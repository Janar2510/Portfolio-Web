'use client';

import { useState } from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleService as contactsService } from '@/domain/crm/services/people-service';
import { orgsService } from '@/domain/crm/services/orgs-service';
import { dealsService } from '@/domain/crm/services/deals-service';
import { ContactList } from '@/components/crm/ContactList';
import { AddDealDialog } from '@/components/crm/AddDealDialog';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Person as Contact } from '@/domain/crm/types';

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [dealDialogContact, setDealDialogContact] = useState<Contact | null>(null);

  // Fetch Contacts
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['crm', 'contacts'],
    queryFn: () => contactsService.getAll(),
  });

  // Fetch Companies
  const { data: companies = [] } = useQuery({
    queryKey: ['crm', 'organizations'],
    queryFn: () => orgsService.getAll(),
  });

  // Fetch Stages (for Create Deal)
  const { data: stages = [] } = useQuery({
    queryKey: ['crm', 'stages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_pipeline_stages').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const createContactMutation = useMutation({
    mutationFn: (data: any) => contactsService.createNew(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      toast.success('Contact created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create contact: ' + error.message);
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => contactsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      toast.success('Contact updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update contact');
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => contactsService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      toast.success('Contact deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete contact');
    }
  });

  const createDealMutation = useMutation({
    mutationFn: (data: any) => dealsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
      toast.success('Deal created successfully');
      setDealDialogContact(null);
    },
    onError: (error: any) => {
      console.error('Create Deal Error:', error);
      toast.error('Failed to create deal: ' + (error.message || 'Unknown error'));
    }
  });

  return (
    <div className="animate-fade-up max-w-[1440px] mx-auto py-12 px-6">


      {isLoadingContacts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[300px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <ContactList
          contacts={contacts}
          companies={companies}
          onContactSelect={(id) => {
            // For now, no separate detail view, editing happens inline or via dialog
            console.log('Selected contact:', id);
          }}
          onContactCreate={async (data) => {
            await createContactMutation.mutateAsync(data);
          }}
          onContactUpdate={async (id, data) => {
            await updateContactMutation.mutateAsync({ id, data });
          }}
          onContactDelete={async (id) => {
            await deleteContactMutation.mutateAsync(id);
          }}
          onCreateDeal={(contact) => {
            setDealDialogContact(contact);
          }}
        />
      )}

      {/* Reusing AddDealDialog but pre-filling contact */}
      {dealDialogContact && (
        <AddDealDialog
          isOpen={!!dealDialogContact}
          onClose={() => setDealDialogContact(null)}
          stages={stages}
          contacts={contacts}
          companies={companies}
          initialContactId={dealDialogContact.id}
          onCreateDeal={async (data) => {
            await createDealMutation.mutateAsync(data);
          }}
        />
      )}
    </div>
  );
}
