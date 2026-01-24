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
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Search, Folder, Image as ImageIcon, Video, File } from 'lucide-react';
import { useEditorStore } from '@/stores/portfolio';
import Image from 'next/image';

interface MediaLibraryProps {
  onSelect?: (mediaId: string, url: string) => void;
  multiple?: boolean;
}

export function MediaLibrary({ onSelect, multiple = false }: MediaLibraryProps) {
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

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
    },
  });

  // Filter media by search
  const filteredMedia = media.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.file_name.toLowerCase().includes(query) ||
      item.alt_text?.toLowerCase().includes(query) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  const handleSelect = (item: any) => {
    if (multiple) {
      const isSelected = selectedMedia.includes(item.id);
      if (isSelected) {
        setSelectedMedia(selectedMedia.filter((id) => id !== item.id));
      } else {
        setSelectedMedia([...selectedMedia, item.id]);
      }
    } else {
      if (onSelect) {
        onSelect(item.id, item.optimized_url || item.file_path);
      }
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
    <div className="p-4 space-y-4">
      {/* Upload */}
      <div className="space-y-2">
        <Label htmlFor="media-upload" className="text-xs">Upload Media</Label>
        <div className="flex gap-2">
          <Input
            id="media-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('media-upload')?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Loading media...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {searchQuery ? 'No media found' : 'No media uploaded yet'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMedia.map((item: any) => {
            const MediaIcon = getMediaIcon(item.mime_type);
            const isSelected = selectedMedia.includes(item.id);

            return (
              <Card
                key={item.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelect(item)}
              >
                <CardContent className="p-2">
                  <div className="relative aspect-square bg-muted rounded overflow-hidden mb-2">
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
                  </div>
                  <div className="text-xs truncate" title={item.file_name}>
                    {item.file_name}
                  </div>
                  {item.file_size && (
                    <div className="text-xs text-muted-foreground">
                      {(item.file_size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selected Media Actions */}
      {multiple && selectedMedia.length > 0 && (
        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between">
          <span className="text-sm">
            {selectedMedia.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedMedia.forEach((id) => {
                  if (confirm('Delete selected media?')) {
                    deleteMediaMutation.mutate(id);
                  }
                });
                setSelectedMedia([]);
              }}
            >
              Delete
            </Button>
            <Button
              size="sm"
              onClick={() => {
                // TODO: Handle multiple selection
                console.log('Selected:', selectedMedia);
              }}
            >
              Use Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
