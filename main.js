const STORAGE_CONTENT_KEY = 'reey-site-content-v1';
const STORAGE_STATS_KEY = 'reey-site-stats-v1';
const STORAGE_ADMIN_OPEN_KEY = 'reey-site-admin-open';
const STORAGE_CLOUD_KEY = 'reey-site-cloud-v1';
const STORAGE_ADMIN_PASS_HASH_KEY = 'reey-site-admin-pass-hash-v1';
const STORAGE_ADMIN_UNLOCKED_KEY = 'reey-site-admin-unlocked-v1';
const DEFAULT_CLOUD_POLL_INTERVAL_MS = 10000;
const ALLOWED_CLOUD_INTERVALS = [5000, 10000, 15000, 30000, 60000, 120000];
const DEFAULT_FAVICON_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%230b0c0f'/%3E%3Cpath d='M20 52h60' stroke='%23ff7a18' stroke-width='8' stroke-linecap='round'/%3E%3Cpath d='M40 30l-20 22 20 22' fill='none' stroke='%23ff7a18' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

const defaultContent = {
  updatedAt: new Date(0).toISOString(),
  cloudConfigMirror: null,
  pageTitle: 'reeyanu — bio',
  metaDescription: 'reeyanu aka Aleksandr — 16 y.o. developer. bio, projects, contacts.',
  seoKeywords: 'reeyanu, bio, links',
  seoRobots: 'index,follow',
  canonicalUrl: '',
  ogTitle: 'reeyanu — bio',
  ogDescription: 'reeyanu aka Aleksandr — 16 y.o. developer. bio, projects, contacts.',
  ogImage: '',
  ogUrl: '',
  twitterCard: 'summary_large_image',
  twitterTitle: 'reeyanu — bio',
  twitterDescription: 'reeyanu aka Aleksandr — 16 y.o. developer. bio, projects, contacts.',
  twitterImage: '',
  faviconUrl: DEFAULT_FAVICON_URL,
  welcomeTitle: 'welcome!',
  welcomeDescription: "hello! i'm <strong>reeyanu</strong> aka <strong>aleksandr</strong>, 16 y.o. — i build things or just nothing on the internet and I like editing in AE.",
  about: 'ненавижу кодинг учу питон и все такое для програмистов you know, терминалы и аккуратные интерфейсы. чаще всего — ничего. занимаюсь эдитами и что-то пытаюсь учить.',
  heroAvatarUrl: '',
  profileCard: {
    imageUrl: '',
    title: 'senpai★ / beats',
    badge: '✔',
    link: '#'
  },
  projects: [
    {
      title: 'TikTok Projects',
      sub: 'sweexyzt',
      desc: 'вылаживаю все что сделал в АЕ для комьюнити',
      url: 'https://www.tiktok.com/@sweexyzt'
    },
    {
      title: 'Мой Telegram',
      sub: 't.me/reeyanu',
      desc: 'официальный тг все остальные фек',
      url: 'https://t.me/reeyanu'
    }
  ],
  skills: [
    '<strong>typescript</strong> (node.js, deno, bun, python-for rn)',
    '<strong>After Effects</strong> editing',
    '<strong>learning postgresql</strong>, redis, sqlite'
  ],
  contact: {
    name: 'настаящи reeyanu',
    handle: '@reeyanu',
    url: 'https://t.me/reeyanu',
    avatarUrl: 'https://t.me/i/userpic/320/sexuzperedoz.jpg'
  },
  donations: [
    { label: 'ton', value: 'UQAFa34CutPo42cOPQWQihVPCGfbWIgPKgArqMBMcm_gzI7N' },
    { label: 'usdt (TON)', value: 'UQAFa34CutPo42cOPQWQihVPCGfbWIgPKgArqMBMcm_gzI7N' },
    { label: 'btc', value: '168p6P4t6N1QPt2DqiB59WWsGDRNorbDa5' },
    { label: 'eth', value: '0xd2121bae9753e859e787cbdb28c47890dcb146aa' }
  ],
  donationFootnote: 'спасибо за поддержку! ❤️',
  footerHtml: 'built by <b>noname---me:)</b> with ❤️ — <span class="muted">some design vibes</span>'
};

const defaultCloudConfig = {
  enabled: false,
  autoSync: true,
  pollIntervalMs: DEFAULT_CLOUD_POLL_INTERVAL_MS,
  url: '',
  anonKey: '',
  contentTable: 'site_content',
  eventsTable: 'site_events',
  rowKey: 'main'
};

function sanitizePollIntervalMs(value) {
  const parsed = Number(value);
  if (ALLOWED_CLOUD_INTERVALS.includes(parsed)) return parsed;
  return DEFAULT_CLOUD_POLL_INTERVAL_MS;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeContent(input) {
  const parsed = input && typeof input === 'object' ? input : {};
  return {
    ...clone(defaultContent),
    ...parsed,
    cloudConfigMirror: parsed.cloudConfigMirror ? normalizeCloudConfig(parsed.cloudConfigMirror) : null,
    profileCard: { ...defaultContent.profileCard, ...(parsed.profileCard || {}) },
    contact: { ...defaultContent.contact, ...(parsed.contact || {}) },
    projects: Array.isArray(parsed.projects) ? parsed.projects : defaultContent.projects,
    skills: Array.isArray(parsed.skills) ? parsed.skills : defaultContent.skills,
    donations: Array.isArray(parsed.donations) ? parsed.donations : defaultContent.donations,
    updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
  };
}

function sanitizeIdentifier(value, fallback) {
  const safe = String(value || '').trim();
  if (!safe) return fallback;
  if (!/^[a-zA-Z0-9_]+$/.test(safe)) return fallback;
  return safe;
}

function normalizeCloudConfig(input) {
  const parsed = input && typeof input === 'object' ? input : {};
  return {
    enabled: Boolean(parsed.enabled),
    autoSync: parsed.autoSync !== false,
    pollIntervalMs: sanitizePollIntervalMs(parsed.pollIntervalMs),
    url: String(parsed.url || '').trim().replace(/\/+$/, ''),
    anonKey: String(parsed.anonKey || '').trim(),
    contentTable: sanitizeIdentifier(parsed.contentTable, defaultCloudConfig.contentTable),
    eventsTable: sanitizeIdentifier(parsed.eventsTable, defaultCloudConfig.eventsTable),
    rowKey: String(parsed.rowKey || defaultCloudConfig.rowKey).trim() || defaultCloudConfig.rowKey
  };
}

function isCloudConfigured(config) {
  return Boolean(config.enabled && config.url && config.anonKey);
}

function buildCloudMirror(config) {
  const normalized = normalizeCloudConfig({ ...config, enabled: true });
  if (!normalized.url || !normalized.anonKey) return null;
  return {
    enabled: true,
    autoSync: normalized.autoSync,
    pollIntervalMs: normalized.pollIntervalMs,
    url: normalized.url,
    anonKey: normalized.anonKey,
    contentTable: normalized.contentTable,
    eventsTable: normalized.eventsTable,
    rowKey: normalized.rowKey
  };
}

function applyCloudMirrorFromContent(content, cloudRef) {
  if (!content || !content.cloudConfigMirror) return false;
  const mirror = normalizeCloudConfig({ ...content.cloudConfigMirror, enabled: true });
  if (!mirror.url || !mirror.anonKey) return false;
  cloudRef.value = normalizeCloudConfig({ ...cloudRef.value, ...mirror, enabled: true });
  saveCloudConfig(cloudRef.value);
  return true;
}

function loadContent() {
  try {
    return normalizeContent(JSON.parse(localStorage.getItem(STORAGE_CONTENT_KEY) || 'null'));
  } catch {
    return clone(defaultContent);
  }
}

function saveContent(content) {
  localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(normalizeContent(content)));
}

