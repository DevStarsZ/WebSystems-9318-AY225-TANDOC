// About Page JavaScript Module
const AboutModule = {
    async init() {
        console.log('About page initialized');
        
        // Initialize components
        this.initAchievementsSlider();
        this.setupTimelineAnimations();
        this.setupValueCards();
    },

    initAchievementsSlider() {
        const slides = document.querySelectorAll('.achievement-slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        
        if (!slides.length) return;

        let currentSlide = 0;
        const slideInterval = 5000; // 5 seconds

        // Function to show a specific slide
        const showSlide = (index) => {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
                slide.style.opacity = '0';
            });
            
            // Remove active class from all dots
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Show the selected slide
            slides[index].classList.add('active');
            setTimeout(() => {
                slides[index].style.opacity = '1';
            }, 10);
            
            // Activate the corresponding dot
            if (dots[index]) {
                dots[index].classList.add('active');
            }
            
            currentSlide = index;
        };

        // Next slide function
        const nextSlide = () => {
            const nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        };

        // Previous slide function
        const prevSlide = () => {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        };

        // Event listeners for buttons
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }

        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
        });

        // Auto slide functionality
        let autoSlideInterval;
        
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(nextSlide, slideInterval);
        };

        const resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        };

        // Pause auto-slide on hover
        const slider = document.querySelector('.achievements-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                clearInterval(autoSlideInterval);
            });
            
            slider.addEventListener('mouseleave', () => {
                startAutoSlide();
            });
        }

        // Start auto-sliding
        startAutoSlide();

        // Initialize first slide
        showSlide(0);

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.achievements-slider')) {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                    resetAutoSlide();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                    resetAutoSlide();
                }
            }
        });
    },

    setupTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'timelineReveal 0.8s ease-out forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Add initial styles
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.animationDelay = `${index * 0.2}s`;
            observer.observe(item);
        });

        // Add CSS animation dynamically
        if (!document.querySelector('#timeline-animation')) {
            const style = document.createElement('style');
            style.id = 'timeline-animation';
            style.textContent = `
                @keyframes timelineReveal {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    setupValueCards() {
        const valueCards = document.querySelectorAll('.value-card');
        
        valueCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.value-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                    icon.style.color = 'var(--accent)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.value-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                    icon.style.color = 'var(--primary)';
                }
            });
        });
    }
};

// Export the module
export { AboutModule as default };