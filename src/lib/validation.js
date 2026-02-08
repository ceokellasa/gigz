// Form validation utilities

export const validators = {
    required: (value, fieldName = 'This field') => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return `${fieldName} is required`
        }
        return null
    },

    email: (value) => {
        if (!value) return null
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            return 'Please enter a valid email address'
        }
        return null
    },

    phone: (value) => {
        if (!value) return null
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            return 'Please enter a valid phone number'
        }
        return null
    },

    minLength: (min) => (value, fieldName = 'This field') => {
        if (!value) return null
        if (value.length < min) {
            return `${fieldName} must be at least ${min} characters`
        }
        return null
    },

    maxLength: (max) => (value, fieldName = 'This field') => {
        if (!value) return null
        if (value.length > max) {
            return `${fieldName} must be less than ${max} characters`
        }
        return null
    },

    min: (minVal) => (value, fieldName = 'Value') => {
        if (value === '' || value === null || value === undefined) return null
        if (Number(value) < minVal) {
            return `${fieldName} must be at least ${minVal}`
        }
        return null
    },

    max: (maxVal) => (value, fieldName = 'Value') => {
        if (value === '' || value === null || value === undefined) return null
        if (Number(value) > maxVal) {
            return `${fieldName} must be less than ${maxVal}`
        }
        return null
    },

    password: (value) => {
        if (!value) return null
        if (value.length < 6) {
            return 'Password must be at least 6 characters'
        }
        return null
    },

    matchPassword: (password) => (value) => {
        if (!value) return null
        if (value !== password) {
            return 'Passwords do not match'
        }
        return null
    }
}

// Validate a single field
export function validateField(value, rules, fieldName) {
    for (const rule of rules) {
        const error = rule(value, fieldName)
        if (error) return error
    }
    return null
}

// Validate entire form
export function validateForm(data, schema) {
    const errors = {}
    let isValid = true

    for (const [field, rules] of Object.entries(schema)) {
        const error = validateField(data[field], rules.validators, rules.label)
        if (error) {
            errors[field] = error
            isValid = false
        }
    }

    return { isValid, errors }
}

// Sanitize string inputs
export function sanitizeInput(value) {
    if (typeof value !== 'string') return value
    return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim()
}

// Format phone number for display
export function formatPhoneNumber(phone) {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
    }
    return phone
}

// Format currency
export function formatCurrency(amount, currency = '₹') {
    if (amount === null || amount === undefined) return ''
    return `${currency}${Number(amount).toLocaleString('en-IN')}`
}

// Format date
export function formatDate(date, options = {}) {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options
    })
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date) {
    if (!date) return ''
    const now = new Date()
    const d = new Date(date)
    const diff = now - d

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) return formatDate(date)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
}
