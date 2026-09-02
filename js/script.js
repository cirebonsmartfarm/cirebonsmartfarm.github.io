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
    initCurrentYear();
    initMenuKalkulator();
    initBiofloc();
    initSalinKutipan();
});


// Isi otomatis tahun berjalan pada footer
function initCurrentYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.js-year').forEach(el => {
        el.textContent = year;
    });
}


// Kalkulator kolam bioflok.
// Semua hitungan berjalan di peramban pengunjung, tidak ada data yang dikirim
// atau disimpan. Fungsi ini berhenti sendiri di halaman yang tidak memuatnya.
function initBiofloc() {
    const form = document.getElementById('biofloc-calc');
    if (!form) return;

    const angka = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
    /* Satu desimal, dan nol di belakang koma dibuang. Sama seperti
       kalkulator nutrisi, supaya angkanya konsisten di seluruh situs. */
    const desimal = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

    const rupiah = (n) => 'Rp ' + angka.format(Math.round(n));
    const el = (id) => document.getElementById(id);
    const val = (id) => {
        const n = parseFloat(el(id).value);
        return isFinite(n) && n >= 0 ? n : 0;
    };

    // Kepadatan biomassa saat panen menentukan seberapa berat kerja aerasi.
    const bandDensity = (kgPerM3) => {
        if (kgPerM3 <= 0) return { teks: 'Isi angkanya dulu', kelas: '' };
        if (kgPerM3 < 15) return { teks: 'Masih longgar, kolam belum terpakai penuh', kelas: 'is-low' };
        if (kgPerM3 <= 35) return { teks: 'Wajar untuk bioflok terpal yang aerasinya jalan 24 jam', kelas: 'is-ok' };
        if (kgPerM3 <= 50) return { teks: 'Padat. Aerasi, pengukuran harian, dan listrik cadangan harus siap', kelas: 'is-warn' };
        return { teks: 'Terlalu padat untuk kolam terpal biasa. Kurangi tebar atau tambah kolam', kelas: 'is-danger' };
    };

    function hitung() {
        const diameter = val('diameter');
        const tinggiAir = val('tinggiAir');
        const jumlahKolam = Math.max(1, Math.round(val('jumlahKolam')));
        const padatTebar = val('padatTebar');
        const bobotPanen = val('bobotPanen');
        const sr = Math.min(100, val('sr')) / 100;
        const fcr = val('fcr');
        const hargaPakan = val('hargaPakan');
        const hargaBenih = val('hargaBenih');
        const hargaJual = val('hargaJual');
        const rasioMolase = val('rasioMolase');

        const jari = diameter / 2;
        const volume = Math.PI * jari * jari * tinggiAir;
        const volumeTotal = volume * jumlahKolam;

        const benih = volumeTotal * padatTebar;
        const hidup = benih * sr;
        const panenKg = (hidup * bobotPanen) / 1000;
        const kepadatan = volumeTotal > 0 ? panenKg / volumeTotal : 0;

        const pakanKg = panenKg * fcr;
        const molaseKg = pakanKg * rasioMolase;
        const titikAerasi = volume > 0 ? Math.max(4, Math.ceil(volume)) : 0;

        const biayaBenih = benih * hargaBenih;
        const biayaPakan = pakanKg * hargaPakan;
        const omzet = panenKg * hargaJual;
        const selisih = omzet - biayaBenih - biayaPakan;

        el('outVolume').textContent = desimal.format(volume) + ' m³';
        el('outVolumeTotal').textContent = desimal.format(volumeTotal) + ' m³ (' + jumlahKolam + ' kolam)';
        el('outBenih').textContent = angka.format(Math.round(benih)) + ' ekor';
        el('outHidup').textContent = angka.format(Math.round(hidup)) + ' ekor';
        el('outPanen').textContent = angka.format(Math.round(panenKg)) + ' kg';
        el('outPakan').textContent = angka.format(Math.round(pakanKg)) + ' kg';
        el('outMolase').textContent = angka.format(Math.round(molaseKg)) + ' kg';
        el('outAerasi').textContent = titikAerasi + ' titik per kolam';

        el('outBiayaBenih').textContent = rupiah(biayaBenih);
        el('outBiayaPakan').textContent = rupiah(biayaPakan);
        el('outOmzet').textContent = rupiah(omzet);
        el('outSelisih').textContent = rupiah(selisih);

        const band = bandDensity(kepadatan);
        el('outDensity').textContent = desimal.format(kepadatan) + ' kg/m³';
        el('outDensityNote').textContent = band.teks;
        el('outDensityBadge').className = 'calc-badge ' + band.kelas;
    }

    form.addEventListener('input', hitung);
    form.addEventListener('change', hitung);
    form.addEventListener('reset', () => setTimeout(hitung, 0));
    hitung();

}


