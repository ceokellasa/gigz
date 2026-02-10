import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Upload, X, Check, DollarSign, Image, FileText, Lock, Building } from 'lucide-react'

export default function CreateProduct() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState(null)
    const [cover, setCover] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'template'
    })

    // Bank Details State
    const [bankDetails, setBankDetails] = useState(null)
    const [fetchingBank, setFetchingBank] = useState(true)
    const [showBankModal, setShowBankModal] = useState(false)
    const [bankForm, setBankForm] = useState({
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: ''
    })

    // Professional Status State
    const [isProfessional, setIsProfessional] = useState(false)
    const [checkingProfessional, setCheckingProfessional] = useState(true)

    useEffect(() => {
        if (user) {
            checkProfessionalStatus()
        }
    }, [user])

    const checkProfessionalStatus = async () => {
        try {
            console.log('Checking professional status for user:', user.id)

            // Check if professional_profiles record exists
            const { data, error } = await supabase
                .from('professional_profiles')
                .select('id, user_id, bank_details')
                .eq('user_id', user.id)  // Changed from 'id' to 'user_id'
                .maybeSingle()

            console.log('Professional query result:', { data, error })

            if (data) {
                console.log('✅ Professional account found!')
                setIsProfessional(true)
                if (data.bank_details) {
                    setBankDetails(data.bank_details)
                }
            } else {
                console.log('❌ No professional account found')
                setIsProfessional(false)
            }
        } catch (err) {
            console.error('Error checking professional status:', err)
            setIsProfessional(false)
        } finally {
            setFetchingBank(false)
            setCheckingProfessional(false)
        }
    }

    const handleSaveBankDetails = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase
                .from('professional_profiles')
                .update({ bank_details: bankForm })
                .eq('user_id', user.id)  // Changed from 'id' to 'user_id'

            if (error) throw error

            setBankDetails(bankForm)
            setShowBankModal(false)
            alert('Bank details saved successfully!')
        } catch (err) {
            console.error(err)
            alert('Error saving bank details.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 1. Check Bank Details
        if (!bankDetails) {
            setShowBankModal(true)
            return
        }

        if (!file || !cover) return alert('Please upload both a product file and cover image.')

        setLoading(true)
        try {
            // Upload Cover
            const coverExt = cover.name.split('.').pop()
            const coverPath = `${user.id}/${Date.now()}_cover.${coverExt}`
            const { error: coverError } = await supabase.storage.from('product-covers').upload(coverPath, cover)
            if (coverError) throw coverError

            const { data: { publicUrl: coverUrl } } = supabase.storage.from('product-covers').getPublicUrl(coverPath)

            // Upload File
            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/${Date.now()}_file.${fileExt}`
            const { error: fileError } = await supabase.storage.from('digital-products').upload(filePath, file)
            if (fileError) throw fileError

            // Insert Record
            const { error: insertError } = await supabase.from('digital_products').insert({
                professional_id: user.id,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                cover_image_url: coverUrl,
                file_path: filePath
            })

            if (insertError) throw insertError

            alert('Product published successfully!')
            navigate('/marketplace')
        } catch (error) {
            console.error(error)
            alert('Error creating product: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (checkingProfessional) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!isProfessional) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-amber-50 rounded-2xl p-8 max-w-md text-center border border-amber-100">
                    <Lock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Professional Account Required</h2>
                    <p className="text-slate-600 mb-6">
                        You need a professional account to sell digital products.
                        Create a professional profile to start earning.
                    </p>
                    <Link to="/subscription" className="btn-primary w-full block py-3">
                        Create Professional Account
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-slate-900 border-b border-slate-200 pb-4">Sell Digital Product</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ... Form Fields (Same as before) ... */}
                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Product Title</label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 bg-slate-50"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <select
                            className="w-full rounded-xl border-slate-300 px-4 py-3 bg-slate-50"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="template">Template</option>
                            <option value="ebook">E-Book</option>
                            <option value="code">Code / UI Kit</option>
                            <option value="art">Art / Stock</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Price (INR)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full pl-8 rounded-xl border-slate-300 px-4 py-3 bg-slate-50 font-bold"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        required
                        rows={6}
                        className="w-full rounded-xl border-slate-300 px-4 py-3 bg-slate-50"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cover Image */}
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${cover ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                        <input type="file" accept="image/*" className="hidden" id="cover-upload" onChange={e => setCover(e.target.files[0])} />
                        <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center justify-center h-full">
                            {cover ? (
                                <>
                                    <Check className="h-10 w-10 text-green-500 mb-2" />
                                    <span className="text-sm font-bold text-green-700 truncate max-w-[200px]">{cover.name}</span>
                                </>
                            ) : (
                                <>
                                    <Image className="h-10 w-10 text-slate-400 mb-3" />
                                    <span className="text-sm font-bold text-slate-600">Upload Cover Image</span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Product File */}
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                        <input type="file" className="hidden" id="file-upload" onChange={e => setFile(e.target.files[0])} />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center h-full">
                            {file ? (
                                <>
                                    <Check className="h-10 w-10 text-indigo-500 mb-2" />
                                    <span className="text-sm font-bold text-indigo-700 truncate max-w-[200px]">{file.name}</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="h-10 w-10 text-slate-400 mb-3" />
                                    <span className="text-sm font-bold text-slate-600">Upload Product File</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary h-14 flex items-center justify-center gap-2 text-lg shadow-lg">
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (
                        <>
                            <DollarSign className="h-5 w-5" />
                            Publish Product
                        </>
                    )}
                </button>
            </form>

            {/* Bank Details Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Building className="h-6 w-6 text-indigo-600" />
                                Bank Details
                            </h2>
                            <button onClick={() => setShowBankModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                        <p className="text-slate-500 mb-6 font-medium">To receive payouts, please provide your bank account details. This is secure and private.</p>

                        <form onSubmit={handleSaveBankDetails} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Account Holder Name</label>
                                <input required type="text" className="w-full rounded-xl border-slate-300" value={bankForm.account_holder_name} onChange={e => setBankForm({ ...bankForm, account_holder_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Account Number</label>
                                <input required type="text" className="w-full rounded-xl border-slate-300" value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">IFSC Code</label>
                                <input required type="text" className="w-full rounded-xl border-slate-300 uppercase" value={bankForm.ifsc_code} onChange={e => setBankForm({ ...bankForm, ifsc_code: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Bank Name</label>
                                <input required type="text" className="w-full rounded-xl border-slate-300" value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} />
                            </div>

                            <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-4">
                                {loading ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
