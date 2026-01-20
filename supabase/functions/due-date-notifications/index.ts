import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  due_date: string;
  due_time: string | null;
  priority: string | null;
  project_id: string;
  assignee_id: string | null;
  projects: {
    name: string;
    user_id: string;
  };
  profiles: {
    email: string;
    display_name: string | null;
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

    // Get tasks due today or tomorrow that are not completed
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        due_date,
        due_time,
        priority,
        project_id,
        assignee_id,
        projects!inner(name, user_id),
        profiles:assignee_id(email, display_name)
      `)
      .not('due_date', 'is', null)
      .is('completed_at', null)
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', tomorrow.toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: 'No tasks due today or tomorrow' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group tasks by user
    const tasksByUser: Record<string, Task[]> = {};
    tasks.forEach((task: any) => {
      const userId = task.assignee_id || task.projects.user_id;
      if (!tasksByUser[userId]) {
        tasksByUser[userId] = [];
      }
      tasksByUser[userId].push(task);
    });

    // Get user emails and send notifications
    const notifications = [];
    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
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

      // Group tasks by due date
      const tasksToday: Task[] = [];
      const tasksTomorrow: Task[] = [];

      userTasks.forEach((task) => {
        const taskDate = new Date(task.due_date);
        if (taskDate.toDateString() === today.toDateString()) {
          tasksToday.push(task);
        } else {
          tasksTomorrow.push(task);
        }
      });

      // Send email notification
      const emailContent = generateEmailContent(
        profile.display_name || 'User',
        tasksToday,
        tasksTomorrow
      );

      // In a real implementation, you would send an email here
      // For now, we'll log it and return the notification data
      console.log(`Would send email to ${profile.email}:`, emailContent);

      notifications.push({
        userId,
        email: profile.email,
        tasksToday: tasksToday.length,
        tasksTomorrow: tasksTomorrow.length,
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        notifications,
        totalTasks: tasks.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in due-date-notifications:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailContent(
  userName: string,
  tasksToday: Task[],
  tasksTomorrow: Task[]
): string {
  let content = `Hello ${userName},\n\n`;
  content += `You have tasks due soon:\n\n`;

  if (tasksToday.length > 0) {
    content += `📅 Due Today (${tasksToday.length}):\n`;
    tasksToday.forEach((task) => {
      const time = task.due_time || 'All day';
      const priority = task.priority ? `[${task.priority.toUpperCase()}]` : '';
      content += `  • ${task.title} ${priority} - ${time}\n`;
      content += `    Project: ${task.projects.name}\n`;
    });
    content += '\n';
  }

  if (tasksTomorrow.length > 0) {
    content += `📅 Due Tomorrow (${tasksTomorrow.length}):\n`;
    tasksTomorrow.forEach((task) => {
      const time = task.due_time || 'All day';
      const priority = task.priority ? `[${task.priority.toUpperCase()}]` : '';
      content += `  • ${task.title} ${priority} - ${time}\n`;
      content += `    Project: ${task.projects.name}\n`;
    });
    content += '\n';
  }

  content += `View your calendar: [Your Calendar URL]\n`;
  content += `\nBest regards,\nPortfolio Platform`;

  return content;
}
