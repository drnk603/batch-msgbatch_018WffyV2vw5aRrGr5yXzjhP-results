(function() {
  'use strict';

  window.__app = window.__app || {};

  var debounce = function(fn, ms) {
    var timer;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(ctx, args);
      }, ms);
    };
  };

  var throttle = function(fn, ms) {
    var wait = false;
    return function() {
      if (wait) return;
      var args = arguments;
      var ctx = this;
      fn.apply(ctx, args);
      wait = true;
      setTimeout(function() {
        wait = false;
      }, ms);
    };
  };

  function initBurgerMenu() {
    if (window.__app.burgerInit) return;
    window.__app.burgerInit = true;

    var toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    var navCollapse = document.querySelector('.navbar-collapse');
    var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
    var body = document.body;

    if (!toggle || !navCollapse) return;

    var isOpen = false;
    var focusableElements = [];
    var firstFocusable = null;
    var lastFocusable = null;

    function updateFocusableElements() {
      focusableElements = Array.prototype.slice.call(
        navCollapse.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
      );
      firstFocusable = focusableElements[0];
      lastFocusable = focusableElements[focusableElements.length - 1];
    }

    function openMenu() {
      isOpen = true;
      navCollapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      updateFocusableElements();
      if (firstFocusable) firstFocusable.focus();
    }

    function closeMenu() {
      isOpen = false;
      navCollapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (!isOpen) return;

      if (e.key === 'Escape' || e.key === 'Esc') {
        closeMenu();
        toggle.focus();
      }

      if (e.key === 'Tab') {
        if (focusableElements.length === 0) return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });

    document.addEventListener('click', function(e) {
      if (!isOpen) return;
      if (!navCollapse.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (isOpen) closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 150);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (window.__app.smoothScrollInit) return;
    window.__app.smoothScrollInit = true;

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetElement = document.getElementById(targetId);

      if (!targetElement) return;

      e.preventDefault();

      var header = document.querySelector('.l-header, .navbar');
      var offset = header ? header.offsetHeight : 80;

      var elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      var offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  }

  function initScrollSpy() {
    if (window.__app.scrollSpyInit) return;
    window.__app.scrollSpyInit = true;

    var sections = document.querySelectorAll('section[id], div[id]');
    var navLinks = document.querySelectorAll('.c-nav__link[href^="#"], .nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var header = document.querySelector('.l-header, .navbar');
    var headerOffset = header ? header.offsetHeight : 80;

    function updateActiveLink() {
      var scrollPosition = window.scrollY + headerOffset + 50;

      var currentSection = null;

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
          break;
        }
      }

      for (var j = 0; j < navLinks.length; j++) {
        var link = navLinks[j];
        var linkHref = link.getAttribute('href');

        if (linkHref === '#' + currentSection) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      }
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler, { passive: true });

    updateActiveLink();
  }

  function initActiveMenuState() {
    if (window.__app.activeMenuInit) return;
    window.__app.activeMenuInit = true;

    var links = document.querySelectorAll('.c-nav__link, .nav-link');
    var currentPath = window.location.pathname;

    var isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath || linkPath.startsWith('#')) continue;

      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (linkPath === currentPath || (isHomepage && (linkPath === '/' || linkPath === '/index.html'))) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImages() {
    if (window.__app.imagesInit) return;
    window.__app.imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isCritical = img.hasAttribute('data-critical') || img.classList.contains('c-logo__img');
      if (!isCritical && !img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        var failedImg = this;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#e9ecef" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#6c757d" dy=".3em">Image not available</text></svg>';
        var dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
        failedImg.src = dataUrl;
      });
    }
  }

  function initForms() {
    if (window.__app.formsInit) return;
    window.__app.formsInit = true;

    var toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }

    window.__app.notify = function(message, type) {
      var alertClass = 'alert-info';
      if (type === 'success') alertClass = 'alert-success';
      if (type === 'error') alertClass = 'alert-danger';
      if (type === 'warning') alertClass = 'alert-warning';

      var alertEl = document.createElement('div');
      alertEl.className = 'alert ' + alertClass + ' alert-dismissible fade show';
      alertEl.setAttribute('role', 'alert');
      alertEl.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

      toastContainer.appendChild(alertEl);

      setTimeout(function() {
        alertEl.classList.remove('show');
        setTimeout(function() {
          if (toastContainer.contains(alertEl)) {
            toastContainer.removeChild(alertEl);
          }
        }, 150);
      }, 5000);
    };

    var forms = document.querySelectorAll('.c-form, .needs-validation');

    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var form = this;
        var isValid = true;
        var errors = [];

        var nameField = form.querySelector('#brochure-name, #contact-firstname');
        if (nameField && nameField.value.trim() === '') {
          isValid = false;
          errors.push('Naam is verplicht');
          markFieldInvalid(nameField);
        } else if (nameField) {
          markFieldValid(nameField);
        }

        var lastnameField = form.querySelector('#contact-lastname');
        if (lastnameField && lastnameField.value.trim() === '') {
          isValid = false;
          errors.push('Achternaam is verplicht');
          markFieldInvalid(lastnameField);
        } else if (lastnameField) {
          markFieldValid(lastnameField);
        }

        var emailField = form.querySelector('#brochure-email, #contact-email');
        if (emailField) {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailField.value.trim() === '') {
            isValid = false;
            errors.push('E-mail is verplicht');
            markFieldInvalid(emailField);
          } else if (!emailPattern.test(emailField.value.trim())) {
            isValid = false;
            errors.push('E-mail formaat is ongeldig');
            markFieldInvalid(emailField);
          } else {
            markFieldValid(emailField);
          }
        }

        var phoneField = form.querySelector('#brochure-phone, #contact-phone');
        if (phoneField) {
          var phonePattern = /^[\d\s\+\-\(\)]{10,20}$/;
          if (phoneField.value.trim() === '') {
            isValid = false;
            errors.push('Telefoonnummer is verplicht');
            markFieldInvalid(phoneField);
          } else if (!phonePattern.test(phoneField.value.trim())) {
            isValid = false;
            errors.push('Telefoonnummer formaat is ongeldig');
            markFieldInvalid(phoneField);
          } else {
            markFieldValid(phoneField);
          }
        }

        var subjectField = form.querySelector('#contact-subject');
        if (subjectField && subjectField.value.trim() === '') {
          isValid = false;
          errors.push('Onderwerp is verplicht');
          markFieldInvalid(subjectField);
        } else if (subjectField) {
          markFieldValid(subjectField);
        }

        var messageField = form.querySelector('#contact-message');
        if (messageField) {
          if (messageField.value.trim() === '') {
            isValid = false;
            errors.push('Bericht is verplicht');
            markFieldInvalid(messageField);
          } else if (messageField.value.trim().length < 10) {
            isValid = false;
            errors.push('Bericht moet minimaal 10 tekens bevatten');
            markFieldInvalid(messageField);
          } else {
            markFieldValid(messageField);
          }
        }

        var privacyField = form.querySelector('#brochure-privacy, #contact-privacy');
        if (privacyField && !privacyField.checked) {
          isValid = false;
          errors.push('Je moet akkoord gaan met het privacybeleid');
          markFieldInvalid(privacyField);
        } else if (privacyField) {
          markFieldValid(privacyField);
        }

        if (!isValid) {
          form.classList.add('was-validated');
          window.__app.notify(errors[0], 'error');
          return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
        }

        setTimeout(function() {
          window.__app.notify('Bedankt! Uw bericht is succesvol verzonden.', 'success');
          
          setTimeout(function() {
            window.location.href = 'thank_you.html';
          }, 1000);
        }, 1500);
      });
    }

    function markFieldInvalid(field) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      var parent = field.closest('.c-form__group, .mb-3');
      if (parent) parent.classList.add('has-error');
    }

    function markFieldValid(field) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      var parent = field.closest('.c-form__group, .mb-3');
      if (parent) parent.classList.remove('has-error');
    }
  }

  function initScrollToTop() {
    if (window.__app.scrollToTopInit) return;
    window.__app.scrollToTopInit = true;

    var scrollBtn = document.createElement('button');
    scrollBtn.className = 'c-scroll-top';
    scrollBtn.setAttribute('aria-label', 'Scroll naar boven');
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:50px;height:50px;border-radius:50%;background:var(--color-secondary);color:#fff;border:none;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease;z-index:1000;font-size:24px;display:flex;align-items:center;justify-content:center;';

    document.body.appendChild(scrollBtn);

    var scrollHandler = throttle(function() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initCountUp() {
    if (window.__app.countUpInit) return;
    window.__app.countUpInit = true;

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    var hasStarted = {};

    function animateCounter(counter) {
      var id = counter.getAttribute('data-count') || Math.random().toString();
      if (hasStarted[id]) return;
      hasStarted[id] = true;

      var target = parseInt(counter.getAttribute('data-count'), 10);
      var duration = 2000;
      var start = 0;
      var increment = target / (duration / 16);
      var current = start;

      var timer = setInterval(function() {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current).toLocaleString('nl-NL');
      }, 16);
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    for (var i = 0; i < counters.length; i++) {
      observer.observe(counters[i]);
    }
  }

  function initPrivacyModal() {
    if (window.__app.privacyModalInit) return;
    window.__app.privacyModalInit = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"]');

    for (var i = 0; i < privacyLinks.length; i++) {
      privacyLinks[i].addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href && (href.includes('privacy.html') || href.includes('#privacy'))) {
          e.preventDefault();
          window.location.href = 'privacy.html';
        }
      });
    }
  }

  function initAccordion() {
    if (window.__app.accordionInit) return;
    window.__app.accordionInit = true;

    var accordionButtons = document.querySelectorAll('.accordion-button');

    for (var i = 0; i < accordionButtons.length; i++) {
      accordionButtons[i].addEventListener('click', function() {
        var target = this.getAttribute('data-bs-target');
        if (!target) return;

        var collapseElement = document.querySelector(target);
        if (!collapseElement) return;

        var isExpanded = this.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          this.setAttribute('aria-expanded', 'false');
          this.classList.add('collapsed');
          collapseElement.classList.remove('show');
        } else {
          this.setAttribute('aria-expanded', 'true');
          this.classList.remove('collapsed');
          collapseElement.classList.add('show');
        }
      });
    }
  }

  window.__app.init = function() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenuState();
    initImages();
    initForms();
    initScrollToTop();
    initCountUp();
    initPrivacyModal();
    initAccordion();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__app.init);
  } else {
    window.__app.init();
  }
})();
