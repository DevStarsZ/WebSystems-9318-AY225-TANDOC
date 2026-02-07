// Toast System
class ToastSystem {
    static show(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('global-modals');
        if (!toastContainer) {
            this.createToastContainer();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="fas fa-${this.getIcon(type)}"></i>
                </div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.getElementById('global-modals').appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideToast(toast);
            }, duration);
        }

        return toast;
    }

    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    static hideToast(toast) {
        if (!toast) return;
        
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    static createToastContainer() {
        const container = document.createElement('div');
        container.id = 'global-modals';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    static clearAll() {
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(toast => this.hideToast(toast));
    }
}

// Modal System
class ModalSystem {
    static modals = new Map();

    static create(id, title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        
        const modalContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `
                <div class="modal-footer">
                    ${options.footer}
                </div>
                ` : ''}
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

        // Store modal reference
        this.modals.set(id, modal);

        // Setup close handlers
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close(id));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close(id);
            }
        });

        // Add keyboard close handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.close(id);
            }
        });

        return modal;
    }

    static open(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first focusable element
            setTimeout(() => {
                const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable) focusable.focus();
            }, 100);
        }
    }

    static close(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Return focus to previous element
            if (this.previousFocus) {
                this.previousFocus.focus();
            }
        }
    }

    static closeAll() {
        this.modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    static remove(id) {
        const modal = this.modals.get(id);
        if (modal) {
            this.close(id);
            modal.parentNode.removeChild(modal);
            this.modals.delete(id);
        }
    }

    static setPreviousFocus(element) {
        this.previousFocus = element;
    }
}

// SPA Router and Core Application Logic
class JPCSApp {
    constructor() {
        this.currentPage = 'home';
        this.pages = ['home', 'about', 'officers', 'events', 'membership', 'contact'];
        this.isLoading = false;
        this.init();
    }

    async init() {
        // Load saved preferences
        this.loadPreferences();
        
        // Set up navigation
        this.setupNavigation();
        
        // Set up service worker for PWA
        this.setupServiceWorker();
        
        // Load initial page based on current hash
        const initialPage = window.location.hash.replace('#', '') || 'home';
        await this.loadPage(initialPage);
        this.updateActiveNav(initialPage);
        
        // Hide loading overlay
        setTimeout(() => {
            this.hideLoading();
        }, 1000);

        // Set up global keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupNavigation() {
        // Navigation link clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = window.location.hash.replace('#', '') || 'home';
            this.loadPage(page, false);
        });

        // Handle hash changes (direct URL changes, etc.)
        window.addEventListener('hashchange', (e) => {
            const page = window.location.hash.replace('#', '') || 'home';
            this.updateActiveNav(page);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container') && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    async navigateTo(page) {
        if (this.pages.includes(page) && page !== this.currentPage) {
            // Update URL without reload
            window.history.pushState({}, '', `#${page}`);
            
            // Update active nav link
            this.updateActiveNav(page);
            
            // Load the page
            await this.loadPage(page);
            
            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    }

    updateActiveNav(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    }

    async loadPage(page, updateNav = true) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        this.currentPage = page;

        try {
            // Load page content
            const response = await fetch(`assets/html/${page}.html`);
            if (!response.ok) throw new Error('Page not found');
            
            const html = await response.text();
            document.getElementById('content-container').innerHTML = html;

            // Load page-specific CSS
            this.loadPageCSS(page);

            // Load page-specific JS module
            await this.loadPageJS(page);

            // Update navigation if needed
            if (updateNav) {
                this.updateActiveNav(page);
            }

            // Save last visited page
            this.savePreference('lastPage', page);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error loading page:', error);
            this.showError();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    loadPageCSS(page) {
        // Remove existing page-specific CSS
        const existingCSS = document.getElementById('page-specific-css');
        if (existingCSS) {
            existingCSS.remove();
        }

        // Create new link element
        const link = document.createElement('link');
        link.id = 'page-specific-css';
        link.rel = 'stylesheet';
        link.href = `assets/css/${page}.css`;
        document.head.appendChild(link);
    }

    async loadPageJS(page) {
        try {
            // Clear any existing page-specific JS
            const existingModule = document.getElementById('page-specific-js');
            if (existingModule) {
                existingModule.remove();
            }

            // Load the module
            const module = await import(`./${page}.js`);
            
            // Initialize the module if it has an init function
            // Check both direct init and default export's init
            const moduleToInit = module.default || module;
            if (typeof moduleToInit?.init === 'function') {
                await moduleToInit.init();
            }
        } catch (error) {
            console.warn(`No JavaScript module for ${page}:`, error);
        }
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('active');
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('active');
    }

    showError() {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div class="container">
                <div class="error-page">
                    <div class="error-code">
                        <span>4</span>
                        <span class="primary">0</span>
                        <span>4</span>
                    </div>
                    <h2>Page Load Error</h2>
                    <p>Unable to load the requested page. Please try again.</p>
                    <button class="btn" onclick="app.loadPage('home')">
                        <i class="fas fa-home"></i> Return Home
                    </button>
                </div>
            </div>
        `;
    }

    savePreference(key, value) {
        try {
            const preferences = JSON.parse(localStorage.getItem('jpcs_preferences')) || {};
            preferences[key] = value;
            localStorage.setItem('jpcs_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preference:', error);
        }
    }

    loadPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('jpcs_preferences')) || {};
            
            // Load theme preference
            if (preferences.theme === 'dark' || !preferences.theme) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
            }

            // Load other preferences as needed
            return preferences;
        } catch (error) {
            console.error('Error loading preferences:', error);
            return {};
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js').catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + number shortcuts for pages
            if (e.ctrlKey || e.metaKey) {
                const key = parseInt(e.key);
                if (key >= 1 && key <= 6) {
                    e.preventDefault();
                    const pages = ['home', 'about', 'officers', 'events', 'membership', 'contact'];
                    const page = pages[key - 1];
                    if (page && window.app) {
                        window.app.navigateTo(page);
                    }
                }
            }
            
            // Escape key to close all modals
            if (e.key === 'Escape') {
                ModalSystem.closeAll();
            }
        });
    }

    // Global notification method
    showNotification(message, type = 'info', duration = 5000) {
        return ToastSystem.show(message, type, duration);
    }

    // Global modal method
    showModal(id, title, content, options = {}) {
        ModalSystem.create(id, title, content, options);
        ModalSystem.open(id);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JPCSApp();
    window.ToastSystem = ToastSystem;
    window.ModalSystem = ModalSystem;
});

// Handle offline/online status
window.addEventListener('online', () => {
    if (window.app) {
        window.app.showNotification('You are back online!', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.app) {
        window.app.showNotification('You are offline. Some features may be limited.', 'warning');
    }
});

// Export for modules
export { JPCSApp, ToastSystem, ModalSystem };