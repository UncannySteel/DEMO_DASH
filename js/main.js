import { overview, plans, workspaces } from './config.js';
import { initCursor } from './cursor.js';
import { initDock } from './dock.js';
import { hydrateIcons, icon } from './icons.js';
import { reducedMotion, riseWords } from './motion.js';
import * as services from './services.js';
import { initSettings } from './settings.js';
import { initSubscription } from './subscription.js';
import { toast, transition } from './util.js';
import { renderWorkspace } from './workspaces.js';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const $ = (id) => document.getElementById(id);
const app = $('app');
const nav = $('nav');
const workspaceEl = $('workspace');

let user = null;

// ---------- Profile ----------

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

function renderUser() {
  const values = {
    name: user.name,
    email: user.email,
    credits: user.credits.toLocaleString(),
    plan: plans.find((p) => p.id === user.plan)?.name ?? '',
  };
  app.querySelectorAll('[data-bind]').forEach((el) => {
    el.textContent = values[el.dataset.bind] ?? '';
  });
  $('plan-tag').dataset.plan = user.plan;

  const avatar = $('avatar');
  if (user.avatarUrl) {
    const img = new Image();
    img.src = user.avatarUrl;
    img.alt = '';
    avatar.replaceChildren(img);
  } else {
    avatar.textContent = initials(user.name);
  }
  avatar.setAttribute('aria-label', `${user.name}'s avatar`);
  avatar.setAttribute('role', 'img');

  $('tagline').textContent = `Welcome back, ${user.name.split(' ')[0]}. Pick up where you left off.`;
}

// ---------- Navigation + routing (#/<workspace-id>, empty hash = dashboard) ----------

// Each item is numbered like a landing chapter (00 is the overview). Its label
// carries an italic twin for the home cards' hover roll (aria-hidden, so the
// name is read once).
function renderNav() {
  const items = [overview, ...workspaces];
  nav.innerHTML = '<span class="nav-thumb" aria-hidden="true"></span>' + items
    .map((item, n) => {
      const href = item === overview ? '#/' : `#/${item.id}`;
      return `<a class="nav-link" href="${href}" data-id="${item.id}" title="${item.label}"
                 style="view-transition-name: nav-${item.id}; --n: ${n}">
                <span class="nav-num" aria-hidden="true">${String(n).padStart(2, '0')}</span>
                ${icon(item.icon, 20)}<span class="nav-label"><span class="nav-word">${item.label}</span><span class="nav-word nav-word-alt" aria-hidden="true">${item.label}</span></span>
              </a>`;
    })
    .join('');
}

// Slides the dock's citrine thumb to the open workspace. `instant` places it
// without the slide: when the dock has just appeared, or the layout changed.
function moveThumb({ instant = false } = {}) {
  const active = nav.querySelector('.nav-link[aria-current="page"]');
  if (!active || app.dataset.view !== 'workspace') return;
  if (instant) nav.classList.add('is-placing');
  nav.style.setProperty('--thumb-y', `${active.offsetTop}px`);
  nav.style.setProperty('--thumb-h', `${active.offsetHeight}px`);
  if (instant) {
    nav.offsetHeight; // commit the new place before transitions come back
    nav.classList.remove('is-placing');
  }
}

const routeId = () => decodeURIComponent(location.hash.replace(/^#\/?/, ''));
const routeView = () => (workspaces.some((w) => w.id === routeId()) ? 'workspace' : 'home');

function renderRoute() {
  const ws = workspaces.find((w) => w.id === routeId()) ?? null;
  const dockAppears = app.dataset.view !== 'workspace';
  app.dataset.view = ws ? 'workspace' : 'home';

  nav.querySelectorAll('.nav-link').forEach((link) => {
    const active = link.dataset.id === (ws ? ws.id : overview.id);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (ws) renderWorkspace(workspaceEl, ws, workspaces.indexOf(ws) + 1);
  else workspaceEl.replaceChildren();
  document.title = ws ? `${ws.label} — Onextap` : 'Dashboard — Onextap';
  dock.refresh();
  moveThumb({ instant: dockAppears });
}

// ---------- Settings actions ----------

const deleteDialog = $('delete-dialog');
const deleteConfirm = $('delete-confirm');
const deleteSubmit = $('delete-submit');
const avatarInput = $('avatar-input');

const subscription = initSubscription({
  dialog: $('subscription-dialog'),
  getUser: () => user,
  onChange: (change) => {
    Object.assign(user, change);
    renderUser();
  },
});

const actions = {
  'change-avatar': () => avatarInput.click(),
  'manage-subscription': () => user && subscription.open(),
  'log-out': async () => {
    await services.logOut();
    toast('You’ve been logged out.');
  },
  'delete-account': () => {
    deleteConfirm.value = '';
    deleteSubmit.disabled = true;
    deleteDialog.returnValue = '';
    deleteDialog.showModal();
  },
};

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  avatarInput.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return toast('Please choose an image file.');
  if (file.size > MAX_AVATAR_BYTES) return toast('Images must be 5 MB or smaller.');
  try {
    user.avatarUrl = await services.updateAvatar(file);
    renderUser();
    toast('Avatar updated.');
  } catch {
    toast('Couldn’t update your avatar. Try again.');
  }
});

deleteConfirm.addEventListener('input', () => {
  deleteSubmit.disabled = deleteConfirm.value.trim() !== 'DELETE';
});

deleteDialog.addEventListener('close', async () => {
  if (deleteDialog.returnValue !== 'confirm') return;
  try {
    await services.deleteAccount();
    toast('Your account has been deleted.');
  } catch {
    toast('Couldn’t delete your account. Try again.');
  }
});

// ---------- Boot ----------

hydrateIcons();
renderNav();

const dock = initDock({
  app,
  dock: $('dock'),
  handle: $('dock-bar'),
  resizer: $('dock-resize'),
  hints: [...document.querySelectorAll('.snap-hint')],
});

initSettings({
  root: $('settings'),
  trigger: $('settings-trigger'),
  menu: $('settings-menu'),
  onAction: (name) => actions[name]?.(),
});

initCursor(app);

renderRoute();
// The kind of move tells the CSS how to deal the workspace sheet.
addEventListener('hashchange', () => {
  const from = app.dataset.view;
  const to = routeView();
  const kind = from === 'home' ? (to === 'workspace' ? 'enter' : '') : to === 'workspace' ? 'swap' : 'leave';
  transition(renderRoute, kind);
});
addEventListener('resize', () => moveThumb({ instant: true }));
document.fonts?.ready.then(() => moveThumb({ instant: true }));

user = await services.getCurrentUser();
renderUser();
app.removeAttribute('aria-busy');

// The entrance, once: the name rises word by word, the rest follows on a stagger.
if (!reducedMotion.matches) {
  app.classList.add('is-entering');
  riseWords(app.querySelector('.user-name'), { delay: 150, restore: true });
  setTimeout(() => app.classList.remove('is-entering'), 1800);
}
