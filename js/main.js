/* ============================================================
   MAIN.JS — God-Level Core Functionality
   Samraddha Shrivastava Portfolio
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       DOM REFERENCES
       ============================================================ */
    var nav = document.getElementById('nav');
    var navToggle = document.getElementById('nav-toggle');
    var navList = document.getElementById('nav-list');
    var navLinks = document.querySelectorAll('.nav__link');
    var bgCanvas = document.getElementById('bg-canvas');
    var cursor = document.getElementById('cursor');
    var cursorDot = cursor ? cursor.querySelector('.cursor__dot') : null;
    var cursorRing = cursor ? cursor.querySelector('.cursor__ring') : null;
    var loader = document.getElementById('loader');
    var loaderFill = document.getElementById('loader-fill');
    var loaderStatus = document.getElementById('loader-status');
    var sections = document.querySelectorAll('section[id]');

    /* ============================================================
       CUSTOM CURSOR
       ============================================================ */
    var mouseX = 0, mouseY = 0;
    var cursorX = 0, cursorY = 0;
    var ringX = 0, ringY = 0;
    var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function initCursor() {
        if (isTouchDevice || !cursor) return;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        document.addEventListener('mousedown', function () {
            cursor.classList.add('cursor--clicking');
        });

        document.addEventListener('mouseup', function () {
            cursor.classList.remove('cursor--clicking');
        });

        /* Hover targets */
        var hoverTargets = document.querySelectorAll(
            'a, button, [data-cursor-hover], [data-magnetic], .badge, .pill, .sandbox-node__inner, .project-card, .bento__card, .about__principle, .ecosystem__domain, .contact__link, .terminal__link'
        );

        hoverTargets.forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                cursor.classList.add('cursor--hover');
            });
            el.addEventListener('mouseleave', function () {
                cursor.classList.remove('cursor--hover');
            });
        });

        renderCursor();
    }

    function renderCursor() {
        if (isTouchDevice || !cursor) return;

        /* Smooth follow — dot is fast, ring is slower */
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;

        if (cursorDot) {
            cursorDot.style.transform = 'translate(' + cursorX + 'px, ' + cursorY + 'px)';
        }
        if (cursorRing) {
            cursorRing.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px)';
        }

        requestAnimationFrame(renderCursor);
    }

    /* ============================================================
       MAGNETIC EFFECT
       ============================================================ */
    function initMagnetic() {
        if (isTouchDevice) return;

        var magneticElements = document.querySelectorAll('[data-magnetic]');

        magneticElements.forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                var strength = 0.3;

                el.style.transform = 'translate(' + (x * strength) + 'px, ' + (y * strength) + 'px)';
            });

            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
                el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                setTimeout(function () {
                    el.style.transition = '';
                }, 400);
            });
        });

        /* Micro magnetic for badges */
        var microMagnets = document.querySelectorAll('[data-magnetic-micro]');
        microMagnets.forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;

                el.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px) translateY(-3px) scale(1.04)';
            });

            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
                el.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease';
                setTimeout(function () {
                    el.style.transition = 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 250ms ease, background 250ms ease';
                }, 350);
            });
        });
    }

    /* ============================================================
       HOVER GLOW TRACKING
       ============================================================ */
    function initHoverGlow() {
        if (isTouchDevice) return;

        var glowElements = document.querySelectorAll('[data-hover-glow]');

        glowElements.forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = ((e.clientX - rect.left) / rect.width) * 100;
                var y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--glow-x', x + '%');
                el.style.setProperty('--glow-y', y + '%');
            });
        });
    }

    /* ============================================================
       NAVIGATION
       ============================================================ */
    function toggleNav() {
        var isOpen = navList.classList.toggle('nav__list--open');
        navToggle.classList.toggle('nav__toggle--active');
        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeNav() {
        navList.classList.remove('nav__list--open');
        navToggle.classList.remove('nav__toggle--active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
    }

    navToggle.addEventListener('click', toggleNav);
    navLinks.forEach(function (link) {
        link.addEventListener('click', closeNav);
    });

    var scrollTicking = false;
    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            requestAnimationFrame(function () {
                handleNavScroll();
                highlightActiveNav();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    /* Active nav */
    function highlightActiveNav() {
        var scrollY = window.scrollY + 200;

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(function (link) {
                    link.classList.remove('nav__link--active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('nav__link--active');
                    }
                });
            }
        });
    }

    /* ============================================================
       COUNTER ANIMATION
       ============================================================ */
    function animateCounters() {
        var counters = document.querySelectorAll('[data-count]');
        counters.forEach(function (counter) {
            var target = parseInt(counter.getAttribute('data-count'), 10);
            var current = 0;
            var increment = Math.ceil(target / 50);
            var duration = 1800;
            var stepTime = duration / (target / increment);

            function update() {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    return;
                }
                counter.textContent = current;
                setTimeout(update, stepTime);
            }
            update();
        });
    }

    /* ============================================================
       ECOSYSTEM BARS
       ============================================================ */
    function animateEcosystemBars() {
        var bars = document.querySelectorAll('.ecosystem__domain-fill');
        bars.forEach(function (bar) {
            var width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        });
    }

    /* ============================================================
       TERMINAL TYPING
       ============================================================ */
    function typeTerminal() {
        var terminalText = document.getElementById('terminal-text');
        if (!terminalText) return;

        var text = 'cat contact.json';
        var index = 0;

        function type() {
            if (index < text.length) {
                terminalText.textContent += text.charAt(index);
                index++;
                setTimeout(type, 50 + Math.random() * 50);
            }
        }
        type();
    }

    /* ============================================================
       SANDBOX DRAG SCROLL
       ============================================================ */
    function initDragScroll() {
        var wrapper = document.querySelector('.sandboxes__track-wrapper');
        if (!wrapper) return;

        var isDown = false;
        var startX;
        var scrollLeft;

        wrapper.addEventListener('mousedown', function (e) {
            isDown = true;
            wrapper.classList.add('is-dragging');
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        });

        wrapper.addEventListener('mouseleave', function () {
            isDown = false;
            wrapper.classList.remove('is-dragging');
        });

        wrapper.addEventListener('mouseup', function () {
            isDown = false;
            wrapper.classList.remove('is-dragging');
        });

        wrapper.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX - wrapper.offsetLeft;
            var walk = (x - startX) * 2;
            wrapper.scrollLeft = scrollLeft - walk;
        });
    }

    /* ============================================================
       BACKGROUND CANVAS — Premium Particle Network
       ============================================================ */
    function initBackgroundCanvas() {
        if (!bgCanvas) return;

        var ctx = bgCanvas.getContext('2d');
        var width, height;
        var particles = [];
        var connections = [];
        var canvasMouseX = 0;
        var canvasMouseY = 0;
        var baseCount = window.innerWidth < 768 ? 30 : 60;

        var colors = [
            { r: 0, g: 255, b: 136 },   /* green */
            { r: 0, g: 204, b: 255 },   /* cyan */
            { r: 170, g: 0, b: 255 }    /* purple */
        ];

        function resize() {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            for (var i = 0; i < baseCount; i++) {
                var color = colors[Math.floor(Math.random() * colors.length)];
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    radius: Math.random() * 1.8 + 0.3,
                    baseOpacity: Math.random() * 0.25 + 0.04,
                    opacity: 0,
                    color: color,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.005 + Math.random() * 0.01
                });
            }
        }

        function render() {
            ctx.clearRect(0, 0, width, height);

            /* Update and draw particles */
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                /* Pulse opacity */
                p.pulse += p.pulseSpeed;
                p.opacity = p.baseOpacity + Math.sin(p.pulse) * 0.05;

                /* Mouse interaction - gentle attraction */
                var dx = canvasMouseX - p.x;
                var dy = canvasMouseY - p.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 250 && dist > 0) {
                    var force = (250 - dist) / 250 * 0.0003;
                    p.vx += dx * force;
                    p.vy += dy * force;
                }

                p.x += p.vx;
                p.y += p.vy;

                /* Dampen */
                p.vx *= 0.998;
                p.vy *= 0.998;

                /* Wrap */
                if (p.x < -20) p.x = width + 20;
                if (p.x > width + 20) p.x = -20;
                if (p.y < -20) p.y = height + 20;
                if (p.y > height + 20) p.y = -20;

                /* Draw particle */
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + Math.max(0, p.opacity) + ')';
                ctx.fill();

                /* Subtle glow for larger particles */
                if (p.radius > 1.2) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + (p.opacity * 0.08) + ')';
                    ctx.fill();
                }
            }

            /* Draw connections */
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var p1 = particles[i];
                    var p2 = particles[j];
                    var cdx = p1.x - p2.x;
                    var cdy = p1.y - p2.y;
                    var cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                    if (cdist < 140) {
                        var lineOpacity = (1 - cdist / 140) * 0.06;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(' + p1.color.r + ',' + p1.color.g + ',' + p1.color.b + ',' + lineOpacity + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            /* Mouse proximity glow */
            if (canvasMouseX > 0 && canvasMouseY > 0) {
                var grad = ctx.createRadialGradient(canvasMouseX, canvasMouseY, 0, canvasMouseX, canvasMouseY, 200);
                grad.addColorStop(0, 'rgba(0, 255, 136, 0.015)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fillRect(canvasMouseX - 200, canvasMouseY - 200, 400, 400);
            }

            requestAnimationFrame(render);
        }

        resize();
        createParticles();
        render();

        window.addEventListener('resize', function () {
            resize();
            createParticles();
        });

        window.addEventListener('mousemove', function (e) {
            canvasMouseX = e.clientX;
            canvasMouseY = e.clientY;
        }, { passive: true });
    }

    /* ============================================================
       SMOOTH SCROLL
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ============================================================
       INTERSECTION OBSERVERS
       ============================================================ */
    function initObservers() {
        /* Counter */
        var statsSection = document.querySelector('.about__stats');
        if (statsSection) {
            var statsObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounters();
                        statsObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            statsObs.observe(statsSection);
        }

        /* Ecosystem bars */
        var ecoGrid = document.querySelector('.ecosystem__grid');
        if (ecoGrid) {
            var ecoObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setTimeout(animateEcosystemBars, 400);
                        ecoObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            ecoObs.observe(ecoGrid);
        }

        /* Terminal */
        var terminal = document.querySelector('.contact__terminal');
        if (terminal) {
            var termObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setTimeout(typeTerminal, 300);
                        termObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            termObs.observe(terminal);
        }
    }

    /* ============================================================
       PAGE LOADER
       ============================================================ */
    function initLoader() {
        document.body.classList.add('is-loading');

        var progress = 0;
        var messages = [
            'Initializing Systems...',
            'Loading Modules...',
            'Connecting Networks...',
            'Rendering Interface...',
            'Systems Ready.'
        ];

        function updateLoader() {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;

            if (loaderFill) loaderFill.style.width = progress + '%';

            var msgIndex = Math.min(Math.floor(progress / 25), messages.length - 1);
            if (loaderStatus) loaderStatus.textContent = messages[msgIndex];

            if (progress >= 100) {
                setTimeout(function () {
                    if (loader) loader.classList.add('loader--hidden');
                    document.body.classList.remove('is-loading');
                    document.body.classList.add('is-loaded');
                }, 400);
                return;
            }

            setTimeout(updateLoader, 80 + Math.random() * 120);
        }

        /* Start after a tiny delay for visual effect */
        setTimeout(updateLoader, 200);
    }

    /* ============================================================
       SPLIT TEXT UTILITY
       ============================================================ */
    function splitText() {
        var elements = document.querySelectorAll('[data-split-text]');
        elements.forEach(function (el) {
            if (el.classList.contains('is-split')) return;

            var text = el.textContent;
            var html = '';

            for (var i = 0; i < text.length; i++) {
                if (text[i] === ' ') {
                    html += ' ';
                } else {
                    html += '<span class="char" style="display:inline-block;">' + text[i] + '</span>';
                }
            }

            el.innerHTML = html;
            el.classList.add('is-split');
        });
    }

    /* ============================================================
       INITIALIZE
       ============================================================ */
    function init() {
        splitText();
        initLoader();
        initCursor();
        initMagnetic();
        initHoverGlow();
        initBackgroundCanvas();
        initDragScroll();
        initObservers();
        handleNavScroll();
        highlightActiveNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();