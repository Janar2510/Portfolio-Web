'use client';

import { useState } from 'react';
import {
    FileText,
    Phone,
    Users,
    CheckSquare,
    Mail,
    Calendar as CalendarIcon,
    Clock,
    Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ActivityType } from '@/domain/crm/crm';

interface ActivityComposerProps {
    dealId: string;
    onActivityCreate: (activity: any) => Promise<void>;
    onNoteCreate: (note: string) => Promise<void>;
    onEmailSend?: (email: any) => Promise<void>;
}

export function ActivityComposer({
    dealId,
    onActivityCreate,
    onNoteCreate,
    onEmailSend
}: ActivityComposerProps) {
    const [activeTab, setActiveTab] = useState('note');
    const [noteContent, setNoteContent] = useState('');
    const [activitySubject, setActivitySubject] = useState('');
    const [activityDate, setActivityDate] = useState<Date | undefined>(new Date());
    const [activityTime, setActivityTime] = useState('12:00');
    const [emailTo, setEmailTo] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (activeTab === 'note') {
                if (!noteContent.trim()) return;
                await onNoteCreate(noteContent);
                setNoteContent('');
            } else if (['call', 'meeting', 'task'].includes(activeTab)) {
                if (!activitySubject.trim()) return;

                // Construct due_date from date + time
                let dueDate = activityDate;
                if (dueDate && activityTime) {
                    const [hours, minutes] = activityTime.split(':').map(Number);
                    dueDate.setHours(hours, minutes);
                }

                await onActivityCreate({
                    deal_id: dealId,
                    activity_type: activeTab as ActivityType, // 'call', 'meeting', 'task'
                    title: activitySubject,
                    description: noteContent, // Use note content as description
                    due_date: dueDate?.toISOString(),
                    is_completed: false
                });

                setActivitySubject('');
                setNoteContent('');
            } else if (activeTab === 'email') {
                if (!emailTo.trim() || !activitySubject.trim() || !emailBody.trim()) return;

                if (onEmailSend) {
                    await onEmailSend({
                        to: emailTo,
                        subject: activitySubject,
                        body: emailBody,
                        deal_id: dealId
                    });
                    // Create a log activity for the email
                    await onActivityCreate({
                        deal_id: dealId,
                        activity_type: 'email',
                        title: `Email: ${activitySubject}`,
                        description: emailBody,
                        is_completed: true,
                        due_date: new Date().toISOString()
                    });
                }

                setEmailTo('');
                setActivitySubject('');
                setEmailBody('');
            }
        } catch (error) {
            console.error('Failed to create activity', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-sm overflow-hidden animate-fade-in group/composer">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-white/[0.03] border-b border-white/5 px-4 pt-4 pb-2">
                    <TabsList className="bg-white/5 h-11 w-full justify-start gap-1 p-1 rounded-full border border-white/5">
                        <TabsTrigger
                            value="note"
                            className="flex-1 rounded-full text-white/40 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow-seafoam-sm transition-all duration-300"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Note
                        </TabsTrigger>
                        <TabsTrigger
                            value="call"
                            className="flex-1 rounded-full text-white/40 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow-seafoam-sm transition-all duration-300"
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                        </TabsTrigger>
                        <TabsTrigger
                            value="meeting"
                            className="flex-1 rounded-full text-white/40 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow-seafoam-sm transition-all duration-300"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Meeting
                        </TabsTrigger>
                        <TabsTrigger
                            value="task"
                            className="flex-1 rounded-full text-white/40 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow-seafoam-sm transition-all duration-300"
                        >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Task
                        </TabsTrigger>
                        <TabsTrigger
                            value="email"
                            className="flex-1 rounded-full text-white/40 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow-seafoam-sm transition-all duration-300"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-6 space-y-4 bg-white/[0.01]">
                    <TabsContent value="note" className="m-0 space-y-4">
                        <Textarea
                            placeholder="Start typing your note..."
                            className="min-h-[100px] border-0 focus-visible:ring-0 resize-none p-0 text-base"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                        />
                    </TabsContent>

                    {(activeTab === 'call' || activeTab === 'meeting' || activeTab === 'task') && (
                        <TabsContent value={activeTab} className="m-0 space-y-4 animate-in fade-in-0 slide-in-from-top-2">
                            <Input
                                placeholder={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} subject...`}
                                className="font-bold text-lg border-0 px-0 focus-visible:ring-0 border-b border-white/5 rounded-none bg-transparent text-white placeholder:text-white/20"
                                value={activitySubject}
                                onChange={(e) => setActivitySubject(e.target.value)}
                                autoFocus
                            />

                            <div className="flex flex-wrap gap-4 items-center text-sm">
                                {/* Date Picker */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"ghost"}
                                            size="sm"
                                            className={cn(
                                                "justify-start text-left font-medium rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white",
                                                !activityDate && "text-white/20"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {activityDate ? format(activityDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={activityDate}
                                            onSelect={setActivityDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {/* Time Picker (Simple) */}
                                <div className="flex items-center border border-white/5 bg-white/5 rounded-xl px-3 py-1 h-9 group/time">
                                    <Clock className="h-4 w-4 mr-2 text-white/30 group-hover/time:text-primary transition-colors" />
                                    <input
                                        type="time"
                                        value={activityTime}
                                        onChange={(e) => setActivityTime(e.target.value)}
                                        className="bg-transparent outline-none w-24 text-sm text-white/60 font-medium"
                                    />
                                </div>
                            </div>

                            <Textarea
                                placeholder="Add description..."
                                className="min-h-[80px] border-0 focus-visible:ring-0 resize-none p-0"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                            />
                        </TabsContent>
                    )}

                    <TabsContent value="email" className="m-0 space-y-4 animate-in fade-in-0 slide-in-from-top-2">
                        <Input
                            placeholder="To: (e.g. client@example.com)"
                            className="font-medium text-sm border-0 px-0 focus-visible:ring-0 border-b rounded-none"
                            value={emailTo}
                            onChange={(e) => setEmailTo(e.target.value)}
                        />
                        <Input
                            placeholder="Subject"
                            className="font-medium text-base border-0 px-0 focus-visible:ring-0 border-b rounded-none"
                            value={activitySubject}
                            onChange={(e) => setActivitySubject(e.target.value)}
                        />
                        <Textarea
                            placeholder="Write your email..."
                            className="min-h-[150px] border-0 focus-visible:ring-0 resize-none p-0 text-base font-normal"
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                        />
                    </TabsContent>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                            Activity Composer
                        </div>
                        <Button
                            size="lg"
                            className={cn(
                                "rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 shadow-glow-soft transition-all",
                                isSubmitting && "opacity-70 cursor-not-allowed"
                            )}
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {activeTab === 'email' && <Send className="h-4 w-4" />}
                            {activeTab === 'note' ? 'Save Note' : activeTab === 'email' ? 'Send Email' : 'Schedule'}
                        </Button>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
