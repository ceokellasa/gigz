import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { createPaymentSession, doPayment } from '../lib/cashfree'
import { Download, ShoppingCart, Check, ShieldCheck, FileText, ArrowLeft, Star, Share2 } from 'lucide-react'

export default function MarketplaceProduct() {
    const { id } = useParams()
    const { user, profile } = useAuth()
    const [product, setProduct] = useState(null)
    const [hasPurchased, setHasPurchased] = useState(false)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [purchasing, setPurchasing] = useState(false)

    useEffect(() => {
        // Increment View Count
        if (id) {
            try {
                supabase.rpc('increment_product_view', { product_id: id })
            } catch (err) {
                console.warn('View count failed:', err)
            }
        }
    }, [id])

    useEffect(() => {
        fetchProduct()
    }, [id, user])

    const fetchProduct = async () => {
        setLoading(true)
        try {
            // 1. Fetch Product
            const { data, error } = await supabase
                .from('digital_products')
                .select(`
                    *,
                    profiles:professional_id (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setProduct(data)

            // 2. Check Purchase status / Ownership
            if (user) {
                // Check if owner
                if (data.professional_id === profile?.id || data.professional_id === user.id) {
                    setHasPurchased(true)
                    return
                }

                // Check purchase
                const { data: purchase } = await supabase
                    .from('product_purchases')
                    .select('id')
                    .eq('product_id', id)
                    .eq('buyer_id', user.id)
                    .maybeSingle()

                if (purchase) setHasPurchased(true)
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBuy = async () => {
        if (!user) return alert('Please login to buy.')
        if (!confirm(`Purchase "${product.title}" for ₹${product.price}?`)) return

        setPurchasing(true)
        try {
            // Use existing payment system - treat product as a "plan"
            const productAsPlan = {
                id: `product_${product.id}`,
                price: product.price
            }

            // Store product ID in URL for success page
            const sessionId = await createPaymentSession(productAsPlan, user, profile)
            await doPayment(sessionId, `/marketplace/success?product_id=${product.id}`)
        } catch (error) {
            console.error('Payment Failed:', error)
            alert('Payment failed: ' + error.message)
            setPurchasing(false)
        }
    }

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const { data, error } = await supabase
                .storage
                .from('digital-products')
                .createSignedUrl(product.file_path, 3600) // 1 hour valid link

            if (error) throw error

            if (data?.signedUrl) {
                // Open secure link in new tab
                const link = document.createElement('a')
                link.href = data.signedUrl
                link.setAttribute('download', product.title) // Hint browser to download
                document.body.appendChild(link)
                link.click()
                link.remove()
            }
        } catch (err) {
            console.error(err)
            alert('Error generating download link. Ensure you have purchased the product.')
        } finally {
            setDownloading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
        </div>
    )

    if (!product) return <div className="p-12 text-center">Product not found.</div>

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/marketplace" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Marketplace
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden lg:flex">
                    {/* Left: Image */}
                    <div className="lg:w-1/2 bg-slate-100 relative min-h-[400px]">
                        {product.cover_image_url ? (
                            <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover absolute inset-0" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <FileText className="h-24 w-24" />
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {product.category}
                            </span>
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-3 mb-8">
                            {product.profiles?.avatar_url ? (
                                <img src={product.profiles.avatar_url} className="w-10 h-10 rounded-full border border-slate-200" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                    {product.profiles?.full_name?.[0]}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-slate-800">{product.profiles?.full_name}</p>
                                <p className="text-xs text-slate-500">{product.profiles?.job_title || 'Creator'}</p>
                            </div>
                        </div>

                        <div className="prose prose-slate mb-8 text-slate-600 leading-relaxed">
                            {product.description}
                        </div>

                        {/* File Info */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-8 flex items-center gap-4 border border-slate-100">
                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Digital Asset File</p>
                                <p className="text-xs text-slate-500">Secure download via Gigz Vault</p>
                            </div>
                            <div className="ml-auto flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Price</p>
                                    <p className="text-3xl font-bold text-slate-900">₹{product.price}</p>
                                </div>
                                {hasPurchased ? (
                                    <span className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
                                        <Check className="h-5 w-5" />
                                        Purchased
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="text-xs text-slate-400 ml-1">(New)</span>
                                    </div>
                                )}
                            </div>

                            {hasPurchased ? (
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 border-green-600 shadow-green-200"
                                >
                                    {downloading ? 'Preparing Download...' : (
                                        <>
                                            <Download className="h-6 w-6" />
                                            Download Now
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleBuy}
                                    disabled={purchasing}
                                    className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    {purchasing ? 'Processing...' : (
                                        <>
                                            <ShoppingCart className="h-6 w-6" />
                                            Buy Now
                                        </>
                                    )}
                                </button>
                            )}
                            <p className="text-center text-xs text-slate-400 mt-4">
                                100% Secure Payment • Instant Download
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
