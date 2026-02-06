'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CompanyList } from '@/components/crm/CompanyList';
import { ContactList } from '@/components/crm/ContactList';
import { OrganizationDetailView } from '@/components/crm/OrganizationDetailView';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, PlusCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Company, Contact } from '@/domain/crm/crm';

export default function CompaniesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );

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
  const contactCounts = contacts.reduce(
    (acc, contact) => {
      if (contact.company_id) {
        acc[contact.company_id] = (acc[contact.company_id] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter contacts by selected company
  const filteredContacts = selectedCompanyId
    ? contacts.filter(c => c.company_id === selectedCompanyId)
    : [];

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: company, error } = await supabase
        .from('companies')
        .insert({ ...data, user_id: user.id })
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Company>;
    }) => {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      if (selectedCompanyId === variables) {
        setSelectedCompanyId(null);
      }
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="animate-fade-up max-w-[1600px] mx-auto py-12 px-6 h-full flex flex-col">
      {/* Pulse-style Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 shrink-0">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            B2B Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display">
            Companies
          </h1>
          <p className="text-lg text-white/40 max-w-xl">
            Everything is running smoothly. Manage your corporate relationships.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam px-8 h-12"
            onClick={() => {
              // Usually handled in CompanyList
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
        {/* Companies List */}
        <div className="w-80 shrink-0 surface-elevated border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-[2.5rem] overflow-hidden flex flex-col">
          <CompanyList
            companies={companies}
            currentCompanyId={selectedCompanyId || undefined}
            onCompanySelect={setSelectedCompanyId}
            onCompanyCreate={async data => {
              await createCompanyMutation.mutateAsync(data);
            }}
            onCompanyUpdate={async (id, data) => {
              await updateCompanyMutation.mutateAsync({ id, data });
            }}
            onCompanyDelete={async id => {
              await deleteCompanyMutation.mutateAsync(id);
            }}
            contactCounts={contactCounts}
          />
        </div>

        {/* Contacts List for Selected Company */}
        <div className="w-96 shrink-0 surface-elevated border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-[2.5rem] overflow-hidden flex flex-col">
          {selectedCompanyId ? (
            <ContactList
              contacts={filteredContacts}
              companies={companies}
              onContactSelect={contactId => {
                router.push(`/crm/contacts/${contactId}`);
              }}
              onContactCreate={async data => {
                await createContactMutation.mutateAsync({
                  ...data,
                  company_id: selectedCompanyId,
                });
              }}
              onContactUpdate={async (id, data) => {
                await updateContactMutation.mutateAsync({ id, data });
              }}
              onContactDelete={async id => {
                await deleteContactMutation.mutateAsync(id);
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center animate-fade-in p-8 text-center">
              <div className="animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Building2 className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-white mb-2">Select a business</p>
                <p className="text-sm text-white/40 leading-relaxed">
                  Choose a company from the sidebar to manage its key members and contacts.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Company Details */}
        <div className="flex-1 surface-elevated border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-[2.5rem] overflow-hidden flex flex-col min-w-0">
          {selectedCompanyId ? (
            (() => {
              const company = companies.find(c => c.id === selectedCompanyId);
              return company ? (
                <div className="flex-1 overflow-y-auto">
                  <OrganizationDetailView company={company} />
                </div>
              ) : null;
            })()
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-center">
              <div className="animate-scale-in max-w-sm">
                <div className="w-20 h-20 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-primary shadow-glow-soft">
                  <PlusCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white mb-3">Enterprise View</h3>
                <p className="text-white/40 leading-relaxed">
                  Deep dive into organizational structures, active deals, and interaction history.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
