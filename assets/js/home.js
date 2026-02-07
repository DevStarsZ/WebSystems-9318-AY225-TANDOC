import { ToastSystem, ModalSystem } from './index.js';

// Home Page JavaScript Module
const HomeModule = {
    async init() {
        console.log('Home page initialized');
        
        // Initialize components
        this.initStatsCounter();
        this.loadFeaturedEvents();
        this.setupEventListeners();
        
        // Check for saved scroll position
        this.restoreScrollPosition();
    },

    initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target;
                    const target = parseInt(statNumber.dataset.count);
                    this.animateCounter(statNumber, target);
                    observer.unobserve(statNumber);
                }
            });
        }, observerOptions);

        statNumbers.forEach(stat => observer.observe(stat));
    },

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 30);
    },

    async loadFeaturedEvents() {
        try {
            // Load events from localStorage or API
            const events = await this.getFeaturedEvents();
            const container = document.querySelector('.featured-grid');
            
            if (!container || events.length === 0) return;

            container.innerHTML = events.map(event => this.createEventCard(event)).join('');
            
            // Add click handlers to event cards
            this.setupEventCardListeners();
            
        } catch (error) {
            console.error('Error loading featured events:', error);
            this.showDefaultEvents();
        }
    },

    async getFeaturedEvents() {
        // Try to get from localStorage first
        const savedEvents = localStorage.getItem('jpcs_events');
        
        if (savedEvents) {
            const events = JSON.parse(savedEvents);
            return events.filter(event => event.featured).slice(0, 3);
        }

        // Default events if none saved
        return [
            {
                id: 1,
                title: "Hackathon 2024",
                date: "2024-03-15",
                time: "09:00",
                description: "Annual coding marathon with exciting prizes and learning opportunities.",
                category: "Competition",
                featured: true,
                location: "Innovation Center",
                capacity: 100,
                registered: 78
            },
            {
                id: 2,
                title: "AI Workshop Series",
                date: "2024-03-22",
                time: "14:00",
                description: "Learn the fundamentals of artificial intelligence and machine learning.",
                category: "Workshop",
                featured: true,
                location: "Tech Building Room 301",
                capacity: 50,
                registered: 42
            },
            {
                id: 3,
                title: "Tech Career Fair",
                date: "2024-04-10",
                time: "10:00",
                description: "Connect with top tech companies and explore career opportunities.",
                category: "Networking",
                featured: true,
                location: "Conference Hall",
                capacity: 150,
                registered: 89
            }
        ];
    },

    createEventCard(event) {
        const date = new Date(event.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <div class="featured-card" data-event-id="${event.id}">
                <div class="featured-image"></div>
                <div class="featured-content">
                    <span class="featured-date">${formattedDate} • ${event.time}</span>
                    <h3 class="featured-title">${event.title}</h3>
                    <p class="featured-description">${event.description}</p>
                    <div class="featured-tags">
                        <span class="tag">${event.category}</span>
                    </div>
                    <button class="btn btn-outline view-event-btn" data-event-id="${event.id}">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        `;
    },

    setupEventCardListeners() {
        document.querySelectorAll('.view-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                this.showEventModal(eventId);
            });
        });

        document.querySelectorAll('.featured-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn')) {
                    const eventId = card.dataset.eventId;
                    this.showEventModal(eventId);
                }
            });
        });
    },

    async showEventModal(eventId) {
        const events = await this.getFeaturedEvents();
        const event = events.find(e => e.id === parseInt(eventId));
        
        if (event) {
            const date = new Date(event.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const modalContent = `
                <div class="event-modal-details">
                    <div class="event-modal-image"></div>
                    <div class="event-info">
                        <h4>Event Details</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Date:</span>
                                <span class="value">${formattedDate}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Time:</span>
                                <span class="value">${event.time}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Location:</span>
                                <span class="value">${event.location}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Category:</span>
                                <span class="value">${event.category}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Capacity:</span>
                                <span class="value">${event.capacity} participants</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Registered:</span>
                                <span class="value">${event.registered} participants</span>
                            </div>
                        </div>
                        <div class="event-description">
                            <h5>Description</h5>
                            <p>${event.description}</p>
                        </div>
                    </div>
                </div>
            `;

            const modalFooter = `
                <button class="btn btn-outline" onclick="ModalSystem.close('event-details-modal')">
                    <i class="fas fa-times"></i> Close
                </button>
                <button class="btn" onclick="window.app.navigateTo('events')">
                    <i class="fas fa-calendar-alt"></i> View All Events
                </button>
            `;

            ModalSystem.create('event-details-modal', event.title, modalContent, { footer: modalFooter });
            ModalSystem.open('event-details-modal');
        }
    },

    showDefaultEvents() {
        const container = document.querySelector('.featured-grid');
        if (container) {
            container.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No Featured Events</h3>
                    <p>Check back soon for upcoming events!</p>
                </div>
            `;
        }
    },

    setupEventListeners() {
        // Hero button animations
        const heroButtons = document.querySelectorAll('.hero-btn');
        heroButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-3px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });

        // Save scroll position before leaving page
        window.addEventListener('beforeunload', () => {
            this.saveScrollPosition();
        });
    },

    saveScrollPosition() {
        const scrollPosition = window.scrollY;
        localStorage.setItem('home_scroll_position', scrollPosition.toString());
    },

    restoreScrollPosition() {
        const savedPosition = localStorage.getItem('home_scroll_position');
        if (savedPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition));
                localStorage.removeItem('home_scroll_position');
            }, 100);
        }
    }
};

// Export the module
export { HomeModule as default };