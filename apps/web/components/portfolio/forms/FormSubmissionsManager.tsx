/**
 * Form Submissions Manager Component
 * View and manage form submissions
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { useEditorStore } from '@/stores/portfolio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Download, Trash2, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function FormSubmissionsManager() {
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const { currentPage } = useEditorStore();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const siteId = currentPage?.site_id;

  // Fetch form submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['portfolio-form-submissions', siteId],
    queryFn: async () => {
      if (!siteId) return [];
      const response = await fetch(`/api/portfolio/forms/submissions?site_id=${siteId}`);
      if (!response.ok) {
        console.error('Failed to fetch form submissions:', response.statusText);
        return [];
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!siteId,
  });

  // Filter submissions by search
  const filteredSubmissions = submissions.filter((submission: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      submission.name?.toLowerCase().includes(query) ||
      submission.email?.toLowerCase().includes(query) ||
      submission.message?.toLowerCase().includes(query) ||
      submission.page_slug?.toLowerCase().includes(query)
    );
  });

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Message', 'Page', 'Submitted At'].join(','),
      ...filteredSubmissions.map((s: any) =>
        [
          s.name || '',
          s.email || '',
          `"${(s.message || '').replace(/"/g, '""')}"`,
          s.page_slug || '',
          s.submitted_at || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!siteId) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No site selected
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Form Submissions</h2>
          <p className="text-sm text-muted-foreground">
            View and manage contact form submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading submissions...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No submissions found' : 'No form submissions yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission: any) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.name || 'Anonymous'}
                  </TableCell>
                  <TableCell>{submission.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{submission.page_slug || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell>
                    {submission.submitted_at
                      ? format(new Date(submission.submitted_at), 'MMM d, yyyy HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        submission.is_read ? 'secondary' : 'default'
                      }
                    >
                      {submission.is_read ? 'Read' : 'New'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Submission Detail Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={(open) => !open && setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle>Form Submission Details</DialogTitle>
                <DialogDescription>
                  Submitted on{' '}
                  {selectedSubmission.submitted_at
                    ? format(
                        new Date(selectedSubmission.submitted_at),
                        'MMMM d, yyyy at HH:mm'
                      )
                    : 'Unknown date'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="mt-1">{selectedSubmission.name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="mt-1">
                      {selectedSubmission.email ? (
                        <a
                          href={`mailto:${selectedSubmission.email}`}
                          className="text-primary hover:underline"
                        >
                          {selectedSubmission.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Page</label>
                    <p className="mt-1">{selectedSubmission.page_slug || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="mt-1">
                      <Badge
                        variant={selectedSubmission.is_read ? 'secondary' : 'default'}
                      >
                        {selectedSubmission.is_read ? 'Read' : 'New'}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <div className="mt-1 p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">
                      {selectedSubmission.message || 'No message provided'}
                    </p>
                  </div>
                </div>
                {selectedSubmission.form_data && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Additional Data
                    </label>
                    <div className="mt-1 p-4 bg-muted rounded-md">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(selectedSubmission.form_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                {selectedSubmission.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selectedSubmission.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Reply
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
