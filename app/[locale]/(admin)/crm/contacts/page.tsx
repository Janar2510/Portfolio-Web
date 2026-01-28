'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ContactList } from '@/components/crm/ContactList';
import { createClient } from '@/lib/supabase/client';
import type { Contact, Company } from '@/domain/crm/crm';

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert({ ...data, user_id: user.id })
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Contact>;
    }) => {
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
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      <div className="w-96 shrink-0 border-r border-border bg-card animate-slide-down">
        <ContactList
          contacts={contacts}
          companies={companies}
          onContactSelect={contactId => {
            router.push(`/crm/contacts/${contactId}`);
          }}
          onContactCreate={async data => {
            await createContactMutation.mutateAsync(data);
          }}
          onContactUpdate={async (id, data) => {
            await updateContactMutation.mutateAsync({ id, data });
          }}
          onContactDelete={async id => {
            await deleteContactMutation.mutateAsync(id);
          }}
        />
      </div>
      <div className="flex-1 flex items-center justify-center animate-fade-in">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-foreground">
            Select a contact to view details
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a contact from the sidebar or create a new one
          </p>
        </div>
      </div>
    </div>
  );
}
