/**
 * Mwatha Maina Analytics Suite - Unified UI Controller
 * Path: F:\Projects\Python\Freelance.Analytics.Statistics_011\script.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI Component hooks
    initThemeEngine();
    initPortfolioFilters();
    initSmoothScroll();
    initMobileMenu();
    initScrollAnimations();
});

/**
 * 1. PERSISTENT LIGHT/DARK THEME CONFIGURATION
 * Synchronizes document root styles and swaps iconography seamlessly.
 */
function initThemeEngine() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;
    
    if (!themeToggle || !themeIcon) return;

    // Check configuration ledger: default to corporate light system
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.classList.toggle('dark', currentTheme === 'dark');
    html.classList.toggle('light', currentTheme !== 'dark');
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const isDark = html.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        
        html.classList.toggle('dark', !isDark);
        html.classList.toggle('light', isDark);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun text-slate-700 dark:text-slate-100';
        } else {
            themeIcon.className = 'fas fa-moon text-slate-700 dark:text-slate-100';
        }
    }
}

/**
 * 2. PORTFOLIO GRID ISOLATION FILTERS
 * Controls grid layout display logic smoothly without fracturing transition pipelines.
 */
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (!filterButtons.length || !portfolioItems.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Swap active classes smoothly
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // Safe, modern transition handling bypassing conflicting timeout threads
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1) translateY(0)';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95) translateY(10px)';
                    // Await transition break before completely pulling block elements from DOM layout
                    item.addEventListener('transitionend', function cb() {
                        if (item.style.opacity === '0') item.style.display = 'none';
                        item.removeEventListener('transitionend', cb);
                    });
                }
            });
        });
    });
}

/**
 * 3. OFFSET COMPENSATED SMOOTH SCROLLING
 * Prevents fixed navigation header bars from overlapping component titles when scrolling.
 */
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const header = document.querySelector('header');
    
    if (!navLinks.length) return;

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 4. MOBILE INTERACTION NAVIGATION HOOK
 * Safely maps open/close commands to responsive drawer layouts.
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (!mobileMenuBtn) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        // Ready for implementation once you append a mobile overlay drawer block
        console.log('Mobile UI operational matrix called.');
    });
}

/**
 * 5. HIGH-FIDELITY INTERSECTION OBSERVER
 * Smoothly cascades element entry animations as the user scrolls down the page.
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                // Unobserve item once animated to protect active filtering states
                observer.unobserve(el);
            }
        });
    }, observerOptions);
    
    // Select specific cards and grid items for staggered appearance load
    const animatedElements = document.querySelectorAll('.card-hover, .portfolio-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });
}