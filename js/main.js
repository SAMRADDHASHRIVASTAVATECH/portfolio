/* ============================================================
   MAIN.JS — Navigation, Smooth Scroll, Mobile Menu
   ============================================================ */

(function () {
    'use strict';

    // ============ NAVIGATION SCROLL STATE ============
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    function handleNavScroll() {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // ============ MOBILE MENU ============
    const navToggle = document.getElementById('nav-toggle');
    const navList = document.getElementById('nav-list');

    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            const isOpen = navList.classList.contains('nav__list--open');

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

        // Close menu on link click
        navList.querySelectorAll('.nav__link').forEach((link) => {
            link.addEventListener('click', () => {
                navList.classList.remove('nav__list--open');
                navToggle.classList.remove('nav__toggle--active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navList.classList.contains('nav__list--open')) {
                navList.classList.remove('nav__list--open');
                navToggle.classList.remove('nav__toggle--active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // ============ SMOOTH SCROLL TO ANCHORS ============
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const offsetTop = target.getBoundingClientRect().top + window.scrollY;
            const navHeight = nav ? nav.offsetHeight : 0;

            window.scrollTo({
                top: offsetTop - navHeight - 10,
                behavior: 'smooth'
            });
        });
    });

    // ============ ACTIVE NAV LINK HIGHLIGHTER ============
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    function setActiveLink() {
        const scrollPos = window.scrollY + 200;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach((link) => {
                    link.classList.remove('nav__link--active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('nav__link--active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });

    // ============ PREVENT OVERFLOW-X ============
    // Belt-and-suspenders approach for mobile
    document.documentElement.style.overflowX = 'hidden';

    // ============ RESIZE HANDLER FOR MOBILE MENU ============
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Close mobile menu on resize to desktop
            if (window.innerWidth >= 768 && navList.classList.contains('nav__list--open')) {
                navList.classList.remove('nav__list--open');
                navToggle.classList.remove('nav__toggle--active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }, 250);
    }, { passive: true });

})();
