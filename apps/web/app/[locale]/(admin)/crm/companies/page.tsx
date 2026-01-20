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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Companies List */}
      <div className="w-80 shrink-0">
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
      <div className="w-96 shrink-0 border-r">
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
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold">Select a company</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a company from the sidebar to view its contacts
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Company Details */}
      <div className="flex-1 flex items-center justify-center">
        {selectedCompanyId ? (
          <div className="text-center">
            <p className="text-lg font-semibold">Company Details</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Company detail view coming soon
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold">Select a company</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a company from the sidebar to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