function loadCloudConfig() {
  try {
    return normalizeCloudConfig(JSON.parse(localStorage.getItem(STORAGE_CLOUD_KEY) || 'null'));
  } catch {
    return clone(defaultCloudConfig);
  }
}

function saveCloudConfig(config) {
  localStorage.setItem(STORAGE_CLOUD_KEY, JSON.stringify(normalizeCloudConfig(config)));
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getAdminPassHash() {
  return localStorage.getItem(STORAGE_ADMIN_PASS_HASH_KEY) || '';
}

function setAdminPassHash(hash) {
  localStorage.setItem(STORAGE_ADMIN_PASS_HASH_KEY, hash || '');
}

function isAdminUnlocked() {
  return localStorage.getItem(STORAGE_ADMIN_UNLOCKED_KEY) === '1';
}

function setAdminUnlocked(value) {
  localStorage.setItem(STORAGE_ADMIN_UNLOCKED_KEY, value ? '1' : '0');
}

function loadStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_STATS_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') {
      return { visitsTotal: 0, externalClicksTotal: 0, externalByUrl: {} };
    }
    return {
      visitsTotal: Number(parsed.visitsTotal || 0),
      externalClicksTotal: Number(parsed.externalClicksTotal || 0),
      externalByUrl: parsed.externalByUrl && typeof parsed.externalByUrl === 'object' ? parsed.externalByUrl : {}
    };
  } catch {
    return { visitsTotal: 0, externalClicksTotal: 0, externalByUrl: {} };
  }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
}

function trackVisitLocal() {
  const stats = loadStats();
  stats.visitsTotal += 1;
  saveStats(stats);
  return stats;
}

function trackExternalClickLocal(url) {
  const stats = loadStats();
  stats.externalClicksTotal += 1;
  stats.externalByUrl[url] = Number(stats.externalByUrl[url] || 0) + 1;
  saveStats(stats);
  return stats;
}

function supabaseHeaders(config, withJson = true) {
  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`
  };
  if (withJson) {
    headers['Content-Type'] = 'application/json';
    headers.Prefer = 'return=representation';
  }
  return headers;
}

async function cloudPullContent(config) {
  if (!isCloudConfigured(config)) return null;
  const rowKey = encodeURIComponent(config.rowKey);
  const url = `${config.url}/rest/v1/${config.contentTable}?key=eq.${rowKey}&select=data,updated_at&limit=1`;
  const response = await fetch(url, { headers: supabaseHeaders(config, false) });
  if (!response.ok) throw new Error(`cloud pull failed: ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const row = rows[0] || {};
  const content = normalizeContent(row.data || {});
  content.updatedAt = row.updated_at || content.updatedAt;
  return content;
}

async function cloudCheckApi(config) {
  if (!isCloudConfigured(config)) return { ok: false, message: 'cloud off' };
  const url = `${config.url}/rest/v1/${config.contentTable}?select=key&limit=1`;
  try {
    const response = await fetch(url, { headers: supabaseHeaders(config, false) });
    if (!response.ok) return { ok: false, message: `http ${response.status}` };
    return { ok: true, message: 'online' };
  } catch {
    return { ok: false, message: 'offline' };
  }
}

async function cloudPushContent(config, content) {
  if (!isCloudConfigured(config)) return null;
  const normalizedContent = normalizeContent(content);
  normalizedContent.cloudConfigMirror = buildCloudMirror(config);
  const payload = [{
    key: config.rowKey,
    data: normalizedContent,
    updated_at: new Date().toISOString()
  }];
  const url = `${config.url}/rest/v1/${config.contentTable}`;
  const headers = supabaseHeaders(config, true);
  headers.Prefer = 'resolution=merge-duplicates,return=representation';
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`cloud push failed: ${response.status}`);
  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  return normalizeContent(row?.data || normalizedContent);
}

async function cloudTrackEvent(config, eventType, urlValue = '') {
  if (!isCloudConfigured(config)) return;
  const payload = [{
    event_type: eventType,
    event_url: urlValue,
    created_at: new Date().toISOString()
  }];
  const response = await fetch(`${config.url}/rest/v1/${config.eventsTable}`, {
    method: 'POST',
    headers: supabaseHeaders(config, true),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`event write failed: ${response.status}`);
}

async function cloudFetchStats(config) {
  if (!isCloudConfigured(config)) return null;
  const query = `${config.url}/rest/v1/${config.eventsTable}?select=event_type,event_url&order=id.desc&limit=10000`;
  const response = await fetch(query, { headers: supabaseHeaders(config, false) });
  if (!response.ok) throw new Error(`stats read failed: ${response.status}`);
  const rows = await response.json();
  const stats = { visitsTotal: 0, externalClicksTotal: 0, externalByUrl: {} };
  (Array.isArray(rows) ? rows : []).forEach((entry) => {
    if (entry.event_type === 'visit') {
      stats.visitsTotal += 1;
      return;
    }
    if (entry.event_type === 'external_click') {
      stats.externalClicksTotal += 1;
      const key = entry.event_url || 'unknown';
      stats.externalByUrl[key] = Number(stats.externalByUrl[key] || 0) + 1;
    }
  });
  return stats;
}

async function cloudClearStats(config) {
  if (!isCloudConfigured(config)) return;
  const response = await fetch(`${config.url}/rest/v1/${config.eventsTable}?id=gt.0`, {
    method: 'DELETE',
    headers: supabaseHeaders(config, false)
  });
  if (!response.ok) throw new Error(`stats clear failed: ${response.status}`);
}

function shorten(text) {
  if (!text || text.length <= 28) return text || '';
  return text.slice(0, 12) + '…' + text.slice(-8);
}

function createCopyButton(value) {
  const button = document.createElement('button');
  button.className = 'copy';
  button.type = 'button';
  button.dataset.copy = value;
  button.textContent = shorten(value);
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
    button.textContent = 'copied';
    setTimeout(() => {
      button.textContent = shorten(value);
    }, 900);
  });
  return button;
}

