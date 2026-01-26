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
import type { ActivityType } from '@/lib/services/crm';

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
            }
            // Email handling to be added
        } catch (error) {
            console.error('Failed to create activity', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-muted/50 border-b px-2 pt-2">
                    <TabsList className="bg-transparent h-10 w-full justify-start gap-1 p-0">
                        <TabsTrigger
                            value="note"
                            className="px-3 rounded-t-md data-[state=active]:bg-background data-[state=active]:shadow-sm border-t border-x border-transparent data-[state=active]:border-border border-b-0 rounded-b-none"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Note
                        </TabsTrigger>
                        <TabsTrigger
                            value="call"
                            className="px-3 rounded-t-md data-[state=active]:bg-background data-[state=active]:shadow-sm border-t border-x border-transparent data-[state=active]:border-border border-b-0 rounded-b-none"
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                        </TabsTrigger>
                        <TabsTrigger
                            value="meeting"
                            className="px-3 rounded-t-md data-[state=active]:bg-background data-[state=active]:shadow-sm border-t border-x border-transparent data-[state=active]:border-border border-b-0 rounded-b-none"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Meeting
                        </TabsTrigger>
                        <TabsTrigger
                            value="task"
                            className="px-3 rounded-t-md data-[state=active]:bg-background data-[state=active]:shadow-sm border-t border-x border-transparent data-[state=active]:border-border border-b-0 rounded-b-none"
                        >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Task
                        </TabsTrigger>
                        <TabsTrigger
                            value="email"
                            className="px-3 rounded-t-md data-[state=active]:bg-background data-[state=active]:shadow-sm border-t border-x border-transparent data-[state=active]:border-border border-b-0 rounded-b-none"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-4 space-y-4 bg-background">
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
                                className="font-medium text-base border-0 px-0 focus-visible:ring-0 border-b rounded-none"
                                value={activitySubject}
                                onChange={(e) => setActivitySubject(e.target.value)}
                                autoFocus
                            />

                            <div className="flex flex-wrap gap-4 items-center text-sm">
                                {/* Date Picker */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            size="sm"
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !activityDate && "text-muted-foreground"
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
                                <div className="flex items-center border rounded-md px-2 py-1 h-9">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <input
                                        type="time"
                                        value={activityTime}
                                        onChange={(e) => setActivityTime(e.target.value)}
                                        className="bg-transparent outline-none w-24 text-sm"
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

                    <TabsContent value="email" className="m-0 space-y-4">
                        <div className="text-center py-8 text-muted-foreground">
                            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Email composition coming soon!</p>
                        </div>
                    </TabsContent>

                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <div className="text-xs text-muted-foreground">
                            {/* Could add rich text toolbar here */}
                        </div>
                        <Button
                            size="sm"
                            className={cn(
                                "bg-green-600 hover:bg-green-700 text-white gap-2 transition-all",
                                isSubmitting && "opacity-70 cursor-not-allowed"
                            )}
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {activeTab === 'note' ? 'Save Note' : 'Schedule Activity'}
                        </Button>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
