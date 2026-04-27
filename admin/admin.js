/* =============================================================
   ADMIN PANEL — admin.js
   GitHub Contents API integration for data.json management
   ============================================================= */

'use strict';

/* ── Session storage keys ── */
const KEY_PAT   = 'admin_pat';
const KEY_OWNER = 'admin_owner';
const KEY_REPO  = 'admin_repo';

/* ── State ── */
let siteData = null; /* current data.json content */
let fileSha  = null; /* GitHub blob SHA needed for update */

/* ── DOM helpers ── */
const $  = id => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.forEach(c => c && node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
};

/* ── GitHub API helpers ── */
function apiHeaders() {
  const pat = sessionStorage.getItem(KEY_PAT);
  return {
    'Authorization': 'Bearer ' + pat,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function apiBase() {
  const owner = sessionStorage.getItem(KEY_OWNER);
  const repo  = sessionStorage.getItem(KEY_REPO);
  return 'https://api.github.com/repos/' + owner + '/' + repo;
}

async function fetchDataJson() {
  const res = await fetch(apiBase() + '/contents/data.json', { headers: apiHeaders() });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (await res.text()));
  const json = await res.json();
  fileSha = json.sha;
  return JSON.parse(atob(json.content.replace(/\s/g, '')));
}

async function saveDataJson(data, message) {
  const json    = JSON.stringify(data, null, 2);
  const bytes   = new TextEncoder().encode(json);
  const content = btoa(String.fromCharCode(...bytes));
  const body    = JSON.stringify({ message, content, sha: fileSha });
  const res     = await fetch(apiBase() + '/contents/data.json', {
    method: 'PUT',
    headers: apiHeaders(),
    body
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (await res.text()));
  const json = await res.json();
  fileSha = json.content.sha;
}

/* ── Login ── */
$('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const pat   = $('pat-input').value.trim();
  const owner = $('owner-input').value.trim();
  const repo  = $('repo-input').value.trim();
  const errEl = $('login-error');
  const btn   = $('login-btn');

  if (!pat || !owner || !repo) { errEl.textContent = 'All fields are required.'; return; }

  errEl.textContent = '';
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';

  sessionStorage.setItem(KEY_PAT,   pat);
  sessionStorage.setItem(KEY_OWNER, owner);
  sessionStorage.setItem(KEY_REPO,  repo);

  try {
    siteData = await fetchDataJson();
    showDashboard();
  } catch (err) {
    sessionStorage.removeItem(KEY_PAT);
    errEl.textContent = 'Sign-in failed: ' + err.message + '. Check your token and repo details.';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }
});

/* ── Logout ── */
$('logout-btn').addEventListener('click', () => {
  sessionStorage.clear();
  siteData = null;
  fileSha  = null;
  $('dashboard').classList.add('hidden');
  $('login-screen').classList.remove('hidden');
  $('pat-input').value = '';
  $('login-error').textContent = '';
});

/* ── Show dashboard ── */
function showDashboard() {
  $('login-screen').classList.add('hidden');
  $('dashboard').classList.remove('hidden');
  populateAllFields();
}

/* ── Tab switching ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    const panel = $('tab-' + btn.dataset.tab);
    if (panel) { panel.classList.remove('hidden'); }
  });
});

/* ── Save & Publish ── */
$('save-btn').addEventListener('click', async () => {
  const status = $('save-status');
  const btn    = $('save-btn');

  collectAllFields();

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing…';
  setSaveStatus('Saving data.json to GitHub…', 'info');

  try {
    await saveDataJson(siteData, 'chore: update site content via admin panel');
    setSaveStatus('✓ Published! GitHub Pages will rebuild in ~30 seconds.', 'success');
  } catch (err) {
    setSaveStatus('✗ Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save &amp; Publish';
  }
});

function setSaveStatus(text, type) {
  const el = $('save-status');
  el.textContent = text;
  el.className = 'save-status' + (type ? ' ' + type : '');
}

/* ================================================================
   FIELD POPULATION
   ================================================================ */
function populateAllFields() {
  const d = siteData;

  /* Hero */
  $('hero-name').value     = d.hero?.name     || '';
  $('hero-tagline').value  = d.hero?.tagline  || '';
  $('hero-github').value   = d.hero?.githubUrl  || '';
  $('hero-linkedin').value = d.hero?.linkedinUrl || '';

  /* About */
  $('about-photo-src').value      = d.about?.photoSrc      || '';
  $('about-photo-alt').value      = d.about?.photoAlt      || '';
  $('about-initials').value       = d.about?.initials       || '';
  $('about-bio').value            = (d.about?.bio || []).join('\n');
  $('about-location').value       = d.about?.location       || '';
  $('about-email').value          = d.about?.email          || '';
  $('about-github-url').value     = d.about?.githubUrl      || '';
  $('about-github-handle').value  = d.about?.githubHandle   || '';
  $('about-linkedin-url').value   = d.about?.linkedinUrl    || '';
  $('about-linkedin-handle').value= d.about?.linkedinHandle || '';
  $('about-cv-url').value         = d.about?.cvUrl          || '';

  /* Experience */
  renderList('experience-list', d.experience || [], buildExperienceCard);

  /* Education */
  renderList('education-list', d.education || [], buildEducationCard);

  /* Extracurriculars */
  renderList('extracurriculars-list', d.extracurriculars || [], buildExtraCard);

  /* Projects */
  renderList('projects-list', d.projects || [], buildProjectCard);

  /* Contact */
  $('contact-email').value      = d.contact?.email        || '';
  $('contact-github').value     = d.contact?.githubUrl    || '';
  $('contact-linkedin').value   = d.contact?.linkedinUrl  || '';
  $('contact-formspree').value  = d.contact?.formspreeId  || '';
}

/* ================================================================
   FIELD COLLECTION
   ================================================================ */
function collectAllFields() {
  /* Hero */
  siteData.hero = {
    name:        $('hero-name').value.trim(),
    tagline:     $('hero-tagline').value.trim(),
    githubUrl:   $('hero-github').value.trim(),
    linkedinUrl: $('hero-linkedin').value.trim()
  };

  /* About */
  siteData.about = {
    photoSrc:       $('about-photo-src').value.trim(),
    photoAlt:       $('about-photo-alt').value.trim(),
    initials:       $('about-initials').value.trim(),
    bio:            $('about-bio').value.split('\n').map(s => s.trim()).filter(Boolean),
    location:       $('about-location').value.trim(),
    email:          $('about-email').value.trim(),
    githubUrl:      $('about-github-url').value.trim(),
    githubHandle:   $('about-github-handle').value.trim(),
    linkedinUrl:    $('about-linkedin-url').value.trim(),
    linkedinHandle: $('about-linkedin-handle').value.trim(),
    cvUrl:          $('about-cv-url').value.trim()
  };

  /* Experience */
  siteData.experience = collectList('experience-list', collectExperienceCard);

  /* Education */
  siteData.education = collectList('education-list', collectEducationCard);

  /* Extracurriculars */
  siteData.extracurriculars = collectList('extracurriculars-list', collectExtraCard);

  /* Projects */
  siteData.projects = collectList('projects-list', collectProjectCard);

  /* Contact */
  siteData.contact = {
    email:       $('contact-email').value.trim(),
    githubUrl:   $('contact-github').value.trim(),
    linkedinUrl: $('contact-linkedin').value.trim(),
    formspreeId: $('contact-formspree').value.trim()
  };
}

/* ================================================================
   GENERIC LIST RENDERER / COLLECTOR
   ================================================================ */
function renderList(containerId, items, buildCardFn) {
  const container = $(containerId);
  container.innerHTML = '';
  items.forEach((item, idx) => {
    container.appendChild(buildCardFn(item, idx));
  });
}

function collectList(containerId, collectCardFn) {
  const cards = $(containerId).querySelectorAll('.item-card');
  return Array.from(cards).map(collectCardFn);
}

function makeItemCard(title, bodyHtml, onDelete) {
  const card    = el('div', { class: 'item-card' });
  const header  = el('div', { class: 'item-card-header' });
  const titleEl = el('span', { class: 'item-card-title' }, title);
  const actions = el('div', { class: 'item-card-actions' });
  const body    = el('div', { class: 'item-card-body', html: bodyHtml });

  const toggleBtn = el('button', { class: 'btn btn-sm btn-outline', type: 'button' });
  toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    body.classList.toggle('open');
    toggleBtn.innerHTML = body.classList.contains('open')
      ? '<i class="fas fa-chevron-up"></i>'
      : '<i class="fas fa-chevron-down"></i>';
    /* Keep title in sync */
    const firstInput = body.querySelector('input[data-title]');
    if (firstInput) titleEl.textContent = firstInput.value || 'New entry';
  });

  const deleteBtn = el('button', { class: 'btn btn-sm btn-danger', type: 'button' });
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (confirm('Delete this entry?')) { card.remove(); }
  });

  header.addEventListener('click', () => toggleBtn.click());

  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);
  header.appendChild(titleEl);
  header.appendChild(actions);
  card.appendChild(header);
  card.appendChild(body);

  /* Update card title as user types in the title field */
  setTimeout(() => {
    const firstInput = body.querySelector('input[data-title]');
    if (firstInput) {
      firstInput.addEventListener('input', () => {
        titleEl.textContent = firstInput.value || 'New entry';
      });
    }
  }, 0);

  return card;
}

