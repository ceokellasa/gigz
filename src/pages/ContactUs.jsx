import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactUs() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Contact Us</h1>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                        Have questions or need assistance? We're here to help you anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in touch</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-indigo-100 p-3 rounded-full">
                                    <Mail className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Email</h3>
                                    <p className="text-slate-600">helpatkelasa@gmail.com</p>
                                    <p className="text-sm text-slate-500 mt-1">We usually reply within 24 hours.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <MapPin className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Office</h3>
                                    <p className="text-slate-600">KELLASA HQ</p>
                                    <p className="text-slate-600">India</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Map or Image placeholder */}
                    <div className="bg-slate-200 rounded-2xl min-h-[300px] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
                        <div className="relative z-10 text-center p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">We are Digital First</h3>
                            <p>Our support team works remotely to serve you better.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
