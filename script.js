/* ============================================================
   BilShop — Interactive JavaScript
   Pure Vanilla ES6+ — No frameworks
   ============================================================ */

'use strict';

/* === UTILITY HELPERS === */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* === NAVIGATION === */
const Nav = (() => {
  const nav = $('.nav');
  const hamburger = $('.nav__hamburger');
  const mobileMenu = $('.mobile-menu');
  const dropdown = $('.nav__dropdown');
  const dropdownTrigger = $('.nav__dropdown-trigger');

  function init() {
    if (!nav) return;

    // Scroll effect
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Hamburger toggle
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobile);
    }

    // Mobile links close menu
    $$('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', closeMobile);
    });

    // Solutions dropdown
    if (dropdownTrigger) {
      dropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('is-open');
      });

      document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target)) {
          dropdown.classList.remove('is-open');
        }
      });
    }

    // Close mobile on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobile();
        if (dropdown) dropdown.classList.remove('is-open');
      }
    });

    // Active link highlighting on scroll
    window.addEventListener('scroll', highlightActiveLink, { passive: true });
  }

  function handleScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  function toggleMobile() {
    hamburger.classList.toggle('is-active');
    mobileMenu.classList.toggle('is-open');
    document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
  }

  function closeMobile() {
    if (hamburger) hamburger.classList.remove('is-active');
    if (mobileMenu) mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function highlightActiveLink() {
    const sections = $$('section[id], main[id]');
    const navLinks = $$('.nav__link[href^="#"]');
    const scrollPos = window.scrollY + 120;

    let currentId = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('nav__link--active');
      }
    });
  }

  return { init };
})();

/* === FAQ ACCORDION === */
const FAQ = (() => {
  function init() {
    const items = $$('.faq__item');
    items.forEach(item => {
      const btn = $('.faq__question', item);
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all others
        items.forEach(other => {
          if (other !== item) other.classList.remove('is-open');
        });

        // Toggle current
        item.classList.toggle('is-open', !isOpen);
      });
    });
  }

  return { init };
})();

/* === DARK MODE TOGGLE === */
const DarkMode = (() => {
  const STORAGE_KEY = 'bilshop-dark-mode';

  function init() {
    const toggles = $$('.dark-toggle');
    if (!toggles.length) return;

    // Restore saved preference
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
      document.body.classList.add('dark-mode');
    } else if (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
    }

    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem(STORAGE_KEY, isDark);
      });
    });
  }

  return { init };
})();

