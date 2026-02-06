import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
    const { data: tables, error: tableError } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    if (tableError) {
        console.error('Error fetching tables:', tableError);
    } else {
        console.log('Tables in public schema:', tables.map((t) => t.table_name).join(', '));
    }
}

checkTables();
