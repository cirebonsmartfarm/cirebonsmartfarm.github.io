// Cirebon Smart Farm - Main JavaScript File
// Interactive functionality for modern hydroponic farming website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initHeroSlider();
    initScrollAnimations();
    initContactForm();
    initFAQ();
    initImageGallery();
    initCounterAnimations();
    initSmoothScrolling();
    initMobileOptimizations();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Navbar scroll effect
    if (navbar) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add scrolled class when scrolling
            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll (optional enhancement)
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        });
    }
}

// Hero slider functionality
function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let slideInterval;

    function showSlide(index) {
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        if (slides[index]) slides[index].classList.add('active');
        if (indicators[index]) indicators[index].classList.add('active');
        
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        showSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(prev);
    }

    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        stopSlideshow();
        startSlideshow();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        stopSlideshow();
        startSlideshow();
    });

    // Indicator click events
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            stopSlideshow();
            startSlideshow();
        });
    });

    // Pause slideshow on hover
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', stopSlideshow);
        heroSlider.addEventListener('mouseleave', startSlideshow);
    }

    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;

    if (heroSlider) {
        heroSlider.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        });

        heroSlider.addEventListener('touchend', e => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const diffX = startX - endX;
        const threshold = 50; // minimum swipe distance

        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                nextSlide(); // swipe left
            } else {
                prevSlide(); // swipe right
            }
            stopSlideshow();
            startSlideshow();
        }
    }

    // Start the slideshow
    startSlideshow();
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger counter animation if element has counter
                if (entry.target.classList.contains('animate-counter')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe all animation elements
    const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-in, .animate-slide-up, .animate-scale, .animate-bounce, .animate-counter');
    animateElements.forEach(el => observer.observe(el));
}

// Counter animations for statistics
function initCounterAnimations() {
    function animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // This function is called from scroll animations when counters come into view
    window.animateCounter = animateCounter;
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (!contactForm) return;

    // Form validation rules
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            message: 'Nama lengkap minimal 2 karakter'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Format email tidak valid'
        },
        subject: {
            required: true,
            message: 'Silakan pilih subjek'
        },
        message: {
            required: true,
            minLength: 10,
            message: 'Pesan minimal 10 karakter'
        },
        privacy: {
            required: true,
            message: 'Anda harus menyetujui kebijakan privasi'
        }
    };

    function validateField(fieldName, value) {
        const rule = validationRules[fieldName];
        if (!rule) return { isValid: true };

        // Required validation
        if (rule.required && (!value || value.trim() === '')) {
            return { isValid: false, message: rule.message };
        }

        // Pattern validation (for email)
        if (rule.pattern && value && !rule.pattern.test(value)) {
            return { isValid: false, message: rule.message };
        }

        // Minimum length validation
        if (rule.minLength && value && value.length < rule.minLength) {
            return { isValid: false, message: rule.message };
        }

        return { isValid: true };
    }

    function showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        const fieldElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        if (fieldElement) {
            fieldElement.style.borderColor = '#ef4444';
        }
    }

    function clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        const fieldElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        if (fieldElement) {
            fieldElement.style.borderColor = '#e5e7eb';
        }
    }

    // Real-time validation
    Object.keys(validationRules).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', () => {
                const validation = validateField(fieldName, field.type === 'checkbox' ? field.checked : field.value);
                if (!validation.isValid) {
                    showFieldError(fieldName, validation.message);
                } else {
                    clearFieldError(fieldName);
                }
            });

            field.addEventListener('input', () => {
                clearFieldError(fieldName);
            });
        }
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isFormValid = true;
        const formData = new FormData(contactForm);

        // Validate all fields
        Object.keys(validationRules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const value = field.type === 'checkbox' ? field.checked : field.value;
            const validation = validateField(fieldName, value);
            
            if (!validation.isValid) {
                showFieldError(fieldName, validation.message);
                isFormValid = false;
            } else {
                clearFieldError(fieldName);
            }
        });

        if (isFormValid) {
            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;

            // Prepare email data
            const emailData = {
                to: 'cirebonsmartfarm@gmail.com',
                subject: `${formData.get('subject')} - ${formData.get('name')}`,
                body: `
Nama: ${formData.get('name')}
Email: ${formData.get('email')}
Telepon: ${formData.get('phone') || 'Tidak diisi'}
Perusahaan: ${formData.get('company') || 'Tidak diisi'}
Subjek: ${formData.get('subject')}

Pesan:
${formData.get('message')}

Newsletter: ${formData.get('newsletter') ? 'Ya' : 'Tidak'}
Waktu: ${new Date().toLocaleString('id-ID')}
                `.trim()
            };

            // Simulate form submission (in real implementation, you would send to a backend)
            setTimeout(() => {
                // Hide form and show success message
                contactForm.style.display = 'none';
                if (formSuccess) {
                    formSuccess.style.display = 'block';
                }
                
                // Create mailto link as fallback
                const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
                
                // Auto-open email client
                setTimeout(() => {
                    window.location.href = mailtoLink;
                }, 1000);
                
            }, 2000);
        }
    });
}

// FAQ accordion functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active', !isActive);
            });
        }
    });
}

// Image gallery functionality
function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImages = document.querySelectorAll('.main-image img');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const productSection = thumbnail.closest('.product-section');
            if (!productSection) return;
            
            const mainImage = productSection.querySelector('.main-image img');
            const thumbnailsInSection = productSection.querySelectorAll('.thumbnail');
            
            if (mainImage) {
                // Update main image
                mainImage.src = thumbnail.src;
                mainImage.alt = thumbnail.alt;
                
                // Update active thumbnail
                thumbnailsInSection.forEach(thumb => thumb.classList.remove('active'));
                thumbnail.classList.add('active');
                
                // Add zoom effect
                mainImage.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    mainImage.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile optimizations
function initMobileOptimizations() {
    // Prevent zoom on input focus in iOS
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (window.innerWidth < 768) {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                }
            }
        });
        
        input.addEventListener('blur', () => {
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        });
    });

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 500);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimizations
window.addEventListener('scroll', throttle(() => {
    // Throttled scroll events for better performance
    const scrollTop = window.pageYOffset;
    
    // Parallax effect for hero section (if needed)
    const hero = document.querySelector('.hero');
    if (hero && scrollTop < window.innerHeight) {
        const rate = scrollTop * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
}, 16));

// Lazy loading for images (modern browsers)
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Error handling for images
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        console.warn('Image failed to load:', e.target.src);
    }
}, true);

// Analytics and tracking (placeholder for future implementation)
function trackEvent(category, action, label) {
    // Placeholder for Google Analytics or other tracking
    console.log('Event tracked:', { category, action, label });
}

// Track CTA button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cta-button') || e.target.classList.contains('btn-primary')) {
        trackEvent('CTA', 'click', e.target.textContent.trim());
    }
});

// Console welcome message
console.log('%c🌱 Cirebon Smart Farm', 'color: #2d5a27; font-size: 24px; font-weight: bold;');
console.log('%cTeknologi Hidroponik Modern untuk Masa Depan Berkelanjutan', 'color: #4a7c59; font-size: 14px;');
console.log('%cWebsite developed with modern web technologies', 'color: #666; font-size: 12px;');
