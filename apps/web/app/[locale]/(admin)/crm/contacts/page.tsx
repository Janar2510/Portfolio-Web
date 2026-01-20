'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ContactList } from '@/components/crm/ContactList';
import { createClient } from '@/lib/supabase/client';
import type { Contact, Company } from '@/lib/services/crm';

export default function ContactsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Contact[];
    },
  });

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ['crm-companies'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as Company[];
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const supabase = createClient();
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return contact as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      const supabase = createClient();
      const { data: contact, error } = await supabase
        .from('contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return contact as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
  });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-96 shrink-0 border-r">
        <ContactList
          contacts={contacts}
          companies={companies}
          onContactSelect={(contactId) => {
            router.push(`/crm/contacts/${contactId}`);
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
        />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Select a contact to view details</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a contact from the sidebar or create a new one
          </p>
        </div>
      </div>
    </div>
  );
}