// Tombol salin pada blok kutipan. Dipakai di beberapa halaman kalkulator,
// jadi berdiri sendiri dan berhenti diam-diam kalau tombolnya tidak ada.
function initSalinKutipan() {
    const tombol = document.querySelectorAll('.cite-copy');
    if (!tombol.length) return;

    tombol.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const target = document.getElementById(btn.dataset.copy);
            if (!target) return;
            const teks = target.textContent;
            const semula = btn.innerHTML;
            try {
                await navigator.clipboard.writeText(teks);
            } catch (e) {
                const tmp = document.createElement('textarea');
                tmp.value = teks;
                tmp.style.position = 'fixed';
                tmp.style.opacity = '0';
                document.body.appendChild(tmp);
                tmp.select();
                try { document.execCommand('copy'); } catch (err) { /* diabaikan */ }
                document.body.removeChild(tmp);
            }
            btn.innerHTML = '<i class="fas fa-check"></i> Tersalin';
            setTimeout(() => { btn.innerHTML = semula; }, 1800);
        });
    });
}


// Menu Kalkulator pada navigasi.
// Di layar lebar panel terbuka lewat hover, yang diurus CSS. Fungsi ini
// mengurus klik dan sentuh, karena perangkat sentuh tidak punya hover.
function initMenuKalkulator() {
    const bungkus = document.getElementById('menu-kalkulator');
    if (!bungkus) return;

    const tombol = bungkus.querySelector('.nav-sub-tombol');
    if (!tombol) return;

    function setel(terbuka) {
        bungkus.classList.toggle('terbuka', terbuka);
        tombol.setAttribute('aria-expanded', terbuka ? 'true' : 'false');
    }

    tombol.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setel(!bungkus.classList.contains('terbuka'));
    });

    // Menutup saat menyentuh di luar menu.
    document.addEventListener('click', (e) => {
        if (!bungkus.contains(e.target)) setel(false);
    });

    // Menutup dengan tombol Escape, lalu fokus kembali ke tombolnya.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bungkus.classList.contains('terbuka')) {
            setel(false);
            tombol.focus();
        }
    });

    // Setelah memilih salah satu kalkulator, menu mobile ikut ditutup.
    bungkus.querySelectorAll('.nav-sub-link').forEach((tautan) => {
        tautan.addEventListener('click', () => {
            setel(false);
            const menu = document.getElementById('nav-menu');
            const toggle = document.getElementById('nav-toggle');
            if (menu) menu.classList.remove('active');
            if (toggle) toggle.classList.remove('active');
        });
    });
}

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
                
                // Angka statistik dihitung sekali saja, lalu berhenti diamati
                // supaya tidak mengulang dari nol tiap kali digulir kembali.
                if (entry.target.classList.contains('animate-counter')) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
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
    const angka = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

    function animateCounter(element) {
        // data-target ada di <h3>, sedangkan yang diamati adalah pembungkusnya.
        // Menulis ke pembungkus akan menimpa labelnya juga, jadi cari sasarannya.
        const sasaran = element.matches('[data-target]')
            ? element
            : element.querySelector('[data-target]');
        if (!sasaran || sasaran.dataset.selesai) return;

        const tujuan = parseFloat(sasaran.dataset.target);
        if (!isFinite(tujuan)) return;          // tanpa penjaga ini muncul NaN

        sasaran.dataset.selesai = '1';

        const diam = window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (diam) {
            sasaran.textContent = angka.format(tujuan);
            return;
        }

        const durasi = 1600;
        const mulai = performance.now();

        function langkah(saat) {
            const bagian = Math.min((saat - mulai) / durasi, 1);
            // melambat di ujung, terasa lebih halus daripada laju rata
            const mulus = 1 - Math.pow(1 - bagian, 3);
            sasaran.textContent = angka.format(Math.round(tujuan * mulus));
            if (bagian < 1) {
                requestAnimationFrame(langkah);
            } else {
                sasaran.textContent = angka.format(tujuan);
            }
        }
        requestAnimationFrame(langkah);
    }

    // Dipanggil dari initScrollAnimations saat angkanya masuk layar.
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