function renderProjects(projects) {
  const root = document.getElementById('projects-list');
  if (!root) return;
  root.innerHTML = '';
  projects.forEach((project) => {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = project.url || '#';
    a.target = '_blank';
    a.rel = 'noreferrer noopener';
    a.innerHTML = `
      <span class="card-title">${project.title || ''}</span>
      <span class="card-sub">${project.sub || ''}</span>
      <span class="card-desc">${project.desc || ''}</span>
    `;
    root.appendChild(a);
  });
}

function renderSkills(skills) {
  const root = document.getElementById('skills-list');
  if (!root) return;
  root.innerHTML = '';
  skills.forEach((skill) => {
    const li = document.createElement('li');
    li.innerHTML = skill;
    root.appendChild(li);
  });
}

function renderDonations(donations) {
  const root = document.getElementById('donations-list');
  if (!root) return;
  root.innerHTML = '';
  donations.forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'donate-item';

    const label = document.createElement('span');
    label.className = 'muted';
    label.textContent = `${entry.label || 'value'}:`;

    item.appendChild(label);
    item.appendChild(createCopyButton(entry.value || ''));
    root.appendChild(item);
  });
}

function renderHeroAvatar(url) {
  const img = document.getElementById('hero-avatar');
  if (!img) return;
  if (!url) {
    img.classList.remove('show');
    img.removeAttribute('src');
    return;
  }
  img.src = url;
  img.onload = () => img.classList.add('show');
  img.onerror = () => img.classList.remove('show');
}

function renderProfileCard(profileCard, fallbackImage) {
  const cardLink = document.getElementById('profile-card-link');
  const cardImage = document.getElementById('profile-card-image');
  const cardTitle = document.getElementById('profile-card-title');
  const cardBadge = document.getElementById('profile-card-badge');
  if (!cardLink || !cardImage || !cardTitle || !cardBadge) return;

  const imageUrl = profileCard.imageUrl || fallbackImage || '';
  cardLink.href = profileCard.link || '#';
  cardTitle.textContent = profileCard.title || defaultContent.profileCard.title;
  cardBadge.textContent = profileCard.badge || defaultContent.profileCard.badge;
  cardImage.src = imageUrl;
}

function toHtmlWithLineBreaks(text) {
  return String(text || '').replace(/\n/g, '<br>');
}

function setMetaTag(selector, attrName, value) {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    const match = selector.match(/\[(name|property)=\"([^\"]+)\"\]/);
    if (match) {
      tag.setAttribute(match[1], match[2]);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute(attrName, value || '');
}

function setCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url || window.location.href);
}

function applySeo(content) {
  document.title = content.pageTitle || defaultContent.pageTitle;

  setMetaTag('meta[name="description"]', 'content', content.metaDescription || defaultContent.metaDescription);
  setMetaTag('meta[name="keywords"]', 'content', content.seoKeywords || defaultContent.seoKeywords);
  setMetaTag('meta[name="robots"]', 'content', content.seoRobots || defaultContent.seoRobots);

  setMetaTag('meta[property="og:type"]', 'content', 'website');
  setMetaTag('meta[property="og:title"]', 'content', content.ogTitle || content.pageTitle || defaultContent.ogTitle);
  setMetaTag('meta[property="og:description"]', 'content', content.ogDescription || content.metaDescription || defaultContent.ogDescription);
  setMetaTag('meta[property="og:image"]', 'content', content.ogImage || '');
  setMetaTag('meta[property="og:url"]', 'content', content.ogUrl || content.canonicalUrl || window.location.href);

  setMetaTag('meta[name="twitter:card"]', 'content', content.twitterCard || defaultContent.twitterCard);
  setMetaTag('meta[name="twitter:title"]', 'content', content.twitterTitle || content.ogTitle || content.pageTitle || defaultContent.twitterTitle);
  setMetaTag('meta[name="twitter:description"]', 'content', content.twitterDescription || content.ogDescription || content.metaDescription || defaultContent.twitterDescription);
  setMetaTag('meta[name="twitter:image"]', 'content', content.twitterImage || content.ogImage || '');

  setCanonical(content.canonicalUrl || window.location.href);
}

function renderContent(content, cloudRef) {
  applySeo(content);
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    favicon.setAttribute('href', content.faviconUrl || DEFAULT_FAVICON_URL);
  }

  const welcomeTitle = document.getElementById('welcome-title');
  const welcomeDescription = document.getElementById('welcome-description');
  const aboutText = document.getElementById('about-text');
  const contactName = document.getElementById('contact-name');
  const contactHandle = document.getElementById('contact-handle');
  const contactLink = document.getElementById('contact-link');
  const tgAvatar = document.getElementById('tg-avatar');
  const donationFootnote = document.getElementById('donation-footnote');
  const footerText = document.getElementById('footer-text');

  if (welcomeTitle) welcomeTitle.textContent = content.welcomeTitle;
  if (welcomeDescription) welcomeDescription.innerHTML = content.welcomeDescription;
  if (aboutText) aboutText.innerHTML = toHtmlWithLineBreaks(content.about);
  if (contactName) contactName.textContent = content.contact.name;
  if (contactHandle) contactHandle.textContent = content.contact.handle;
  if (contactLink) contactLink.href = content.contact.url || '#';
  if (tgAvatar) {
    tgAvatar.src = content.contact.avatarUrl || '';
    tgAvatar.onload = () => tgAvatar.setAttribute('aria-hidden', 'false');
  }
  if (donationFootnote) donationFootnote.textContent = content.donationFootnote;
  if (footerText) footerText.innerHTML = `<div>${content.footerHtml}</div>`;

  renderProjects(content.projects);
  renderSkills(content.skills);
  renderDonations(content.donations);
  renderHeroAvatar(content.heroAvatarUrl);
  renderProfileCard(content.profileCard || {}, content.heroAvatarUrl || content.contact.avatarUrl || '');
  bindExternalClickTracking(() => cloudRef.value);
}

