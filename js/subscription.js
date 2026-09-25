import { plans } from './config.js';
import * as services from './services.js';
import { toast } from './util.js';

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

function statusText(plan, user) {
  if (plan.price === '$0') return `You’re on ${plan.name}: free forever, no card on file.`;
  const renews = user.renewsOn ? ` It renews on ${dateFormat.format(new Date(`${user.renewsOn}T00:00`))}.` : '';
  return `You’re on ${plan.name}, ${plan.price} ${plan.period}.${renews}`;
}

/**
 * The Manage subscription panel: the plan you're on, both plans side by side
 * (as the landing page prices them), and a button to move to the other one.
 * `getUser()` returns the signed-in user; `onChange(change)` gets the new
 * { plan, renewsOn } once a move goes through.
 */
export function initSubscription({ dialog, getUser, onChange }) {
  const status = dialog.querySelector('[data-sub="status"]');
  const list = dialog.querySelector('[data-sub="plans"]');
  const billing = dialog.querySelector('[data-sub="billing"]');
  const done = dialog.querySelector('[data-sub="done"]');

  function render() {
    const user = getUser();
    const current = plans.find((p) => p.id === user.plan) ?? plans[0];
    const rank = plans.indexOf(current);
    status.textContent = statusText(current, user);
    list.innerHTML = plans
      .map((plan, i) => {
        const isCurrent = plan === current;
        const cta = isCurrent
          ? ''
          : i > rank
            ? `<button type="button" class="btn btn-solid plan-cta" data-plan="${plan.id}">Upgrade to ${plan.name} <span class="btn-arrow" aria-hidden="true">→</span></button>`
            : `<button type="button" class="btn btn-ghost plan-cta" data-plan="${plan.id}">Switch to ${plan.name}</button>`;
        return `<li class="plan"${isCurrent ? ' data-current' : ''}>
            <div class="plan-head">
              <h3 class="label plan-name">${plan.name}</h3>
              ${isCurrent ? '<span class="plan-badge">Current plan</span>' : ''}
            </div>
            <div class="plan-price"><span class="display">${plan.price}</span> <span class="plan-period">${plan.period}</span></div>
            <ul class="plan-features">${plan.features.map((f) => `<li>${f}</li>`).join('')}</ul>
            ${cta}
          </li>`;
      })
      .join('');
    // Billing and invoices only mean something on a paid plan.
    billing.hidden = current.price === '$0';
  }

  list.addEventListener('click', async (e) => {
    const button = e.target.closest('[data-plan]');
    if (!button) return;
    const plan = plans.find((p) => p.id === button.dataset.plan);
    list.querySelectorAll('button').forEach((b) => (b.disabled = true));
    button.textContent = button.classList.contains('btn-solid') ? 'Upgrading…' : 'Switching…';
    try {
      onChange(await services.changePlan(plan.id));
      toast(`You’re on ${plan.name} now.`);
    } catch {
      toast('Couldn’t change your plan. Try again.');
    }
    render();
    // The pressed button is gone with the re-render; keep focus in the panel.
    done.focus();
  });

  billing.addEventListener('click', async () => {
    toast('Opening billing…');
    await services.openSubscriptionPortal();
  });

  return {
    open() {
      render();
      dialog.showModal();
    },
  };
}
