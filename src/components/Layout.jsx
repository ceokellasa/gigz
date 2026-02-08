import { Fragment } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Menu as MenuIcon, X, User, LogOut, Briefcase, PlusCircle, Search, MessageSquare, ShieldAlert, Users, Receipt } from 'lucide-react'
import clsx from 'clsx'
import BroadcastListener from './BroadcastListener'

export default function Layout() {
    const { user, profile, signOut, unreadCount } = useAuth()
    const { settings } = useSettings()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const navigation = [
        { name: 'Home', href: '/', current: true },
        { name: 'Post a Gig', href: '/post-gig', current: false },
        { name: 'Find Work', href: '/gigs', current: false },
        { name: 'Find Professionals', href: '/professionals', current: false },
    ]

    if (user) {
        navigation.push({ name: 'Profile', href: '/profile', current: false })
    }

    return (
        <div className="min-h-screen font-sans bg-transparent flex flex-col pb-28 md:pb-0">
            <BroadcastListener />
            <div className="fixed inset-0 -z-10 bg-slate-50"></div>
            <Disclosure as="nav" className="sticky top-0 md:top-4 z-50 md:max-w-7xl md:mx-auto md:px-4 sm:px-6 lg:px-8 w-full">
                {({ open }) => (
                    <div className="bg-white md:glass-panel md:rounded-2xl md:mt-4 border-b md:border-b-0 border-slate-200">
                        <div className="flex justify-between h-auto py-3 md:py-4 px-4 sm:px-6 lg:px-8">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link to="/" className="flex items-center gap-2">
                                        <span className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-slate-900 uppercase py-2">
                                            KELLASA
                                        </span>
                                    </Link>
                                </div>
                                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={clsx(
                                                item.current
                                                    ? 'border-indigo-500 text-slate-900'
                                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                                                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="flex ml-6 items-center gap-4">
                                {user ? (
                                    <Menu as="div" className="ml-3 relative">
                                        <div>
                                            <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ring-offset-slate-50 relative">
                                                <span className="sr-only">Open user menu</span>
                                                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                                                    ) : (
                                                        <span className="font-semibold text-sm">{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                                                    )}
                                                </div>
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm border border-white">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                )}
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <div className="px-4 py-2 border-b border-slate-100">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || 'User'}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                </div>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            to="/messages"
                                                            className={clsx(
                                                                active ? 'bg-slate-50' : '',
                                                                'block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2 justify-between'
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <MessageSquare className="h-4 w-4" />
                                                                Messages
                                                            </div>
                                                            {unreadCount > 0 && (
                                                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                                    {unreadCount}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            to="/profile"
                                                            className={clsx(
                                                                active ? 'bg-slate-50' : '',
                                                                'block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2'
                                                            )}
                                                        >
                                                            <User className="h-4 w-4" />
                                                            Your Profile
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            to="/payments"
                                                            className={clsx(
                                                                active ? 'bg-slate-50' : '',
                                                                'block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2'
                                                            )}
                                                        >
                                                            <Receipt className="h-4 w-4" />
                                                            Payments
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                {user?.email === 'nsjdfmjr@gmail.com' && (
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/admin"
                                                                className={clsx(
                                                                    active ? 'bg-slate-50' : '',
                                                                    'block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2 font-medium text-indigo-600'
                                                                )}
                                                            >
                                                                <ShieldAlert className="h-4 w-4" />
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                )}
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="mailto:helpatkelasa@gmail.com"
                                                            className={clsx(
                                                                active ? 'bg-slate-50' : '',
                                                                'block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2'
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2 w-full">
                                                                <span className="flex-grow">help@kellasa.com</span>
                                                                <span className="bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded font-medium">Support</span>
                                                            </div>
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={handleSignOut}
                                                            className={clsx(
                                                                active ? 'bg-slate-50' : '',
                                                                'block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2'
                                                            )}
                                                        >
                                                            <LogOut className="h-4 w-4" />
                                                            Sign out
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                ) : (
                                    <div className="flex gap-4 items-center">
                                        <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Log in</Link>
                                        <Link to="/signup" className="btn-primary text-sm">Sign up</Link>
                                    </div>
                                )}
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

            <footer className="glass-panel mt-auto border-t-0 rounded-t-2xl mx-4 mb-4 hidden md:block">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <Link to="/contact" className="text-slate-400 hover:text-slate-500">Contact Us</Link>
                        <Link to="/terms" className="text-slate-400 hover:text-slate-500">Terms</Link>
                        <Link to="/refunds" className="text-slate-400 hover:text-slate-500">Refunds</Link>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-base text-slate-400">
                            {settings.footer_text || '© 2026 Kelasa, Inc. All rights reserved.'}
                        </p>
                    </div>
                </div>
            </footer>


            {/* Mobile Bottom Navigation - Floating Capsule Style */}
            <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center pb-safe pointer-events-none">
                <div className="bg-gradient-to-b from-white/40 to-white/20 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 shadow-2xl shadow-black/10 rounded-full px-6 py-3.5 flex justify-between items-center w-[90%] max-w-[380px] pointer-events-auto ring-1 ring-white/40">
                    <Link to="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors p-1.5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </Link>

                    <Link to="/gigs" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors p-1.5">
                        <Briefcase className="h-6 w-6" />
                    </Link>

                    <Link to="/post-gig" className="relative -top-7 transition-transform hover:scale-105 active:scale-95">
                        <div className="bg-slate-900 p-4 rounded-full shadow-lg shadow-slate-900/40 text-white ring-4 ring-white">
                            <PlusCircle className="h-7 w-7" />
                        </div>
                    </Link>

                    <Link to="/messages" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors relative p-1.5">
                        <MessageSquare className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    <Link to="/professionals" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors p-1.5">
                        <Users className="h-6 w-6" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