function updateStatsView(stats) {
  const visits = document.getElementById('visits-total');
  const clicks = document.getElementById('external-clicks-total');
  if (visits) visits.textContent = String(stats.visitsTotal);
  if (clicks) clicks.textContent = String(stats.externalClicksTotal);
}

function renderAdminStats(stats) {
  const out = document.getElementById('admin-stats-breakdown');
  if (!out) return;
  const sorted = Object.entries(stats.externalByUrl || {}).sort((a, b) => b[1] - a[1]);
  const lines = sorted.length
    ? sorted.map(([url, count]) => `${count.toString().padStart(4, ' ')} × ${url}`).join('\n')
    : 'нет переходов по ссылкам';
  out.textContent = `visits: ${stats.visitsTotal}\nexternal clicks: ${stats.externalClicksTotal}\n\nby url:\n${lines}`;
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU');
}

function updateCloudStatusView(cloudState) {
  const mode = document.getElementById('cloud-status-mode');
  const api = document.getElementById('cloud-status-api');
  const content = document.getElementById('cloud-status-content');
  const stats = document.getElementById('cloud-status-stats');
  const lastSync = document.getElementById('cloud-status-last-sync');
  if (!mode || !api || !content || !stats || !lastSync) return;

  mode.textContent = cloudState.enabled ? (cloudState.autoSync ? 'enabled (auto)' : 'enabled (manual)') : 'off';
  api.textContent = cloudState.apiMessage || 'unknown';
  content.textContent = cloudState.contentMessage || 'idle';
  stats.textContent = cloudState.statsMessage || 'idle';
  lastSync.textContent = formatDateTime(cloudState.lastSyncAt);
}

async function syncContentFromCloud(cloudConfig, contentRef, cloudRef, cloudState) {
  if (!isCloudConfigured(cloudConfig)) {
    cloudState.contentMessage = 'cloud off';
    updateCloudStatusView(cloudState);
    return null;
  }

  const remote = await cloudPullContent(cloudConfig);
  if (!remote) {
    cloudState.contentMessage = 'empty';
    updateCloudStatusView(cloudState);
    return null;
  }

  applyCloudMirrorFromContent(remote, cloudRef);

  const remoteTime = Date.parse(remote.updatedAt || '') || 0;
  const localTime = Date.parse(contentRef.value.updatedAt || '') || 0;
  if (remoteTime > localTime) {
    contentRef.value = normalizeContent(remote);
    saveContent(contentRef.value);
    renderContent(contentRef.value, cloudRef);
    writeAdminForm(contentRef.value, cloudRef.value);
    cloudState.contentMessage = 'updated from cloud';
  } else {
    cloudState.contentMessage = 'up to date';
  }
  cloudState.lastSyncAt = new Date().toISOString();
  updateCloudStatusView(cloudState);
  return contentRef.value;
}

async function syncStatsFromCloud(cloudConfig) {
  if (!isCloudConfigured(cloudConfig)) return null;
  const cloudStats = await cloudFetchStats(cloudConfig);
  if (!cloudStats) return null;
  saveStats(cloudStats);
  updateStatsView(cloudStats);
  renderAdminStats(cloudStats);
  return cloudStats;
}

async function syncStatsFromCloudWithState(cloudConfig, cloudState) {
  if (!isCloudConfigured(cloudConfig)) {
    cloudState.statsMessage = 'cloud off';
    updateCloudStatusView(cloudState);
    return null;
  }
  const cloudStats = await syncStatsFromCloud(cloudConfig);
  cloudState.statsMessage = cloudStats ? 'synced' : 'empty';
  cloudState.lastSyncAt = new Date().toISOString();
  updateCloudStatusView(cloudState);
  return cloudStats;
}

function startCloudPolling(contentRef, cloudRef, cloudState) {
  let timerId = null;

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const runCycle = async () => {
    const config = cloudRef.value;
    cloudState.enabled = isCloudConfigured(config);
    cloudState.autoSync = Boolean(config.autoSync);
    if (!cloudState.enabled) {
      cloudState.apiMessage = 'cloud off';
      cloudState.contentMessage = 'cloud off';
      cloudState.statsMessage = 'cloud off';
      updateCloudStatusView(cloudState);
      return;
    }

    const health = await cloudCheckApi(config);
    cloudState.apiMessage = health.message;
    updateCloudStatusView(cloudState);
    if (!health.ok) return;

    try {
      await syncContentFromCloud(config, contentRef, cloudRef, cloudState);
      await syncStatsFromCloudWithState(config, cloudState);
    } catch {
      cloudState.contentMessage = 'sync error';
      cloudState.statsMessage = 'sync error';
      updateCloudStatusView(cloudState);
    }
  };

  const restart = () => {
    stop();
    runCycle();
    const config = cloudRef.value;
    if (!config.autoSync) {
      cloudState.contentMessage = 'manual only';
      cloudState.statsMessage = 'manual only';
      updateCloudStatusView(cloudState);
      return;
    }
    timerId = window.setInterval(runCycle, sanitizePollIntervalMs(config.pollIntervalMs));
  };

  return { restart, stop, runCycle };
}

function trackExternalClick(url, cloudConfig) {
  const stats = trackExternalClickLocal(url);
  updateStatsView(stats);
  renderAdminStats(stats);
  if (!isCloudConfigured(cloudConfig)) return;
  cloudTrackEvent(cloudConfig, 'external_click', url)
    .then(() => syncStatsFromCloud(cloudConfig))
    .catch(() => {});
}

function bindExternalClickTracking(getCloudConfig) {
  document.querySelectorAll('a[href^="http"]').forEach((a) => {
    if (a.dataset.trackBound === '1') return;
    a.dataset.trackBound = '1';
    a.addEventListener('click', () => {
      trackExternalClick(a.href, getCloudConfig());
    });
  });
}

