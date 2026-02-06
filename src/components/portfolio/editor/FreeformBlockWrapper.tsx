'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GripHorizontal } from 'lucide-react';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

interface FreeformBlockWrapperProps {
    block: PortfolioBlock;
    children: React.ReactNode;
    isEditing?: boolean;
    isSelected?: boolean;
    onLayoutUpdate: (layout: Partial<PortfolioBlock['layout']>) => void;
    onSelect: () => void;
}

export function FreeformBlockWrapper({
    block,
    children,
    isEditing = false,
    isSelected = false,
    onLayoutUpdate,
    onSelect,
}: FreeformBlockWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const layout = block.layout || {};

    // Default values
    const x = layout.x ?? 0;
    const y = layout.y ?? 0;
    const width = layout.width ?? 'auto';
    const height = layout.height ?? 'auto';
    const zIndex = layout.zIndex ?? 10;

    const [isResizing, setIsResizing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (_: any, info: any) => {
        setIsDragging(false);
        onLayoutUpdate({
            x: x + info.offset.x,
            y: y + info.offset.y,
        });
    };

    const handleResize = (direction: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = typeof width === 'number' ? width : containerRef.current?.offsetWidth || 200;
        const startHeight = typeof height === 'number' ? height : containerRef.current?.offsetHeight || 100;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (direction.includes('right')) newWidth = Math.max(100, startWidth + deltaX);
            if (direction.includes('bottom')) newHeight = Math.max(50, startHeight + deltaY);

            // Update UI immediately (visual feedback)
            if (containerRef.current) {
                containerRef.current.style.width = `${newWidth}px`;
                containerRef.current.style.height = `${newHeight}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setIsResizing(false);

            const finalWidth = containerRef.current?.offsetWidth || startWidth;
            const finalHeight = containerRef.current?.offsetHeight || startHeight;

            onLayoutUpdate({
                width: finalWidth,
                height: finalHeight,
            });
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // Preview mode - no interaction
    if (!isEditing) {
        return (
            <div
                style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: width,
                    height: height,
                    zIndex: zIndex,
                }}
            >
                {children}
            </div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragListener={!isResizing}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: width,
                height: height,
                zIndex: isSelected ? 100 : zIndex,
            }}
            className={cn(
                "group select-none bg-background border border-transparent rounded-md overflow-hidden",
                isSelected && "ring-2 ring-primary shadow-lg",
                !isSelected && "hover:ring-1 hover:ring-primary/50",
                isDragging && "opacity-90 cursor-grabbing"
            )}
        >
            {/* Drag Handle - always visible when selected */}
            {isSelected && (
                <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-t-md flex items-center gap-1 text-xs cursor-grab active:cursor-grabbing z-[100]"
                    style={{ pointerEvents: 'auto' }}
                >
                    <GripHorizontal className="w-3 h-3" />
                    <span className="font-medium capitalize">{block.block_type}</span>
                </div>
            )}

            {/* Content - pointer events disabled during drag */}
            <div
                className={cn(
                    "w-full h-full",
                    isDragging && "pointer-events-none"
                )}
            >
                {children}
            </div>

            {/* Resize Handles - only when selected */}
            {isSelected && (
                <>
                    {/* Corner handles - more visible */}
                    <div
                        className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full cursor-nwse-resize z-[60] shadow-md border-2 border-background"
                        onMouseDown={(e) => handleResize('bottom-right', e)}
                    />
                    <div
                        className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-primary rounded-full cursor-nesw-resize z-[60] shadow-md border-2 border-background"
                        onMouseDown={(e) => handleResize('bottom', e)}
                    />
                    <div
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full cursor-nesw-resize z-[60] shadow-md border-2 border-background"
                        onMouseDown={(e) => handleResize('right', e)}
                    />
                    <div
                        className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-primary rounded-full cursor-nwse-resize z-[60] shadow-md border-2 border-background"
                    />

                    {/* Edge handles */}
                    <div
                        className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-8 bg-primary/80 rounded-full cursor-ew-resize z-[55]"
                        onMouseDown={(e) => handleResize('right', e)}
                    />
                    <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-primary/80 rounded-full cursor-ns-resize z-[55]"
                        onMouseDown={(e) => handleResize('bottom', e)}
                    />
                </>
            )}
        </motion.div>
    );
}

