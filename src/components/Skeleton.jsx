import clsx from 'clsx'

// Base skeleton pulse animation
const pulse = 'animate-pulse bg-slate-200'

// Skeleton building blocks
export function Skeleton({ className }) {
    return <div className={clsx(pulse, 'rounded', className)} />
}

export function SkeletonText({ lines = 3, className }) {
    return (
        <div className={clsx('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={clsx(
                        'h-4',
                        i === lines - 1 ? 'w-2/3' : 'w-full'
                    )}
                />
            ))}
        </div>
    )
}

export function SkeletonAvatar({ size = 'md', className }) {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24'
    }
    return <Skeleton className={clsx('rounded-full', sizes[size], className)} />
}

// Gig Card Skeleton
export function GigCardSkeleton() {
    return (
        <div className="glass-card overflow-hidden">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-5 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <SkeletonText lines={2} />
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <SkeletonAvatar size="sm" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            </div>
        </div>
    )
}

// Gig Feed Skeleton (multiple cards)
export function GigFeedSkeleton({ count = 6 }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <GigCardSkeleton key={i} />
            ))}
        </div>
    )
}

// Profile Skeleton
export function ProfileSkeleton() {
    return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
            <div className="flex justify-center">
                <SkeletonAvatar size="xl" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
    )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// List Item Skeleton
export function ListItemSkeleton() {
    return (
        <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
        </div>
    )
}

// Page Loading Skeleton
export function PageLoadingSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-slate-500">Loading...</p>
            </div>
        </div>
    )
}
