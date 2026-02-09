import { useState, useEffect } from 'react'
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'
import { PrivacyPageSkeleton } from '../components/Skeleton'

export default function Privacy() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return <PrivacyPageSkeleton />
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-900 text-sm font-bold mb-8 shadow-sm">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Privacy Policy</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-slate-900 mb-6 leading-[1.1]">
                        Your Privacy Matters
                    </h1>

                    <p className="text-xl text-slate-500 font-medium">
                        Last updated: February 8, 2026
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-12">
                        {/* Introduction */}
                        <div>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                At Kellasa, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully.
                            </p>
                        </div>

                        {/* Information We Collect */}
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#FACC15] rounded-xl flex items-center justify-center shrink-0">
                                    <Database className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
                                    <div className="space-y-4 text-slate-600">
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-2">Personal Information</h3>
                                            <p className="leading-relaxed">We collect information you provide directly, including your name, email address, phone number, profile information, and payment details.</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-2">Usage Information</h3>
                                            <p className="leading-relaxed">We automatically collect information about your interactions with our platform, including pages viewed, features used, and time spent on the platform.</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-2">Device Information</h3>
                                            <p className="leading-relaxed">We collect device-specific information such as IP address, browser type, operating system, and device identifiers.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How We Use Your Information */}
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center shrink-0">
                                    <Eye className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
                                    <ul className="space-y-3 text-slate-600">
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>To provide, maintain, and improve our services</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>To process transactions and send related information</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>To send you technical notices, updates, and support messages</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>To respond to your comments and questions</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>To detect, prevent, and address fraud and security issues</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>To personalize your experience and deliver relevant content</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Data Security */}
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center shrink-0">
                                    <Lock className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Information Sharing */}
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center shrink-0">
                                    <UserCheck className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Information Sharing</h2>
                                    <p className="text-slate-600 leading-relaxed mb-4">
                                        We do not sell your personal information. We may share your information in the following circumstances:
                                    </p>
                                    <ul className="space-y-3 text-slate-600">
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>With service providers who perform services on our behalf</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>When required by law or to protect our rights</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>In connection with a business transaction (merger, sale, etc.)</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>With your consent or at your direction</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Your Rights */}
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center shrink-0">
                                    <FileText className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
                                    <p className="text-slate-600 leading-relaxed mb-4">
                                        You have the right to:
                                    </p>
                                    <ul className="space-y-3 text-slate-600">
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>Access and receive a copy of your personal data</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>Correct inaccurate or incomplete information</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>Request deletion of your personal information</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>Object to or restrict certain processing of your data</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-[#FACC15] mt-1">•</span>
                                            <span>Withdraw consent at any time</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Cookies */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies and Tracking</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                            </p>
                        </div>

                        {/* Children's Privacy */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Children's Privacy</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
                            </p>
                        </div>

                        {/* Changes to Policy */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="bg-black text-white p-8 rounded-[2rem]">
                            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                            <p className="text-slate-300 leading-relaxed mb-4">
                                If you have any questions about this Privacy Policy, please contact us:
                            </p>
                            <div className="space-y-2 text-slate-300">
                                <p>Email: <a href="mailto:privacy@kellasa.com" className="text-[#FACC15] hover:underline font-bold">privacy@kellasa.com</a></p>
                                <p>Support: <a href="mailto:help@kellasa.com" className="text-[#FACC15] hover:underline font-bold">help@kellasa.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
