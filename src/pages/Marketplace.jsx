import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Filter, ShoppingBag, Plus, Sparkles, Download } from 'lucide-react'

export default function Marketplace() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'template', 'ebook', 'code', 'other'

    useEffect(() => {
        fetchProducts()
    }, [filter])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('digital_products')
                .select(`
                    *,
                    profiles:professional_id (
                        full_name,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false })

            if (filter !== 'all') {
                query = query.eq('category', filter)
            }

            const { data, error } = await query
            if (!error) setProducts(data || [])
        } catch (error) {
            console.error('Error fetching marketplace:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-amber-400 fill-amber-400" />
                        Digital Marketplace
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        Discover premium templates, e-books, and resources created by top professionals.
                        Buy once, keep forever.
                    </p>
                </div>
                <Link to="/marketplace/sell" className="mt-4 md:mt-0 btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    <Plus className="h-5 w-5" />
                    Sell Your Work
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                {['all', 'template', 'ebook', 'code', 'art'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-300
                            ${filter === cat
                                ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100">
                            <div className="aspect-[4/3] bg-slate-100 rounded-xl animate-pulse mb-4" />
                            <div className="h-4 bg-slate-100 w-1/3 rounded mb-2 animate-pulse" />
                            <div className="h-6 bg-slate-100 w-3/4 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => (
                        <Link key={product.id} to={`/marketplace/${product.id}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-floating transition-all duration-300 hover:-translate-y-1">
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                {product.cover_image_url ? (
                                    <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                        <ShoppingBag className="h-12 w-12 mb-2 opacity-50" />
                                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">No Preview</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-slate-900 shadow-sm border border-slate-100">
                                    ₹{product.price}
                                </div>
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">{product.category}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">{product.title}</h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                    <div className="flex items-center gap-2">
                                        {product.profiles?.avatar_url ? (
                                            <img src={product.profiles.avatar_url} className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-500">
                                                {product.profiles?.full_name?.[0] || '?'}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 font-medium">Created by</span>
                                            <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{product.profiles?.full_name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 rounded-full p-2 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <Download className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Be the pioneer! Create the first digital asset on Gigz Marketplace and start earning passive income.</p>
                    <Link to="/marketplace/sell" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                        <Plus className="h-5 w-5" />
                        Create First Product
                    </Link>
                </div>
            )}
        </div>
    )
}
