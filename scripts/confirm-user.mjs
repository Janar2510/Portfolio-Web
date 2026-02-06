import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function confirmUser(email) {
    console.log(`Attempting to confirm user: ${email}`)

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.error(`User not found: ${email}`)
        return
    }

    console.log(`Found user ID: ${user.id}`)

    // Update user to be confirmed
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
    })

    if (error) {
        console.error('Error confirming user:', error)
    } else {
        console.log(`Successfully confirmed user: ${email}`)
    }
}

const emailToConfirm = process.argv[2] || 'janar.kuusk@icloud.com'
confirmUser(emailToConfirm)
