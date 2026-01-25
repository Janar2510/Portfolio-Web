const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSites() {
    const { data: sites, error } = await supabase
        .from('portfolio_sites')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching sites:', error);
        return;
    }

    console.log('Recent Sites:');
    console.log(JSON.stringify(sites, null, 2));

    for (const site of sites) {
        const { data: pages } = await supabase
            .from('portfolio_pages')
            .select('id, title')
            .eq('site_id', site.id);

        if (pages) {
            for (const page of pages) {
                const { data: blocks } = await supabase
                    .from('portfolio_blocks')
                    .select('id, block_type, content, settings')
                    .eq('page_id', page.id);

                console.log(`Blocks for Site: ${site.name}, Page: ${page.title}`);
                process.stdout.write(JSON.stringify(blocks, (key, value) => {
                    if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
                    return value;
                }, 2) + '\n');
            }
        }
    }
}

checkSites().catch(console.error);
