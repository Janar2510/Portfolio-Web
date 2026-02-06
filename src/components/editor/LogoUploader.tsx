'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { ThemeLogo } from '@/domain/sites/theme-schema';

interface LogoUploaderProps {
    value: ThemeLogo | undefined;
    onChange: (logo: ThemeLogo | undefined) => void;
    onUpload?: (file: File) => Promise<string>; // Returns uploaded URL
}

export function LogoUploader({ value, onChange, onUpload }: LogoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // If onUpload is provided, use it to upload to storage
            // Otherwise, create a local object URL for preview
            const url = onUpload
                ? await onUpload(file)
                : URL.createObjectURL(file);

            // Get image dimensions
            const img = new window.Image();
            img.src = url;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            onChange({
                url,
                alt: file.name.replace(/\.[^/.]+$/, ''),
                width: img.width,
                height: img.height,
            });
        } catch (error) {
            console.error('Failed to upload logo:', error);
            alert('Failed to upload logo. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleRemove = () => {
        onChange(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-base font-semibold">Logo</Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload your logo to appear in the header (recommended: PNG with transparent background)
                </p>
            </div>

            {value?.url ? (
                // Logo preview
                <Card className="p-6 bg-[hsl(var(--bg-elevated))]">
                    <div className="flex items-start gap-4">
                        <div className="relative w-32 h-32 bg-white rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                            <Image
                                src={value.url}
                                alt={value.alt || 'Logo'}
                                width={value.width || 128}
                                height={value.height || 128}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div>
                                <Label htmlFor="logo-alt" className="text-sm">Alt Text</Label>
                                <Input
                                    id="logo-alt"
                                    value={value.alt || ''}
                                    onChange={(e) => onChange({ ...value, alt: e.target.value })}
                                    placeholder="Logo description"
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{value.width} × {value.height}px</span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                className="gap-2"
                            >
                                <X className="w-4 h-4" />
                                Remove Logo
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                // Upload area
                <Card
                    className={`
            p-8 border-2 border-dashed transition-all cursor-pointer
            ${dragActive
                            ? 'border-[hsl(var(--brand-violet))] bg-[hsl(var(--brand-violet))]/5'
                            : 'border-border hover:border-[hsl(var(--brand-violet))] hover:bg-[hsl(var(--bg-elevated))]'
                        }
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-[hsl(var(--bg-elevated))] flex items-center justify-center">
                            {isUploading ? (
                                <div className="w-8 h-8 border-4 border-[hsl(var(--brand-violet))] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Upload className="w-8 h-8 text-[hsl(var(--brand-violet))]" />
                            )}
                        </div>

                        <div>
                            <p className="font-semibold mb-1">
                                {isUploading ? 'Uploading...' : 'Drop your logo here'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                or click to browse (PNG, JPG, SVG • Max 5MB)
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                        />
                    </div>
                </Card>
            )}

            {/* Tips */}
            <div className="p-4 bg-[hsl(var(--bg-surface))] rounded-lg border text-sm">
                <p className="font-semibold mb-2">💡 Logo Tips:</p>
                <ul className="space-y-1 text-muted-foreground">
                    <li>• Use PNG format with transparent background for best results</li>
                    <li>• Recommended size: 200-400px wide</li>
                    <li>• Keep it simple and recognizable at small sizes</li>
                </ul>
            </div>
        </div>
    );
}
