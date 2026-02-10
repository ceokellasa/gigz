import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { Disclosure } from '@headlessui/react'
import { Briefcase, PlusCircle, Search, MessageSquare, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import BroadcastListener from './BroadcastListener'

export default function Layout() {
    const { user, profile, signOut, unreadCount } = useAuth()
    const { settings } = useSettings()
    const navigate = useNavigate()
    const location = useLocation()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const navigation = [
        { name: 'Home', href: '/', current: location.pathname === '/' },
        { name: 'Post a Gig', href: '/post-gig', current: location.pathname === '/post-gig' },
        { name: 'Find Work', href: '/gigs', current: location.pathname === '/gigs' },
        { name: 'Find Professionals', href: '/professionals', current: location.pathname === '/professionals' },
    ]

    if (user) {
        navigation.push({ name: 'Profile', href: '/profile', current: location.pathname === '/profile' })
    }

    // Hide Layout footer on Home since Home has its own
    const isHome = location.pathname === '/'

    return (
        <div className="min-h-screen font-sans flex flex-col pb-28 md:pb-0 relative">
            <BroadcastListener />

            {/* Navbar */}
            <Disclosure as="nav" className="sticky top-0 z-50 w-full">
                {({ open }) => (
                    <div className={clsx(
                        "w-full transition-all duration-300 border-b",
                        open ? "bg-white border-slate-200" : "bg-white/80 backdrop-blur-xl border-white/50 supports-[backdrop-filter]:bg-white/60"
                    )}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-20">
                                <div className="flex">
                                    <div className="flex-shrink-0 flex items-center">
                                        <Link to="/" className="flex items-center group">
                                            <span className="font-bold text-2xl tracking-tighter text-slate-900">
                                                KELLASA
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={clsx(
                                                    item.current
                                                        ? 'border-black text-black'
                                                        : 'border-transparent text-slate-500 hover:text-black hover:border-slate-300',
                                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all duration-200'
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex ml-6 items-center gap-4">
                                    {user ? (
                                        <Link to="/profile" className="relative hover:scale-105 transition-transform duration-200">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                {profile?.avatar_url ? (
                                                    <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-slate-900">{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    ) : (
                                        <div className="flex gap-4 items-center">
                                            <Link to="/login" className="text-slate-600 hover:text-black font-bold text-sm transition-colors">Log in</Link>
                                            <Link to="/signup" className="btn-primary rounded-full px-6 py-2.5 text-sm h-auto shadow-none hover:shadow-lg">Sign up</Link>
                                        </div>
                                    )}
                                </div>


                            </div>
                        </div>

                    </div>
                )}
            </Disclosure>

            <div className="flex-grow">
                <main>
                    <Outlet />
                </main>
            </div>

            {/* Branded Footer Section - "Live it up!" style */}
            <section className="bg-slate-50 py-20 md:py-32 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-slate-200 leading-none tracking-tight">
                        Work
                        <br />
                        your way!
                    </h2>
                    <p className="mt-6 text-lg md:text-xl text-slate-500 font-medium flex items-center justify-center gap-2">
                        Built with <span className="text-red-500 text-2xl">❤️</span> for professionals everywhere
                    </p>
                </div>
            </section>

            <footer className="bg-white border-t border-slate-100 py-12 md:pb-12 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-black text-white p-1.5 rounded-lg">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900">KELLASA</span>
                    </div>
                    <div className="flex gap-8">
                        <Link to="/contact" className="text-sm font-bold text-slate-400 hover:text-black transition-colors">Contact</Link>
                        <Link to="/terms" className="text-sm font-bold text-slate-400 hover:text-black transition-colors">Terms</Link>
                        <Link to="/refunds" className="text-sm font-bold text-slate-400 hover:text-black transition-colors">Refunds</Link>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">© 2026 Kellasa Inc. All rights reserved. Crafted by <span className="hover:text-slate-900 transition-colors cursor-pointer">Marzookk411</span></p>
                </div>
            </footer>

            {/* Mobile Bottom Navigation - Floating Capsule */}
            <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center pb-safe pointer-events-none">
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 shadow-float-lg rounded-full px-6 py-4 flex justify-between items-center w-[85%] max-w-[350px] pointer-events-auto">
                    <Link to="/" className={clsx("flex flex-col items-center gap-1 transition-colors", location.pathname === '/' ? "text-[#FACC15]" : "text-white/50 hover:text-white")}>
                        <Sparkles className="h-6 w-6" />
                    </Link>



                    <Link to="/gigs" className={clsx("flex flex-col items-center gap-1 transition-colors", location.pathname === '/gigs' ? "text-[#FACC15]" : "text-white/50 hover:text-white")}>
                        <Briefcase className="h-6 w-6" />
                    </Link>

                    <Link to="/post-gig" className="relative -top-8">
                        <div className="bg-[#FACC15] p-4 rounded-full shadow-lg shadow-yellow-500/20 text-black ring-4 ring-white ring-opacity-10 transform transition-transform hover:scale-110 active:scale-95">
                            <PlusCircle className="h-7 w-7" />
                        </div>
                    </Link>

                    <Link to="/messages" className={clsx("flex flex-col items-center gap-1 transition-colors relative", location.pathname === '/messages' ? "text-[#FACC15]" : "text-white/50 hover:text-white")}>
                        <MessageSquare className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-black">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    <Link to="/professionals" className={clsx("flex flex-col items-center gap-1 transition-colors relative", location.pathname === '/professionals' ? "text-[#FACC15]" : "text-white/50 hover:text-white")}>
                        <Search className="h-6 w-6" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
