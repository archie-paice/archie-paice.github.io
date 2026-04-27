/* =============================================================
   PERSONAL PORTFOLIO — script.js
   ============================================================= */

/* ── Load content from data.json and render the page ── */
(function () {
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderTags(tags) {
    if (!tags || !tags.length) return '';
    return '<ul class="timeline-tags">' +
      tags.map(t => '<li>' + escHtml(t) + '</li>').join('') +
      '</ul>';
  }

  function renderTimelineItem(date, role, company, description, tags) {
    return '<div class="timeline-item">' +
      '<div class="timeline-marker"></div>' +
      '<div class="timeline-content">' +
      '<span class="timeline-date">' + escHtml(date) + '</span>' +
      '<h3 class="timeline-role">' + escHtml(role) + '</h3>' +
      '<h4 class="timeline-company">' + escHtml(company) + '</h4>' +
      '<p>' + escHtml(description) + '</p>' +
      renderTags(tags) +
      '</div></div>';
  }

  function applyData(data) {
    /* ── Hero ── */
    const hero = data.hero || {};
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
      heroContent.innerHTML =
        '<h1>Hi, I\'m <span class="highlight">' + escHtml(hero.name || '') + '</span></h1>' +
        '<p class="hero-tagline">' + escHtml(hero.tagline || '') + '</p>' +
        '<div class="hero-cta">' +
        '<a href="#about" class="btn btn-primary">Learn More</a>' +
        '<a href="#contact" class="btn btn-outline">Get in Touch</a>' +
        '</div>' +
        '<div class="hero-socials">' +
        (hero.githubUrl ? '<a href="' + escHtml(hero.githubUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fab fa-github"></i></a>' : '') +
        (hero.linkedinUrl ? '<a href="' + escHtml(hero.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>' : '') +
        '</div>';
    }

    const navBrand = document.getElementById('nav-brand');
    if (navBrand && hero.name) navBrand.textContent = hero.name;

    /* ── About ── */
    const about = data.about || {};
    const aboutContent = document.getElementById('about-content');
    if (aboutContent) {
      const bioParagraphs = (about.bio || []).map(p => '<p>' + escHtml(p) + '</p>').join('');
      aboutContent.innerHTML =
        '<div class="about-photo">' +
        '<img src="' + escHtml(about.photoSrc || '') + '" alt="' + escHtml(about.photoAlt || '') + '" />' +
        '<div class="about-photo-placeholder" aria-hidden="true">' + escHtml(about.initials || '') + '</div>' +
        '</div>' +
        '<div class="about-text">' +
        bioParagraphs +
        '<ul class="about-details">' +
        (about.location ? '<li><i class="fas fa-map-marker-alt"></i> <span>Location: ' + escHtml(about.location) + '</span></li>' : '') +
        (about.email ? '<li><i class="fas fa-envelope"></i> <span>Email: <a href="mailto:' + escHtml(about.email) + '">' + escHtml(about.email) + '</a></span></li>' : '') +
        (about.githubUrl ? '<li><i class="fab fa-github"></i> <span>GitHub: <a href="' + escHtml(about.githubUrl) + '" target="_blank" rel="noopener noreferrer">' + escHtml(about.githubHandle || about.githubUrl) + '</a></span></li>' : '') +
        (about.linkedinUrl ? '<li><i class="fab fa-linkedin"></i> <span>LinkedIn: <a href="' + escHtml(about.linkedinUrl) + '" target="_blank" rel="noopener noreferrer">' + escHtml(about.linkedinHandle || about.linkedinUrl) + '</a></span></li>' : '') +
        '</ul>' +
        (about.cvUrl ? '<a href="' + escHtml(about.cvUrl) + '" class="btn btn-primary" download>Download CV <i class="fas fa-download"></i></a>' : '') +
        '</div>';
    }

    /* ── Experience ── */
    const expTimeline = document.getElementById('experience-timeline');
    if (expTimeline && data.experience) {
      expTimeline.innerHTML = data.experience.map(item =>
        renderTimelineItem(item.date, item.role, item.company, item.description, item.tags)
      ).join('');
    }

    /* ── Education ── */
    const eduTimeline = document.getElementById('education-timeline');
    if (eduTimeline && data.education) {
      eduTimeline.innerHTML = data.education.map(item =>
        renderTimelineItem(item.date, item.degree, item.institution, item.description, item.tags)
      ).join('');
    }

    /* ── Extracurriculars ── */
    const extraGrid = document.getElementById('extracurriculars-grid');
    if (extraGrid && data.extracurriculars) {
      extraGrid.innerHTML = data.extracurriculars.map(item =>
        '<div class="card">' +
        '<div class="card-icon"><i class="' + escHtml(item.icon || 'fas fa-star') + '"></i></div>' +
        '<h3>' + escHtml(item.title) + '</h3>' +
        '<p>' + escHtml(item.description) + '</p>' +
        '</div>'
      ).join('');
    }

    /* ── Projects ── */
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid && data.projects) {
      projectsGrid.innerHTML = data.projects.map(item =>
        '<div class="card project-card">' +
        '<div class="project-card-header">' +
        '<i class="fas fa-folder-open"></i>' +
        '<div class="project-links">' +
        (item.githubUrl ? '<a href="' + escHtml(item.githubUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"><i class="fab fa-github"></i></a>' : '') +
        (item.liveUrl ? '<a href="' + escHtml(item.liveUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="Live demo"><i class="fas fa-external-link-alt"></i></a>' : '') +
        '</div></div>' +
        '<h3>' + escHtml(item.name) + '</h3>' +
        '<p>' + escHtml(item.description) + '</p>' +
        renderTags(item.tags) +
        '</div>'
      ).join('');
    }

    const githubProfileLink = document.getElementById('github-profile-link');
    if (githubProfileLink && (data.hero || {}).githubUrl) {
      githubProfileLink.href = data.hero.githubUrl;
    }

    /* ── LinkedIn CTA ── */
    const linkedinCta = document.getElementById('linkedin-cta');
    if (linkedinCta) {
      const url = (data.hero || {}).linkedinUrl || (data.contact || {}).linkedinUrl || '';
      if (url) linkedinCta.href = url;
    }

    /* ── Contact links ── */
    const contactLinks = document.getElementById('contact-links');
    const contact = data.contact || {};
    if (contactLinks) {
      contactLinks.innerHTML =
        (contact.email ? '<li><a href="mailto:' + escHtml(contact.email) + '"><i class="fas fa-envelope"></i> ' + escHtml(contact.email) + '</a></li>' : '') +
        (contact.githubUrl ? '<li><a href="' + escHtml(contact.githubUrl) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> ' + escHtml(contact.githubUrl.replace('https://', '')) + '</a></li>' : '') +
        (contact.linkedinUrl ? '<li><a href="' + escHtml(contact.linkedinUrl) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin"></i> LinkedIn Profile</a></li>' : '');
    }

    /* ── Contact form action ── */
    const contactForm = document.getElementById('contact-form');
    if (contactForm && contact.formspreeId) {
      contactForm.setAttribute('action', 'https://formspree.io/f/' + contact.formspreeId);
    }

    /* ── Footer socials ── */
    const footerSocials = document.getElementById('footer-socials');
    if (footerSocials) {
      footerSocials.innerHTML =
        (contact.githubUrl ? '<a href="' + escHtml(contact.githubUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fab fa-github"></i></a>' : '') +
        (contact.linkedinUrl ? '<a href="' + escHtml(contact.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>' : '') +
        (contact.email ? '<a href="mailto:' + escHtml(contact.email) + '" aria-label="Email"><i class="fas fa-envelope"></i></a>' : '');
    }

    /* ── Page title ── */
    if ((data.hero || {}).name) {
      document.title = data.hero.name + ' | Portfolio';
    }

    /* ── Profile photo fallback ── */
    const img         = document.querySelector('.about-photo img');
    const placeholder = document.querySelector('.about-photo-placeholder');
    if (img && placeholder) {
      img.addEventListener('error', () => {
        img.style.display         = 'none';
        placeholder.style.display = 'flex';
      });
    }
  }

  fetch('data.json')
    .then(r => r.json())
    .then(applyData)
    .catch(() => {
      /* If data.json fails to load, the page shows empty containers — graceful degradation */
    });
})();

/* ── Navbar scroll shadow & active link highlighting ── */
(function () {
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav-links a');
  const sections  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

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

    const data   = new FormData(form);
    const action = form.getAttribute('action');

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

    if (!action || action === '#' || action.includes('YOUR-FORM-ID')) {
      setStatus('Contact form not configured — please set the Formspree ID via the admin panel.', 'error');
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

