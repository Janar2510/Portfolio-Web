import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUp {
  id: string;
  user_id: string;
  contact_id: string | null;
  deal_id: string | null;
  title: string;
  due_date: string;
  is_completed: boolean;
  profiles: {
    email: string;
    display_name: string | null;
  } | null;
  contacts: {
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
  deals: {
    title: string;
  } | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date and time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get follow-ups due today or tomorrow that are not completed
    const { data: followUps, error } = await supabase
      .from('follow_ups')
      .select(`
        id,
        user_id,
        title,
        due_date,
        is_completed,
        contact_id,
        deal_id,
        profiles:user_id(email, display_name),
        contacts:contact_id(first_name, last_name, email),
        deals:deal_id(title)
      `)
      .eq('is_completed', false)
      .gte('due_date', today.toISOString())
      .lte('due_date', tomorrow.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching follow-ups:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!followUps || followUps.length === 0) {
      return new Response(JSON.stringify({ message: 'No follow-ups due today or tomorrow' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group follow-ups by user
    const followUpsByUser: Record<string, FollowUp[]> = {};
    (followUps as any[]).forEach((followUp) => {
      const userId = followUp.user_id;
      if (!followUpsByUser[userId]) {
        followUpsByUser[userId] = [];
      }
      followUpsByUser[userId].push(followUp);
    });

    // Get user emails and send notifications
    const notifications = [];
    for (const [userId, userFollowUps] of Object.entries(followUpsByUser)) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', userId)
        .single();

      if (!profile || !profile.email) {
        console.log(`No email found for user ${userId}`);
        continue;
      }

      // Group follow-ups by due date
      const followUpsToday: FollowUp[] = [];
      const followUpsTomorrow: FollowUp[] = [];

      userFollowUps.forEach((followUp) => {
        const followUpDate = new Date(followUp.due_date);
        if (followUpDate.toDateString() === today.toDateString()) {
          followUpsToday.push(followUp);
        } else {
          followUpsTomorrow.push(followUp);
        }
      });

      // Send email notification
      const emailContent = generateEmailContent(
        profile.display_name || 'User',
        followUpsToday,
        followUpsTomorrow
      );

      // In a real implementation, you would send an email here
      // For now, we'll log it and return the notification data
      console.log(`Would send email to ${profile.email}:`, emailContent);

      notifications.push({
        userId,
        email: profile.email,
        followUpsToday: followUpsToday.length,
        followUpsTomorrow: followUpsTomorrow.length,
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        notifications,
        totalFollowUps: followUps.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in follow-up-notifications:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailContent(
  userName: string,
  followUpsToday: FollowUp[],
  followUpsTomorrow: FollowUp[]
): string {
  let content = `Hello ${userName},\n\n`;
  content += `You have follow-up reminders:\n\n`;

  if (followUpsToday.length > 0) {
    content += `Due Today (${followUpsToday.length}):\n`;
    followUpsToday.forEach((followUp) => {
      const context = followUp.contacts
        ? `${followUp.contacts.first_name} ${followUp.contacts.last_name}`
        : followUp.deals
        ? followUp.deals.title
        : 'General';
      content += `- ${followUp.title} (${context})\n`;
    });
    content += '\n';
  }

  if (followUpsTomorrow.length > 0) {
    content += `Due Tomorrow (${followUpsTomorrow.length}):\n`;
    followUpsTomorrow.forEach((followUp) => {
      const context = followUp.contacts
        ? `${followUp.contacts.first_name} ${followUp.contacts.last_name}`
        : followUp.deals
        ? followUp.deals.title
        : 'General';
      content += `- ${followUp.title} (${context})\n`;
    });
    content += '\n';
  }

  content += `\nView all follow-ups: [Your CRM URL]/crm/activities\n`;
  content += `\nBest regards,\nYour CRM System`;

  return content;
}
