'use client';

import { useState } from 'react';
import {
    Building2,
    TrendingUp,
    MoreHorizontal,
    ArrowRight,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Organization } from '@/domain/crm/schemas';

interface OrganizationsListProps {
    organizations: Organization[];
    onCreateLeadFromOrg: (orgId: string, orgName: string) => Promise<void>;
}

export function OrganizationsList({
    organizations,
    onCreateLeadFromOrg,
}: OrganizationsListProps) {
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleCreateLead = async (org: Organization) => {
        setProcessingId(org.id);
        try {
            await onCreateLeadFromOrg(org.id, org.name);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Organizations Grid */}
            {organizations.length === 0 ? (
                <div className="col-span-full py-24 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-sm animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                        <Building2 className="w-8 h-8 text-white/10" />
                    </div>
                    <h3 className="text-xl font-bold text-white/40 uppercase tracking-tight font-display mb-2">No organizations found</h3>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/10 mb-8 max-w-[240px] text-center leading-relaxed">
                        Add organizations to manage your B2B relationships.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {organizations.map(org => (
                        <div
                            key={org.id}
                            className="group relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 shadow-sm backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-primary/30 hover:shadow-glow-seafoam-sm hover:scale-[1.02]"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-white tracking-tight leading-tight line-clamp-2">{org.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">
                                            {org.address?.city || 'HQ Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                                            Status
                                        </div>
                                        <div className="text-sm font-medium text-white/70">
                                            Active Client
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                                            Created
                                        </div>
                                        <div className="text-sm font-medium text-white/40">
                                            {new Date(org.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={processingId === org.id}
                                    onClick={() => handleCreateLead(org)}
                                    className="flex-1 rounded-xl bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/40 text-white font-bold h-10 transition-all"
                                >
                                    {processingId === org.id ? (
                                        <span className="animate-pulse">Creating...</span>
                                    ) : (
                                        <>
                                            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                                            Create Lead
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-xl hover:bg-white/5 text-white/20 hover:text-white h-10 px-3"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
