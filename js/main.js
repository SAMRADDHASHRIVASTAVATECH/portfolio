/* ============================================================
   MAIN.JS — Complete Portfolio Engine
   Navigation + Canvas + GSAP + Terminal + Everything
   ============================================================ */

(function () {
    'use strict';

    // ========== DEVICE DETECTION ==========
    var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.innerWidth < 768;
    var isLowPower = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : isMobile;

    // ========== GSAP REGISTER ==========
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ========== NO-JS FALLBACK ==========
    // If GSAP failed to load, show everything
    if (typeof gsap === 'undefined') {
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        // Still run navigation
        initNavigation();
        return;
    }

    // ========== PARTICLE CANVAS ==========
    var canvas = document.getElementById('bg-canvas');
    var ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
    var particles = [];
    var mouseX = -9999;
    var mouseY = -9999;
    var canvasW = 0;
    var canvasH = 0;
    var animFrameId = null;

    function resizeCanvas() {
        if (!canvas) return;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvasW = window.innerWidth;
        canvasH = window.innerHeight;
        canvas.width = canvasW * dpr;
        canvas.height = canvasH * dpr;
        canvas.style.width = canvasW + 'px';
        canvas.style.height = canvasH + 'px';
        ctx.scale(dpr, dpr);
    }

    function createParticles() {
        particles = [];
        var count = isLowPower ? 25 : (isMobile ? 35 : 70);
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvasW,
                y: Math.random() * canvasH,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                r: Math.random() * 1.5 + 0.5,
                o: Math.random() * 0.25 + 0.08,
                bo: Math.random() * 0.25 + 0.08
            });
        }
    }

    function drawCanvas() {
        if (!ctx || document.hidden) return;

        ctx.clearRect(0, 0, canvasW, canvasH);
        var connDist = isMobile ? 90 : 130;
        var mouseDist = 180;

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvasW;
            if (p.x > canvasW) p.x = 0;
            if (p.y < 0) p.y = canvasH;
            if (p.y > canvasH) p.y = 0;

            if (!isTouchDevice) {
                var dx = mouseX - p.x;
                var dy = mouseY - p.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouseDist) {
                    var force = (1 - dist / mouseDist) * 0.006;
                    p.vx -= dx * force;
                    p.vy -= dy * force;
                    p.o = p.bo + (1 - dist / mouseDist) * 0.35;
                } else {
                    p.o += (p.bo - p.o) * 0.015;
                }
            }

            p.vx *= 0.99;
            p.vy *= 0.99;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,240,255,' + p.o + ')';
            ctx.fill();

            if (!isLowPower) {
                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var cdx = p.x - p2.x;
                    var cdy = p.y - p2.y;
                    var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                    if (cdist < connDist) {
                        var alpha = (1 - cdist / connDist) * 0.1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(0,240,255,' + alpha + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        animFrameId = requestAnimationFrame(drawCanvas);
    }

    function initCanvas() {
        if (!canvas || !ctx) return;
        resizeCanvas();
        createParticles();

        if (!isTouchDevice) {
            window.addEventListener('mousemove', function (e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }, { passive: true });
        }

        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeCanvas();
                createParticles();
            }, 250);
        }, { passive: true });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                cancelAnimationFrame(animFrameId);
            } else {
                drawCanvas();
            }
        });

        drawCanvas();
    }

    // ========== CUSTOM CURSOR ==========
    function initCursor() {
        if (isTouchDevice) return;

        var cursorEl = document.getElementById('cursor');
        if (!cursorEl) return;

        var dot = cursorEl.querySelector('.cursor__dot');
        var ring = cursorEl.querySelector('.cursor__ring');
        var posX = 0;
        var posY = 0;
        var targetX = 0;
        var targetY = 0;

        window.addEventListener('mousemove', function (e) {
            targetX = e.clientX;
            targetY = e.clientY;
        }, { passive: true });

        var hovers = document.querySelectorAll('a, button, [data-magnetic], [data-cursor-hover]');
        hovers.forEach(function (el) {
            el.addEventListener('mouseenter', function () { cursorEl.classList.add('cursor--hover'); });
            el.addEventListener('mouseleave', function () { cursorEl.classList.remove('cursor--hover'); });
        });

        function renderCursor() {
            posX += (targetX - posX) * 0.12;
            posY += (targetY - posY) * 0.12;

            if (dot) {
                dot.style.transform = 'translate(' + targetX + 'px,' + targetY + 'px)';
            }

            if (ring) {
                ring.style.transform = 'translate(' + posX + 'px,' + posY + 'px)';
            }

            requestAnimationFrame(renderCursor);
        }

        renderCursor();
    }

    // ========== MAGNETIC EFFECT ==========
    function initMagnetic() {
        if (isTouchDevice) return;

        var magnets = document.querySelectorAll('[data-magnetic]');
        magnets.forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;

                gsap.to(el, {
                    x: x * 0.25,
                    y: y * 0.25,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            el.addEventListener('mouseleave', function () {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.4)'
                });
            });
        });
    }

    // ========== GLOW FOLLOW ==========
    function initGlowFollow() {
        if (isTouchDevice) return;

        var glowEls = document.querySelectorAll('[data-hover-glow]');
        glowEls.forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = ((e.clientX - rect.left) / rect.width) * 100;
                var y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--glow-x', x + '%');
                el.style.setProperty('--glow-y', y + '%');
            });
        });
    }

    // ========== NAVIGATION ==========
    function initNavigation() {
        var nav = document.getElementById('nav');
        var navToggle = document.getElementById('nav-toggle');
        var navList = document.getElementById('nav-list');

        // Scroll state
        if (nav) {
            window.addEventListener('scroll', function () {
                if (window.scrollY > 50) {
                    nav.classList.add('nav--scrolled');
                } else {
                    nav.classList.remove('nav--scrolled');
                }
            }, { passive: true });
        }

        // Mobile toggle
        if (navToggle && navList) {
            navToggle.addEventListener('click', function () {
                var isOpen = navList.classList.contains('nav__list--open');

                if (isOpen) {
                    navList.classList.remove('nav__list--open');
                    navToggle.classList.remove('nav__toggle--active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                } else {
                    navList.classList.add('nav__list--open');
                    navToggle.classList.add('nav__toggle--active');
                    navToggle.setAttribute('aria-expanded', 'true');
                    document.body.style.overflow = 'hidden';
                }
            });

            // Close on link click
            navList.querySelectorAll('.nav__link').forEach(function (link) {
                link.addEventListener('click', function () {
                    navList.classList.remove('nav__list--open');
                    navToggle.classList.remove('nav__toggle--active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });

            // Close on ESC
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && navList.classList.contains('nav__list--open')) {
                    navList.classList.remove('nav__list--open');
                    navToggle.classList.remove('nav__toggle--active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });

            // Close on resize to desktop
            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    if (window.innerWidth >= 768 && navList.classList.contains('nav__list--open')) {
                        navList.classList.remove('nav__list--open');
                        navToggle.classList.remove('nav__toggle--active');
                        navToggle.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                }, 250);
            }, { passive: true });
        }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var id = anchor.getAttribute('href');
                if (id === '#') return;
                var target = document.querySelector(id);
                if (!target) return;

                e.preventDefault();
                var navH = nav ? nav.offsetHeight : 0;
                var top = target.getBoundingClientRect().top + window.scrollY - navH - 10;

                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });

        // Active link highlighter
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav__link');

        window.addEventListener('scroll', function () {
            var scrollPos = window.scrollY + 200;

            sections.forEach(function (section) {
                var sTop = section.offsetTop;
                var sHeight = section.offsetHeight;
                var sId = section.getAttribute('id');

                if (scrollPos >= sTop && scrollPos < sTop + sHeight) {
                    navLinks.forEach(function (link) {
                        link.classList.remove('nav__link--active');
                        if (link.getAttribute('href') === '#' + sId) {
                            link.classList.add('nav__link--active');
                        }
                    });
                }
            });
        }, { passive: true });
    }

    // ========== LOADER ==========
    function runLoader(callback) {
        var loader = document.getElementById('loader');
        var fill = document.getElementById('loader-fill');
        var status = document.getElementById('loader-status');

        if (!loader || !fill) {
            if (callback) callback();
            return;
        }

        var messages = [
            'Initializing Systems...',
            'Loading Modules...',
            'Compiling Assets...',
            'Connecting Networks...',
            'Systems Ready.'
        ];

        var progress = 0;
        var interval = setInterval(function () {
            progress += Math.random() * 18 + 5;
            if (progress > 100) progress = 100;

            fill.style.width = progress + '%';

            var msgIdx = Math.min(Math.floor(progress / 25), messages.length - 1);
            if (status) status.textContent = messages[msgIdx];

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(function () {
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.inOut',
                        onComplete: function () {
                            loader.style.display = 'none';
                            loader.style.visibility = 'hidden';
                            loader.style.pointerEvents = 'none';
                            if (callback) callback();
                        }
                    });
                }, 200);
            }
        }, 100);
    }

    // ========== HERO ANIMATION ==========
    function animateHero() {
        var tl = gsap.timeline({ delay: 0.15 });

        tl.fromTo('.hero__status',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );

        tl.fromTo('.hero__title-word',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' },
            '-=0.2'
        );

        tl.fromTo('.hero__role',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
            '-=0.3'
        );

        tl.fromTo('.hero__role-sep',
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' },
            '-=0.2'
        );

        tl.fromTo('.hero__subtitle-word',
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.1, ease: 'power2.out' },
            '-=0.1'
        );

        tl.fromTo('.hero__actions .btn',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
            '-=0.15'
        );

        tl.fromTo('.hero__scroll-indicator',
            { opacity: 0 },
            { opacity: 1, duration: 0.6 },
            '-=0.1'
        );
    }

    // ========== SCROLL ANIMATIONS ==========
    function initScrollAnimations() {
        // All [data-reveal] elements
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            gsap.fromTo(el,
                { opacity: 0, y: 24 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Section lines
        document.querySelectorAll('.section__line').forEach(function (line) {
            gsap.fromTo(line,
                { scaleX: 0, transformOrigin: 'left' },
                {
                    scaleX: 1,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Counters
        document.querySelectorAll('[data-count]').forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'));
            ScrollTrigger.create({
                trigger: el,
                start: 'top 90%',
                once: true,
                onEnter: function () {
                    var obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 1.2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            el.textContent = Math.round(obj.val);
                        }
                    });
                }
            });
        });

        // Ecosystem bars
        document.querySelectorAll('.ecosystem__domain-fill').forEach(function (bar) {
            var targetW = bar.getAttribute('data-width');
            ScrollTrigger.create({
                trigger: bar,
                start: 'top 92%',
                once: true,
                onEnter: function () {
                    gsap.to(bar, {
                        width: targetW + '%',
                        duration: 1,
                        ease: 'power2.out'
                    });
                }
            });
        });

        // Batch animations for cards
        var batchSets = [
            '.workflow__step',
            '.project-card',
            '.bento__card',
            '.sandbox-node',
            '.ecosystem__domain'
        ];

        batchSets.forEach(function (selector) {
            var els = document.querySelectorAll(selector);
            if (els.length) {
                ScrollTrigger.batch(els, {
                    start: 'top 92%',
                    onEnter: function (batch) {
                        gsap.fromTo(batch,
                            { opacity: 0, y: 24 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.5,
                                stagger: 0.06,
                                ease: 'power2.out'
                            }
                        );
                    },
                    once: true
                });
            }
        });

        // Hero parallax (desktop only)
        if (!isMobile) {
            gsap.to('.hero__geometry', {
                yPercent: 25,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.5
                }
            });
        }
    }

    // ========== TERMINAL TYPING ==========
    function initTerminal() {
        var terminalText = document.getElementById('terminal-text');
        var terminalOutput = document.getElementById('terminal-output');
        if (!terminalText) return;

        var command = 'cat ./contact.json';
        var charIndex = 0;

        // Initially hide output, but ENSURE it becomes visible
        if (terminalOutput) {
            terminalOutput.style.opacity = '0';
            terminalOutput.style.transform = 'translateY(8px)';
        }

        ScrollTrigger.create({
            trigger: '.contact__terminal',
            start: 'top 85%',
            once: true,
            onEnter: function () {
                var typeInterval = setInterval(function () {
                    if (charIndex < command.length) {
                        terminalText.textContent += command[charIndex];
                        charIndex++;
                    } else {
                        clearInterval(typeInterval);
                        // ALWAYS show output — never leave it hidden
                        if (terminalOutput) {
                            gsap.to(terminalOutput, {
                                opacity: 1,
                                y: 0,
                                duration: 0.4,
                                delay: 0.2,
                                ease: 'power2.out'
                            });
                        }
                    }
                }, 55);
            }
        });

        // FAILSAFE: if ScrollTrigger doesn't fire within 5s, show everything anyway
        setTimeout(function () {
            if (terminalOutput && terminalOutput.style.opacity === '0') {
                terminalOutput.style.opacity = '1';
                terminalOutput.style.transform = 'none';
            }
            if (terminalText && terminalText.textContent === '') {
                terminalText.textContent = command;
            }
        }, 5000);
    }

    // ========== FAILSAFE: SHOW EVERYTHING ==========
    // If anything is still hidden after 4 seconds, force show it
    function showEverythingFailsafe() {
        setTimeout(function () {
            document.querySelectorAll('[data-reveal]').forEach(function (el) {
                if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                    el.style.transition = 'none';
                }
            });

            // Also force-show terminal output
            var termOut = document.getElementById('terminal-output');
            if (termOut && parseFloat(getComputedStyle(termOut).opacity) < 0.1) {
                termOut.style.opacity = '1';
                termOut.style.transform = 'none';
            }
        }, 4000);
    }

    // ========== REDUCED MOTION ==========
    function handleReducedMotion() {
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });

        document.querySelectorAll('.section__line').forEach(function (line) {
            line.style.transform = 'scaleX(1)';
        });

        document.querySelectorAll('.ecosystem__domain-fill').forEach(function (bar) {
            bar.style.width = bar.getAttribute('data-width') + '%';
        });

        document.querySelectorAll('[data-count]').forEach(function (el) {
            el.textContent = el.getAttribute('data-count');
        });

        var termOut = document.getElementById('terminal-output');
        if (termOut) {
            termOut.style.opacity = '1';
            termOut.style.transform = 'none';
        }

        var termText = document.getElementById('terminal-text');
        if (termText) termText.textContent = 'cat ./contact.json';
    }

    // ========== BOOT SEQUENCE ==========
    function boot() {
        initNavigation();
        initCanvas();

        if (prefersReducedMotion) {
            handleReducedMotion();
            initCursor();
            return;
        }

        initCursor();
        initMagnetic();
        initGlowFollow();
        animateHero();
        initScrollAnimations();
        initTerminal();
        showEverythingFailsafe();
    }

    // ========== START ==========
    runLoader(boot);

})();
