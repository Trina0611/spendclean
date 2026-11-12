# SpendClean

Static site for spendclean.com. A public library showing which companies keep their money out of politics, based on public records.

The promise, as the project's own words on Home and About: SpendClean is the library of the legit places to spend. Every entry shows its source, quoted on its page. The 20 clean-verified companies are the legit places, and each one shows the record that backs it. Home leads with the full clean-verified list, and the Library has a one-click clean-verified preset (`library.html?status=clean-verified`). Flagged and not-yet-verified entries stay on the site so the library is complete.

Every company name, status, category, figure, and count on the site comes from `data/companies.json`. The HTML pages contain no company data.

## Files

```
index.html             Home: promise, search, categories, live counts, status guide, featured sample
library.html           Library: full catalog with name search, category and status filters
company.html           Company page, rendered from ?slug= (for example company.html?slug=apple)
methodology.html       What clean means, what we check, what we cannot see, corrections
suggest.html           Suggest a Company / Corrections form (no back end yet)
about.html             About the project
assets/css/styles.css  All styles, system fonts only
assets/js/app.js       Loads data/companies.json and renders every page
data/companies.json    The catalog
README.md              This file
```

## Run it locally

The pages load `data/companies.json` with `fetch`, which browsers block when a file is opened directly from disk. Start any small web server in this folder instead, for example:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Add Wave 2 (data only)

Edit `data/companies.json` only. No HTML, CSS, or JavaScript changes are needed.

1. Add each new company to the `companies` array with these fields:
   - `slug`: unique, lowercase, letters, numbers, and hyphens (used in company.html?slug=)
   - `name`: as given in the catalog
   - `category`: the primary category, one of the 7 browse categories (see the category mapping below)
   - `categoryLabel`: optional, the full authoritative label shown on the page, for example `retail/clothing` or `home goods`
   - `status`: `clean-verified`, `flagged`, or `not-yet-verified`
   - `fecId`: FEC committee ID confirmed on fec.gov, or `null`
   - `fecCommitteeName`: flagged only, the committee's registered name exactly as the FEC record shows it, or `null`
   - `figuresText`: figures confirmed in the FEC record, with the FEC's own labels, or `null` if not confirmed
   - `evidence`: one plain-English sentence drawn only from the catalog note
   - `source`: as given, for example `FEC`, `OpenSecrets`, `Company policy, OpenSecrets`, or `null`
   - `cycle`: the cycle checked as given, or `null`
   - `pendingNote`: for `not-yet-verified` only, the note as given, otherwise `null`
   - `quoteText`: word for word from the catalog or a real source (see the quote rule below)
   - `quoteSource`: the source named for that quote, for example `FEC`, `OpenSecrets`, or `SpendClean Wave 1 catalog`
   - `quoteUrl`: see the link rule below, or `null`
   - `quoteNote`: optional, a short note in the project's own words shown under the quote, outside the blockquote
   - `quoteOrigin`: `source` when the quote is copied from the source itself (FEC record, company policy page), `catalog` when it is the catalog's evidence line
2. Update `meta`: set `wave`, `total`, `counts` for each status, and `lastVerified` (YYYY-MM-DD).
3. A new category string appears automatically in Home and in the Library filter.
4. Run the verification checklist below.

## Category mapping

Browsing and filtering use 7 primary categories: retail, groceries, pharmacy, banking, tech, travel, home. A company can also carry `categoryLabel`, a fuller label that is shown on its company page and in the Library. The primary `category` is the first part of the label, with `home goods` mapping to `home` and `travel` to `travel`:

| categoryLabel | category |
|---|---|
| retail/clothing | retail |
| groceries/food | groceries |
| pharmacy/health | pharmacy |
| banking/finance | banking |
| tech/telecom | tech |
| travel | travel |
| home goods | home |

The flagged companies' labels come from the owner's original research table. Companies without a `categoryLabel` show their primary category.

## The quote rule

Every company page shows a quote block: a `blockquote` with a `cite` attribute, a figcaption with a label, the source name, and a link. It renders from the quote fields.

- `quoteText` is copied word for word. Never write policy sentences, committee names, or OpenSecrets wording that are not in the catalog or a real source you can open.
- `quoteOrigin: "source"` quotes are copied from the source itself and labeled "Quoted word for word from the source record." In Wave 1: the FEC registered committee name for each of the 21 flagged companies with a committee, and Apple's policy sentence from apple.com/public-policy-advocacy. Apple's sentence reads "we do not have political action committee (PAC)" with no "a"; that is Apple's own wording.
- `quoteOrigin: "catalog"` quotes are the catalog's evidence line, labeled "Quoted from the record cited in the Wave 1 catalog."
- `quoteNote` is optional and renders under the quote, outside the blockquote, in the project's own words. Starbucks uses it: its quote is the catalog's verbatim claim, and the note says no Starbucks committee appears in the FEC registry as checked November 11, 2026. The quote itself is never rewritten.
- If a flagged company's FEC record is ever being re-verified, set its quote fields to `null`. Its page then says so in the quote block and shows no figures.
- Link rule. A confirmed FEC committee links to `https://www.fec.gov/data/committee/<ID>/?cycle=2024`. A company policy quote links to that policy page. Otherwise use a general source home page (`https://www.fec.gov/` or `https://www.opensecrets.org/`), and the page says the link goes to the source, not to a page for that company. A note from the catalog itself has `quoteUrl: null`, and the page links to Methodology instead.
- The Wave 1 catalog's FEC committee IDs were wrong for 18 of 20 flagged companies (only Walmart and Amazon matched). Wrong IDs and every catalog figure line were removed. Every flagged committee's ID, registered name, and four 2023-2024 totals (Total receipts, Total contributions, Contributions to other committees, Total disbursements) now come from the owner's FEC-verified table, checked November 11, 2026.

