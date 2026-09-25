import { icon } from './icons.js';
import { riseWords } from './motion.js';

// Placeholder workspace renderer. Swap in real views per workspace id as they're built.
// Laid out as one of the landing page's chapters: a numbered label beside a
// display headline over a hairline, the substance below.
export function renderWorkspace(el, ws, number) {
  el.innerHTML = `
    <header class="ws-head">
      <p class="label ws-label" data-rise><span class="ws-num">${String(number).padStart(2, '0')}</span>Workspace</p>
      <div>
        <h2 class="display ws-title">${ws.label}</h2>
        <p class="ws-desc" data-rise style="--r: 2">${ws.description}</p>
      </div>
    </header>
    <div class="ws-empty" data-rise style="--r: 3">
      <div class="ws-empty-icon">${icon(ws.icon, 24)}</div>
      <h3>${ws.empty.title}</h3>
      <p>${ws.empty.body}</p>
      <button type="button" class="btn btn-solid">${ws.empty.cta} <span class="btn-arrow" aria-hidden="true">→</span></button>
    </div>`;
  riseWords(el.querySelector('.ws-title'), { delay: 80 });
}
