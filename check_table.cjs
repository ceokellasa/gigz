
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Simple env parser
function parseEnv() {
    try {
        const content = fs.readFileSync('.env', 'utf8')
        const config = {}
        content.split('\n').forEach(line => {
            const parts = line.split('=')
            if (parts.length >= 2) {
                const key = parts[0].trim()
                const val = parts.slice(1).join('=').trim()
                config[key] = val
            }
        })
        return config
    } catch (e) {
        return {}
    }
}

const env = parseEnv()
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('Checking saved_gigs table...')
    const { count, error } = await supabase.from('saved_gigs').select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Table check failed:', error.message)
    } else {
        console.log('Table exists. Count:', count)
    }
}

check()
