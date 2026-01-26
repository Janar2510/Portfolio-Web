const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function verifyDb() {
    // Read .env.local manually
    const envPath = path.join(__dirname, 'apps/web/.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const getEnvVar = (name) => {
        const match = envContent.match(new RegExp(`${name}=(.*)`));
        return match ? match[1].trim() : null;
    };

    const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
        console.error('Missing Supabase URL or Service Role Key');
        process.exit(1);
    }

    const supabase = createClient(url, key);

    console.log('Verifying CRM tables...');
    const tables = [
        'crm_organizations',
        'crm_persons',
        'crm_pipelines',
        'crm_pipeline_stages',
        'crm_deals',
        'crm_leads',
        'crm_products',
        'crm_labels',
        'crm_notes'
    ];

    for (const table of tables) {
        const { head, count, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table ${table}: Not found or error: ${error.message}`);
        } else {
            console.log(`✅ Table ${table}: Exists (Count: ${count})`);
        }
    }

    console.log('\nChecking for migration functions...');
    const functions = [
        'migrate_companies_to_organizations',
        'migrate_contacts_to_persons',
        'create_default_pipeline_from_stages',
        'migrate_deals_to_crm_deals'
    ];

    for (const func of functions) {
        const { data, error } = await supabase.rpc(func).limit(0);
        // rpc might fail if it's 0 args or returns void, but we just want to see if it's there
        if (error && error.message.includes('does not exist')) {
            console.log(`❌ Function ${func}: Not found`);
        } else {
            console.log(`✅ Function ${func}: Exists (or at least reachable)`);
        }
    }

    console.log('\nChecking old table counts...');
    const oldTables = ['companies', 'contacts', 'deals', 'pipeline_stages'];
    for (const table of oldTables) {
        const { count, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table ${table}: Error ${error.message}`);
        } else {
            console.log(`ℹ️ Table ${table}: Count: ${count}`);
        }
    }

    console.log('\nChecking RLS policies for contacts...');
    const { data: policies, error: policyError } = await supabase
        .from('pg_policy')
        .select('policyname')
        .eq('tablename', 'contacts');

    // Note: pg_policy might not be accessible via the REST API depending on permissions.
    // If this fails, we can try to infer it or just skip.
    if (policyError) {
        console.log(`⚠️  Could not check policies directory (need direct SQL or higher privileges): ${policyError.message}`);
    } else {
        if (policies && policies.length > 0) {
            console.log(`✅ Found ${policies.length} policies for 'contacts': ${policies.map(p => p.policyname).join(', ')}`);
        } else {
            console.log(`❌ No RLS policies found for 'contacts'! This is likely the cause of 403 errors.`);
        }
    }

    console.log('\nChecking default pipeline setup...');
    const defaultSetupFunctions = ['create_default_crm_setup'];
    for (const func of defaultSetupFunctions) {
        const { error } = await supabase.rpc(func).limit(0);
        if (error && error.message.includes('does not exist')) {
            console.log(`❌ Function ${func}: Not found`);
        } else {
            console.log(`✅ Function ${func}: Exists`);
        }
    }
}

verifyDb().catch(console.error);
