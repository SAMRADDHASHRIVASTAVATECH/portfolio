/* ============================================================
   ANIMATIONS.JS — GSAP ScrollTrigger & Canvas Engine
   Performance: 60fps target, hardware accelerated
   ============================================================ */

(function () {
    'use strict';

    // ============ DETECT CAPABILITIES ============
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const isLowPower = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : isMobile;

    // ============ REGISTER GSAP PLUGINS ============
    gsap.registerPlugin(ScrollTrigger);

    // Mark body as GSAP ready
    document.body.classList.add('gsap-ready');

    // ============ PARTICLE CANVAS SYSTEM ============
    const ParticleSystem = {
        canvas: null,
        ctx: null,
        particles: [],
        mouse: { x: -1000, y: -1000 },
        dpr: 1,
        animationId: null,
        width: 0,
        height: 0,

        init() {
            this.canvas = document.getElementById('bg-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);

            this.resize();
            this.createParticles();
            this.bindEvents();
            this.animate();
        },

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(this.dpr, this.dpr);
        },

        createParticles() {
            this.particles = [];
            // Fewer particles on mobile / low-power devices
            const count = isLowPower ? 30 : (isMobile ? 40 : 80);

            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1,
                    baseOpacity: Math.random() * 0.3 + 0.1
                });
            }
        },

        bindEvents() {
            if (!isTouchDevice) {
                window.addEventListener('mousemove', (e) => {
                    this.mouse.x = e.clientX;
                    this.mouse.y = e.clientY;
                }, { passive: true });
            }

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.resize();
                    this.createParticles();
                }, 250);
            }, { passive: true });

            // Pause when tab hidden
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(this.animationId);
                } else {
                    this.animate();
                }
            });
        },

        animate() {
            if (document.hidden) return;

            this.ctx.clearRect(0, 0, this.width, this.height);
            const connectionDist = isMobile ? 100 : 150;
            const mouseDist = 200;

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Wrap
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                // Mouse interaction (desktop only)
                if (!isTouchDevice) {
                    const dx = this.mouse.x - p.x;
                    const dy = this.mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouseDist) {
                        const force = (1 - dist / mouseDist) * 0.008;
                        p.vx -= dx * force;
                        p.vy -= dy * force;
                        p.opacity = p.baseOpacity + (1 - dist / mouseDist) * 0.4;
                    } else {
                        p.opacity += (p.baseOpacity - p.opacity) * 0.02;
                    }
                }

                // Dampen velocity
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
                this.ctx.fill();

                // Draw connections (skip on very low power)
                if (!isLowPower || !isMobile) {
                    for (let j = i + 1; j < this.particles.length; j++) {
                        const p2 = this.particles[j];
                        const cdx = p.x - p2.x;
                        const cdy = p.y - p2.y;
                        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                        if (cdist < connectionDist) {
                            const alpha = (1 - cdist / connectionDist) * 0.12;
                            this.ctx.beginPath();
                            this.ctx.moveTo(p.x, p.y);
                            this.ctx.lineTo(p2.x, p2.y);
                            this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                            this.ctx.lineWidth = 0.5;
                            this.ctx.stroke();
                        }
                    }
                }
            }

            this.animationId = requestAnimationFrame(() => this.animate());
        },

        destroy() {
            cancelAnimationFrame(this.animationId);
        }
    };

    // ============ CUSTOM CURSOR ============
    const CustomCursor = {
        dot: null,
        ring: null,
        cursor: null,
        pos: { x: 0, y: 0 },
        target: { x: 0, y: 0 },

        init() {
            if (isTouchDevice) return;

            this.cursor = document.getElementById('cursor');
            if (!this.cursor) return;

            this.dot = this.cursor.querySelector('.cursor__dot');
            this.ring = this.cursor.querySelector('.cursor__ring');

            window.addEventListener('mousemove', (e) => {
                this.target.x = e.clientX;
                this.target.y = e.clientY;
            }, { passive: true });

            // Hover state
            const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], [data-cursor-hover], [data-magnetic-micro]');
            hoverTargets.forEach((el) => {
                el.addEventListener('mouseenter', () => this.cursor.classList.add('cursor--hover'));
                el.addEventListener('mouseleave', () => this.cursor.classList.remove('cursor--hover'));
            });

            // Click state
            window.addEventListener('mousedown', () => this.cursor.classList.add('cursor--click'));
            window.addEventListener('mouseup', () => this.cursor.classList.remove('cursor--click'));

            this.render();
        },

        render() {
            // Dot follows instantly
            this.pos.x += (this.target.x - this.pos.x) * 0.15;
            this.pos.y += (this.target.y - this.pos.y) * 0.15;

            // Dot is instant
            gsap.set(this.dot, {
                x: this.target.x,
                y: this.target.y
            });

            // Ring lags behind
            gsap.set(this.ring, {
                x: this.pos.x,
                y: this.pos.y
            });

            requestAnimationFrame(() => this.render());
        }
    };

    // ============ MAGNETIC HOVER EFFECT ============
    const MagneticEffect = {
        init() {
            if (isTouchDevice) return;

            const magnets = document.querySelectorAll('[data-magnetic]');
            magnets.forEach((el) => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    const strength = 0.3;

                    gsap.to(el, {
                        x: x * strength,
                        y: y * strength,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                });

                el.addEventListener('mouseleave', () => {
                    gsap.to(el, {
                        x: 0,
                        y: 0,
                        duration: 0.6,
                        ease: 'elastic.out(1, 0.4)'
                    });
                });
            });
        }
    };

    // ============ GLOW FOLLOW EFFECT ============
    const GlowFollow = {
        init() {
            if (isTouchDevice) return;

            const glowEls = document.querySelectorAll('[data-hover-glow]');
            glowEls.forEach((el) => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    el.style.setProperty('--glow-x', x + '%');
                    el.style.setProperty('--glow-y', y + '%');
                });
            });
        }
    };

    // ============ SPLIT TEXT UTILITY ============
    function splitTextIntoChars(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';

        const chars = [];
        for (let i = 0; i < text.length; i++) {
            const charEl = document.createElement('span');
            charEl.className = 'hero__char';
            charEl.textContent = text[i] === ' ' ? '\u00A0' : text[i];
            charEl.style.display = 'inline-block';
            charEl.style.opacity = '0';
            charEl.style.transform = 'translateY(100%)';
            element.appendChild(charEl);
            chars.push(charEl);
        }

        return chars;
    }

    // ============ LOADER ============
    const Loader = {
        init(onComplete) {
            const loader = document.getElementById('loader');
            const fill = document.getElementById('loader-fill');
            const status = document.getElementById('loader-status');

            if (!loader || !fill) {
                onComplete();
                return;
            }

            const messages = [
                'Initializing Systems...',
                'Loading Modules...',
                'Compiling Assets...',
                'Connecting Networks...',
                'Systems Ready.'
            ];

            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 100) progress = 100;

                fill.style.width = progress + '%';

                const msgIndex = Math.min(
                    Math.floor(progress / 25),
                    messages.length - 1
                );
                if (status) status.textContent = messages[msgIndex];

                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        gsap.to(loader, {
                            opacity: 0,
                            duration: 0.6,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                loader.style.display = 'none';
                                onComplete();
                            }
                        });
                    }, 300);
                }
            }, 120);
        }
    };

    // ============ HERO ANIMATIONS ============
    function animateHero() {
        const tl = gsap.timeline({ delay: 0.2 });

        // Status badge
        tl.fromTo('.hero__status',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );

        // Title words — split into chars
        const titleWords = document.querySelectorAll('.hero__title-word[data-split-text]');
        titleWords.forEach((word) => {
            const chars = splitTextIntoChars(word);
            tl.to(chars, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.03,
                ease: 'power3.out'
            }, '-=0.3');
        });

        // Roles
        tl.fromTo('.hero__role',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
            '-=0.2'
        );

        tl.fromTo('.hero__role-sep',
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' },
            '-=0.3'
        );

        // Subtitle words
        const subtitleWords = document.querySelectorAll('.hero__subtitle-word');
        tl.fromTo(subtitleWords,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.15, ease: 'power2.out' },
            '-=0.1'
        );

        // Buttons
        tl.fromTo('.hero__actions .btn',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
            '-=0.2'
        );

        // Scroll indicator
        tl.fromTo('.hero__scroll-indicator',
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            '-=0.2'
        );
    }

    // ============ SCROLL ANIMATIONS ============
    function initScrollAnimations() {
        // Generic [data-reveal] elements
        const revealEls = document.querySelectorAll('[data-reveal]');
        revealEls.forEach((el) => {
            gsap.fromTo(el,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Section lines
        document.querySelectorAll('.section__line').forEach((line) => {
            gsap.fromTo(line,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Section title split-text
        document.querySelectorAll('.section__title[data-split-text]').forEach((title) => {
            ScrollTrigger.create({
                trigger: title,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                    const chars = splitTextIntoChars(title);
                    gsap.to(chars, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.02,
                        ease: 'power3.out'
                    });
                }
            });
        });

        // Counter animation
        document.querySelectorAll('[data-count]').forEach((el) => {
            const target = parseInt(el.getAttribute('data-count'));
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to(el, {
                        duration: 1.5,
                        ease: 'power2.out',
                        onUpdate: function () {
                            el.textContent = Math.round(this.progress() * target);
                        }
                    });
                }
            });
        });

        // Ecosystem domain bars
        document.querySelectorAll('.ecosystem__domain-fill').forEach((bar) => {
            const targetWidth = bar.getAttribute('data-width');
            ScrollTrigger.create({
                trigger: bar,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    gsap.to(bar, {
                        width: targetWidth + '%',
                        duration: 1.2,
                        ease: 'power2.out'
                    });
                }
            });
        });

        // Workflow steps stagger
        const workflowSteps = document.querySelectorAll('.workflow__step');
        if (workflowSteps.length) {
            ScrollTrigger.batch(workflowSteps, {
                start: 'top 88%',
                onEnter: (batch) => {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.08,
                            ease: 'power2.out'
                        }
                    );
                },
                once: true
            });
        }

        // Project cards stagger
        const projectCards = document.querySelectorAll('.project-card');
        if (projectCards.length) {
            ScrollTrigger.batch(projectCards, {
                start: 'top 88%',
                onEnter: (batch) => {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.06,
                            ease: 'power2.out'
                        }
                    );
                },
                once: true
            });
        }

        // Bento cards
        const bentoCards = document.querySelectorAll('.bento__card');
        if (bentoCards.length) {
            ScrollTrigger.batch(bentoCards, {
                start: 'top 88%',
                onEnter: (batch) => {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.08,
                            ease: 'power2.out'
                        }
                    );
                },
                once: true
            });
        }

        // Sandbox nodes
        const sandboxNodes = document.querySelectorAll('.sandbox-node');
        if (sandboxNodes.length) {
            ScrollTrigger.batch(sandboxNodes, {
                start: 'top 92%',
                onEnter: (batch) => {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 20, scale: 0.95 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.5,
                            stagger: 0.06,
                            ease: 'power2.out'
                        }
                    );
                },
                once: true
            });
        }

        // Hero parallax
        if (!isMobile) {
            gsap.to('.hero__geometry', {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.5
                }
            });

            gsap.to('.hero__container', {
                yPercent: -10,
                opacity: 0.3,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: '80% top',
                    scrub: 0.5
                }
            });
        }
    }

    // ============ TERMINAL TYPING EFFECT ============
    function initTerminal() {
        const terminalText = document.getElementById('terminal-text');
        if (!terminalText) return;

        const command = 'cat ./contact.json';
        let index = 0;

        ScrollTrigger.create({
            trigger: '.contact__terminal',
            start: 'top 80%',
            once: true,
            onEnter: () => {
                const typeInterval = setInterval(() => {
                    if (index < command.length) {
                        terminalText.textContent += command[index];
                        index++;
                    } else {
                        clearInterval(typeInterval);
                        // Show output
                        gsap.fromTo('.terminal__output',
                            { opacity: 0, y: 10 },
                            { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' }
                        );
                    }
                }, 60);
            }
        });

        // Hide output initially
        gsap.set('.terminal__output', { opacity: 0 });
    }

    // ============ SANDBOXES DRAG SCROLL ============
    function initSandboxDrag() {
        const wrapper = document.querySelector('.sandboxes__track-wrapper');
        if (!wrapper) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            wrapper.style.cursor = 'grabbing';
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        });

        wrapper.addEventListener('mouseleave', () => {
            isDown = false;
            wrapper.style.cursor = 'grab';
        });

        wrapper.addEventListener('mouseup', () => {
            isDown = false;
            wrapper.style.cursor = 'grab';
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            wrapper.scrollLeft = scrollLeft - walk;
        });
    }

    // ============ INITIALIZATION ============
    function boot() {
        if (prefersReducedMotion) {
            // Show everything immediately
            document.querySelectorAll('[data-reveal], [data-split-text], [data-char-reveal]').forEach((el) => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });

            document.querySelectorAll('.section__line').forEach((line) => {
                line.style.transform = 'scaleX(1)';
            });

            // Still init functional things
            ParticleSystem.init();
            CustomCursor.init();
            initSandboxDrag();
            initTerminal();
            return;
        }

        // Full experience
        ParticleSystem.init();
        CustomCursor.init();
        MagneticEffect.init();
        GlowFollow.init();
        animateHero();
        initScrollAnimations();
        initTerminal();
        initSandboxDrag();
    }

    // Loader → Boot sequence
    Loader.init(() => {
        boot();
    });

})();
