'use client';

import React from 'react';
import { listTemplates } from '@/domain/templates/registry';
import { convertTemplateDefToPortfolioTemplate } from '@/domain/builder/templates/converter';
import { BlockRenderer } from '@/components/portfolio/editor/BlockRenderer';

export default function TemplatesSnapshotPage() {
  const templates = listTemplates();

  return (
    <div className="bg-white min-h-screen">
      {templates.map(template => {
        const portfolio = convertTemplateDefToPortfolioTemplate(template);
        const homePage = portfolio.pages_schema.find(p => p.slug === 'home');
        const heroBlock = homePage?.blocks.find(b =>
          b.block_type.includes('hero')
        );

        if (!heroBlock) return null;

        return (
          <div
            key={template.id}
            id={`template-${template.id}`}
            className="mb-20"
          >
            <h2 className="bg-gray-100 p-4 font-mono text-sm border-b">
              Template: {template.id} ({template.name})
            </h2>
            <div
              className="relative border shadow-sm overflow-hidden"
              style={{ height: '800px' }}
            >
              <BlockRenderer
                block={heroBlock as any}
                isEditing={false}
                onUpdate={() => { }}
                onDelete={() => { }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
