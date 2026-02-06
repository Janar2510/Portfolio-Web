import { Variants } from 'framer-motion';

export const fadeUp: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { opacity: 0, y: -10 }
};

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { opacity: 0 }
};

export const sidebarTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1
};

export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const cardHover = {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.2 }
};
