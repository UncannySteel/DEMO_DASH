import { bootSubPage } from '../sub-page.js';
import * as feedback from '../../features/feedback/feedback.js';
import { loadText } from '../../shared/lib/load.js';

var markup = await loadText('./contact.html', import.meta.url);

/* --- Contact: the feedback window, and quick answers before it ---------- */
var page = bootSubPage({ 'contact': { markup: markup }, 'feedback': feedback });
feedback.initFeedback().onToggle(page.hold);