/* ── Experience ── */
function buildExperienceCard(item) {
  const html =
    '<div class="field-row">' +
    field('Date / Period', 'exp-date', 'text', item.date, true) +
    field('Role / Title', 'exp-role', 'text', item.role) +
    '</div>' +
    field('Company', 'exp-company', 'text', item.company) +
    field('Description', 'exp-desc', 'textarea', item.description) +
    fieldTags('Tags (comma-separated)', 'exp-tags', item.tags);
  return makeItemCard(item.role || 'Experience entry', html);
}
function collectExperienceCard(card) {
  return {
    date:        card.querySelector('[data-key="exp-date"]').value.trim(),
    role:        card.querySelector('[data-key="exp-role"]').value.trim(),
    company:     card.querySelector('[data-key="exp-company"]').value.trim(),
    description: card.querySelector('[data-key="exp-desc"]').value.trim(),
    tags:        parseTags(card.querySelector('[data-key="exp-tags"]').value)
  };
}

/* ── Education ── */
function buildEducationCard(item) {
  const html =
    '<div class="field-row">' +
    field('Date / Period', 'edu-date', 'text', item.date, true) +
    field('Degree / Qualification', 'edu-degree', 'text', item.degree) +
    '</div>' +
    field('Institution', 'edu-institution', 'text', item.institution) +
    field('Description', 'edu-desc', 'textarea', item.description) +
    fieldTags('Tags (comma-separated)', 'edu-tags', item.tags);
  return makeItemCard(item.degree || 'Education entry', html);
}
function collectEducationCard(card) {
  return {
    date:        card.querySelector('[data-key="edu-date"]').value.trim(),
    degree:      card.querySelector('[data-key="edu-degree"]').value.trim(),
    institution: card.querySelector('[data-key="edu-institution"]').value.trim(),
    description: card.querySelector('[data-key="edu-desc"]').value.trim(),
    tags:        parseTags(card.querySelector('[data-key="edu-tags"]').value)
  };
}

