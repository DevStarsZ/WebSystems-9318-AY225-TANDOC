// Contact Page JavaScript Module
const ContactModule = {
    async init() {
        console.log('Contact page initialized');
        
        // Initialize components
        this.initContactForm();
        this.initModals();
        this.initSocialLinks();
        this.setupEventListeners();
        
        // Load saved form data
        this.loadSavedFormData();
    },

    initContactForm() {
        const form = document.getElementById('contact-form');
        
        // Subject selection - show other field if "other" is selected
        const subjectSelect = document.getElementById('contact-subject');
        if (subjectSelect) {
            subjectSelect.addEventListener('change', (e) => {
                const otherGroup = document.getElementById('other-subject-group');
                otherGroup.style.display = e.target.value === 'other' ? 'block' : 'none';
                this.saveFormData();
            });
        }
        
        // Real-time validation
        const requiredFields = ['contact-name', 'contact-email', 'contact-subject', 'contact-message'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
                
                field.addEventListener('input', () => {
                    if (field.classList.contains('error')) {
                        this.validateField(field);
                    }
                });
            }
        });
        
        // Email validation
        const emailField = document.getElementById('contact-email');
        if (emailField) {
            emailField.addEventListener('blur', () => {
                this.validateEmail(emailField);
            });
        }
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitContactForm();
        });
        
        // Auto-save on input
        form.addEventListener('input', () => {
            this.saveFormData();
        });
    },

    validateField(field) {
        const errorElement = field.parentElement.querySelector('.error-message');
        
        if (!field.value.trim()) {
            field.classList.add('error');
            if (errorElement) errorElement.textContent = 'This field is required';
            return false;
        } else {
            field.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
            return true;
        }
    },

    validateEmail(emailField) {
        const errorElement = emailField.parentElement.querySelector('.error-message');
        const email = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            emailField.classList.add('error');
            if (errorElement) errorElement.textContent = 'Email is required';
            return false;
        } else if (!emailRegex.test(email)) {
            emailField.classList.add('error');
            if (errorElement) errorElement.textContent = 'Please enter a valid email address';
            return false;
        } else {
            emailField.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
            return true;
        }
    },

    validateForm() {
        let isValid = true;
        
        // Validate required fields
        const requiredFields = ['contact-name', 'contact-email', 'contact-subject', 'contact-message'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validate email
        const emailField = document.getElementById('contact-email');
        if (emailField && !this.validateEmail(emailField)) {
            isValid = false;
        }
        
        // Validate other subject if selected
        const subjectSelect = document.getElementById('contact-subject');
        const otherSubjectGroup = document.getElementById('other-subject-group');
        if (subjectSelect.value === 'other' && otherSubjectGroup.style.display === 'block') {
            const otherSubject = document.getElementById('other-subject');
            if (otherSubject && !otherSubject.value.trim()) {
                otherSubject.classList.add('error');
                isValid = false;
            }
        }
        
        if (!isValid) {
            // Scroll to first error
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            
            ToastSystem.show('Please fix the errors in the form', 'error');
        }
        
        return isValid;
    },

    async submitContactForm() {
        if (!this.validateForm()) return;
        
        const form = document.getElementById('contact-form');
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Collect form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                other_subject: formData.get('other_subject'),
                message: formData.get('message'),
                urgency: formData.get('urgency'),
                newsletter: formData.get('newsletter') === 'on',
                submittedAt: new Date().toISOString()
            };
            
            // Generate message ID
            const messages = JSON.parse(localStorage.getItem('jpcs_contact_messages') || '[]');
            const messageId = `MSG-${new Date().getFullYear()}-${String(messages.length + 1).padStart(3, '0')}`;
            
            // Create message object
            const message = {
                id: messageId,
                ...data,
                status: 'pending',
                read: false
            };
            
            // Save to localStorage
            messages.push(message);
            localStorage.setItem('jpcs_contact_messages', JSON.stringify(messages));
            
            // Clear saved form data
            localStorage.removeItem('jpcs_contact_form');
            
            // Reset form
            form.reset();
            
            // Show success modal
            this.showSuccessModal(messageId);
            
            // Track submission
            this.trackMessageSubmission(messageId, data.subject);
            
        } catch (error) {
            console.error('Error submitting contact form:', error);
            ToastSystem.show('Error sending message. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    saveFormData() {
        try {
            const form = document.getElementById('contact-form');
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                other_subject: formData.get('other_subject'),
                message: formData.get('message'),
                urgency: formData.get('urgency'),
                newsletter: formData.get('newsletter') === 'on'
            };
            
            // Save to localStorage
            localStorage.setItem('jpcs_contact_form', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    },

    loadSavedFormData() {
        try {
            const savedData = localStorage.getItem('jpcs_contact_form');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Populate form fields
                document.getElementById('contact-name').value = data.name || '';
                document.getElementById('contact-email').value = data.email || '';
                document.getElementById('contact-subject').value = data.subject || '';
                document.getElementById('contact-message').value = data.message || '';
                
                // Set urgency
                if (data.urgency) {
                    const urgencyRadio = document.querySelector(`input[name="urgency"][value="${data.urgency}"]`);
                    if (urgencyRadio) urgencyRadio.checked = true;
                }
                
                // Set newsletter
                if (data.newsletter !== undefined) {
                    document.getElementById('contact-newsletter').checked = data.newsletter;
                }
                
                // Show/hide other subject field if needed
                const subjectSelect = document.getElementById('contact-subject');
                if (subjectSelect && subjectSelect.value === 'other') {
                    document.getElementById('other-subject-group').style.display = 'block';
                    document.getElementById('other-subject').value = data.other_subject || '';
                }
                
                ToastSystem.show('Previous form data restored', 'success');
            }
        } catch (error) {
            console.error('Error loading saved form data:', error);
        }
    },

    initModals() {
        // Success modal content
        const successModalContent = `
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Thank You for Contacting Us</h3>
                <p>Your message has been successfully sent. We'll get back to you as soon as possible.</p>
                <div class="success-details">
                    <p><strong>Reference ID:</strong> <span id="message-id">MSG-${new Date().getFullYear()}-001</span></p>
                    <p><strong>Expected Response:</strong> 24-48 hours</p>
                </div>
            </div>
        `;

        const successModalFooter = `
            <button class="btn btn-outline" onclick="ModalSystem.close('contact-success-modal')">
                Close
            </button>
            <button class="btn" onclick="ContactModule.printMessage()">
                <i class="fas fa-print"></i> Print Receipt
            </button>
        `;

        ModalSystem.create('contact-success-modal', 'Message Sent!', successModalContent, { footer: successModalFooter });

        // Directions modal content
        const directionsModalContent = `
            <div class="directions-content">
                <h4>Getting to JPCS Office</h4>
                <div class="transport-options">
                    <div class="transport-option">
                        <i class="fas fa-subway"></i>
                        <div>
                            <strong>By MRT/LRT:</strong>
                            <p>Get off at University Station, take Exit 3.</p>
                        </div>
                    </div>
                    <div class="transport-option">
                        <i class="fas fa-bus"></i>
                        <div>
                            <strong>By Bus:</strong>
                            <p>University Loop buses stop at the main gate.</p>
                        </div>
                    </div>
                    <div class="transport-option">
                        <i class="fas fa-car"></i>
                        <div>
                            <strong>By Car:</strong>
                            <p>Parking available at Building C parking lot.</p>
                        </div>
                    </div>
                </div>
                <div class="map-link">
                    <p>Computer Science Building, Room 305</p>
                    <p>University of Technology Campus</p>
                    <p>Metro Manila, Philippines</p>
                </div>
            </div>
        `;

        const directionsModalFooter = `
            <button class="btn btn-outline" onclick="ModalSystem.close('directions-modal')">
                <i class="fas fa-times"></i> Close
            </button>
            <button class="btn" onclick="ContactModule.openGoogleMaps()">
                <i class="fas fa-external-link-alt"></i> Open in Google Maps
            </button>
        `;

        ModalSystem.create('directions-modal', 'Get Directions', directionsModalContent, { footer: directionsModalFooter });

        // Get directions button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'get-directions' || e.target.closest('#get-directions')) {
                e.preventDefault();
                ModalSystem.open('directions-modal');
            }
        });
    },

    showSuccessModal(messageId) {
        document.getElementById('message-id').textContent = messageId;
        ModalSystem.open('contact-success-modal');
        this.trackMessageSubmission(messageId);
    },

    openGoogleMaps() {
        const address = "Computer Science Building, University of Technology Campus, Metro Manila, Philippines";
        const encodedAddress = encodeURIComponent(address);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        
        window.open(mapsUrl, '_blank');
        ModalSystem.close('directions-modal');
        
        this.trackDirectionsRequest();
    },

    printMessage() {
        const printContent = `
            <html>
                <head>
                    <title>JPCS Contact Confirmation</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #0066cc; }
                        .section { margin-bottom: 20px; }
                        .label { font-weight: bold; color: #666; }
                        .value { margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <h1>JPCS Contact Confirmation</h1>
                    <p>Reference ID: ${document.getElementById('message-id').textContent}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    <p>Thank you for contacting JPCS. We have received your message and will respond within 24-48 hours.</p>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    },

    initSocialLinks() {
        // Add click tracking to social links
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = link.classList[1]; // e.g., 'facebook', 'twitter'
                this.trackSocialClick(platform);
                ToastSystem.show(`Opening ${platform} page...`, 'info');
                
                // In a real application, you would redirect to the actual social media page
                // window.open(link.href, '_blank');
            });
        });
        
        // Add click tracking to quick links
        document.querySelectorAll('.quick-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const linkText = link.textContent.trim();
                this.trackQuickLinkClick(linkText);
                
                // Navigate to the appropriate page
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    const page = href.substring(1);
                    if (['faq', 'events', 'membership', 'resources'].includes(page)) {
                        window.app.navigateTo(page === 'faq' ? 'contact' : page);
                    }
                }
            });
        });
    },

    trackSocialClick(platform) {
        try {
            const analytics = JSON.parse(localStorage.getItem('jpcs_analytics') || '{}');
            if (!analytics.socialClicks) {
                analytics.socialClicks = {};
            }
            
            if (!analytics.socialClicks[platform]) {
                analytics.socialClicks[platform] = 0;
            }
            
            analytics.socialClicks[platform]++;
            analytics.lastSocialClick = {
                platform: platform,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('jpcs_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Error tracking social click:', error);
        }
    },

    trackQuickLinkClick(linkText) {
        try {
            const analytics = JSON.parse(localStorage.getItem('jpcs_analytics') || '{}');
            if (!analytics.quickLinkClicks) {
                analytics.quickLinkClicks = [];
            }
            
            analytics.quickLinkClicks.push({
                link: linkText,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('jpcs_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Error tracking quick link click:', error);
        }
    },

    trackMessageSubmission(messageId) {
        try {
            const analytics = JSON.parse(localStorage.getItem('jpcs_analytics') || '{}');
            if (!analytics.contactMessages) {
                analytics.contactMessages = [];
            }
            
            analytics.contactMessages.push({
                id: messageId,
                timestamp: new Date().toISOString(),
                subject: document.getElementById('contact-subject').value
            });
            
            localStorage.setItem('jpcs_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Error tracking message:', error);
        }
    },

    trackDirectionsRequest() {
        try {
            const analytics = JSON.parse(localStorage.getItem('jpcs_analytics') || '{}');
            if (!analytics.directionsRequests) {
                analytics.directionsRequests = 0;
            }
            
            analytics.directionsRequests++;
            analytics.lastDirectionsRequest = new Date().toISOString();
            
            localStorage.setItem('jpcs_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Error tracking directions request:', error);
        }
    },

    setupEventListeners() {
        // Auto-save form data on window close
        window.addEventListener('beforeunload', () => {
            this.saveFormData();
        });
        
        // Initialize tooltips
        this.initTooltips();
        
        // Add keyboard shortcut for form (Ctrl/Cmd + Enter to submit)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const form = document.getElementById('contact-form');
                if (form && document.activeElement.closest('#contact-form')) {
                    e.preventDefault();
                    form.requestSubmit();
                }
            }
        });
    },

    initTooltips() {
        // Add tooltips to form fields
        const tooltips = {
            'contact-name': 'Please enter your full name',
            'contact-email': 'We\'ll respond to this email address',
            'contact-subject': 'What is your message about?',
            'contact-message': 'Please provide details about your inquiry',
            'contact-urgency': 'How urgent is your message? Low: within a week, Medium: within 3 days, High: within 24 hours'
        };
        
        Object.entries(tooltips).forEach(([fieldId, tooltipText]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.title = tooltipText;
                field.setAttribute('aria-label', tooltipText);
            }
        });
        
        // Add tooltips to contact cards
        document.querySelectorAll('.contact-link').forEach(link => {
            if (link.href.startsWith('mailto:')) {
                link.title = 'Send us an email';
            } else if (link.href.startsWith('tel:')) {
                link.title = 'Call us';
            }
        });
    }
};

// Make ContactModule available globally
window.ContactModule = ContactModule;

// Export the module
export { ContactModule as default };