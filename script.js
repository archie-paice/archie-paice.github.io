/* =============================================================
   PERSONAL PORTFOLIO — script.js
   ============================================================= */

/* ── Navbar scroll shadow & active link highlighting ── */
(function () {
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav-links a');
  const sections  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Add shadow when scrolled
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Highlight the active nav link based on scroll position
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  });
})();

/* ── Mobile nav toggle ── */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('nav');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── Contact form (Formspree) ── */
(function () {
  const form   = document.getElementById('contact-form');
  const status = form ? form.querySelector('.form-status') : null;

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const action = form.getAttribute('action');

    // Basic client-side validation
    const name    = data.get('name')?.trim();
    const email   = data.get('email')?.trim();
    const message = data.get('message')?.trim();

    if (!name || !email || !message) {
      setStatus('Please fill in all fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }

    // If the form action still contains the placeholder, show a helpful message
    if (action.includes('YOUR-FORM-ID')) {
      setStatus('Form not yet configured — please update the Formspree action URL in index.html.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setStatus('Sending…', '');

    try {
      const response = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setStatus('Thanks! Your message has been sent.', 'success');
        form.reset();
      } else {
        setStatus('Something went wrong. Please try again.', 'error');
      }
    } catch {
      setStatus('Network error. Please try again later.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  function setStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.className = 'form-status' + (type ? ' ' + type : '');
  }
})();

/* ── Auto-update copyright year ── */
(function () {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── Profile photo fallback ── */
(function () {
  const img         = document.querySelector('.about-photo img');
  const placeholder = document.querySelector('.about-photo-placeholder');

  if (!img || !placeholder) return;

  function showPlaceholder() {
    img.style.display         = 'none';
    placeholder.style.display = 'flex';
  }

  img.addEventListener('error', showPlaceholder);
})();