function setupReveal() {
  document.querySelectorAll('.block').forEach((el) => {
    el.setAttribute('data-reveal', '');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('show');
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

function setupTypewriter(initialText) {
  const target = document.getElementById('welcome-title');
  const caret = document.querySelector('.typewriter .caret');
  if (!target || !caret) return;

  target.textContent = '';
  let index = 0;
  const text = initialText || 'welcome!';

  const tick = () => {
    if (index <= text.length) {
      target.textContent = text.slice(0, index++);
      requestAnimationFrame(tick);
    } else {
      caret.style.opacity = '0.6';
    }
  };

  requestAnimationFrame(tick);
}

function getAdminFields() {
  return {
    lockWrap: document.getElementById('admin-lock-wrap'),
    inner: document.getElementById('admin-inner'),
    passwordInput: document.getElementById('admin-password-input'),
    unlockButton: document.getElementById('admin-unlock'),
    pageTitle: document.getElementById('admin-page-title'),
    metaDescription: document.getElementById('admin-meta-description'),
    seoKeywords: document.getElementById('admin-seo-keywords'),
    seoRobots: document.getElementById('admin-seo-robots'),
    canonicalUrl: document.getElementById('admin-canonical-url'),
    ogTitle: document.getElementById('admin-og-title'),
    ogDescription: document.getElementById('admin-og-description'),
    ogImage: document.getElementById('admin-og-image'),
    ogUrl: document.getElementById('admin-og-url'),
    twitterCard: document.getElementById('admin-twitter-card'),
    twitterTitle: document.getElementById('admin-twitter-title'),
    twitterDescription: document.getElementById('admin-twitter-description'),
    twitterImage: document.getElementById('admin-twitter-image'),
    faviconUrl: document.getElementById('admin-favicon-url'),
    welcomeTitle: document.getElementById('admin-welcome-title'),
    welcomeDescription: document.getElementById('admin-welcome-description'),
    about: document.getElementById('admin-about'),
    heroAvatarUrl: document.getElementById('admin-hero-avatar-url'),
    heroAvatarFile: document.getElementById('admin-hero-avatar-file'),
    profilePhotoUrl: document.getElementById('admin-profile-photo-url'),
    profilePhotoFile: document.getElementById('admin-profile-photo-file'),
    profileTitle: document.getElementById('admin-profile-title'),
    profileBadge: document.getElementById('admin-profile-badge'),
    profileLink: document.getElementById('admin-profile-link'),
    projects: document.getElementById('admin-projects'),
    skills: document.getElementById('admin-skills'),
    contactName: document.getElementById('admin-contact-name'),
    contactHandle: document.getElementById('admin-contact-handle'),
    contactUrl: document.getElementById('admin-contact-url'),
    contactAvatarUrl: document.getElementById('admin-contact-avatar-url'),
    donations: document.getElementById('admin-donations'),
    donationFootnote: document.getElementById('admin-donation-footnote'),
    footer: document.getElementById('admin-footer'),
    cloudEnabled: document.getElementById('admin-cloud-enabled'),
    cloudAutoSync: document.getElementById('admin-cloud-auto-sync'),
    cloudInterval: document.getElementById('admin-cloud-interval'),
    cloudUrl: document.getElementById('admin-cloud-url'),
    cloudKey: document.getElementById('admin-cloud-key'),
    cloudContentTable: document.getElementById('admin-cloud-content-table'),
    cloudEventsTable: document.getElementById('admin-cloud-events-table'),
    cloudRowKey: document.getElementById('admin-cloud-row-key'),
    lockButton: document.getElementById('admin-lock'),
    changePasswordButton: document.getElementById('admin-change-password'),
    status: document.getElementById('admin-status')
  };
}

function writeAdminForm(content, cloud) {
  const fields = getAdminFields();
  fields.pageTitle.value = content.pageTitle || defaultContent.pageTitle;
  fields.metaDescription.value = content.metaDescription || defaultContent.metaDescription;
  fields.seoKeywords.value = content.seoKeywords || defaultContent.seoKeywords;
  fields.seoRobots.value = content.seoRobots || defaultContent.seoRobots;
  fields.canonicalUrl.value = content.canonicalUrl || '';
  fields.ogTitle.value = content.ogTitle || defaultContent.ogTitle;
  fields.ogDescription.value = content.ogDescription || defaultContent.ogDescription;
  fields.ogImage.value = content.ogImage || '';
  fields.ogUrl.value = content.ogUrl || '';
  fields.twitterCard.value = content.twitterCard || defaultContent.twitterCard;
  fields.twitterTitle.value = content.twitterTitle || defaultContent.twitterTitle;
  fields.twitterDescription.value = content.twitterDescription || defaultContent.twitterDescription;
  fields.twitterImage.value = content.twitterImage || '';
  fields.faviconUrl.value = content.faviconUrl || DEFAULT_FAVICON_URL;
  fields.welcomeTitle.value = content.welcomeTitle;
  fields.welcomeDescription.value = content.welcomeDescription;
  fields.about.value = content.about;
  fields.heroAvatarUrl.value = content.heroAvatarUrl || '';
  fields.profilePhotoUrl.value = content.profileCard?.imageUrl || '';
  fields.profileTitle.value = content.profileCard?.title || '';
  fields.profileBadge.value = content.profileCard?.badge || '';
  fields.profileLink.value = content.profileCard?.link || '';
  fields.projects.value = JSON.stringify(content.projects, null, 2);
  fields.skills.value = content.skills.join('\n');
  fields.contactName.value = content.contact.name;
  fields.contactHandle.value = content.contact.handle;
  fields.contactUrl.value = content.contact.url;
  fields.contactAvatarUrl.value = content.contact.avatarUrl || '';
  fields.donations.value = JSON.stringify(content.donations, null, 2);
  fields.donationFootnote.value = content.donationFootnote;
  fields.footer.value = content.footerHtml;

  fields.cloudEnabled.checked = cloud.enabled;
  fields.cloudAutoSync.checked = cloud.autoSync !== false;
  fields.cloudInterval.value = String(sanitizePollIntervalMs(cloud.pollIntervalMs));
  fields.cloudUrl.value = cloud.url;
  fields.cloudKey.value = cloud.anonKey;
  fields.cloudContentTable.value = cloud.contentTable;
  fields.cloudEventsTable.value = cloud.eventsTable;
  fields.cloudRowKey.value = cloud.rowKey;
}

function status(message, isError = false) {
  const fields = getAdminFields();
  if (!fields.status) return;
  fields.status.textContent = message;
  fields.status.style.color = isError ? '#ff9f9f' : '';
}

function readAdminContentForm(currentContent) {
  const fields = getAdminFields();
  const next = clone(currentContent);

  next.pageTitle = fields.pageTitle.value.trim() || defaultContent.pageTitle;
  next.metaDescription = fields.metaDescription.value.trim() || defaultContent.metaDescription;
  next.seoKeywords = fields.seoKeywords.value.trim() || defaultContent.seoKeywords;
  next.seoRobots = fields.seoRobots.value.trim() || defaultContent.seoRobots;
  next.canonicalUrl = fields.canonicalUrl.value.trim();
  next.ogTitle = fields.ogTitle.value.trim() || next.pageTitle;
  next.ogDescription = fields.ogDescription.value.trim() || next.metaDescription;
  next.ogImage = fields.ogImage.value.trim();
  next.ogUrl = fields.ogUrl.value.trim() || next.canonicalUrl;
  next.twitterCard = fields.twitterCard.value.trim() || defaultContent.twitterCard;
  next.twitterTitle = fields.twitterTitle.value.trim() || next.ogTitle;
  next.twitterDescription = fields.twitterDescription.value.trim() || next.ogDescription;
  next.twitterImage = fields.twitterImage.value.trim() || next.ogImage;
  next.faviconUrl = fields.faviconUrl.value.trim() || DEFAULT_FAVICON_URL;
  next.welcomeTitle = fields.welcomeTitle.value.trim() || 'welcome!';
  next.welcomeDescription = fields.welcomeDescription.value.trim() || defaultContent.welcomeDescription;
  next.about = fields.about.value.trim();
  next.heroAvatarUrl = fields.heroAvatarUrl.value.trim();
  next.profileCard = {
    imageUrl: fields.profilePhotoUrl.value.trim(),
    title: fields.profileTitle.value.trim() || defaultContent.profileCard.title,
    badge: fields.profileBadge.value.trim() || defaultContent.profileCard.badge,
    link: fields.profileLink.value.trim() || '#'
  };
  next.projects = JSON.parse(fields.projects.value || '[]');
  next.skills = fields.skills.value.split('\n').map((s) => s.trim()).filter(Boolean);
  next.contact.name = fields.contactName.value.trim();
  next.contact.handle = fields.contactHandle.value.trim();
  next.contact.url = fields.contactUrl.value.trim();
  next.contact.avatarUrl = fields.contactAvatarUrl.value.trim();
  next.donations = JSON.parse(fields.donations.value || '[]');
  next.donationFootnote = fields.donationFootnote.value.trim();
  next.footerHtml = fields.footer.value.trim();
  next.updatedAt = new Date().toISOString();

  if (!Array.isArray(next.projects) || !Array.isArray(next.donations)) {
    throw new Error('projects/donations должны быть JSON-массивами');
  }

  return normalizeContent(next);
}

function readCloudForm() {
  const fields = getAdminFields();
  return normalizeCloudConfig({
    enabled: fields.cloudEnabled.checked,
    autoSync: fields.cloudAutoSync.checked,
    pollIntervalMs: fields.cloudInterval.value,
    url: fields.cloudUrl.value,
    anonKey: fields.cloudKey.value,
    contentTable: fields.cloudContentTable.value,
    eventsTable: fields.cloudEventsTable.value,
    rowKey: fields.cloudRowKey.value
  });
}

function replaceSelectionOrCurrentLine(field, transform) {
  const value = field.value || '';
  const start = field.selectionStart ?? 0;
  const end = field.selectionEnd ?? start;

  let rangeStart = start;
  let rangeEnd = end;
  if (start === end) {
    rangeStart = value.lastIndexOf('\n', start - 1) + 1;
    const nextBreak = value.indexOf('\n', start);
    rangeEnd = nextBreak === -1 ? value.length : nextBreak;
  }

  const selected = value.slice(rangeStart, rangeEnd);
  const updated = transform(selected);
  field.value = value.slice(0, rangeStart) + updated + value.slice(rangeEnd);

  const caret = rangeStart + updated.length;
  field.setSelectionRange(caret, caret);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

function setupAdminFormatter() {
  const buttons = document.querySelectorAll('#admin-format-tools [data-format-action]');
  if (!buttons.length) return;

  let activeField = null;
  const editableFields = document.querySelectorAll('#admin-inner textarea, #admin-inner input[type="text"]');
  editableFields.forEach((field) => {
    if (field.id.startsWith('admin-cloud-') || field.id === 'admin-password-input') return;
    field.addEventListener('focus', () => {
      activeField = field;
    });
  });

  const wrap = (left, right) => (text) => `${left}${text}${right}`;
  const prefix = (textPrefix) => (text) => {
    if (!text) return `${textPrefix}`;
    return text.startsWith(textPrefix) ? text : `${textPrefix}${text}`;
  };

  const actions = {
    bold: wrap('<strong>', '</strong>'),
    italic: wrap('<em>', '</em>'),
    underline: wrap('<u>', '</u>'),
    heading: wrap('<h3>', '</h3>'),
    code: wrap('<code>', '</code>'),
    bullet: prefix('• '),
    linebreak: (text) => `${text}<br>`
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!activeField) return;
      const action = button.getAttribute('data-format-action') || '';
      const formatter = actions[action];
      if (!formatter) return;
      replaceSelectionOrCurrentLine(activeField, formatter);
      activeField.focus();
    });
  });
}

