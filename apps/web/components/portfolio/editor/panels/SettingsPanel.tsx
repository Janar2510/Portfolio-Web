/**
 * Settings Panel Component
 * General site settings and management links
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsManager } from '../../projects/ProjectsManager';
import { FormSubmissionsManager } from '../../forms/FormSubmissionsManager';
import { DomainSettings } from '../../domain/DomainSettings';
import { Settings, FolderKanban, Mail, Globe } from 'lucide-react';

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
        <TabsTrigger value="general" className="flex items-center gap-2 text-xs">
          <Settings className="h-3 w-3" />
          General
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2 text-xs">
          <FolderKanban className="h-3 w-3" />
          Projects
        </TabsTrigger>
        <TabsTrigger value="submissions" className="flex items-center gap-2 text-xs">
          <Mail className="h-3 w-3" />
          Submissions
        </TabsTrigger>
        <TabsTrigger value="domain" className="flex items-center gap-2 text-xs">
          <Globe className="h-3 w-3" />
          Domain
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto">
        <TabsContent value="general" className="mt-0 p-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>
                  General configuration for your portfolio site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  General site settings coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="projects" className="mt-0">
          <ProjectsManager />
        </TabsContent>
        <TabsContent value="submissions" className="mt-0">
          <FormSubmissionsManager />
        </TabsContent>
        <TabsContent value="domain" className="mt-0">
          <DomainSettings />
        </TabsContent>
      </div>
    </Tabs>
  );
}
