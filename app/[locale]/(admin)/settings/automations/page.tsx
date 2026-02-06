'use client';

import { useState } from 'react';
import { AutomationBuilder } from '@/components/automations/AutomationBuilder';
import { AutomationList } from '@/components/automations/AutomationList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AutomationsPage() {
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Automations</h1>
                    <p className="text-white/50">Manage global automation rules.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} className="bg-primary text-white gap-2">
                        <Plus className="w-4 h-4" />
                        Create Rule
                    </Button>
                )}
            </div>

            {isCreating ? (
                <div className="mb-8">
                    <AutomationBuilder
                        onSuccess={() => setIsCreating(false)}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            ) : null}

            <AutomationList />
        </div>
    );
}
