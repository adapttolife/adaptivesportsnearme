/* /letter/confirmed: where the letter's confirmation email lands (beehiiv's
   Opt-in Redirect URL; /?confirmed=1 is sent here too). It says the email is
   confirmed, what the letter brings, how to keep it out of spam, and offers the
   directory. A colour block like home's hero, without the search inside it. */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";

export const FROM = "news@mail.adaptivesportsnearme.com";

export function render() {
  const html = `<section class="lc" aria-labelledby="lc-h"><div class="lc-art" aria-hidden="true">${A.fig("basketball", { big: true, cls: "fig--pin" })}</div>
<div class="lc-text"><p class="lc-tag">${A.icon("check", 18)}<span>Email confirmed</span></p>
<h1 class="display" id="lc-h" tabindex="-1">You're on the list.</h1>
<p class="lc-lede">New programs, grants and events, when there's something worth sending.</p></div></section>
<div class="lc-next">
<section class="lc-find" aria-labelledby="lc-find-h">${A.sectionHead({ title: "Find programs near you", id: "lc-find-h" })}${A.whereForm({ id: "lc-where" })}</section>
<section class="lc-from" aria-labelledby="lc-from-h">${A.sectionHead({ title: "Add us to your contacts", id: "lc-from-h" })}<p>The letter comes from <strong>${FROM.replace(/([@.])/g, "$1<wbr>")}</strong>. Saving that address keeps it in your inbox, out of spam.</p></section>
</div>`;
  return {
    title: site(PAGES.letterConfirmed.title),
    description: PAGES.letterConfirmed.description,
    html,
  };
}
