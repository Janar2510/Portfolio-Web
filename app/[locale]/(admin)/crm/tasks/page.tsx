import { redirect } from 'next/navigation';

export default function CrmTasksRedirect() {
    redirect('/admin/projects/calendar'); // Reuse general calendar for now, or build specific CRM task view
}