## Design notes

Four layers, applied in this order:

1. **Clean.** One centered masthead, a strict grid, generous space, plain lists and ledger rows instead of card grids. Each page type has its own layout: front page (lead, tally table, taped sidebar, aisle index, three shelves), Library (A to Z ledger), company entry (stamped heading, taped clipping, particulars list), long-form article with a margin sidebar (Methodology), postcard form (Suggest), short essay (About).
2. **Grassroots honesty.** Every claim points at a record. Numbers and names come from the data, never from the HTML.
3. **French country dressing.** Linen and cream paper (`--paper`, `--linen`, `--card`), sage, dusty blue, and terracotta accents, an italic serif touch in the masthead and pull quotes.
4. **Scrappy details, used sparingly.** Rubber-stamp status marks, a pencil-drawn underline under the headline and the current nav item, a hand-drawn arrow on margin notes, masking tape on the "How to read the marks" note, the "What we cannot see" note, and the quote clipping, paper grain and a torn lower edge on the clipping only, and typewriter type for labels and quotes.

Hard rules: no gradients, no emoji, no web fonts (system serif, sans, and monospace stacks only), no images beyond small inline SVGs in the stylesheet, no em dashes. Status words always appear in text, never color alone. All text colors pass WCAG AA on their backgrounds.

## Wave 1

- Total: 50 companies
- Clean-verified: 20
- Flagged: 22
- Not yet verified: 8
- Last verified: 2026-11-11

## Verification checklist

- [ ] `data/companies.json` is valid JSON.
- [ ] `meta.total` equals the number of companies, and `meta.counts` matches the statuses in the array.
- [ ] Every slug is unique, and every company page opens from the Library.
- [ ] Every flagged `figuresText` matches the FEC record for the linked committee, with the FEC's labels. No catalog figure line, estimate, or rounded figure appears.
- [ ] Flagged entries without confirmed figures show no amount and say why.
- [ ] Every company has a primary `category` from the 7, and every flagged company has its `categoryLabel`.
- [ ] No not-yet-verified company is presented as clean.
- [ ] Sample-check a subset of clean-verified entries against FEC committee search before launch.
- [ ] Complete any not-stated flagged amounts from FEC records before publishing an amount.
- [ ] No em dash characters, email addresses, personal names, phone numbers, or street addresses in any file.
- [ ] All internal links resolve, and an unknown slug shows the not-found message.
- [ ] Every company page shows a quote block with its label, a source name, and a link, or says plainly that the record is being re-verified.
- [ ] Every `quoteText` appears word for word in the catalog or in the source it links to. No quote wording is invented.
- [ ] Every `quoteUrl` is that entry's confirmed FEC committee page, the quoted policy page, a general source home page, or `null`.
- [ ] No gradients, emoji, or stock marketing phrases in any file.

## Pre-launch checks

- [x] FEC link pattern confirmed: https://www.fec.gov/data/committee/C00093054/ opens WALMART INC. PAC FOR RESPONSIBLE GOVERNMENT, ID C00093054, checked by hand in a browser.
- [x] UnitedHealth Group: the catalog's C00341882 does not exist in FEC. Correct committee C00274431, UNITEDHEALTH GROUP INCORPORATED PAC (UNITEDHEALTH GROUP PAC), with 2023-2024 totals, verified by the owner via the FEC API.
- [x] Amazon: C00360354 opens AMAZON.COM SERVICES LLC SEPARATE SEGREGATED FUND (AMAZON PAC) on fec.gov.
- [x] All 21 flagged committees entered from the owner's FEC-verified table: ID, registered name, and four 2023-2024 totals.
- [x] JPMorgan Chase uses C00104299. Its evidence also notes the affiliated JPMORGAN CHASE & CO. PAC (C00128512) and its 2024 totals.
- [x] Starbucks: no committee in the FEC registry (checked November 11, 2026). Shown as flagged with no ID and no amount, with a note saying so.
- [x] Clean sweep done (checked November 11, 2026). WinCo Foods has an active corporate PAC (C00546903) and moved to flagged. No PAC was found for the other 20. Counts: 20 clean-verified, 22 flagged, 8 not yet verified.
- [ ] Open each of the 21 committee links in a real browser and confirm it lands on the right committee with the 2023-2024 view selected. fec.gov opens on 2025-2026 without `?cycle=2024`.
- [ ] The Starbucks status stays flagged, as the owner directed, even though no FEC committee was found. Revisit it if a later check still finds none.
- [ ] When a new wave changes the clean-verified count, update the number in the Home and About meta descriptions. The visible copy updates itself from the data.


## v6 changes (Nov 12, 2026, ChatGPT pre-launch review applied by Cooper)

- Home, About, Library, Methodology: public claims tightened to the records standard. "Legit places" language removed; home page and methodology now carry the review's replacement copy (a finding about records checked, not a guarantee). Masthead tag now "Company political giving, read straight from the public record."
- Starbucks exception explained site-wide (home marks box and Methodology section 02): one company stays flagged on an older catalog record although no committee for it appears in the current FEC registry; its page says so. No company data changed.
- Suggest form made unmistakably inactive pending a form service (Formspree recommended): fields and button disabled, notice states nothing typed is sent or saved.
- FEC committee links (21) re-verified live Nov 12, 2026: all 21 PASS (correct committee, ID, 2023-2024 cycle, totals displayed), and every flagged record's receipts figure matches the live FEC page.
