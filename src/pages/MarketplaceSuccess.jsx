import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { verifyPayment } from '../lib/cashfree'
import { supabase } from '../lib/supabase'
import { CheckCircle, Download, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function MarketplaceSuccess() {
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const [status, setStatus] = useState('verifying') // verifying, success, failed
    const [product, setProduct] = useState(null)
    const [error, setError] = useState(null)
    const orderId = searchParams.get('order_id')
    const productId = searchParams.get('product_id')

    useEffect(() => {
        console.log('MarketplaceSuccess - Debug Info:', {
            orderId,
            productId,
            user: user?.id,
            hasUser: !!user
        })

        // Wait for auth to load
        if (user === undefined) {
            console.log('Waiting for auth to load...')
            return
        }

        if (!orderId || !productId || !user) {
            setStatus('failed')
            setError('Invalid Order, Product ID, or User not logged in')
            console.error('Missing required data:', { orderId, productId, hasUser: !!user })
            return
        }

        const processOrder = async () => {
            try {
                // 1. Verify Payment (using existing system)
                const verifyData = await verifyPayment(orderId)
                if (verifyData.order_status !== 'PAID') {
                    throw new Error(`Payment status: ${verifyData.order_status}`)
                }

                // 2. Record Purchase
                const { error: insertError } = await supabase
                    .from('product_purchases')
                    .insert({
                        buyer_id: user.id,
                        product_id: productId,
                        amount_paid: verifyData.order_amount,
                        status: 'completed',
                        created_at: new Date().toISOString()
                    })

                // Ignore uniqueness violation (already processed)
                if (insertError) {
                    if (insertError.code === '23505') {
                        console.log('Purchase already recorded')
                    } else {
                        throw insertError
                    }
                } else {
                    // Increment count only on fresh insert
                    try {
                        const { error: rpcError } = await supabase.rpc('increment_product_purchase', { product_id: productId })
                        if (rpcError) console.warn('Failed to increment count', rpcError)
                    } catch (e) {
                        console.warn(e)
                    }
                }

                // 3. Fetch Product Details
                const { data: productData, error: fetchError } = await supabase
                    .from('digital_products')
                    .select('*')
                    .eq('id', productId)
                    .single()

                if (fetchError) throw fetchError

                setProduct(productData)
                setStatus('success')

            } catch (err) {
                console.error('Processing Error:', err)
                setStatus('failed')
                setError(err.message)
            }
        }

        processOrder()
    }, [orderId, productId, user])

    const handleDownload = async () => {
        if (!product) return
        try {
            const { data, error } = await supabase
                .storage
                .from('digital-products')
                .createSignedUrl(product.file_path, 3600)

            if (data?.signedUrl) {
                const link = document.createElement('a')
                link.href = data.signedUrl
                link.setAttribute('download', product.title)
                document.body.appendChild(link)
                link.click()
                link.remove()
            } else {
                throw error
            }
        } catch (err) {
            alert('Download failed: ' + (err.message || 'Unknown error'))
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
                {status === 'verifying' && (
                    <div className="py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying Payment</h2>
                        <p className="text-slate-500">Please wait while we confirm your purchase...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                        <p className="text-slate-600 mb-8">
                            You have successfully purchased <br />
                            <span className="font-bold text-slate-900">{product?.title || 'Digital Product'}</span>
                        </p>

                        <button
                            onClick={handleDownload}
                            className="btn-primary w-full py-4 text-lg mb-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            <Download className="h-5 w-5" />
                            Download Now
                        </button>

                        <Link to="/marketplace" className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center justify-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Return to Marketplace
                        </Link>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
                        <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                            {error || 'We could not verify your payment. Please try again or contact support.'}
                        </p>
                        <Link to="/marketplace" className="btn-secondary w-full block py-3">
                            Back to Marketplace
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
