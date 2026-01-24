const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function ensureUser(email, name) {
    console.log(`Ensuring user exists: ${email} (${name})`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    let user = users.find(u => u.email === email);

    if (user) {
        console.log(`User already exists with ID: ${user.id}`);
    } else {
        const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }

        user = newUser;
        console.log(`User created with ID: ${user?.id}`);
    }
}

const email = process.argv[2];
const name = process.argv[3];

if (!email || !name) {
    console.error('Usage: node scripts/ensure-user.cjs <email> <name>');
    process.exit(1);
}

ensureUser(email, name).catch(console.error);
