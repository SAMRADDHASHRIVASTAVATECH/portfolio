/* ============================================================
   ANIMATIONS.CSS — Keyframes & Animation Utilities
   ============================================================ */

/* ---- Keyframes ---- */

/* Pulsing status dot */
@keyframes pulse-dot {
    0%, 100% {
        box-shadow: 0 0 0 0 var(--accent-green-glow);
    }
    50% {
        box-shadow: 0 0 0 6px transparent;
    }
}

/* Scroll line indicator */
@keyframes scroll-line {
    0% {
        opacity: 1;
        transform: scaleY(0);
        transform-origin: top;
    }
    50% {
        opacity: 1;
        transform: scaleY(1);
        transform-origin: top;
    }
    51% {
        transform-origin: bottom;
    }
    100% {
        opacity: 0;
        transform: scaleY(0);
        transform-origin: bottom;
    }
}

/* Terminal cursor blink */
@keyframes blink-cursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

/* Floating orb movement */
@keyframes float-orb-1 {
    0%, 100% {
        transform: translate(0, 0) scale(1);
    }
    25% {
        transform: translate(30px, -40px) scale(1.05);
    }
    50% {
        transform: translate(-20px, -60px) scale(0.95);
    }
    75% {
        transform: translate(40px, -20px) scale(1.02);
    }
}

@keyframes float-orb-2 {
    0%, 100% {
        transform: translate(0, 0) scale(1);
    }
    33% {
        transform: translate(-30px, 30px) scale(1.1);
    }
    66% {
        transform: translate(20px, -20px) scale(0.9);
    }
}

@keyframes float-orb-3 {
    0%, 100% {
        transform: translate(0, 0);
    }
    25% {
        transform: translate(-40px, 20px);
    }
    50% {
        transform: translate(30px, 40px);
    }
    75% {
        transform: translate(-10px, -30px);
    }
}

/* Gradient text shimmer */
@keyframes gradient-shift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

/* ---- Animation Classes ---- */

/* Hero orb floating animations */
.hero__orb--1 {
    animation: float-orb-1 12s ease-in-out infinite;
}

.hero__orb--2 {
    animation: float-orb-2 15s ease-in-out infinite;
}

.hero__orb--3 {
    animation: float-orb-3 10s ease-in-out infinite;
}

/* Reveal animation base states (GSAP will override) */
[data-reveal] {
    opacity: 0;
    transform: translateY(30px);
}

/* Stagger children */
.bento__card {
    opacity: 0;
    transform: translateY(20px);
}

.project-card {
    opacity: 0;
    transform: translateY(30px);
}

.workflow__step {
    opacity: 0;
    transform: translateX(-20px);
}

.ecosystem__domain {
    opacity: 0;
    transform: translateY(20px);
}

/* ---- Hover Micro-interactions ---- */

/* Card glow on hover — radial gradient follow (requires JS for mouse tracking) */
.project-card {
    --mouse-x: 50%;
    --mouse-y: 50%;
}

/* Badge pop */
.badge {
    transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease;
}

/* Nav link underline slide */
.nav__link:not(.nav__link--cta)::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent-green);
    transition: width var(--transition-base);
}

.nav__link:not(.nav__link--cta):hover::after {
    width: 100%;
}

/* ---- Transition utilities ---- */
.fade-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
}

/* Loading state */
body.is-loading {
    overflow: hidden;
}

body.is-loading * {
    animation-play-state: paused !important;
}