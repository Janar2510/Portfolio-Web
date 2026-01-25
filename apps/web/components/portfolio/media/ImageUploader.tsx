'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { mediaService } from '@/lib/services/media';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getCroppedImg } from '@/lib/utils/crop'; // We'll need to create this utility

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  aspectRatio?: number;
  className?: string;
  value?: string;
  disabled?: boolean;
}

export function ImageUploader({
  onUpload,
  aspectRatio = 16 / 9,
  className,
  value,
  disabled = false,
}: ImageUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      // 1. Get cropped image blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // 2. Upload to storage
      // Create a File object from Blob
      const file = new File([croppedBlob], `image-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      const url = await mediaService.uploadFile(file);

      onUpload(url);
      setIsDialogOpen(false);
      setImageSrc(null);
      toast.success('Image uploaded successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {value ? (
        <div className="relative group rounded-md overflow-hidden border bg-muted/20">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-auto object-cover max-h-[300px]"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              Change
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpload('')}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload image
            </p>
          </div>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      )}

      {/* Cropper Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={open => !isUploading && setIsDialogOpen(open)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-[400px] bg-black rounded-md overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Zoom</label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={val => setZoom(val[0])}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Save & Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
