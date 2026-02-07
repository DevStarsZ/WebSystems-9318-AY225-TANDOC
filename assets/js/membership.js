// Membership Page JavaScript Module
const MembershipModule = {
    async init() {
        console.log('Membership page initialized');
        
        // Initialize form state
        this.currentStep = 1;
        this.formData = {};
        this.validationErrors = {};
        
        // Initialize components
        this.initTierSelection();
        this.initFormSteps();
        this.initFormValidation();
        this.initFAQ();
        this.initModals();
        this.loadSavedFormData();
        
        // Setup event listeners
        this.setupEventListeners();
    },

    initTierSelection() {
        // Tier selection from cards
        document.querySelectorAll('.tier-select').forEach(button => {
            button.addEventListener('click', () => {
                const tier = button.dataset.tier;
                this.selectTier(tier);
                
                // Scroll to form
                document.querySelector('#membership-form').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
        
        // Tier selection in form
        document.querySelectorAll('input[name="membership_tier"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.saveFormData();
                ToastSystem.show(`${this.formatMembershipTier(e.target.value)} selected`, 'success');
            });
        });
    },

    selectTier(tier) {
        const radio = document.querySelector(`#tier-${tier}`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
            
            // Highlight selected tier card
            document.querySelectorAll('.tier-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            const tierCard = document.querySelector(`.tier-select[data-tier="${tier}"]`)?.closest('.tier-card');
            if (tierCard) {
                tierCard.classList.add('selected');
            }
        }
    },

    initFormSteps() {
        this.updateProgressBar();
        
        // Next step buttons
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const nextStep = parseInt(button.dataset.next);
                if (this.validateStep(this.currentStep)) {
                    this.goToStep(nextStep);
                }
            });
        });
        
        // Previous step buttons
        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const prevStep = parseInt(button.dataset.prev);
                this.goToStep(prevStep);
            });
        });
        
        // University selection - show other field if "other" is selected
        const universitySelect = document.getElementById('university');
        if (universitySelect) {
            universitySelect.addEventListener('change', (e) => {
                const otherGroup = document.getElementById('other-university-group');
                otherGroup.style.display = e.target.value === 'other' ? 'block' : 'none';
                this.saveFormData();
            });
        }
        
        // Referral source - show other field if "other" is selected
        const referralSelect = document.getElementById('referral-source');
        if (referralSelect) {
            referralSelect.addEventListener('change', (e) => {
                const otherGroup = document.getElementById('other-referral-group');
                otherGroup.style.display = e.target.value === 'other' ? 'block' : 'none';
                this.saveFormData();
            });
        }
    },

    goToStep(step) {
        if (step < 1 || step > 4) return;
        
        // Hide current step
        const currentStepEl = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }
        
        // Update progress steps
        const currentStepIndicator = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        const newStepIndicator = document.querySelector(`.step[data-step="${step}"]`);
        
        if (currentStepIndicator) currentStepIndicator.classList.remove('active');
        if (newStepIndicator) newStepIndicator.classList.add('active');
        
        // Show new step
        const newStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        if (newStepEl) {
            newStepEl.classList.add('active');
            this.currentStep = step;
        }
        
        // Update progress bar
        this.updateProgressBar();
        
        // Save form data
        this.saveFormData();
        
        // If going to review step, update review summary
        if (step === 4) {
            this.updateReviewSummary();
        }
        
        // Scroll to top of form
        newStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const percentage = ((this.currentStep - 1) / 3) * 100; // 4 steps = 0-100%
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    },

    initFormValidation() {
        // Real-time validation for required fields
        document.querySelectorAll('#membership-form input[required], #membership-form select[required]').forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                if (this.validationErrors[field.name]) {
                    this.validateField(field);
                }
            });
        });
        
        // Email validation
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', () => {
                this.validateEmail(emailField);
            });
        }
        
        // Phone validation
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('blur', () => {
                this.validatePhone(phoneField);
            });
        }
        
        // Form submission
        const form = document.getElementById('membership-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    },

    validateField(field) {
        const errorElement = field.parentElement.querySelector('.error-message');
        const fieldName = field.getAttribute('name') || field.id;
        
        if (!field.value.trim()) {
            this.validationErrors[fieldName] = 'This field is required';
            field.classList.add('error');
            if (errorElement) errorElement.textContent = 'This field is required';
            return false;
        } else {
            delete this.validationErrors[fieldName];
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
            this.validationErrors.email = 'Email is required';
            emailField.classList.add('error');
            if (errorElement) errorElement.textContent = 'Email is required';
            return false;
        } else if (!emailRegex.test(email)) {
            this.validationErrors.email = 'Please enter a valid email address';
            emailField.classList.add('error');
            if (errorElement) errorElement.textContent = 'Please enter a valid email address';
            return false;
        } else {
            delete this.validationErrors.email;
            emailField.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
            return true;
        }
    },

    validatePhone(phoneField) {
        const errorElement = phoneField.parentElement.querySelector('.error-message');
        const phone = phoneField.value.trim();
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        
        if (!phone) {
            this.validationErrors.phone = 'Phone number is required';
            phoneField.classList.add('error');
            if (errorElement) errorElement.textContent = 'Phone number is required';
            return false;
        } else if (!phoneRegex.test(phone)) {
            this.validationErrors.phone = 'Please enter a valid phone number';
            phoneField.classList.add('error');
            if (errorElement) errorElement.textContent = 'Please enter a valid phone number';
            return false;
        } else {
            delete this.validationErrors.phone;
            phoneField.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
            return true;
        }
    },

    validateStep(step) {
        let isValid = true;
        
        switch (step) {
            case 1:
                // Validate personal information
                const requiredFields1 = ['first_name', 'last_name', 'email', 'phone', 'birthdate'];
                requiredFields1.forEach(fieldName => {
                    const field = document.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        if (!this.validateField(field)) isValid = false;
                    }
                });
                
                // Special validation for email
                const emailField = document.getElementById('email');
                if (emailField && !this.validateEmail(emailField)) isValid = false;
                
                // Special validation for phone
                const phoneField = document.getElementById('phone');
                if (phoneField && !this.validatePhone(phoneField)) isValid = false;
                break;
                
            case 2:
                // Validate academic information
                const requiredFields2 = ['student_id', 'university', 'major', 'year_level', 'expected_graduation'];
                requiredFields2.forEach(fieldName => {
                    const field = document.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        if (!this.validateField(field)) isValid = false;
                    }
                });
                break;
                
            case 3:
                // Validate membership details
                const membershipTier = document.querySelector('input[name="membership_tier"]:checked');
                const referralSource = document.getElementById('referral-source');
                
                if (!membershipTier) {
                    this.validationErrors.membership_tier = 'Please select a membership tier';
                    const errorElement = document.querySelector('#membership-tier + .error-message');
                    if (errorElement) errorElement.textContent = 'Please select a membership tier';
                    isValid = false;
                } else {
                    delete this.validationErrors.membership_tier;
                    const errorElement = document.querySelector('#membership-tier + .error-message');
                    if (errorElement) errorElement.textContent = '';
                }
                
                if (!referralSource.value) {
                    this.validationErrors.referral_source = 'Please select how you heard about JPCS';
                    referralSource.classList.add('error');
                    const errorElement = referralSource.parentElement.querySelector('.error-message');
                    if (errorElement) errorElement.textContent = 'Please select how you heard about JPCS';
                    isValid = false;
                } else {
                    delete this.validationErrors.referral_source;
                    referralSource.classList.remove('error');
                    const errorElement = referralSource.parentElement.querySelector('.error-message');
                    if (errorElement) errorElement.textContent = '';
                }
                break;
        }
        
        if (!isValid) {
            // Scroll to first error
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            
            ToastSystem.show('Please fix the errors in the form before continuing.', 'error');
        }
        
        return isValid;
    },

    saveFormData() {
        try {
            // Collect all form data
            const form = document.getElementById('membership-form');
            const formData = new FormData(form);
            
            // Convert FormData to object
            const data = {};
            formData.forEach((value, key) => {
                // Handle checkboxes
                if (key === 'skills' || key === 'interests') {
                    if (!data[key]) data[key] = [];
                    if (value) data[key].push(value);
                } else {
                    data[key] = value;
                }
            });
            
            // Save to localStorage
            localStorage.setItem('jpcs_membership_form', JSON.stringify(data));
            localStorage.setItem('jpcs_membership_form_step', this.currentStep.toString());
            
            // Update formData property
            this.formData = data;
            
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    },

    loadSavedFormData() {
        try {
            const savedData = localStorage.getItem('jpcs_membership_form');
            const savedStep = localStorage.getItem('jpcs_membership_form_step');
            
            if (savedData) {
                const data = JSON.parse(savedData);
                this.formData = data;
                
                // Populate form fields
                Object.keys(data).forEach(key => {
                    if (Array.isArray(data[key])) {
                        // Handle arrays (checkboxes)
                        data[key].forEach(value => {
                            const checkbox = document.querySelector(`input[name="${key}"][value="${value}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    } else {
                        const field = document.querySelector(`[name="${key}"]`);
                        if (field) {
                            if (field.type === 'checkbox' || field.type === 'radio') {
                                field.checked = field.value === data[key];
                            } else {
                                field.value = data[key];
                            }
                        }
                    }
                });
                
                // Restore step
                if (savedStep) {
                    this.goToStep(parseInt(savedStep));
                }
                
                // Show universities other field if needed
                const universitySelect = document.getElementById('university');
                if (universitySelect && universitySelect.value === 'other') {
                    document.getElementById('other-university-group').style.display = 'block';
                }
                
                // Show referral other field if needed
                const referralSelect = document.getElementById('referral-source');
                if (referralSelect && referralSelect.value === 'other') {
                    document.getElementById('other-referral-group').style.display = 'block';
                }
                
                ToastSystem.show('Previous form data restored', 'success');
            }
        } catch (error) {
            console.error('Error loading saved form data:', error);
        }
    },

    updateReviewSummary() {
        const reviewSummary = document.querySelector('.review-summary');
        if (!reviewSummary) return;
        
        // Format data for display
        const formattedData = this.formatReviewData();
        
        reviewSummary.innerHTML = `
            <div class="review-item">
                <h4>Personal Information</h4>
                <div class="review-details">
                    <div class="review-detail">
                        <span class="detail-label">Full Name</span>
                        <span class="detail-value">${formattedData.fullName}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Email</span>
                        <span class="detail-value">${formattedData.email}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">${formattedData.phone}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Date of Birth</span>
                        <span class="detail-value">${formattedData.birthdate}</span>
                    </div>
                </div>
            </div>
            
            <div class="review-item">
                <h4>Academic Information</h4>
                <div class="review-details">
                    <div class="review-detail">
                        <span class="detail-label">Student ID</span>
                        <span class="detail-value">${formattedData.studentId}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">University</span>
                        <span class="detail-value">${formattedData.university}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Major</span>
                        <span class="detail-value">${formattedData.major}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Year Level</span>
                        <span class="detail-value">${formattedData.yearLevel}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Expected Graduation</span>
                        <span class="detail-value">${formattedData.graduationYear}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Skills</span>
                        <span class="detail-value">${formattedData.skills}</span>
                    </div>
                </div>
            </div>
            
            <div class="review-item">
                <h4>Membership Details</h4>
                <div class="review-details">
                    <div class="review-detail">
                        <span class="detail-label">Membership Tier</span>
                        <span class="detail-value">${formattedData.membershipTier}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Referral Source</span>
                        <span class="detail-value">${formattedData.referralSource}</span>
                    </div>
                    <div class="review-detail">
                        <span class="detail-label">Interests</span>
                        <span class="detail-value">${formattedData.interests}</span>
                    </div>
                </div>
            </div>
        `;
    },

    formatReviewData() {
        // Helper function to format arrays as comma-separated strings
        const formatArray = (arr) => {
            if (!arr || !Array.isArray(arr)) return 'None selected';
            return arr.map(item => {
                // Convert value to readable format
                const readable = item.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return readable;
            }).join(', ');
        };
        
        // Format values for display
        return {
            fullName: `${this.formData.first_name || ''} ${this.formData.last_name || ''}`.trim() || 'Not provided',
            email: this.formData.email || 'Not provided',
            phone: this.formData.phone || 'Not provided',
            birthdate: this.formData.birthdate ? new Date(this.formData.birthdate).toLocaleDateString() : 'Not provided',
            studentId: this.formData.student_id || 'Not provided',
            university: this.formData.university === 'other' ? this.formData.other_university : this.formData.university || 'Not provided',
            major: this.formData.major || 'Not provided',
            yearLevel: this.formatYearLevel(this.formData.year_level),
            graduationYear: this.formData.expected_graduation || 'Not provided',
            skills: formatArray(this.formData.skills),
            membershipTier: this.formatMembershipTier(this.formData.membership_tier),
            referralSource: this.formData.referral_source === 'other' ? this.formData.other_referral : this.formatReferralSource(this.formData.referral_source),
            interests: formatArray(this.formData.interests)
        };
    },

    formatYearLevel(level) {
        const levels = {
            freshman: 'Freshman',
            sophomore: 'Sophomore',
            junior: 'Junior',
            senior: 'Senior',
            graduate: 'Graduate Student'
        };
        return levels[level] || level || 'Not specified';
    },

    formatMembershipTier(tier) {
        const tiers = {
            basic: 'Basic Member (Free)',
            active: 'Active Member (₱500/year)',
            lifetime: 'Lifetime Member (₱2,000)'
        };
        return tiers[tier] || tier || 'Not selected';
    },

    formatReferralSource(source) {
        const sources = {
            friend: 'Friend/Classmate',
            professor: 'Professor',
            'social-media': 'Social Media',
            'university-event': 'University Event',
            website: 'Website',
            other: 'Other'
        };
        return sources[source] || source || 'Not specified';
    },

    async submitForm() {
        // Validate step 4 (terms agreement)
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            this.validationErrors.terms = 'You must agree to the terms and conditions';
            const errorElement = termsCheckbox.closest('.checkbox-group').nextElementSibling;
            if (errorElement) errorElement.textContent = 'You must agree to the terms and conditions';
            
            termsCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            termsCheckbox.focus();
            
            ToastSystem.show('Please agree to the terms and conditions', 'error');
            return;
        }
        
        // Validate entire form
        let isValid = true;
        for (let step = 1; step <= 3; step++) {
            if (!this.validateStep(step)) {
                isValid = false;
            }
        }
        
        if (!isValid) {
            ToastSystem.show('Please fix all errors in the form', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-form');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Save to localStorage (simulating database)
            const applications = JSON.parse(localStorage.getItem('jpcs_membership_applications') || '[]');
            const applicationId = `JPCS-${new Date().getFullYear()}-${String(applications.length + 1).padStart(3, '0')}`;
            
            const application = {
                id: applicationId,
                ...this.formData,
                submittedAt: new Date().toISOString(),
                status: 'pending',
                membershipTier: this.formData.membership_tier
            };
            
            applications.push(application);
            localStorage.setItem('jpcs_membership_applications', JSON.stringify(applications));
            
            // Clear saved form data
            localStorage.removeItem('jpcs_membership_form');
            localStorage.removeItem('jpcs_membership_form_step');
            
            // Reset form
            document.getElementById('membership-form').reset();
            
            // Show success modal
            this.showSuccessModal(applicationId, this.formData.membership_tier);
            
            // Reset form state
            this.currentStep = 1;
            this.formData = {};
            this.validationErrors = {};
            
            // Update UI
            this.goToStep(1);
            this.updateProgressBar();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            ToastSystem.show('Error submitting application. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    initFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                faqItem.classList.toggle('active');
            });
        });
    },

    initModals() {
        // Terms modal
        const termsModalContent = `
            <div class="terms-content">
                <h4>Membership Agreement</h4>
                <p>By joining JPCS, you agree to:</p>
                <ul>
                    <li>Abide by the organization's code of conduct</li>
                    <li>Respect fellow members and organizers</li>
                    <li>Participate actively in community activities</li>
                    <li>Maintain academic integrity</li>
                    <li>Use organization resources responsibly</li>
                </ul>
                
                <h4>Code of Conduct</h4>
                <p>All members must maintain professional behavior and respect diversity. Harassment or discrimination of any kind will not be tolerated.</p>
                
                <h4>Privacy Policy</h4>
                <p>Your personal information will be used solely for JPCS activities and will not be shared with third parties without your consent.</p>
                
                <h4>Membership Renewal & Cancellation</h4>
                <p>Annual memberships auto-renew unless cancelled 30 days before expiration. Refunds are available within 14 days of payment.</p>
            </div>
        `;

        const termsModalFooter = `
            <button class="btn" onclick="ModalSystem.close('terms-modal')">
                <i class="fas fa-check"></i> I Understand
            </button>
        `;

        ModalSystem.create('terms-modal', 'Terms and Conditions', termsModalContent, { footer: termsModalFooter });

        // Success modal
        const successModalContent = `
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Thank You for Joining JPCS!</h3>
                <p>Your membership application has been successfully submitted. You'll receive a confirmation email shortly.</p>
                <div class="success-details">
                    <p><strong>Application ID:</strong> <span id="application-id">JPCS-2024-001</span></p>
                    <p><strong>Membership Type:</strong> <span id="membership-type">Active Member</span></p>
                    <p><strong>Expected Processing:</strong> 3-5 business days</p>
                </div>
                <div class="next-steps">
                    <h4>Next Steps:</h4>
                    <ol>
                        <li>Check your email for confirmation</li>
                        <li>Join our Discord community</li>
                        <li>Attend the next member orientation</li>
                        <li>Explore upcoming events</li>
                    </ol>
                </div>
            </div>
        `;

        const successModalFooter = `
            <button class="btn btn-outline" onclick="ModalSystem.close('success-modal')">
                <i class="fas fa-times"></i> Close
            </button>
            <button class="btn" onclick="MembershipModule.printApplication()">
                <i class="fas fa-print"></i> Print Application
            </button>
        `;

        ModalSystem.create('success-modal', 'Application Submitted!', successModalContent, { footer: successModalFooter });

        // Terms links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('terms-link') || e.target.closest('.terms-link')) {
                e.preventDefault();
                ModalSystem.open('terms-modal');
            }
        });

        // Privacy links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('privacy-link') || e.target.closest('.privacy-link')) {
                e.preventDefault();
                ModalSystem.open('terms-modal');
            }
        });
    },

    showSuccessModal(applicationId, membershipTier) {
        document.getElementById('application-id').textContent = applicationId;
        document.getElementById('membership-type').textContent = this.formatMembershipTier(membershipTier);
        ModalSystem.open('success-modal');
        this.trackApplicationSubmission(applicationId);
    },

    trackApplicationSubmission(applicationId) {
        try {
            const analytics = JSON.parse(localStorage.getItem('jpcs_analytics') || '{}');
            if (!analytics.membershipApplications) {
                analytics.membershipApplications = [];
            }
            
            analytics.membershipApplications.push({
                id: applicationId,
                timestamp: new Date().toISOString(),
                tier: this.formData.membership_tier
            });
            
            localStorage.setItem('jpcs_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Error tracking application:', error);
        }
    },

    printApplication() {
        const printContent = `
            <html>
                <head>
                    <title>JPCS Membership Application</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #0066cc; }
                        .section { margin-bottom: 20px; }
                        .label { font-weight: bold; color: #666; }
                        .value { margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <h1>JPCS Membership Application</h1>
                    <p>Application ID: ${document.getElementById('application-id').textContent}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    
                    <div class="section">
                        <h2>Personal Information</h2>
                        ${Object.entries(this.formatReviewData()).map(([key, value]) => `
                            <div class="field">
                                <div class="label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</div>
                                <div class="value">${value}</div>
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    },

    setupEventListeners() {
        // Auto-save form data on input
        document.getElementById('membership-form').addEventListener('input', () => {
            this.saveFormData();
        });
        
        // Auto-save on change for select elements
        document.querySelectorAll('#membership-form select').forEach(select => {
            select.addEventListener('change', () => {
                this.saveFormData();
            });
        });
        
        // Handle window close/refresh - save form data
        window.addEventListener('beforeunload', () => {
            this.saveFormData();
        });
        
        // Initialize tooltips
        this.initTooltips();
    },

    initTooltips() {
        // Add tooltips to form fields
        const tooltips = {
            'student_id': 'Your official university student ID number',
            'github': 'Your GitHub profile URL (optional but recommended)',
            'linkedin': 'Your LinkedIn profile URL (optional but recommended)',
            'previous_experience': 'List any previous tech club memberships or leadership roles',
            'goals': 'What you hope to achieve by joining JPCS'
        };
        
        Object.entries(tooltips).forEach(([fieldId, tooltipText]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.title = tooltipText;
                field.setAttribute('aria-label', tooltipText);
            }
        });
    }
};

// Make MembershipModule available globally for button clicks
window.MembershipModule = MembershipModule;

// Export the module
export { MembershipModule as default };