// Events Page JavaScript Module
const EventsModule = {
    async init() {
        console.log('Events page initialized');
        
        // Initialize data
        await this.loadEventsData();
        
        // Initialize components
        this.initViewToggle();
        this.initFilters();
        this.initCalendar();
        this.initSuggestionModal();
        this.initStats();
        
        // Load events
        this.loadEvents();
        this.loadFeaturedEvents();
        
        // Setup event listeners
        this.setupEventListeners();
    },

    async loadEventsData() {
        try {
            const savedEvents = localStorage.getItem('jpcs_events');
            const savedRegistrations = localStorage.getItem('jpcs_event_registrations');
            
            if (savedEvents) {
                this.events = JSON.parse(savedEvents);
            } else {
                this.events = await this.getDefaultEvents();
                this.saveEventsData();
            }
            
            this.registrations = savedRegistrations ? JSON.parse(savedRegistrations) : [];
            
        } catch (error) {
            console.error('Error loading events data:', error);
            this.events = await this.getDefaultEvents();
            this.registrations = [];
        }
    },

    async getDefaultEvents() {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        
        return [
            {
                id: 1,
                title: "AI & Machine Learning Workshop",
                date: today.toISOString().split('T')[0],
                time: "14:00",
                duration: "3 hours",
                category: "workshop",
                description: "Learn the fundamentals of AI and machine learning with hands-on exercises and real-world examples. Perfect for beginners and intermediate learners.",
                location: "Tech Building Room 301",
                capacity: 50,
                registered: 42,
                featured: true,
                organizer: "Tech Committee",
                requirements: "Laptop with Python installed, basic programming knowledge",
                contactEmail: "tech@jpcs.org",
                registrationDeadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0]
            },
            {
                id: 2,
                title: "Annual Hackathon 2024",
                date: nextWeek.toISOString().split('T')[0],
                time: "09:00",
                duration: "48 hours",
                category: "hackathon",
                description: "24-hour coding marathon to solve real-world problems. Cash prizes for top 3 teams. Open to all skill levels.",
                location: "Innovation Center",
                capacity: 100,
                registered: 78,
                featured: true,
                organizer: "Events Committee",
                requirements: "Team of 2-4 members, any programming language",
                contactEmail: "events@jpcs.org",
                registrationDeadline: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate() - 1).toISOString().split('T')[0]
            },
            {
                id: 3,
                title: "Cybersecurity Seminar",
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
                time: "16:00",
                duration: "2 hours",
                category: "seminar",
                description: "Learn about the latest cybersecurity threats and best practices from industry experts.",
                location: "Auditorium A",
                capacity: 200,
                registered: 156,
                featured: false,
                organizer: "Tech Committee",
                requirements: "None",
                contactEmail: "tech@jpcs.org",
                registrationDeadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0]
            },
            {
                id: 4,
                title: "Tech Industry Networking Night",
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString().split('T')[0],
                time: "18:00",
                duration: "3 hours",
                category: "networking",
                description: "Connect with professionals from top tech companies. Bring your resume for career opportunities.",
                location: "Conference Hall",
                capacity: 150,
                registered: 89,
                featured: true,
                organizer: "Membership Committee",
                requirements: "Business casual attire",
                contactEmail: "membership@jpcs.org",
                registrationDeadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8).toISOString().split('T')[0]
            },
            {
                id: 5,
                title: "Web Development Bootcamp",
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
                time: "10:00",
                duration: "6 hours",
                category: "workshop",
                description: "Intensive workshop covering modern web development with React, Node.js, and MongoDB.",
                location: "Computer Lab 2",
                capacity: 30,
                registered: 28,
                featured: false,
                organizer: "Tech Committee",
                requirements: "Laptop, basic HTML/CSS/JS knowledge",
                contactEmail: "tech@jpcs.org",
                registrationDeadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0]
            },
            {
                id: 6,
                title: "Game Development Challenge",
                date: lastMonth.toISOString().split('T')[0],
                time: "13:00",
                duration: "8 hours",
                category: "competition",
                description: "Create a game in 8 hours using any engine. Prizes for most innovative and best gameplay.",
                location: "Game Dev Lab",
                capacity: 40,
                registered: 35,
                featured: false,
                organizer: "Tech Committee",
                requirements: "Laptop with game engine installed",
                contactEmail: "tech@jpcs.org",
                registrationDeadline: lastMonth.toISOString().split('T')[0]
            }
        ];
    },

    saveEventsData() {
        try {
            localStorage.setItem('jpcs_events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error saving events data:', error);
        }
    },

    initViewToggle() {
        const viewButtons = document.querySelectorAll('.view-btn');
        const views = {
            grid: document.querySelector('.events-grid-view'),
            list: document.querySelector('.events-list-view'),
            calendar: document.querySelector('.events-calendar-view')
        };

        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view;
                
                // Update active button
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show selected view
                Object.values(views).forEach(viewEl => viewEl.classList.remove('active'));
                if (views[view]) {
                    views[view].classList.add('active');
                }
                
                // Save preference
                this.savePreference('eventView', view);
            });
        });

        // Load saved view preference
        const savedView = this.loadPreference('eventView');
        if (savedView && views[savedView]) {
            const button = document.querySelector(`.view-btn[data-view="${savedView}"]`);
            if (button) {
                button.click();
            }
        }
    },

    initFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const dateFilter = document.getElementById('date-filter');
        const sortFilter = document.getElementById('sort-filter');
        const searchInput = document.getElementById('event-search');

        // Load saved filters
        const savedFilters = this.loadPreference('eventFilters') || {};
        if (savedFilters.category) categoryFilter.value = savedFilters.category;
        if (savedFilters.date) dateFilter.value = savedFilters.date;
        if (savedFilters.sort) sortFilter.value = savedFilters.sort;
        if (savedFilters.search) searchInput.value = savedFilters.search;

        // Add event listeners
        [categoryFilter, dateFilter, sortFilter].forEach(filter => {
            filter.addEventListener('change', () => {
                this.applyFilters();
                this.saveFilters();
            });
        });

        searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.applyFilters();
                this.saveFilters();
            }, 300);
        });
    },

    saveFilters() {
        const filters = {
            category: document.getElementById('category-filter').value,
            date: document.getElementById('date-filter').value,
            sort: document.getElementById('sort-filter').value,
            search: document.getElementById('event-search').value
        };
        this.savePreference('eventFilters', filters);
    },

    applyFilters() {
        let filteredEvents = [...this.events];
        const category = document.getElementById('category-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const sortBy = document.getElementById('sort-filter').value;
        const searchTerm = document.getElementById('event-search').value.toLowerCase();

        // Filter by category
        if (category !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.category === category);
        }

        // Filter by date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
            case 'upcoming':
                filteredEvents = filteredEvents.filter(event => new Date(event.date) >= today);
                break;
            case 'past':
                filteredEvents = filteredEvents.filter(event => new Date(event.date) < today);
                break;
            case 'this-week':
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= today && eventDate <= nextWeek;
                });
                break;
            case 'this-month':
                const nextMonth = new Date(today);
                nextMonth.setMonth(today.getMonth() + 1);
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= today && eventDate <= nextMonth;
                });
                break;
        }

        // Filter by search term
        if (searchTerm) {
            filteredEvents = filteredEvents.filter(event =>
                event.title.toLowerCase().includes(searchTerm) ||
                event.description.toLowerCase().includes(searchTerm) ||
                event.organizer.toLowerCase().includes(searchTerm)
            );
        }

        // Sort events
        filteredEvents.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            switch (sortBy) {
                case 'date-asc':
                    return dateA - dateB;
                case 'date-desc':
                    return dateB - dateA;
                case 'name-asc':
                    return a.title.localeCompare(b.title);
                case 'name-desc':
                    return b.title.localeCompare(a.title);
                case 'popularity':
                    return (b.registered / b.capacity) - (a.registered / a.capacity);
                default:
                    return 0;
            }
        });

        this.filteredEvents = filteredEvents;
        this.displayEvents();
        this.updateNoEventsMessage();
    },

    displayEvents() {
        const activeView = document.querySelector('.view-btn.active').dataset.view;
        
        if (activeView === 'grid') {
            this.displayGridView();
        } else if (activeView === 'list') {
            this.displayListView();
        }
        
        this.updateStats();
    },

    displayGridView() {
        const gridView = document.querySelector('.events-grid-view');
        
        if (!this.filteredEvents || this.filteredEvents.length === 0) {
            gridView.innerHTML = '';
            return;
        }

        gridView.innerHTML = this.filteredEvents.map(event => this.createEventCard(event)).join('');
        
        // Add event listeners to cards
        this.setupEventCardListeners();
    },

    createEventCard(event) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = eventDate < today;
        
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const categoryNames = {
            workshop: 'Workshop',
            hackathon: 'Hackathon',
            seminar: 'Seminar',
            networking: 'Networking',
            social: 'Social Event',
            competition: 'Competition'
        };

        const progress = Math.round((event.registered / event.capacity) * 100);
        const isFull = event.registered >= event.capacity;

        return `
            <div class="event-card ${event.featured ? 'featured' : ''}" data-event-id="${event.id}">
                <div class="event-image"></div>
                <div class="event-content">
                    <div class="event-date">
                        <i class="far fa-calendar"></i>
                        ${formattedDate} • ${event.time}
                    </div>
                    <span class="event-category">${categoryNames[event.category] || event.category}</span>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-description">${event.description}</p>
                    
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            ${event.location}
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-users"></i>
                            ${event.registered}/${event.capacity}
                        </div>
                    </div>
                    
                    <div class="event-actions">
                        <button class="btn event-btn view-details-btn" data-event-id="${event.id}">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        ${!isPast && !isFull ? 
                            `<button class="btn event-btn register-btn" data-event-id="${event.id}">
                                <i class="fas fa-user-plus"></i> Register
                            </button>` :
                            `<button class="btn event-btn disabled" disabled>
                                <i class="fas fa-calendar-times"></i> ${isPast ? 'Event Ended' : 'Full'}
                            </button>`
                        }
                    </div>
                    
                    ${progress > 0 ? `
                        <div class="progress-bar" style="margin-top: 1rem;">
                            <div class="progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, var(--primary), var(--secondary)); height: 6px; border-radius: 3px;"></div>
                            <div class="progress-text" style="color: var(--gray); font-size: 0.8rem; margin-top: 0.3rem;">${progress}% full</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    displayListView() {
        const listView = document.querySelector('.events-list-view');
        
        if (!this.filteredEvents || this.filteredEvents.length === 0) {
            listView.innerHTML = '';
            return;
        }

        listView.innerHTML = this.filteredEvents.map(event => this.createEventListItem(event)).join('');
        
        // Add event listeners to list items
        this.setupEventCardListeners();
    },

    createEventListItem(event) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = eventDate < today;
        
        const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const day = eventDate.getDate();
        const year = eventDate.getFullYear();

        const categoryNames = {
            workshop: 'Workshop',
            hackathon: 'Hackathon',
            seminar: 'Seminar',
            networking: 'Networking',
            social: 'Social Event',
            competition: 'Competition'
        };

        return `
            <div class="event-list-item" data-event-id="${event.id}">
                <div class="list-date">
                    <div class="list-month">${month}</div>
                    <div class="list-day">${day}</div>
                    <div class="list-year">${year}</div>
                </div>
                <div class="list-details">
                    <h3 class="list-title">${event.title}</h3>
                    <span class="list-category">${categoryNames[event.category] || event.category}</span>
                    <span class="list-time">
                        <i class="far fa-clock"></i> ${event.time} • ${event.duration}
                    </span>
                    <p style="color: var(--gray); margin-top: 0.5rem; font-size: 0.9rem;">
                        ${event.location}
                    </p>
                </div>
                <div class="list-actions">
                    <button class="btn view-details-btn" data-event-id="${event.id}" style="width: 100%;">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
    },

    setupEventCardListeners() {
        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = parseInt(btn.dataset.eventId);
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    this.showEventModal(event);
                }
            });
        });

        // Register buttons
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = parseInt(btn.dataset.eventId);
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    this.showRegistrationModal(event);
                }
            });
        });

        // Event card clicks
        document.querySelectorAll('.event-card, .event-list-item').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn')) {
                    const eventId = parseInt(card.dataset.eventId);
                    const event = this.events.find(e => e.id === eventId);
                    if (event) {
                        this.showEventModal(event);
                    }
                }
            });
        });
    },

    initCalendar() {
        this.currentCalendarDate = new Date();
        this.renderCalendar();
        
        // Navigation buttons
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
            this.renderCalendar();
        });
    },

    renderCalendar() {
        const monthYear = document.getElementById('current-month-year');
        const daysContainer = document.getElementById('calendar-days');
        
        // Update month/year display
        const options = { month: 'long', year: 'numeric' };
        monthYear.textContent = this.currentCalendarDate.toLocaleDateString('en-US', options);
        
        // Get first day of month
        const firstDay = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth(), 1);
        const lastDay = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth() + 1, 0);
        
        // Calculate days from previous month
        const startDay = firstDay.getDay(); // 0 = Sunday
        
        // Clear container
        daysContainer.innerHTML = '';
        
        // Add empty days for previous month
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            daysContainer.appendChild(emptyDay);
        }
        
        // Add days of current month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Create date object for this day
            const date = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth(), day);
            
            // Check if today
            if (date.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            // Check if has events
            const hasEvents = this.events.some(event => {
                const eventDate = new Date(event.date);
                return eventDate.getFullYear() === date.getFullYear() &&
                       eventDate.getMonth() === date.getMonth() &&
                       eventDate.getDate() === date.getDate();
            });
            
            if (hasEvents) {
                dayElement.classList.add('has-events');
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                this.selectCalendarDate(date);
            });
            
            daysContainer.appendChild(dayElement);
        }
        
        // Select today by default
        if (this.currentCalendarDate.getMonth() === today.getMonth() && 
            this.currentCalendarDate.getFullYear() === today.getFullYear()) {
            this.selectCalendarDate(today);
        }
    },

    selectCalendarDate(date) {
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selected class to clicked day
        const dayElements = document.querySelectorAll('.calendar-day');
        const dayIndex = date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
        if (dayElements[dayIndex]) {
            dayElements[dayIndex].classList.add('selected');
        }
        
        // Show events for selected date
        this.displayEventsForDate(date);
    },

    displayEventsForDate(date) {
        const eventsContainer = document.getElementById('calendar-events');
        const events = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === date.getFullYear() &&
                   eventDate.getMonth() === date.getMonth() &&
                   eventDate.getDate() === date.getDate();
        });
        
        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <h3>Events for ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                <div class="no-events-date">
                    <i class="far fa-calendar-times" style="font-size: 2rem; color: var(--primary); opacity: 0.5; margin-bottom: 1rem;"></i>
                    <p>No events scheduled for this date.</p>
                </div>
            `;
            return;
        }
        
        eventsContainer.innerHTML = `
            <h3>Events for ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
            <div class="date-events-list">
                ${events.map(event => this.createCalendarEventItem(event)).join('')}
            </div>
        `;
        
        // Add event listeners
        eventsContainer.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = parseInt(btn.dataset.eventId);
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    this.showEventModal(event);
                }
            });
        });
    },

    createCalendarEventItem(event) {
        const categoryNames = {
            workshop: 'Workshop',
            hackathon: 'Hackathon',
            seminar: 'Seminar',
            networking: 'Networking',
            social: 'Social Event',
            competition: 'Competition'
        };

        return `
            <div class="date-event-item">
                <h4 class="date-event-title">${event.title}</h4>
                <div class="date-event-time">
                    <i class="far fa-clock"></i> ${event.time} • ${event.duration}
                </div>
                <span class="date-event-category">${categoryNames[event.category] || event.category}</span>
                <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.5rem;">
                    <i class="fas fa-map-marker-alt"></i> ${event.location}
                </p>
                <button class="btn btn-outline view-details-btn" data-event-id="${event.id}" style="margin-top: 0.8rem; width: 100%;">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
            </div>
        `;
    },

    showEventModal(event) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = eventDate < today;
        const isFull = event.registered >= event.capacity;
        
        const categoryNames = {
            workshop: 'Workshop',
            hackathon: 'Hackathon',
            seminar: 'Seminar',
            networking: 'Networking',
            social: 'Social Event',
            competition: 'Competition'
        };
        
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const modalContent = `
            <div class="event-modal-content">
                <div class="modal-event-header">
                    <div class="modal-event-image"></div>
                    <div class="modal-event-details">
                        <h2 class="modal-event-title">${event.title}</h2>
                        <span class="modal-event-category">${categoryNames[event.category] || event.category}</span>
                        <div class="modal-event-date">
                            <i class="far fa-calendar"></i>
                            ${formattedDate} • ${event.time}
                        </div>
                        <div style="color: var(--primary); font-weight: 600;">
                            <i class="fas fa-clock"></i> Duration: ${event.duration}
                        </div>
                        <div style="color: var(--primary); font-weight: 600;">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                        </div>
                    </div>
                </div>
                
                <div class="modal-event-body">
                    <h3 style="color: var(--light); margin-bottom: 1rem;">Event Description</h3>
                    <p class="modal-event-description">${event.description}</p>
                    
                    <div class="modal-event-info">
                        <div class="info-item">
                            <div class="info-label">Organizer</div>
                            <div class="info-value">${event.organizer}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Capacity</div>
                            <div class="info-value">${event.capacity} participants</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Requirements</div>
                            <div class="info-value">${event.requirements}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Registration Deadline</div>
                            <div class="info-value">${new Date(event.registrationDeadline).toLocaleDateString()}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Contact</div>
                            <div class="info-value">${event.contactEmail}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <div class="info-value" style="color: ${isPast ? '#ff6b6b' : isFull ? '#ffa726' : '#4caf50'}">
                                ${isPast ? 'Event Ended' : isFull ? 'Fully Booked' : 'Open for Registration'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalFooter = `
            <button class="btn btn-outline" onclick="ModalSystem.close('event-details-modal')">
                <i class="fas fa-times"></i> Close
            </button>
            ${!isPast && !isFull ? 
                `<button class="btn register-event-btn" data-event-id="${event.id}">
                    <i class="fas fa-user-plus"></i> Register Now
                </button>` :
                `<button class="btn" disabled>
                    <i class="fas fa-calendar-times"></i> ${isPast ? 'Event Ended' : 'Registration Closed'}
                </button>`
            }
        `;

        // Create or update modal
        if (!ModalSystem.modals.has('event-details-modal')) {
            ModalSystem.create('event-details-modal', event.title, modalContent, { footer: modalFooter });
        } else {
            // Update existing modal
            const modal = ModalSystem.modals.get('event-details-modal');
            modal.querySelector('.modal-header h3').textContent = event.title;
            modal.querySelector('.modal-body').innerHTML = modalContent;
            modal.querySelector('.modal-footer').innerHTML = modalFooter;
        }

        ModalSystem.open('event-details-modal');

        // Add event listener to register button
        setTimeout(() => {
            const registerBtn = document.querySelector('.register-event-btn');
            if (registerBtn) {
                registerBtn.addEventListener('click', () => {
                    ModalSystem.close('event-details-modal');
                    this.showRegistrationModal(event);
                });
            }
        }, 100);
    },

    showRegistrationModal(event) {
        const modalContent = `
            <div class="registration-form">
                <h3 style="color: var(--light); margin-bottom: 1.5rem;">Register for: ${event.title}</h3>
                
                <form id="registration-form-${event.id}">
                    <div class="form-group">
                        <label for="reg-name-${event.id}">Full Name *</label>
                        <input type="text" id="reg-name-${event.id}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-email-${event.id}">Email Address *</label>
                        <input type="email" id="reg-email-${event.id}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-student-id-${event.id}">Student ID</label>
                        <input type="text" id="reg-student-id-${event.id}">
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-major-${event.id}">Major/Program</label>
                        <input type="text" id="reg-major-${event.id}">
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-year-${event.id}">Year Level</label>
                        <select id="reg-year-${event.id}">
                            <option value="">Select year level</option>
                            <option value="freshman">Freshman</option>
                            <option value="sophomore">Sophomore</option>
                            <option value="junior">Junior</option>
                            <option value="senior">Senior</option>
                            <option value="graduate">Graduate</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-phone-${event.id}">Phone Number</label>
                        <input type="tel" id="reg-phone-${event.id}">
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-comments-${event.id}">Additional Comments</label>
                        <textarea id="reg-comments-${event.id}" rows="3" placeholder="Any special requirements or comments..."></textarea>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="reg-newsletter-${event.id}" checked>
                        <label for="reg-newsletter-${event.id}">Receive updates about this event</label>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="reg-terms-${event.id}" required>
                        <label for="reg-terms-${event.id}">I agree to the terms and conditions *</label>
                    </div>
                </form>
            </div>
        `;

        const modalFooter = `
            <button class="btn btn-outline" onclick="ModalSystem.close('event-registration-modal')">
                Cancel
            </button>
            <button class="btn" onclick="EventsModule.handleRegistration(${event.id})">
                <i class="fas fa-paper-plane"></i> Submit Registration
            </button>
        `;

        // Create or update modal
        if (!ModalSystem.modals.has('event-registration-modal')) {
            ModalSystem.create('event-registration-modal', `Register for ${event.title}`, modalContent, { footer: modalFooter });
        } else {
            const modal = ModalSystem.modals.get('event-registration-modal');
            modal.querySelector('.modal-header h3').textContent = `Register for ${event.title}`;
            modal.querySelector('.modal-body').innerHTML = modalContent;
            modal.querySelector('.modal-footer').innerHTML = modalFooter;
        }

        ModalSystem.open('event-registration-modal');

        // Load saved form data
        this.loadRegistrationFormData(event.id);
        
        // Save form data on input
        const form = document.getElementById(`registration-form-${event.id}`);
        if (form) {
            form.addEventListener('input', () => {
                this.saveRegistrationFormData(event.id);
            });
        }
    },

    async handleRegistration(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const form = document.getElementById(`registration-form-${eventId}`);
        if (!form) return;

        const formData = new FormData(form);
        
        // Basic validation
        const name = document.getElementById(`reg-name-${eventId}`).value;
        const email = document.getElementById(`reg-email-${eventId}`).value;
        const terms = document.getElementById(`reg-terms-${eventId}`).checked;
        
        if (!name || !email || !terms) {
            ToastSystem.show('Please fill in all required fields and agree to terms', 'error');
            return;
        }

        // Check if already registered
        const alreadyRegistered = this.registrations.some(reg => 
            reg.eventId === eventId && reg.email === email
        );
        
        if (alreadyRegistered) {
            ToastSystem.show('You are already registered for this event!', 'error');
            return;
        }
        
        // Simulate API call
        ToastSystem.show('Processing registration...', 'info');
        
        setTimeout(() => {
            // Create registration object
            const registration = {
                eventId: event.id,
                eventTitle: event.title,
                name: name,
                email: email,
                studentId: document.getElementById(`reg-student-id-${eventId}`)?.value || '',
                major: document.getElementById(`reg-major-${eventId}`)?.value || '',
                year: document.getElementById(`reg-year-${eventId}`)?.value || '',
                phone: document.getElementById(`reg-phone-${eventId}`)?.value || '',
                comments: document.getElementById(`reg-comments-${eventId}`)?.value || '',
                newsletter: document.getElementById(`reg-newsletter-${eventId}`)?.checked || false,
                registeredAt: new Date().toISOString()
            };
            
            // Add registration
            this.registrations.push(registration);
            
            // Update event registration count
            const eventIndex = this.events.findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                this.events[eventIndex].registered++;
                this.saveEventsData();
            }
            
            // Save registrations
            localStorage.setItem('jpcs_event_registrations', JSON.stringify(this.registrations));
            
            // Clear saved form data
            this.clearRegistrationFormData(eventId);
            
            // Show success
            ToastSystem.show(`Successfully registered for ${event.title}! Check your email for confirmation.`, 'success');
            
            // Close modal
            ModalSystem.close('event-registration-modal');
            
            // Refresh events display
            this.applyFilters();
            
        }, 1500);
    },

    saveRegistrationFormData(eventId) {
        try {
            const formData = {
                name: document.getElementById(`reg-name-${eventId}`)?.value || '',
                email: document.getElementById(`reg-email-${eventId}`)?.value || '',
                studentId: document.getElementById(`reg-student-id-${eventId}`)?.value || '',
                major: document.getElementById(`reg-major-${eventId}`)?.value || '',
                year: document.getElementById(`reg-year-${eventId}`)?.value || '',
                phone: document.getElementById(`reg-phone-${eventId}`)?.value || '',
                comments: document.getElementById(`reg-comments-${eventId}`)?.value || '',
                newsletter: document.getElementById(`reg-newsletter-${eventId}`)?.checked || false
            };
            
            localStorage.setItem(`reg_form_${eventId}`, JSON.stringify(formData));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    },

    loadRegistrationFormData(eventId) {
        try {
            const savedData = localStorage.getItem(`reg_form_${eventId}`);
            if (!savedData) return;
            
            const formData = JSON.parse(savedData);
            
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(`reg-${key}-${eventId}`);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = formData[key];
                    } else {
                        element.value = formData[key];
                    }
                }
            });
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    },

    clearRegistrationFormData(eventId) {
        localStorage.removeItem(`reg_form_${eventId}`);
    },

    initSuggestionModal() {
        const modalContent = `
            <form id="event-suggestion-form">
                <div class="form-group">
                    <label for="suggestion-title">Event Title *</label>
                    <input type="text" id="suggestion-title" required>
                </div>
                <div class="form-group">
                    <label for="suggestion-category">Category *</label>
                    <select id="suggestion-category" required>
                        <option value="">Select category</option>
                        <option value="workshop">Workshop</option>
                        <option value="hackathon">Hackathon</option>
                        <option value="seminar">Seminar</option>
                        <option value="networking">Networking</option>
                        <option value="social">Social Event</option>
                        <option value="competition">Competition</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="suggestion-description">Description *</label>
                    <textarea id="suggestion-description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="suggestion-contact">Your Email *</label>
                    <input type="email" id="suggestion-contact" required>
                </div>
            </form>
        `;

        const modalFooter = `
            <button class="btn btn-outline" onclick="ModalSystem.close('suggestion-modal')">
                Cancel
            </button>
            <button class="btn" onclick="EventsModule.handleEventSuggestion()">
                <i class="fas fa-paper-plane"></i> Submit Suggestion
            </button>
        `;

        ModalSystem.create('suggestion-modal', 'Suggest an Event', modalContent, { footer: modalFooter });

        // Suggest event button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'suggest-event-btn' || e.target.closest('#suggest-event-btn')) {
                ModalSystem.open('suggestion-modal');
            }
        });

        // Volunteer button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'volunteer-btn' || e.target.closest('#volunteer-btn')) {
                window.app.navigateTo('membership');
                ToastSystem.show('Redirecting to membership page...', 'info');
            }
        });
    },

    handleEventSuggestion() {
        const title = document.getElementById('suggestion-title').value;
        const category = document.getElementById('suggestion-category').value;
        const description = document.getElementById('suggestion-description').value;
        const contact = document.getElementById('suggestion-contact').value;

        if (!title || !category || !description || !contact) {
            ToastSystem.show('Please fill in all required fields', 'error');
            return;
        }

        const suggestion = {
            title,
            category,
            description,
            contact,
            submittedAt: new Date().toISOString()
        };

        // Save suggestion
        const suggestions = JSON.parse(localStorage.getItem('jpcs_event_suggestions') || '[]');
        suggestions.push(suggestion);
        localStorage.setItem('jpcs_event_suggestions', JSON.stringify(suggestions));

        // Clear form
        document.getElementById('event-suggestion-form').reset();

        // Show success
        ToastSystem.show('Thank you for your suggestion! We\'ll review it soon.', 'success');

        // Close modal
        ModalSystem.close('suggestion-modal');
    },

    loadEvents() {
        this.applyFilters();
    },

    loadFeaturedEvents() {
        const featuredEvents = this.events.filter(event => event.featured);
        const slider = document.querySelector('.featured-events-slider');
        
        if (featuredEvents.length === 0) {
            slider.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 2rem;">No featured events at the moment.</p>';
            return;
        }
        
        slider.innerHTML = `
            <div class="featured-slides-container">
                ${featuredEvents.map((event, index) => this.createFeaturedEventSlide(event, index)).join('')}
            </div>
            <div class="slider-controls">
                <button class="slider-prev"><i class="fas fa-chevron-left"></i></button>
                <div class="slider-dots" id="featured-dots">
                    ${featuredEvents.map((_, index) => 
                        `<span class="dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>`
                    ).join('')}
                </div>
                <button class="slider-next"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;

        this.initFeaturedSlider();
    },

    createFeaturedEventSlide(event, index) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <div class="featured-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                <div class="featured-event-content">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="featured-event-details">
                        <div class="featured-event-date">
                            <i class="far fa-calendar"></i> ${formattedDate}
                        </div>
                        <div class="featured-event-time">
                            <i class="far fa-clock"></i> ${event.time}
                        </div>
                        <div class="featured-event-location">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                        </div>
                    </div>
                    <button class="btn view-details-btn" data-event-id="${event.id}" style="margin-top: 1.5rem;">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        `;
    },

    initFeaturedSlider() {
        const slides = document.querySelectorAll('.featured-slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        
        let currentSlide = 0;
        const slideInterval = 5000;

        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        };

        const nextSlide = () => {
            const nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        };

        const prevSlide = () => {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        };

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });

        // Auto slide
        let autoSlideInterval = setInterval(nextSlide, slideInterval);

        // Pause on hover
        const slider = document.querySelector('.featured-events-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                clearInterval(autoSlideInterval);
            });
            
            slider.addEventListener('mouseleave', () => {
                autoSlideInterval = setInterval(nextSlide, slideInterval);
            });
        }
    },

    initStats() {
        this.updateStats();
    },

    updateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const totalEvents = this.events.length;
        const upcomingEvents = this.events.filter(event => new Date(event.date) >= today).length;
        const totalParticipants = this.events.reduce((sum, event) => sum + event.registered, 0);
        const totalCapacity = this.events.reduce((sum, event) => sum + event.capacity, 0);
        const completionRate = totalCapacity > 0 ? Math.round((totalParticipants / totalCapacity) * 100) : 0;
        
        document.getElementById('total-events').textContent = totalEvents;
        document.getElementById('upcoming-events').textContent = upcomingEvents;
        document.getElementById('participants-count').textContent = totalParticipants.toLocaleString();
        document.getElementById('completion-rate').textContent = completionRate + '%';
    },

    updateNoEventsMessage() {
        const noEventsMsg = document.querySelector('.no-events-message');
        const hasEvents = this.filteredEvents && this.filteredEvents.length > 0;
        
        if (noEventsMsg) {
            noEventsMsg.style.display = hasEvents ? 'none' : 'block';
        }
    },

    setupEventListeners() {
        // Save filters on page unload
        window.addEventListener('beforeunload', () => {
            this.saveFilters();
        });
    },

    savePreference(key, value) {
        try {
            const preferences = JSON.parse(localStorage.getItem('jpcs_preferences')) || {};
            preferences[key] = value;
            localStorage.setItem('jpcs_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preference:', error);
        }
    },

    loadPreference(key) {
        try {
            const preferences = JSON.parse(localStorage.getItem('jpcs_preferences')) || {};
            return preferences[key];
        } catch (error) {
            console.error('Error loading preference:', error);
            return null;
        }
    }
};

// Make EventsModule available globally for button clicks
window.EventsModule = EventsModule;

// Export the module
export { EventsModule as default };