/* ── Extracurriculars ── */
function buildExtraCard(item) {
  const html =
    field('Title', 'extra-title', 'text', item.title, true) +
    field('Font Awesome Icon Class (e.g. fas fa-code)', 'extra-icon', 'text', item.icon) +
    field('Description', 'extra-desc', 'textarea', item.description);
  return makeItemCard(item.title || 'Activity', html);
}
function collectExtraCard(card) {
  return {
    title:       card.querySelector('[data-key="extra-title"]').value.trim(),
    icon:        card.querySelector('[data-key="extra-icon"]').value.trim(),
    description: card.querySelector('[data-key="extra-desc"]').value.trim()
  };
}

/* ── Projects ── */
function buildProjectCard(item) {
  const html =
    field('Project Name', 'proj-name', 'text', item.name, true) +
    field('Description', 'proj-desc', 'textarea', item.description) +
    '<div class="field-row">' +
    field('GitHub URL', 'proj-github', 'url', item.githubUrl) +
    field('Live Demo URL (optional)', 'proj-live', 'url', item.liveUrl) +
    '</div>' +
    fieldTags('Tags (comma-separated)', 'proj-tags', item.tags);
  return makeItemCard(item.name || 'Project', html);
}
function collectProjectCard(card) {
  return {
    name:        card.querySelector('[data-key="proj-name"]').value.trim(),
    description: card.querySelector('[data-key="proj-desc"]').value.trim(),
    githubUrl:   card.querySelector('[data-key="proj-github"]').value.trim(),
    liveUrl:     card.querySelector('[data-key="proj-live"]').value.trim(),
    tags:        parseTags(card.querySelector('[data-key="proj-tags"]').value)
  };
}

/* ── Field HTML builders ── */
function field(label, key, type, value = '', isTitle = false) {
  const titleAttr = isTitle ? ' data-title="1"' : '';
  if (type === 'textarea') {
    return '<div class="field-group">' +
      '<label>' + escHtml(label) + '</label>' +
      '<textarea data-key="' + key + '"' + titleAttr + ' rows="3">' + escHtml(value || '') + '</textarea>' +
      '</div>';
  }
  return '<div class="field-group">' +
    '<label>' + escHtml(label) + '</label>' +
    '<input type="' + type + '" data-key="' + key + '"' + titleAttr + ' value="' + escHtml(value || '') + '" />' +
    '</div>';
}

function fieldTags(label, key, tags) {
  return '<div class="field-group">' +
    '<label>' + escHtml(label) + '</label>' +
    '<input type="text" data-key="' + key + '" value="' + escHtml((tags || []).join(', ')) + '" />' +
    '<span class="tags-hint">Separate tags with commas, e.g. JavaScript, React, Node.js</span>' +
    '</div>';
}

function parseTags(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean);
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Add buttons ── */
$('add-experience').addEventListener('click', () => {
  $('experience-list').appendChild(buildExperienceCard({}));
});
$('add-education').addEventListener('click', () => {
  $('education-list').appendChild(buildEducationCard({}));
});
$('add-extracurricular').addEventListener('click', () => {
  $('extracurriculars-list').appendChild(buildExtraCard({}));
});
$('add-project').addEventListener('click', () => {
  $('projects-list').appendChild(buildProjectCard({}));
});

/* ── Auto-restore session if PAT still stored ── */
(function () {
  const pat = sessionStorage.getItem(KEY_PAT);
  if (!pat) return;
  $('owner-input').value = sessionStorage.getItem(KEY_OWNER) || 'archie-paice';
  $('repo-input').value  = sessionStorage.getItem(KEY_REPO)  || 'archie-paice.github.io';
  /* Silently try to reload data */
  fetchDataJson()
    .then(data => { siteData = data; showDashboard(); })
    .catch(() => { sessionStorage.clear(); });
})();
