import { bootSubPage } from '../sub-page.js';
import { loadText } from '../../shared/lib/load.js';

var markup = await loadText('./privacy.html', import.meta.url);

/* --- Privacy: what stays on the device, and the one thing that leaves ---- */
bootSubPage({ 'privacy': { markup: markup } });
