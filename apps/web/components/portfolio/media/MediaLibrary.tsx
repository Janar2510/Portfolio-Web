/**
 * Media Library Component
 * Browse and manage uploaded media
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  Search,
  Folder,
  Image as ImageIcon,
  Video,
  File,
} from 'lucide-react';
import { useEditorStore } from '@/stores/portfolio';
import Image from 'next/image';

interface MediaLibraryProps {
  onSelect?: (mediaId: string, url: string) => void;
  onSelectMultiple?: (items: any[]) => void;
  multiple?: boolean;
}

export function MediaLibrary({
  onSelect,
  onSelectMultiple,
  multiple = false,
}: MediaLibraryProps) {
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const siteId = currentPage?.site_id;

  // Fetch media
  const { data: media = [], isLoading } = useQuery({
    queryKey: ['portfolio-media', siteId, selectedFolder],
    queryFn: async () => {
      if (!siteId) return [];
      return await portfolioService.getMedia(
        siteId,
        selectedFolder === 'all' ? undefined : selectedFolder
      );
    },
    enabled: !!siteId,
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      return await portfolioService.deleteMedia(mediaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-media', siteId] });
      setSelectedMediaIds(prev => prev.filter(id => id !== mediaId));
    },
  });

  // Filter media by search
  const filteredMedia = media.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.file_name.toLowerCase().includes(query) ||
      item.alt_text?.toLowerCase().includes(query) ||
      (item.tags &&
        item.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  });

  const handleSelect = (item: any) => {
    if (multiple) {
      const isSelected = selectedMediaIds.includes(item.id);
      if (isSelected) {
        setSelectedMediaIds(selectedMediaIds.filter(id => id !== item.id));
      } else {
        setSelectedMediaIds([...selectedMediaIds, item.id]);
      }
    } else {
      if (onSelect) {
        onSelect(item.id, item.optimized_url || item.file_path);
      }
    }
  };

  const handleUseSelected = () => {
    if (multiple && onSelectMultiple) {
      const selectedItems = media.filter((item: any) =>
        selectedMediaIds.includes(item.id)
      );
      onSelectMultiple(selectedItems);
      setSelectedMediaIds([]);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !siteId) return;

    for (const file of Array.from(files)) {
      try {
        await portfolioService.uploadMedia(siteId, file);
      } catch (error) {
        console.error('Failed to upload:', error);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['portfolio-media', siteId] });
  };

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    return File;
  };

  if (!siteId) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No site selected
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b space-y-4 bg-muted/20">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="media-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => document.getElementById('media-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading media...
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {searchQuery ? 'No media found' : 'No media uploaded yet'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((item: any) => {
              const MediaIcon = getMediaIcon(item.mime_type);
              const isSelected = selectedMediaIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`relative group aspect-square rounded-lg border bg-muted/30 overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  {item.mime_type.startsWith('image/') && item.optimized_url ? (
                    <Image
                      src={item.optimized_url}
                      alt={item.alt_text || item.file_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MediaIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {multiple && (
                    <div
                      className={`absolute top-2 right-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'bg-black/20 border-white/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate font-medium">
                      {item.file_name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Selection Actions */}
      {multiple && selectedMediaIds.length > 0 && (
        <div className="border-t p-4 bg-muted/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {selectedMediaIds.length} items selected
            </span>
            <span className="text-[10px] text-muted-foreground">
              Total size:{' '}
              {(
                media
                  .filter((i: any) => selectedMediaIds.includes(i.id))
                  .reduce(
                    (acc: number, i: any) => acc + (i.file_size || 0),
                    0
                  ) /
                1024 /
                1024
              ).toFixed(2)}{' '}
              MB
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-error-main hover:bg-error-light hover:text-error-main"
              onClick={() => {
                if (confirm(`Delete ${selectedMediaIds.length} items?`)) {
                  selectedMediaIds.forEach(id =>
                    deleteMediaMutation.mutate(id)
                  );
                }
              }}
            >
              Delete
            </Button>
            <Button size="sm" onClick={handleUseSelected}>
              Use Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
