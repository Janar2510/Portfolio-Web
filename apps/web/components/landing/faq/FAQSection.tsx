'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
    {
        question: "Can I try before I buy?",
        answer: "Yes! All paid plans come with a 14-day free trial. No charge until the trial ends, and you can cancel anytime."
    },
    {
        question: "Can I change plans later?",
        answer: "Absolutely. You can upgrade or downgrade your plan at any time from your billing settings. Changes take effect immediately."
    },
    {
        question: "Do I need coding skills?",
        answer: "Not at all. Our drag-and-drop editor allows you to build stunning portfolios without writing a single line of code. However, custom CSS is available on higher tiers for advanced users."
    },
    {
        question: "Can I use my own domain?",
        answer: "Yes, you can connect your own custom domain (e.g., yourname.com) on the Starter plan and above. We handle the SSL certificates automatically."
    },
    {
        question: "What happens if I cancel?",
        answer: "If you cancel, your portfolio will remain active until the end of your billing period. After that, it will revert to the Free plan limits."
    },
    {
        question: "Do you offer discounts?",
        answer: "Yes, we offer a ~17% discount when you choose annual billing on any paid plan."
    }
];

export function FAQSection() {
    return (
        <section id="faq" className="py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-bold font-display text-navy-900 mb-6">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Everything you need to know about Copifolio billing, features, and support.
                        </p>
                        <div className="p-6 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                            <h4 className="font-semibold mb-2">Still have questions?</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                We're here to help. Chat with our support team.
                            </p>
                            <a href="mailto:support@copifolio.com" className="text-teal-600 font-medium hover:underline">
                                Contact Support →
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left font-medium text-foreground hover:text-teal-600">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    );
}
