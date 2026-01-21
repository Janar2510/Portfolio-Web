'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CompanyList } from '@/components/crm/CompanyList';
import { ContactList } from '@/components/crm/ContactList';
import { createClient } from '@/lib/supabase/client';
import type { Company, Contact } from '@/lib/services/crm';

export default function CompaniesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

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

  // Calculate contact counts per company
  const contactCounts = contacts.reduce((acc, contact) => {
    if (contact.company_id) {
      acc[contact.company_id] = (acc[contact.company_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Filter contacts by selected company
  const filteredContacts = selectedCompanyId
    ? contacts.filter((c) => c.company_id === selectedCompanyId)
    : [];

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const supabase = createClient();
      const { data: company, error } = await supabase
        .from('companies')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return company as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
      const supabase = createClient();
      const { data: company, error } = await supabase
        .from('companies')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return company as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      if (selectedCompanyId === id) {
        setSelectedCompanyId(null);
      }
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
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      {/* Companies List */}
      <div className="w-80 shrink-0 bg-card border-r border-border animate-slide-down">
        <CompanyList
          companies={companies}
          currentCompanyId={selectedCompanyId || undefined}
          onCompanySelect={setSelectedCompanyId}
          onCompanyCreate={async (data) => {
            await createCompanyMutation.mutateAsync(data);
          }}
          onCompanyUpdate={async (id, data) => {
            await updateCompanyMutation.mutateAsync({ id, data });
          }}
          onCompanyDelete={async (id) => {
            await deleteCompanyMutation.mutateAsync(id);
          }}
          contactCounts={contactCounts}
        />
      </div>

      {/* Contacts List for Selected Company */}
      <div className="w-96 shrink-0 border-r border-border bg-card">
        {selectedCompanyId ? (
          <ContactList
            contacts={filteredContacts}
            companies={companies}
            onContactSelect={(contactId) => {
              router.push(`/crm/contacts/${contactId}`);
            }}
            onContactCreate={async (data) => {
              await createContactMutation.mutateAsync({
                ...data,
                company_id: selectedCompanyId,
              });
            }}
            onContactUpdate={async (id, data) => {
              await updateContactMutation.mutateAsync({ id, data });
            }}
            onContactDelete={async (id) => {
              await deleteContactMutation.mutateAsync(id);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center animate-fade-in">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">Select a company</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a company from the sidebar to view its contacts
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Company Details */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
        {selectedCompanyId ? (
          <div className="text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-foreground">Company Details</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Company detail view coming soon
            </p>
          </div>
        ) : (
          <div className="text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-foreground">Select a company</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a company from the sidebar to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
