
import { createClient } from './src/lib/supabase/client';
import { leadsService } from './src/domain/crm/services/leads-service';

async function testCreateLead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found. Please log in.');
        return;
    }

    console.log('Testing lead creation for user:', user.id);

    try {
        const lead = await leadsService.create({
            title: 'Test Lead ' + new Date().toISOString(),
            person_name: 'Test Person',
            email: 'test@example.com',
        });
        console.log('Lead created successfully:', lead);
    } catch (error) {
        console.error('Failed to create lead:', error);
    }

    try {
        const leads = await leadsService.getAll();
        console.log('Fetched leads:', leads.length);
    } catch (error) {
        console.error('Failed to fetch leads:', error);
    }
}

// Note: This script needs to be run in an environment where auth is available.
// Since I can't run it easily with auth, I'll just check the code again.
