// Application constants

// Categories for gigs
export const CATEGORIES = [
    { id: 'Tech', name: 'Tech & IT', icon: 'Code' },
    { id: 'Design', name: 'Design', icon: 'PenTool' },
    { id: 'Cleaning', name: 'Cleaning', icon: 'Sparkles' },
    { id: 'Delivery', name: 'Delivery', icon: 'Truck' },
    { id: 'Cooking', name: 'Cooking', icon: 'UtensilsCrossed' },
    { id: 'Tutoring', name: 'Tutoring', icon: 'GraduationCap' },
    { id: 'Beauty', name: 'Beauty & Salon', icon: 'Scissors' },
    { id: 'Repair', name: 'Repair & Maintenance', icon: 'Wrench' },
    { id: 'Photography', name: 'Photography', icon: 'Camera' },
    { id: 'Driving', name: 'Driving', icon: 'Car' },
    { id: 'Moving', name: 'Moving & Packing', icon: 'Package' },
    { id: 'HomeService', name: 'Home Services', icon: 'Home' },
    { id: 'Writing', name: 'Writing', icon: 'Pen' },
    { id: 'Marketing', name: 'Marketing', icon: 'Megaphone' },
    { id: 'Video', name: 'Video & Audio', icon: 'Video' },
    { id: 'Other', name: 'Other', icon: 'Briefcase' },
]

export const CATEGORY_LIST = ['All', ...CATEGORIES.map(c => c.id)]

// Subscription plans
export const SUBSCRIPTION_PLANS = [
    {
        id: '1_day',
        name: '1 Day Pass',
        price: 49,
        duration_days: 1,
        features: ['Access to all contact numbers', 'Unlimited job views', 'Direct messaging'],
        popular: false
    },
    {
        id: '1_week',
        name: 'Weekly Pro',
        price: 270,
        duration_days: 7,
        features: ['Access to all contact numbers', 'Unlimited job views', 'Direct messaging', 'Priority support'],
        popular: true
    },
    {
        id: '1_month',
        name: 'Monthly Elite',
        price: 1000,
        duration_days: 30,
        features: ['Access to all contact numbers', 'Unlimited job views', 'Direct messaging', 'Priority support', 'Featured profile'],
        popular: false
    }
]

// Gig statuses
export const GIG_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    UNDER_REVIEW: 'under_review',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
}

export const GIG_STATUS_LABELS = {
    [GIG_STATUS.OPEN]: 'Open',
    [GIG_STATUS.IN_PROGRESS]: 'In Progress',
    [GIG_STATUS.UNDER_REVIEW]: 'Under Review',
    [GIG_STATUS.COMPLETED]: 'Completed',
    [GIG_STATUS.CANCELLED]: 'Cancelled'
}

export const GIG_STATUS_COLORS = {
    [GIG_STATUS.OPEN]: 'bg-green-100 text-green-800',
    [GIG_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [GIG_STATUS.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [GIG_STATUS.COMPLETED]: 'bg-slate-100 text-slate-800',
    [GIG_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
}

// Budget types
export const BUDGET_TYPE = {
    FIXED: 'fixed',
    HOURLY: 'hourly'
}

// Application status
export const APPLICATION_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
}

// Pagination
export const DEFAULT_PAGE_SIZE = 12

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// App metadata
export const APP_NAME = 'Kelasa'
export const APP_DESCRIPTION = 'Find your next gig or hire the perfect talent'
