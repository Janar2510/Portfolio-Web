'use client';

import { useState, useEffect } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, Plus, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';

interface User {
    id: string;
    email: string;
    // full_name?: string; 
    // avatar_url?: string;
}

interface AssigneePickerProps {
    assigneeIds: string[];
    onAssign: (userId: string) => void;
    onUnassign: (userId: string) => void;
}

export function AssigneePicker({ assigneeIds, onAssign, onUnassign }: AssigneePickerProps) {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const supabase = createClient();

    // Fetch potential assignees (e.g. all users, or project members)
    // For now, we'll fetch a simplified list or mock if no public users table
    useEffect(() => {
        async function fetchUsers() {
            // Ideally filtered by project members
            // But usually we need a way to get user list. 
            // supabase.auth.admin is not available on client.
            // We usually rely on a public.profiles table.

            // Assuming we might have public.users or relying on currently authenticated user + cached profiles
            // We'll try to fetch from project_members view if we had joined it with profiles.

            // Fallback: Just showing current user for now if no profiles table exists
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUsers([{ id: user.id, email: user.email || 'Current User' }]);
            }
        }
        fetchUsers();
    }, []);

    return (
        <div className="flex items-center gap-2">
            {/* Avatars */}
            <div className="flex -space-x-2">
                {assigneeIds.map(id => (
                    <div key={id} className="relative group">
                        <Avatar className="w-8 h-8 border-2 border-zinc-950">
                            <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs">
                                U
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={() => onUnassign(id)}
                            className="absolute -top-1 -right-1 bg-zinc-950 rounded-full text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <UserIcon className="w-3 h-3 p-0.5" />
                            {/* Using icon for removal indicator, could be X */}
                        </button>
                    </div>
                ))}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-dashed border-white/20 bg-transparent hover:bg-white/5 text-white/40">
                        <Plus className="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-60 bg-zinc-950 border-white/10" align="start">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Assign to..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup prefix="Members">
                                {users.map(user => (
                                    <CommandItem
                                        key={user.id}
                                        value={user.email}
                                        onSelect={() => {
                                            if (assigneeIds.includes(user.id)) {
                                                onUnassign(user.id);
                                            } else {
                                                onAssign(user.id);
                                            }
                                            setOpen(false);
                                        }}
                                        className="gap-2"
                                    >
                                        <Avatar className="w-6 h-6">
                                            <AvatarFallback className="text-[10px]">U</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{user.email}</span>
                                        {assigneeIds.includes(user.id) && (
                                            <Check className="ml-auto w-4 h-4" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