/* === FORM VALIDATION & SUBMISSION === */
const DemoForm = (() => {
  function init() {
    const form = $('#demo-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Live validation on blur
    $$('.form__input, .form__textarea, .form__select', form).forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        const group = field.closest('.form__group');
        if (group && group.classList.contains('has-error')) {
          validateField(field);
        }
      });
    });
  }

  function validateField(field) {
    const group = field.closest('.form__group');
    if (!group) return true;

    const errorEl = $('.form__error', group);
    let valid = true;
    let message = '';

    const value = field.value.trim();
    const name = field.name;

    if (field.hasAttribute('required') && !value) {
      valid = false;
      message = 'This field is required';
    } else if (name === 'email' && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        valid = false;
        message = 'Please enter a valid email address';
      }
    } else if (name === 'phone' && value) {
      const phonePattern = /^[\d\s\-+()]{7,20}$/;
      if (!phonePattern.test(value)) {
        valid = false;
        message = 'Please enter a valid phone number';
      }
    }

    if (valid) {
      group.classList.remove('has-error');
      field.classList.remove('has-error');
    } else {
      group.classList.add('has-error');
      field.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    }

    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const fields = $$('[required]', form);
    let allValid = true;

    fields.forEach(field => {
      if (!validateField(field)) {
        allValid = false;
      }
    });

    // Also validate email even if not required
    const emailField = $('[name="email"]', form);
    if (emailField && !validateField(emailField)) {
      allValid = false;
    }

    if (!allValid) {
      Toast.show('Please fix the errors in the form.', 'error');
      // Focus first error
      const firstError = $('.form__group.has-error .form__input, .form__group.has-error .form__textarea, .form__group.has-error .form__select', form);
      if (firstError) firstError.focus();
      return;
    }

    // Simulate form submission
    const submitBtn = $('button[type="submit"]', form);
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span>Sending...</span>
    `;

    // Simulate network delay
    setTimeout(() => {
      // Save to localStorage
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      data.timestamp = new Date().toISOString();

      const submissions = JSON.parse(localStorage.getItem('bilshop-demos') || '[]');
      submissions.push(data);
      localStorage.setItem('bilshop-demos', JSON.stringify(submissions));

      // Reset form
      form.reset();
      $$('.form__group', form).forEach(g => g.classList.remove('has-error'));

      // Success feedback
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      Toast.show('Demo request submitted successfully! We\'ll contact you within 24 hours.', 'success');
    }, 1500);
  }

  return { init };
})();

/* === TOAST NOTIFICATIONS === */
const Toast = (() => {
  let timeout = null;

  function show(message, type = 'success') {
    // Remove existing toast
    const existing = $('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const iconSvg = type === 'success'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `
      <div class="toast__icon toast__icon--${type}">${iconSvg}</div>
      <div class="toast__content">
        <div class="toast__title">${type === 'success' ? 'Success' : 'Error'}</div>
        <div class="toast__message">${message}</div>
      </div>
      <button class="toast__close" aria-label="Close notification">&times;</button>
    `;

    document.body.appendChild(toast);

    // Close handler
    $('.toast__close', toast).addEventListener('click', () => dismiss(toast));

    // Show with animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('is-visible');
      });
    });

    // Auto dismiss
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => dismiss(toast), 5000);
  }

  function dismiss(toast) {
    if (!toast) return;
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }

  return { show };
})();

/* === SCROLL TO TOP === */
const ScrollTop = (() => {
  function init() {
    const btn = $('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();

/* === SMOOTH SCROLL FOR ANCHOR LINKS === */
const SmoothScroll = (() => {
  function init() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = $(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL without scroll jump
        history.pushState(null, '', href);
      });
    });
  }

  return { init };
})();

/* === INTERSECTION OBSERVER — SCROLL REVEAL === */
const ScrollReveal = (() => {
  function init() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = $$('.feature-card, .step-card, .pricing-card, .showcase__feature, .faq__item, .hero__metric');

    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i % 5 * 0.08}s, transform 0.5s ease ${i % 5 * 0.08}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* === PRICING TOGGLE (Monthly/Annual) === */
const PricingToggle = (() => {
  const prices = {
    monthly: { starter: 29, professional: 79, enterprise: 149 },
    annual: { starter: 24, professional: 65, enterprise: 125 }
  };

  function init() {
    const toggle = $('#pricing-toggle');
    if (!toggle) return;

    toggle.addEventListener('change', () => {
      const isAnnual = toggle.checked;
      const plan = isAnnual ? 'annual' : 'monthly';
      const period = isAnnual ? '/mo (billed annually)' : '/month';

      $$('[data-price]').forEach(el => {
        const tier = el.dataset.price;
        if (prices[plan][tier] !== undefined) {
          el.textContent = `$${prices[plan][tier]}`;
        }
      });

      $$('[data-period]').forEach(el => {
        el.textContent = period;
      });
    });
  }

  return { init };
})();

/* === SPINNER KEYFRAME (injected for form loading) === */
function injectSpinKeyframe() {
  if ($('#bilshop-spin-keyframe')) return;
  const style = document.createElement('style');
  style.id = 'bilshop-spin-keyframe';
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

/* === INITIALIZE === */
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  FAQ.init();
  DarkMode.init();
  DemoForm.init();
  ScrollTop.init();
  SmoothScroll.init();
  ScrollReveal.init();
  PricingToggle.init();
  injectSpinKeyframe();
});

