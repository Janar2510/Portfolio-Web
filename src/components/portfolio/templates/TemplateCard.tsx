/**
 * Template Card Component
 * Individual template card in the gallery
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Sparkles } from 'lucide-react';
import type { PortfolioTemplate } from '@/domain/builder/portfolio';
import Image from 'next/image';

interface TemplateCardProps {
  template: PortfolioTemplate;
  onPreview: () => void;
  onSelect: () => void;
}

export function TemplateCard({
  template,
  onPreview,
  onSelect,
}: TemplateCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={template.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {template.is_featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="bg-amber-500">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
        {template.is_premium && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">Premium</Badge>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={e => {
                e.stopPropagation();
                onPreview();
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onSelect();
              }}
            >
              Use Template
            </Button>
          </div>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            {template.category && (
              <Badge variant="outline" className="mt-1">
                {template.category}
              </Badge>
            )}
          </div>
        </div>
        {template.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>
      {template.features && template.features.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {template.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.features.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      )}
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{template.use_count || 0} uses</span>
        {template.demo_url && (
          <a
            href={template.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            onClick={e => e.stopPropagation()}
          >
            Live Demo →
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