function setAdminAccessView(unlocked) {
  const fields = getAdminFields();
  if (!fields.lockWrap || !fields.inner) return;
  fields.lockWrap.classList.toggle('hidden', unlocked);
  fields.inner.classList.toggle('hidden', !unlocked);
}

async function unlockAdminFromInput() {
  const fields = getAdminFields();
  const entered = (fields.passwordInput?.value || '').trim();
  const savedHash = getAdminPassHash();
  if (!savedHash) {
    if (entered.length < 4) {
      status('придумайте пароль минимум 4 символа', true);
      return false;
    }
    const hash = await sha256(entered);
    setAdminPassHash(hash);
    setAdminUnlocked(true);
    setAdminAccessView(true);
    if (fields.passwordInput) fields.passwordInput.value = '';
    status('пароль создан, админка разблокирована');
    return true;
  }

  const enteredHash = await sha256(entered);
  if (enteredHash !== savedHash) {
    status('неверный пароль', true);
    return false;
  }

  setAdminUnlocked(true);
  setAdminAccessView(true);
  if (fields.passwordInput) fields.passwordInput.value = '';
  status('админка разблокирована');
  return true;
}

function setupAdmin(contentRef, cloudRef, cloudState, cloudPolling) {
  const adminSection = document.getElementById('admin');
  const adminToggle = document.getElementById('admin-toggle');
  const adminContent = document.getElementById('admin-content');
  const saveButton = document.getElementById('admin-save');
  const resetButton = document.getElementById('admin-reset');
  const exportButton = document.getElementById('admin-export');
  const importButton = document.getElementById('admin-import');
  const importFile = document.getElementById('admin-import-file');
  const clearStatsButton = document.getElementById('admin-clear-stats');
  const cloudPullButton = document.getElementById('admin-cloud-pull');
  const cloudPushButton = document.getElementById('admin-cloud-push');
  const cloudSyncStatsButton = document.getElementById('admin-cloud-sync-stats');
  const fields = getAdminFields();
  setupAdminFormatter();

  if (!adminSection || !adminToggle || !adminContent || !saveButton || !resetButton || !exportButton || !importButton || !importFile || !clearStatsButton || !cloudPullButton || !cloudPushButton || !cloudSyncStatsButton || !fields.unlockButton || !fields.passwordInput || !fields.lockButton || !fields.changePasswordButton) return;

  const isOpen = localStorage.getItem(STORAGE_ADMIN_OPEN_KEY) === '1';
  adminContent.classList.toggle('hidden', !isOpen);
  adminSection.classList.toggle('admin-pinned', isOpen);
  adminToggle.textContent = isOpen ? 'close admin' : 'open admin';

  adminToggle.addEventListener('click', () => {
    const open = adminContent.classList.contains('hidden');
    adminContent.classList.toggle('hidden', !open);
    adminSection.classList.toggle('admin-pinned', open);
    adminToggle.textContent = open ? 'close admin' : 'open admin';
    localStorage.setItem(STORAGE_ADMIN_OPEN_KEY, open ? '1' : '0');
  });

  const hasPassword = Boolean(getAdminPassHash());
  const unlocked = hasPassword ? isAdminUnlocked() : false;
  setAdminAccessView(unlocked);
  if (!hasPassword) {
    status('введите новый пароль и нажмите unlock');
  }

  fields.unlockButton.addEventListener('click', async () => {
    await unlockAdminFromInput();
  });

  fields.passwordInput.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    await unlockAdminFromInput();
  });

  const ensureUnlocked = () => {
    if (isAdminUnlocked()) return true;
    status('сначала разблокируйте админку паролем', true);
    setAdminAccessView(false);
    return false;
  };

  const persistCloudDraft = () => {
    if (!ensureUnlocked()) return;
    cloudRef.value = readCloudForm();
    cloudState.enabled = isCloudConfigured(cloudRef.value);
    cloudState.autoSync = Boolean(cloudRef.value.autoSync);
    saveCloudConfig(cloudRef.value);
    updateCloudStatusView(cloudState);
  };

  const applyCloudSettingsFromFields = () => {
    if (!ensureUnlocked()) return;
    cloudRef.value = readCloudForm();
    cloudState.enabled = isCloudConfigured(cloudRef.value);
    cloudState.autoSync = Boolean(cloudRef.value.autoSync);
    saveCloudConfig(cloudRef.value);
    updateCloudStatusView(cloudState);
    cloudPolling.restart();
    status(`auto sync ${cloudRef.value.autoSync ? 'on' : 'off'} (${sanitizePollIntervalMs(cloudRef.value.pollIntervalMs) / 1000}s)`);
  };

  fields.cloudAutoSync?.addEventListener('change', applyCloudSettingsFromFields);
  fields.cloudInterval?.addEventListener('change', applyCloudSettingsFromFields);
  fields.cloudEnabled?.addEventListener('change', applyCloudSettingsFromFields);
  fields.cloudUrl?.addEventListener('input', persistCloudDraft);
  fields.cloudKey?.addEventListener('input', persistCloudDraft);
  fields.cloudContentTable?.addEventListener('change', persistCloudDraft);
  fields.cloudEventsTable?.addEventListener('change', persistCloudDraft);
  fields.cloudRowKey?.addEventListener('input', persistCloudDraft);

  fields.heroAvatarFile.addEventListener('change', () => {
    if (!ensureUnlocked()) return;
    const file = fields.heroAvatarFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      fields.heroAvatarUrl.value = String(reader.result || '');
      status('аватар загружен, нажмите save changes');
    };
    reader.readAsDataURL(file);
  });

  fields.profilePhotoFile?.addEventListener('change', () => {
    if (!ensureUnlocked()) return;
    const file = fields.profilePhotoFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (fields.profilePhotoUrl) fields.profilePhotoUrl.value = String(reader.result || '');
      status('фото профиля загружено, нажмите save changes');
    };
    reader.readAsDataURL(file);
  });

  saveButton.addEventListener('click', async () => {
    if (!ensureUnlocked()) return;
    try {
      const next = readAdminContentForm(contentRef.value);
      const cloud = readCloudForm();
      cloudRef.value = cloud;
      cloudState.enabled = isCloudConfigured(cloudRef.value);
      saveCloudConfig(cloud);

      contentRef.value = next;
      saveContent(next);
      renderContent(next, cloudRef);
      setupTypewriter(next.welcomeTitle);

      if (isCloudConfigured(cloudRef.value)) {
        const savedRemote = await cloudPushContent(cloudRef.value, contentRef.value);
        if (savedRemote) {
          contentRef.value = normalizeContent(savedRemote);
          saveContent(contentRef.value);
        }
        cloudState.contentMessage = 'pushed';
        cloudState.lastSyncAt = new Date().toISOString();
      }

      updateCloudStatusView(cloudState);
      cloudPolling.restart();
      status('сохранено');
    } catch (error) {
      status(error instanceof Error ? error.message : 'ошибка сохранения', true);
    }
  });

  resetButton.addEventListener('click', async () => {
    if (!ensureUnlocked()) return;
    try {
      contentRef.value = normalizeContent(clone(defaultContent));
      contentRef.value.updatedAt = new Date().toISOString();
      saveContent(contentRef.value);
      renderContent(contentRef.value, cloudRef);
      setupTypewriter(contentRef.value.welcomeTitle);
      writeAdminForm(contentRef.value, cloudRef.value);

      if (isCloudConfigured(cloudRef.value)) {
        await cloudPushContent(cloudRef.value, contentRef.value);
        cloudState.contentMessage = 'reset + pushed';
        cloudState.lastSyncAt = new Date().toISOString();
      }

      updateCloudStatusView(cloudState);
      cloudPolling.restart();
      status('сброшено к оригиналу');
    } catch {
      status('ошибка при сбросе', true);
    }
  });

  exportButton.addEventListener('click', () => {
    if (!ensureUnlocked()) return;
    const data = JSON.stringify(contentRef.value, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-content-export.json';
    a.click();
    URL.revokeObjectURL(url);
    status('экспортировано');
  });

  importButton.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', () => {
    if (!ensureUnlocked()) return;
    const file = importFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const merged = normalizeContent(parsed);
        merged.updatedAt = new Date().toISOString();
        contentRef.value = merged;
        saveContent(merged);
        writeAdminForm(merged, cloudRef.value);
        renderContent(merged, cloudRef);
        setupTypewriter(merged.welcomeTitle);
        status('импортировано');
      } catch {
        status('неверный JSON файл', true);
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  cloudPullButton.addEventListener('click', async () => {
    if (!ensureUnlocked()) return;
    try {
      cloudRef.value = readCloudForm();
      cloudState.enabled = isCloudConfigured(cloudRef.value);
      saveCloudConfig(cloudRef.value);
      if (!isCloudConfigured(cloudRef.value)) {
        status('заполните Supabase URL и anon key + включите cloud mode', true);
        return;
      }
      const cloudData = await syncContentFromCloud(cloudRef.value, contentRef, cloudRef, cloudState);
      if (!cloudData) {
        status('в облаке пока нет контента');
        return;
      }
      setupTypewriter(contentRef.value.welcomeTitle);
      cloudPolling.restart();
      status('контент загружен из облака');
    } catch (error) {
      status(error instanceof Error ? error.message : 'cloud pull error', true);
    }
  });

  cloudPushButton.addEventListener('click', async () => {
    if (!ensureUnlocked()) return;
    try {
      cloudRef.value = readCloudForm();
      cloudState.enabled = isCloudConfigured(cloudRef.value);
      saveCloudConfig(cloudRef.value);
      if (!isCloudConfigured(cloudRef.value)) {
        status('заполните Supabase URL и anon key + включите cloud mode', true);
        return;
      }
      contentRef.value = readAdminContentForm(contentRef.value);
      saveContent(contentRef.value);
      await cloudPushContent(cloudRef.value, contentRef.value);
      cloudState.contentMessage = 'pushed';
      cloudState.lastSyncAt = new Date().toISOString();
      updateCloudStatusView(cloudState);
      cloudPolling.restart();
      status('контент отправлен в облако');
    } catch (error) {
      status(error instanceof Error ? error.message : 'cloud push error', true);
    }
  });

  cloudSyncStatsButton.addEventListener('click', async () => {
    if (!ensureUnlocked()) return;
    try {
      cloudRef.value = readCloudForm();
      cloudState.enabled = isCloudConfigured(cloudRef.value);
      saveCloudConfig(cloudRef.value);
      if (!isCloudConfigured(cloudRef.value)) {
        status('заполните Supabase URL и anon key + включите cloud mode', true);
        return;
      }
      await syncStatsFromCloudWithState(cloudRef.value, cloudState);
      cloudPolling.restart();
      status('статистика синхронизирована с облаком');
    } catch (error) {
      status(error instanceof Error ? error.message : 'cloud stats sync error', true);
    }
  });

  clearStatsButton.addEventListener('click', async () => {
    if (!ensureUnlocked()) return;
    try {
      const empty = { visitsTotal: 0, externalClicksTotal: 0, externalByUrl: {} };
      saveStats(empty);
      updateStatsView(empty);
      renderAdminStats(empty);

      cloudRef.value = readCloudForm();
      cloudState.enabled = isCloudConfigured(cloudRef.value);
      saveCloudConfig(cloudRef.value);
      if (isCloudConfigured(cloudRef.value)) {
        await cloudClearStats(cloudRef.value);
        cloudState.statsMessage = 'cleared';
        cloudState.lastSyncAt = new Date().toISOString();
      }

      updateCloudStatusView(cloudState);
      cloudPolling.restart();
      status('статистика очищена');
    } catch (error) {
      status(error instanceof Error ? error.message : 'ошибка очистки статистики', true);
    }
  });

  fields.lockButton.addEventListener('click', () => {
    setAdminUnlocked(false);
    setAdminAccessView(false);
    status('админка заблокирована');
  });

  fields.changePasswordButton.addEventListener('click', async () => {
    if (!ensureUnlocked()) return;
    const current = prompt('Текущий пароль');
    if (current === null) return;
    const currentHash = await sha256(current.trim());
    if (currentHash !== getAdminPassHash()) {
      status('текущий пароль неверный', true);
      return;
    }
    const next = prompt('Новый пароль (минимум 4 символа)');
    if (next === null) return;
    if (next.trim().length < 4) {
      status('слишком короткий пароль', true);
      return;
    }
    setAdminPassHash(await sha256(next.trim()));
    status('пароль обновлен');
  });
}

