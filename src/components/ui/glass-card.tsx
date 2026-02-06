import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "hover" | "active"
    children: React.ReactNode
    className?: string
}

export function GlassCard({
    variant = "default",
    children,
    className,
    ...props
}: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-xl transition-all duration-300",
                "border-white/5 shadow-glass",
                variant === "hover" && "hover:bg-card/80 hover:scale-[1.02] hover:shadow-glow-soft cursor-pointer",
                variant === "active" && "bg-primary/5 border-primary/20",
                className
            )}
            {...props}
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}
