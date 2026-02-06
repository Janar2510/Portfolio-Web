
import { createClient } from '@/lib/supabase/client';

async function diagnoseLeadConversion() {
    const supabase = createClient();

    // 1. Check Auth User
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User:', user?.id || 'Not logged in');

    if (!user) {
        console.error('Login required to run test');
        return;
    }

    // 2. Create a dummy lead
    const { data: lead, error: leadError } = await supabase
        .from('crm_leads')
        .insert({
            title: 'Test Debug Lead',
            user_id: user.id,
            status: 'new',
            email: 'debug@example.com'
        })
        .select()
        .single();

    if (leadError) {
        console.error('Failed to create lead:', leadError);
        return;
    }
    console.log('Created lead:', lead.id);

    // 3. Attempt to convert to person manually
    console.log('Attempting to create person...');
    const { data: person, error: personError } = await supabase
        .from('crm_persons')
        .insert({
            name: 'Debug Person',
            first_name: 'Debug',
            last_name: 'Person',
            user_id: user.id,
            emails: [{ value: 'debug@example.com', label: 'work', primary: true }]
        })
        .select()
        .single();

    if (personError) {
        console.error('Failed to create person:', personError);
        // Clean up lead
        await supabase.from('crm_leads').delete().eq('id', lead.id);
        return;
    }
    console.log('Created person:', person.id);

    // 4. Update Lead
    const { error: updateError } = await supabase
        .from('crm_leads')
        .update({
            status: 'qualified',
            converted_person_id: person.id
        })
        .eq('id', lead.id);

    if (updateError) {
        console.error('Failed to update lead:', updateError);
    } else {
        console.log('Successfully linked person to lead');
    }

    // 5. Clean up
    console.log('Cleaning up...');
    await supabase.from('crm_leads').delete().eq('id', lead.id);
    await supabase.from('crm_persons').delete().eq('id', person.id);
    console.log('Done.');
}

// Just run it if executed directly (this is a client-side friendly snippet for browser console or node with polyfills, 
// strictly we can't run this easily in node without setup, but we can instruct user to putting it in a file like test-leads.ts and viewing it)
// But since I can update the app, I can also assume I can run typescripts via ts-node if environment allows.
// Given constraints, I will rely on code review mostly.
