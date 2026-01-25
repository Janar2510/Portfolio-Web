import { Link } from '@/i18n/routing';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-navy-900 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/50 to-navy-900" />
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Ready to Build Your Professional Portfolio?
                </h2>
                <p className="text-xl text-teal-100/80 mb-10 max-w-2xl mx-auto">
                    Join thousands of freelancers who use Copifolio to showcase their work and grow their business. Start your free 14-day trial today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <GradientButton asChild className="text-lg">
                        <Link href="/register">
                            Get Started for Free <ArrowRight className="ml-2 size-5" />
                        </Link>
                    </GradientButton>
                    <p className="text-sm text-teal-200/60 mt-4 sm:mt-0 sm:absolute sm:bottom-0 sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-12">
                        No credit card required. Cancel anytime.
                    </p>
                </div>
            </div>
        </section>
    );
}
