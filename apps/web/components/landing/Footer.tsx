import { Link } from '@/i18n/routing';
import { Twitter, Instagram, Github, Linkedin } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Templates', href: '#templates' },
            { label: 'Showcase', href: '#examples' },
        ],
        resources: [
            { label: 'Blog', href: '#' },
            { label: 'Help Center', href: '#' },
            { label: 'API Docs', href: '#' },
            { label: 'Status', href: '#' },
        ],
        company: [
            { label: 'About', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '#' },
            { label: 'Press', href: '#' },
        ],
        legal: [
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Cookies', href: '#' },
            { label: 'GDPR', href: '#' },
        ],
    };

    return (
        <footer className="bg-navy-900 border-t border-white/10 pt-20 pb-10 text-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-6">
                            <div className="size-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white">
                                <span className="text-lg">C</span>
                            </div>
                            <span>Copifolio</span>
                        </Link>
                        <p className="text-gray-400 max-w-sm mb-6">
                            The all-in-one platform for freelancers to showcase work, manage clients, and grow their revenue with professional tools.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Copifolio. Made with ♥ in Estonia.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-gray-500 text-sm flex items-center gap-2">
                            <span className="size-2 rounded-full bg-green-500"></span>
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
