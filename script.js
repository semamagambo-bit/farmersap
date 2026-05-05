// Mobile Navigation Toggle
console.log('Script loaded successfully!');

// Helper: set a safe --vh custom property to account for mobile browser UI
function setVHUnit() {
  // 1% of the viewport height
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initialize and update on resize/orientation change
setVHUnit();
window.addEventListener('resize', setVHUnit);
window.addEventListener('orientationchange', setVHUnit);

const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-content a, .mobile-nav .nav-links a');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    // Toggle page scrolling when mobile menu is open
    if (mobileNav.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close mobile nav when clicking on a link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      // restore scrolling once a link is clicked
      document.body.style.overflow = '';
    });
  });

  // Close mobile nav when clicking outside
  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Navbar scroll effect with smooth transitions
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// Set active link based on current page
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a, .mobile-nav-content a, .nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// ------------------------------------------------------------
// Animated logo text cycle (CSS keyframes + tiny JS state control)
// - Reads variants from data-variants on .logo-text (pipe-separated)
// - Uses CSS classes .enter and .exit to trigger keyframe animations
// - JS only controls timing and swaps DOM nodes; does NOT reload pages
// ------------------------------------------------------------
;(function initLogoTextCycle(){
  const el = document.querySelector('.logo-text');
  if (!el) return;

  const variantsRaw = el.dataset.variants || el.textContent || '';
  const variants = variantsRaw.split('|').map(s => s.trim()).filter(Boolean);
  if (variants.length === 0) return;

  // Start with first variant as an element
  el.textContent = ''; // clear existing
  let currentIndex = 0;
  let currentNode = document.createElement('span');
  currentNode.className = 'logo-text-item enter';
  currentNode.textContent = variants[currentIndex];
  el.appendChild(currentNode);

  const interval = 3000; // ms between text changes
  const exitDuration = 420; // matches logoTextExit keyframe

  const cycle = () => {
    const nextIndex = (currentIndex + 1) % variants.length;
    const nextNode = document.createElement('span');
    nextNode.className = 'logo-text-item';
    nextNode.textContent = variants[nextIndex];
    el.appendChild(nextNode);

    // Trigger enter animation on next node
    requestAnimationFrame(() => nextNode.classList.add('enter'));

    // Trigger exit on current node
    currentNode.classList.remove('enter');
    currentNode.classList.add('exit');

    // Remove old node after exit animation completes
    setTimeout(() => {
      if (currentNode && currentNode.parentNode) currentNode.parentNode.removeChild(currentNode);
      currentNode = nextNode;
      currentIndex = nextIndex;
    }, exitDuration + 60);
  };

  const timerId = setInterval(cycle, interval);

  // Pause cycling while user hovers or focuses the logo (nice UX)
  const pauseOnMouseEnter = () => clearInterval(timerId);
  const pauseOnFocusIn = () => clearInterval(timerId);
  
  el.addEventListener('mouseenter', pauseOnMouseEnter);
  el.addEventListener('focusin', pauseOnFocusIn);

  // Ensure cleanup on page unload
  const cleanupOnUnload = () => {
    clearInterval(timerId);
    el.removeEventListener('mouseenter', pauseOnMouseEnter);
    el.removeEventListener('focusin', pauseOnFocusIn);
  };
  window.addEventListener('beforeunload', cleanupOnUnload);
})();


const rows = document.querySelectorAll('.program-row');

if (rows.length > 0) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.2 });

  rows.forEach(row => {
    row.style.opacity = 0;
    row.style.transform = 'translateY(40px)';
    row.style.transition = 'all 0.6s ease';
    observer.observe(row);
  });
}

// Animate numeric KPIs (uses .num elements and stat-card h3)
const numElements = document.querySelectorAll('.num[data-target], .stat-card h3[data-target]');

const numObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      let current = 0;
      const duration = 1200; // ms
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.innerText = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.innerText = target;
      }

      requestAnimationFrame(step);
      numObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });

numElements.forEach(el => numObserver.observe(el));

// ============================================
// DONATE PAGE - IMAGE SLIDER (Vanilla JS)
// ============================================
class ImageSlider {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.indicators = document.querySelectorAll('.indicator');
    this.prevBtn = document.querySelector('.slider-prev');
    this.nextBtn = document.querySelector('.slider-next');
    this.currentIndex = 0;
    this.autoSlideInterval = null;
    this.autoSlideDuration = 2000; // 2 seconds

    if (this.slides.length === 0) return; // Exit if no slider found

    this.init();
  }

  init() {
    // Attach event listeners
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());

    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Ensure first slide is shown (in case HTML doesn't have active)
    this.showSlide(this.currentIndex);

    // Start auto-slide
    this.startAutoSlide();

    // Pause on hover, resume on leave
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => this.stopAutoSlide());
      sliderContainer.addEventListener('mouseleave', () => this.startAutoSlide());
    }
  }

  showSlide(index) {
    // Remove active class from all slides and indicators
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.indicators.forEach(indicator => indicator.classList.remove('active'));

    // Add active class to current slide and indicator
    this.slides[index].classList.add('active');
    this.indicators[index].classList.add('active');
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.showSlide(this.currentIndex);
    this.resetAutoSlide();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.showSlide(this.currentIndex);
    this.resetAutoSlide();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.showSlide(this.currentIndex);
    this.resetAutoSlide();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideDuration);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}

// Initialize slider when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();
    initializeCalculator();
  });
} else {
  new ImageSlider();
  initializeCalculator();
}

// ============================================
// DONATION CALCULATOR
// ============================================
function initializeCalculator() {
  const donationInput = document.getElementById('donation-amount');
  const amountValue = document.getElementById('amount-value');
  const youthTrained = document.getElementById('youth-trained');
  const mealsProv = document.getElementById('meals-provided');
  const jobsCreated = document.getElementById('jobs-created');

  if (!donationInput) return; // Exit if calculator not on page

  donationInput.addEventListener('input', (e) => {
    const amount = parseInt(e.target.value, 10);
    
    // Update display
    if (amountValue) {
      amountValue.textContent = `$${amount * 100}`; // $50 = $5000
    }

    // Calculate impact metrics (example formulas)
    const youthCount = Math.floor(amount / 5); // 1 youth per $5
    const mealCount = Math.floor(amount / 2); // More meals per dollar
    const jobCount = Math.floor(amount / 3); // Jobs created

    // Update results
    if (youthTrained) youthTrained.textContent = youthCount;
    if (mealsProv) mealsProv.textContent = mealCount;
    if (jobsCreated) jobsCreated.textContent = jobCount;
  });

  // Trigger initial calculation
  donationInput.dispatchEvent(new Event('input'));
}

/* Optional JS snippet: re-trigger logo animation or add a class on load
   If you want to control the animation start via JS (e.g. after fonts load),
   uncomment below and adjust as needed.

document.addEventListener('DOMContentLoaded', () => {
  const logoImg = document.querySelector('.logo-img');
  const logoText = document.querySelector('.logo-text');
  if (logoImg && logoText) {
    // Example: remove animations then re-add to replay
    logoImg.style.animation = 'none';
    logoText.style.animation = 'none';
    // Force reflow
    void logoImg.offsetWidth;
    void logoText.offsetWidth;
    // Re-apply animations
    logoImg.style.animation = '';
    logoText.style.animation = '';
  }
});
*/