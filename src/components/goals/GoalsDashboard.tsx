'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService, Goal, KeyResult } from '@/domain/goals';
import { Project } from '@/domain/projects';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trophy, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { CreateGoalDialog } from './CreateGoalDialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface GoalsDashboardProps {
    projectId?: string; // Optional: if provided, filters by project
}

export function GoalsDashboard({ projectId }: GoalsDashboardProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: goals = [] } = useQuery({
        queryKey: ['goals', projectId],
        queryFn: () => goalsService.getAll(projectId),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        Goals & OKRs
                    </h2>
                    <p className="text-sm text-white/40">Track high-level objectives and key results.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 border border-purple-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}
                {goals.length === 0 && (
                    <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-sm">
                        No goals set yet.
                    </div>
                )}
            </div>

            <CreateGoalDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                projectId={projectId}
            />
        </div>
    );
}

function GoalCard({ goal }: { goal: Goal }) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: keyResults = [] } = useQuery({
        queryKey: ['key-results', goal.id],
        queryFn: () => goalsService.getKeyResults(goal.id),
    });

    return (
        <div className="group bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
            <div className="p-4 flex items-start gap-4">
                <div className="mt-1">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border",
                        goal.status === 'completed'
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : "bg-white/5 border-white/10 text-white/40"
                    )}>
                        <Trophy className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-white text-lg">{goal.title}</h3>
                            {goal.description && <p className="text-sm text-white/50">{goal.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border",
                                goal.status === 'active' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                    goal.status === 'completed' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                        "bg-zinc-800 border-white/10 text-white/40"
                            )}>
                                {goal.status}
                            </span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-white/40">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-1.5 bg-white/5" indicatorClassName={cn(
                            goal.progress >= 100 ? "bg-green-500" : "bg-purple-500"
                        )} />
                    </div>

                    {/* Key Results Toggle */}
                    <div className="pt-2">
                        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-0 text-white/40 hover:text-white group-hover/card:text-white/60">
                                    {isOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                                    {keyResults.length} Key Results
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2 space-y-2">
                                {keyResults.map(kr => (
                                    <div key={kr.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                                        <span className="text-white/80">{kr.title}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/40 text-xs">
                                                {kr.current_value} / {kr.target_value} {kr.unit}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {keyResults.length === 0 && (
                                    <div className="text-xs text-white/20 italic">No key results defined.</div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            </div>
        </div>
    );
}
