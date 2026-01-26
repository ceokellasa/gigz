
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env'))
const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('Checking saved_gigs table...')
    const { data, error } = await supabase.from('saved_gigs').select('count', { count: 'exact', head: true })

    if (error) {
        console.error('Table check failed:', error.message)
    } else {
        console.log('Table exists. Count:', data)
    }
}

check()
