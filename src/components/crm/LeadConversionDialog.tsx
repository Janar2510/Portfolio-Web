'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, ArrowRight, Zap, Target, User, Mail, Phone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Lead, Pipeline, PipelineStage } from '@/domain/crm/types';

interface LeadConversionDialogProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    onConvert: (data: {
        pipeline_id: string;
        stage_id: string;
        title: string;
        value?: number;
        person_name: string;
        organization_name?: string;
        email?: string;
        phone?: string;
        custom_fields?: Record<string, any>;
    }) => Promise<void>;
}

// Force HMR update
export function LeadConversionDialog({
    lead,
    isOpen,
    onClose,
    onConvert,
}: LeadConversionDialogProps) {
    const [personName, setPersonName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with lead data when lead changes
    useEffect(() => {
        if (lead) {
            setPersonName(lead.person_name || lead.title || '');
            setOrganizationName(lead.organization_name || '');
            setEmail(lead.email || '');
            setPhone(lead.phone || '');
        }
    }, [lead]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onConvert({
                person_name: personName,
                organization_name: organizationName,
                email: email,
                phone: phone,
                pipeline_id: '', // Not used
                stage_id: '',    // Not used
                title: '',       // Not used
            });
            onClose();
        } catch (error) {
            console.error('Failed to qualify lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const containerVariants: any = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-black/60 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] text-foreground rounded-[3rem]">
                <DialogHeader className="p-10 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Zap className="w-32 h-32 text-primary" strokeWidth={1} />
                    </div>

                    <div className="relative space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                            Qualification Step
                        </div>
                        <DialogTitle className="text-4xl font-bold tracking-tight text-white font-display uppercase leading-none">
                            Qualify Lead
                        </DialogTitle>
                        <p className="text-white/40 text-xs font-medium max-w-[300px]">
                            Turn this lead into a <strong>Person</strong> and <strong>Organization</strong> in your database.
                        </p>
                    </div>
                    <DialogDescription className="sr-only">
                        Convert lead to contact and organization.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-none">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="space-y-10"
                    >
                        <div className="space-y-6 pt-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/30 ml-1">
                                <div className="w-4 h-px bg-primary/20" />
                                Contact Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Person Name</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                        <Input
                                            value={personName}
                                            onChange={e => setPersonName(e.target.value)}
                                            placeholder="Full Name"
                                            className="h-14 pl-12 rounded-2xl bg-white/[0.01] border-white/5 focus:border-primary/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Organization</Label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                        <Input
                                            value={organizationName}
                                            onChange={e => setOrganizationName(e.target.value)}
                                            placeholder="Company Name"
                                            className="h-14 pl-12 rounded-2xl bg-white/[0.01] border-white/5 focus:border-primary/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                        <Input
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            className="h-14 pl-12 rounded-2xl bg-white/[0.01] border-white/5 focus:border-primary/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Phone Number</Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                        <Input
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="h-14 pl-12 rounded-2xl bg-white/[0.01] border-white/5 focus:border-primary/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer Actions */}
                    <div className="pt-10 flex justify-between items-center border-t border-white/5 mt-10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 rounded-2xl transition-all h-14 px-8"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-tight h-14 px-10 rounded-[1.5rem] shadow-glow-seafoam transition-all active:scale-95 gap-3 group"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <span>Transform to Contact</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
