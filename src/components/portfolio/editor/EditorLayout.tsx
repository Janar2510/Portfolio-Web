/**
 * Editor Layout Component
 * Main layout for the visual editor with sidebar, canvas, and settings panel
 */

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SiteService } from '@/domain/builder/services';
import { createDefaultConfig } from '@/domain/templates/registry';
import type { TemplateId } from '@/domain/templates/types';
import { useEditorStore } from '@/stores/portfolio';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import '@/domain/builder/blocks/definitions'; // Register blocks

interface EditorLayoutProps {
  pageId: string;
  siteId: string;
}

export function EditorLayout({ pageId, siteId }: EditorLayoutProps) {
  const { setCurrentPage, previewMode, setIsLoading, setSiteId, setDraftConfig } =
    useEditorStore();

  // Fetch Site Document (contains everything in config_draft)
  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ['portfolio-site', siteId],
    queryFn: async () => {
      const siteService = new SiteService();
      return await siteService.getSite(siteId);
    },
    enabled: !!siteId,
  });

  // Initialize editor draft config
  useEffect(() => {
    if (!site) return;

    setSiteId(siteId);
    setCurrentPage({
      id: pageId,
      site_id: siteId,
      title: 'Home',
      slug: 'home',
    } as any);

    if (site.draft_config) {
      setDraftConfig(site.draft_config);
      return;
    }

    const fallbackTemplateId =
      (site.template_id as TemplateId) ||
      (site.templateId as TemplateId) ||
      'minimal';
    const initialConfig = createDefaultConfig(fallbackTemplateId);
    if (initialConfig) {
      setDraftConfig(initialConfig);
    }
  }, [site, setCurrentPage, setDraftConfig, setSiteId, siteId, pageId]);

  useEffect(() => {
    setIsLoading(siteLoading);
  }, [siteLoading, setIsLoading]);

  if (siteLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Site not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorToolbar siteId={siteId} />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          className="border-r"
          style={{ width: 'calc(var(--space-24) * 4)' }}
          siteId={siteId}
        />
        <EditorCanvas previewMode={previewMode} />
      </div>
    </div>
  );
}
