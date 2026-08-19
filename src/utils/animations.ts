import { Transition } from 'framer-motion';

/**
 * BrainBites Admin Panel - Motion Tokens
 * Standardized Framer Motion physics for high-fidelity interactions.
 */

export const SPRING_SWIFT: Transition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 1
};

export const SPRING_SMOOTH: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 25,
    mass: 1
};

export const SPRING_BOUNCY: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 15,
    mass: 1.2
};

export const FADE_ONLY: Transition = {
    type: "tween",
    ease: "linear",
    duration: 0.2
};

export const PAGE_TRANSITION = {
    initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -20, filter: 'blur(10px)' },
    transition: SPRING_SMOOTH
};

export const DRAWER_TRANSITION = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: SPRING_SMOOTH
};
