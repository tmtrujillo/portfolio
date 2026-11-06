// GoatCounter: privacy-friendly analytics, no cookies, so no consent banner.
// Dashboard: https://<code>.goatcounter.com. Set the code to '' to turn it off.
export const GOATCOUNTER_CODE = 'taylortrujillo';

type Vars = { path: string; title?: string; referrer?: string; event?: boolean };
type GoatCounter = { count?: (vars: Vars) => void };

// count.js loads async, so wait for it briefly. It skips localhost on its own.
function send(vars: Vars, tries = 0) {
  const gc = (window as unknown as { goatcounter?: GoatCounter }).goatcounter;
  if (gc?.count) return gc.count(vars);
  if (tries < 40) setTimeout(() => send(vars, tries + 1), 250);
}

let firstPage = true;

/** A pageview. Page transitions don't reload the page, so the layout calls this on each one. */
export function countPage() {
  // After the first page, the referrer is this site, so leave it blank.
  send({ path: location.pathname + location.search, title: document.title, ...(firstPage ? {} : { referrer: '' }) });
  firstPage = false;
}

/** An event, e.g. countEvent('ta-track-ai', 'TA: picked AI enablement'). Never send visitor text. */
export function countEvent(name: string, title: string) {
  send({ path: name, title, event: true });
}
