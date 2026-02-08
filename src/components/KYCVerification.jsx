import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ShieldCheck, Clock, AlertTriangle, Upload, FileCheck, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

export default function KYCVerification({ profile, onUpdate }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)

    const status = profile?.kyc_status || 'none'

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        setError(null)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}/id_proof_${Date.now()}.${fileExt}`

            // 1. Upload to explicit KYC bucket
            const { error: uploadError } = await supabase.storage
                .from('kyc-documents')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Get Signed URL (Private bucket, so we don't use getPublicUrl usually, but for record keeping)
            // Actually, we just store the path or check existence.
            // For now, let's just update the status.

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    kyc_status: 'pending',
                    kyc_document_url: fileName,
                    kyc_submitted_at: new Date().toISOString()
                })
                .eq('id', profile.id)

            if (updateError) throw updateError

            if (onUpdate) onUpdate()

        } catch (err) {
            console.error(err)
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    if (status === 'verified') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-green-900">Identity Verified</h3>
                    <p className="text-sm text-green-700">Your profile is verified with a blue tick badge!</p>
                </div>
            </div>
        )
    }

    if (status === 'pending') {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-amber-900">Verification Pending</h3>
                    <p className="text-sm text-amber-700">We are reviewing your documents. This usually takes 24 hours.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-slate-500" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Verify Your Identity</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Get a <span className="text-blue-600 font-medium font-mono">Blue Tick</span> badge properly and gain trust.
                        Upload a Government ID (Aadhar, PAN, or Driving License).
                    </p>

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="mt-4">
                        <label className={clsx(
                            "flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-slate-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-indigo-500 focus:outline-none",
                            uploading && "opacity-50 cursor-wait"
                        )}>
                            <div className="flex flex-col items-center space-y-2">
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-slate-400" />
                                        <span className="font-medium text-slate-600">
                                            Click to upload ID Proof
                                        </span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                name="file_upload"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                        <p className="mt-2 text-xs text-slate-400 text-center">
                            Your ID is stored securely and only visible to admins for verification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