(async function init() {
  const contentRef = { value: loadContent() };
  const cloudRef = { value: loadCloudConfig() };
  const cloudState = {
    enabled: isCloudConfigured(cloudRef.value),
    autoSync: Boolean(cloudRef.value.autoSync),
    apiMessage: 'unknown',
    contentMessage: 'idle',
    statsMessage: 'idle',
    lastSyncAt: ''
  };
  const cloudPolling = startCloudPolling(contentRef, cloudRef, cloudState);

  if (isCloudConfigured(cloudRef.value)) {
    try {
      await syncContentFromCloud(cloudRef.value, contentRef, cloudRef, cloudState);
    } catch {}
  } else {
    updateCloudStatusView(cloudState);
  }

  renderContent(contentRef.value, cloudRef);
  setupTypewriter(contentRef.value.welcomeTitle);
  setupReveal();
  writeAdminForm(contentRef.value, cloudRef.value);

  const localStats = trackVisitLocal();
  updateStatsView(localStats);
  renderAdminStats(localStats);

  if (isCloudConfigured(cloudRef.value)) {
    try {
      await cloudTrackEvent(cloudRef.value, 'visit');
      await syncStatsFromCloudWithState(cloudRef.value, cloudState);
    } catch {}
  }

  setupAdmin(contentRef, cloudRef, cloudState, cloudPolling);
  cloudPolling.restart();
})();
