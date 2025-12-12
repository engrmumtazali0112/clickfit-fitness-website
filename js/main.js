// Main JavaScript File for ClickFit

$(document).ready(function() {
    
    // Smooth scrolling for navigation links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        
        var target = $(this.getAttribute('href'));
        
        if(target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 70
            }, 1000);
        }
    });

    // Navbar scroll effect
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });

    // Counter animation
    function animateCounter() {
        $('.counter').each(function() {
            const $this = $(this);
            const countTo = $this.attr('data-target');
            
            $({ countNum: 0 }).animate({
                countNum: countTo
            }, {
                duration: 2000,
                easing: 'linear',
                step: function() {
                    $this.text(Math.floor(this.countNum));
                },
                complete: function() {
                    $this.text(this.countNum);
                }
            });
        });
    }

    // Intersection Observer for animations on scroll
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger counter animation when stats section is visible
                if (entry.target.classList.contains('stat-item')) {
                    if (!entry.target.classList.contains('counted')) {
                        entry.target.classList.add('counted');
                        // Trigger counter animation only once
                        const statsSection = entry.target.closest('.stats-section');
                        if (statsSection && !statsSection.classList.contains('animated')) {
                            statsSection.classList.add('animated');
                            animateCounter();
                        }
                    }
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    $('.stat-item, .animate-on-scroll').each(function() {
        observer.observe(this);
    });

    // Feature cards animation on hover
    $('.feature-card').hover(
        function() {
            $(this).addClass('card-hover-active');
        },
        function() {
            $(this).removeClass('card-hover-active');
        }
    );

    // Contact form submission
    $('.contact-form').on('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = $(this).find('input[type="text"]').val();
        const email = $(this).find('input[type="email"]').val();
        const message = $(this).find('textarea').val();
        
        // Basic validation
        if (name === '' || email === '' || message === '') {
            alert('Please fill in all fields');
            return;
        }
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        this.reset();
    });

    // Get Started button click
    $('.pulse-button').on('click', function() {
        $('html, body').animate({
            scrollTop: $('#services').offset().top - 70
        }, 1000);
    });

    // Add ripple effect to buttons
    $('.btn').on('click', function(e) {
        const button = $(this);
        const ripple = $('<span class="ripple"></span>');
        
        const x = e.pageX - button.offset().left;
        const y = e.pageY - button.offset().top;
        
        ripple.css({
            left: x,
            top: y
        });
        
        button.append(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    // Social icons animation
    $('.social-icons a').hover(
        function() {
            $(this).addClass('bounce-animation');
        },
        function() {
            $(this).removeClass('bounce-animation');
        }
    );

    // Add parallax effect to hero section
    $(window).scroll(function() {
        const scrolled = $(window).scrollTop();
        $('.hero-icon').css('transform', 'translateY(' + (scrolled * 0.3) + 'px)');
    });

    // Feature icons rotation on scroll
    let lastScrollTop = 0;
    $(window).scroll(function() {
        const st = $(this).scrollTop();
        
        if (st > lastScrollTop) {
            $('.feature-icon i').css('transform', 'rotate(' + (st * 0.5) + 'deg)');
        } else {
            $('.feature-icon i').css('transform', 'rotate(' + (st * 0.5) + 'deg)');
        }
        
        lastScrollTop = st;
    });

    // Navbar toggle animation
    $('.navbar-toggler').on('click', function() {
        $(this).toggleClass('active');
    });

    // Add loading animation
    $(window).on('load', function() {
        $('body').addClass('loaded');
    });

    // Random background gradient for hero section
    function changeHeroGradient() {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];
        
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        $('.hero-section').css('background', randomGradient);
    }

    // Change gradient every 10 seconds
    setInterval(changeHeroGradient, 10000);

    // Tooltip initialization (if using Bootstrap tooltips)
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Add active class to current nav item
    const sections = $('section');
    const navItems = $('.nav-link');

    $(window).on('scroll', function() {
        let current = '';
        
        sections.each(function() {
            const sectionTop = $(this).offset().top;
            const sectionHeight = $(this).height();
            
            if ($(window).scrollTop() >= (sectionTop - 200)) {
                current = $(this).attr('id');
            }
        });
        
        navItems.removeClass('active');
        navItems.each(function() {
            if ($(this).attr('href') === '#' + current) {
                $(this).addClass('active');
            }
        });
    });

    // Console log for debugging
    console.log('ClickFit main.js loaded successfully!');
    
    // Welcome message
    console.log('%cWelcome to ClickFit! 💪', 'color: #4A90E2; font-size: 20px; font-weight: bold;');
});