import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all projects for the user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return new NextResponse('Error fetching projects', { status: 500 });
    }

    if (!projects || projects.length === 0) {
      return new NextResponse(generateEmptyICal(), {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'attachment; filename="tasks.ics"',
        },
      });
    }

    const projectIds = projects.map(p => p.id);

    // Get all tasks with due dates for the user's projects
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        description,
        due_date,
        due_time,
        priority,
        project_id,
        projects(id, name)
      `
      )
      .in('project_id', projectIds)
      .not('due_date', 'is', null)
      .is('completed_at', null)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return new NextResponse('Error fetching tasks', { status: 500 });
    }

    // Generate iCal content
    const icalContent = generateICal(tasks || []);

    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="tasks.ics"',
      },
    });
  } catch (error) {
    console.error('Error generating iCal:', error);
    return new NextResponse('Error generating calendar', { status: 500 });
  }
}

function generateEmptyICal(): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Portfolio Platform//Task Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Tasks',
    'X-WR-TIMEZONE:UTC',
    'END:VCALENDAR',
  ].join('\r\n');
}

function generateICal(tasks: any[]): string {
  const now = new Date();
  const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Portfolio Platform//Task Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Tasks`,
    `X-WR-TIMEZONE:UTC`,
  ];

  tasks.forEach(task => {
    if (!task.due_date) return;

    const dueDate = new Date(task.due_date);
    if (task.due_time) {
      const [hours, minutes] = task.due_time.split(':').map(Number);
      dueDate.setHours(hours, minutes, 0, 0);
    } else {
      dueDate.setHours(9, 0, 0, 0); // Default to 9 AM
    }

    const dtStart = format(dueDate, "yyyyMMdd'T'HHmmss'Z'");
    const dtEnd = format(
      new Date(dueDate.getTime() + 60 * 60 * 1000),
      "yyyyMMdd'T'HHmmss'Z'"
    ); // 1 hour duration

    const summary = escapeICalText(task.title);
    const description = escapeICalText(
      [
        task.description,
        task.projects?.name,
        `Priority: ${task.priority || 'None'}`,
      ]
        .filter(Boolean)
        .join('\\n')
    );

    const uid = `task-${task.id}@portfolio-platform`;

    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `PRIORITY:${getPriorityNumber(task.priority)}`,
      `STATUS:CONFIRMED`,
      `CREATED:${timestamp}`,
      `LAST-MODIFIED:${timestamp}`,
      'END:VEVENT'
    );
  });

  ical.push('END:VCALENDAR');

  return ical.join('\r\n');
}

function escapeICalText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function getPriorityNumber(priority: string | null | undefined): string {
  switch (priority) {
    case 'urgent':
      return '1';
    case 'high':
      return '2';
    case 'medium':
      return '5';
    case 'low':
      return '9';
    default:
      return '5';
  }
}
