'use client';

import { useState } from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgsService } from '@/domain/crm/services/orgs-service';
import { leadsService } from '@/domain/crm/services/leads-service';
import { OrganizationsList } from '@/components/crm/OrganizationsList';
import { AddOrganizationDialog } from '@/components/crm/AddOrganizationDialog'; // Added import
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Organization } from '@/domain/crm/types'; // For typing

export default function OrganizationsPage({ params: { locale } }: { params: { locale: string } }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: organizations = [], isLoading } = useQuery({
        queryKey: ['crm', 'organizations'],
        queryFn: () => orgsService.getAll(),
    });

    const createOrgMutation = useMutation({
        mutationFn: (data: Partial<Organization>) => orgsService.createNew(data as any), // Cast as any because verify schema later if needed, helper uses Zod
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm', 'organizations'] });
            toast.success('Organization created successfully');
            setIsAddOpen(false);
        },
        onError: (error) => {
            console.error('Failed to create organization:', error);
            toast.error('Failed to create organization');
        }
    });



    const createLeadMutation = useMutation({
        mutationFn: async ({ orgId, orgName }: { orgId: string; orgName: string }) => {
            return await leadsService.create({
                title: `${orgName} Opportunity`,
                organization_name: orgName,
                status: 'new',
                converted_organization_id: orgId, // Link directly
            });
        },
        onSuccess: () => {
            toast.success('Lead created from organization');
            router.push(`/${locale}/crm/leads`); // Redirect to leads to see it
        },
        onError: (error: any) => {
            console.error('Failed to create lead:', error);
            toast.error('Failed to create lead');
        }
    });

    return (
        <div className="animate-fade-up max-w-[1440px] mx-auto py-12 px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        B2B Overview
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display">
                        Organizations
                    </h1>
                    <p className="text-lg text-white/40 max-w-xl">
                        Manage your organizations and generate new opportunities from them.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        size="lg"
                        className="gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam px-8 h-12"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Organization</span>
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[300px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <OrganizationsList
                    organizations={organizations}
                    onCreateLeadFromOrg={async (orgId, orgName) => {
                        await createLeadMutation.mutateAsync({ orgId, orgName });
                    }}
                />
            )}

            <AddOrganizationDialog
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onCreateOrganization={async (data) => {
                    return await createOrgMutation.mutateAsync(data);
                }}
            />
        </div>
    );
}
