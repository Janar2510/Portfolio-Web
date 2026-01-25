'use client';

import {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent,
} from "react";
import {
    AnimatePresence,
    motion,
    useMotionTemplate,
    useMotionValue,
    type MotionStyle,
    type MotionValue,
    type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// --- Types ---
type WrapperStyle = MotionStyle & {
    "--x": MotionValue<string>;
    "--y": MotionValue<string>;
};

interface Step {
    id: string;
    name: string;
    title: string;
    description: string;
    image: string;
}

// --- Constants ---
const steps: readonly Step[] = [
    {
        id: "1",
        name: "Step 1",
        title: "Connect Your Portfolio",
        description: "Import your existing projects or start from scratch with our intuitive builder. We support all major media formats and file types.",
        image: "/images/how-it-works/step1.png",
    },
    {
        id: "2",
        name: "Step 2",
        title: "Powerful Customization",
        description: "Gain full control over your aesthetic with advanced color palettes, typography, and layout blocks designed by top creatives.",
        image: "/images/how-it-works/step2.png",
    },
    {
        id: "3",
        name: "Step 3",
        title: "Manage Your Business",
        description: "Use our integrated CRM to track leads, manage projects, and communicate with clients directly through your dashboard.",
        image: "/images/how-it-works/step3.png",
    },
    {
        id: "4",
        name: "Step 4",
        title: "Scale and Automate",
        description: "Automate boring tasks and scale your outreach. Focus on what you do best while we handle the technical heavy lifting.",
        image: "/images/how-it-works/step4.png",
    },
];

const ANIMATION_PRESETS = {
    fadeInScale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
    },
} as const;

// --- Hooks ---
function useNumberCycler(totalSteps: number, interval: number = 8000) {
    const [currentNumber, setCurrentNumber] = useState(0);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setCurrentNumber((prev) => (prev + 1) % totalSteps);
        }, interval);
        return () => clearTimeout(timerId);
    }, [currentNumber, totalSteps, interval]);

    const setStep = useCallback((stepIndex: number) => {
        setCurrentNumber(stepIndex % totalSteps);
    }, [totalSteps]);

    return { currentNumber, setStep };
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        };
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);
    return isMobile;
}

// --- Components ---
const stepVariants: Variants = {
    inactive: { scale: 0.9, opacity: 0.6 },
    active: { scale: 1, opacity: 1 },
};

function FeatureCard({ step }: { step: number }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const isMobile = useIsMobile();

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        if (isMobile) return;
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            className="group relative w-full rounded-3xl"
            onMouseMove={handleMouseMove}
            style={{ "--x": useMotionTemplate`${mouseX}px`, "--y": useMotionTemplate`${mouseY}px` } as WrapperStyle}
        >
            <div className="relative w-full overflow-hidden rounded-3xl border border-[#354F6F]/30 bg-[#212D50]/40 backdrop-blur-xl transition-all duration-300 shadow-2xl">
                <div className="flex flex-col lg:flex-row min-h-[500px]">
                    {/* Text Content */}
                    <div className="p-10 lg:p-16 lg:w-1/2 flex flex-col justify-center relative z-10 text-left">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-6"
                            >
                                <div className="text-sm font-bold uppercase tracking-widest text-[#68A9A5]">
                                    {steps[step].name}
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold font-display text-white italic">
                                    {steps[step].title}
                                </h3>
                                <p className="text-lg leading-relaxed text-gray-400">
                                    {steps[step].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Image Content */}
                    <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-full overflow-hidden flex items-center justify-center p-8 bg-black/20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                className="w-full h-full relative"
                                {...ANIMATION_PRESETS.fadeInScale}
                            >
                                <img
                                    src={steps[step].image}
                                    alt={steps[step].title}
                                    className="w-full h-full object-contain rounded-2xl shadow-2xl ring-1 ring-[#68A9A5]/20"
                                    style={{ userSelect: "none" }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StepsNav({ current, onChange }: { current: number; onChange: (index: number) => void; }) {
    return (
        <nav aria-label="Progress" className="flex justify-center mt-12">
            <ol className="flex w-full flex-wrap items-center justify-center gap-3" role="list">
                {steps.map((step, stepIdx) => {
                    const isCompleted = current > stepIdx;
                    const isCurrent = current === stepIdx;
                    return (
                        <motion.li key={step.name} initial="inactive" animate={isCurrent ? "active" : "inactive"} variants={stepVariants} transition={{ duration: 0.3 }}>
                            <button
                                type="button"
                                className={cn(
                                    "group flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 focus:outline-none",
                                    isCurrent
                                        ? "bg-gradient-to-r from-[#3D726E] to-[#68A9A5] text-white shadow-lg shadow-teal-500/20"
                                        : "bg-[#212D50]/40 text-gray-400 hover:text-white border border-[#354F6F]/30"
                                )}
                                onClick={() => onChange(stepIdx)}
                            >
                                <span className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                                    isCompleted
                                        ? "bg-white text-[#3D726E]"
                                        : isCurrent
                                            ? "bg-white/20 text-white"
                                            : "bg-white/5 text-gray-500 group-hover:bg-white/10"
                                )}>
                                    {isCompleted ? <Check size={14} className="stroke-[3]" /> : <span>{stepIdx + 1}</span>}
                                </span>
                                <span className="hidden sm:inline-block">{step.name}</span>
                            </button>
                        </motion.li>
                    );
                })}
            </ol>
        </nav>
    );
}

export function HowItWorksSection() {
    const { currentNumber: step, setStep } = useNumberCycler(steps.length, 8000);

    return (
        <section id="how-it-works" className="min-h-screen bg-[#141C33] relative overflow-hidden flex flex-col justify-center py-20 lg:py-12">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3D726E]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#212D50]/20 rounded-full blur-[100px] -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col h-full">
                <div className="max-w-4xl mx-auto mb-10 lg:mb-8 text-center shrink-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-4">
                            How It <span className="text-[#68A9A5]">Works</span>
                        </h2>
                        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto italic">
                            Building a world-class portfolio has never been easier.
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto flex flex-col items-center flex-1 justify-center gap-8">
                    <FeatureCard step={step} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="shrink-0"
                    >
                        <StepsNav current={step} onChange={setStep} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
