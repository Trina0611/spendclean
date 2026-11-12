/* SpendClean. Loads data/companies.json and renders every page from it.
   To add a wave, edit data/companies.json only. No company is named in this file. */
(function () {
  "use strict";

  var DATA_URL = "data/companies.json";
  var NONE = "none"; // filter value for an entry that has no category yet
  var NO_CATEGORY = "Category pending";
  var CHECKING = "Still being checked";

  var STATUS = {
    "clean-verified": { label: "Clean-verified", cls: "stamp-clean" },
    "flagged": { label: "Flagged", cls: "stamp-flagged" },
    "not-yet-verified": { label: "Not yet verified", cls: "stamp-pending" }
  };
  var STATUS_ORDER = ["clean-verified", "flagged", "not-yet-verified"];

  /* ---------- helpers ---------- */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  // Show the full label where the data has one (for example "home goods"); filter on the primary category.
  function categoryLabel(c) {
    if (c.categoryLabel) return capitalize(c.categoryLabel);
    return c.category ? capitalize(c.category) : NO_CATEGORY;
  }

  function isHomePage(url) {
    return /^https?:\/\/[^/]+\/?$/.test(url || "");
  }

  // A stamped mark. The status words are always in the text, never color alone.
  function stamp(status, large) {
    var s = STATUS[status];
    if (!s) return "";
    return '<span class="stamp ' + s.cls + (large ? " stamp-lg" : "") + '">' + esc(s.label) + "</span>";
  }

  function formatDate(iso) {
    var months = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso || "";
    return months[parseInt(p[1], 10) - 1] + " " + parseInt(p[2], 10) + ", " + p[0];
  }

  function companyUrl(slug) {
    return "company.html?slug=" + encodeURIComponent(slug);
  }

  function byName(a, b) {
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  }

  function categories(companies) {
    var seen = [];
    companies.forEach(function (c) {
      if (c.category && seen.indexOf(c.category) === -1) seen.push(c.category);
    });
    return seen;
  }

  function countBy(companies, fn) {
    var out = {};
    companies.forEach(function (c) {
      var k = fn(c);
      out[k] = (out[k] || 0) + 1;
    });
    return out;
  }

  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : many);
  }

  function hostOf(url) {
    var m = /^https?:\/\/(?:www\.)?([^/]+)/.exec(url || "");
    return m ? m[1] : "";
  }

  /* ---------- shared renderers ---------- */

  function renderRow(c) {
    return "<li>" +
      '<a class="name" href="' + esc(companyUrl(c.slug)) + '">' + esc(c.name) + "</a>" +
      '<span class="cat">' + esc(categoryLabel(c)) + "</span>" +
      stamp(c.status) +
      "</li>";
  }

  function filterCompanies(companies, opts) {
    var q = (opts.q || "").trim().toLowerCase();
    return companies.filter(function (c) {
      if (q && c.name.toLowerCase().indexOf(q) === -1) return false;
      if (opts.category) {
        if (opts.category === NONE) {
          if (c.category) return false;
        } else if (c.category !== opts.category) {
          return false;
        }
      }
      if (opts.status && c.status !== opts.status) return false;
      return true;
    });
  }

  function findCompany(companies, slug) {
    for (var i = 0; i < companies.length; i++) {
      if (companies[i].slug === slug) return companies[i];
    }
    return null;
  }

  // The quote block. Wording comes straight from quoteText; nothing is added to it.
  function renderQuote(c, wave) {
    if (!c.quoteText) {
      // No verified record to quote yet. Say so plainly rather than show anything unconfirmed.
      return '<div class="clipping-wrap"><figure class="clipping">' +
        '<p class="quote-label">No quote yet.</p>' +
        "<figcaption><p>The FEC committee record for " + esc(c.name) +
        " is being re-verified, so nothing is quoted here until it is confirmed. " +
        '<a href="methodology.html">How we check</a></p></figcaption></figure></div>';
    }
    var label = c.quoteOrigin === "source"
      ? "Quoted word for word from the source record."
      : "Quoted from the record cited in the Wave " + esc(wave) + " catalog.";
    var link, note = "";
    var committeePage = c.fecId && c.quoteUrl && c.quoteUrl.indexOf(c.fecId) !== -1;

    if (committeePage) {
      link = '<a href="' + esc(c.quoteUrl) + '">FEC committee ' + esc(c.fecId) + " on fec.gov, 2023-2024</a>";
    } else if (c.quoteUrl && !isHomePage(c.quoteUrl)) {
      link = '<a href="' + esc(c.quoteUrl) + '">' + esc(c.quoteSource) + " on " + esc(hostOf(c.quoteUrl)) + "</a>";
    } else if (c.quoteUrl) {
      link = '<a href="' + esc(c.quoteUrl) + '">' + esc(hostOf(c.quoteUrl)) + "</a>";
      note = "This link goes to the source, not to a page for " + esc(c.name) + ".";
    } else {
      link = '<a href="methodology.html">How the catalog was made</a>';
      note = "This note comes from our own catalog, so there is no outside page for it. The link goes to our Methodology page.";
    }

    var citeAttr = c.quoteUrl ? ' cite="' + esc(c.quoteUrl) + '"' : "";
    return '<div class="clipping-wrap"><figure class="clipping">' +
      "<blockquote" + citeAttr + "><p>" + esc(c.quoteText) + "</p></blockquote>" +
      "<figcaption>" +
      '<p class="quote-label">' + label + "</p>" +
      "<p>Source: <cite>" + esc(c.quoteSource) + "</cite>. " + link + "</p>" +
      (note ? '<p class="link-note">' + note + "</p>" : "") +
      (c.quoteNote ? '<p class="link-note">' + esc(c.quoteNote) + "</p>" : "") +
      "</figcaption></figure></div>";
  }

  function renderCompanyDetail(c, wave) {
    var rows = [];
    function row(label, valueHtml) {
      rows.push("<div><dt>" + esc(label) + "</dt><dd>" + valueHtml + "</dd></div>");
    }

    row("Category", esc(categoryLabel(c)));
    if (c.status === "not-yet-verified") {
      row("Still to check", esc(c.pendingNote || CHECKING));
    } else if (c.figuresText) {
      row(c.status === "clean-verified" ? "Figures in the records checked" : "PAC figures, FEC record, 2023-2024",
        esc(c.figuresText));
    } else if (c.status === "flagged" && (c.fecId || !c.quoteText)) {
      row("Amount", "Not shown until the 2023-2024 totals are confirmed from the FEC record.");
    } else {
      row("Amount", "Amount not stated in the records checked.");
    }
    row("Source", c.source ? esc(c.source) : CHECKING);
    if (c.fecCommitteeName) row("FEC committee name", esc(c.fecCommitteeName));
    if (c.fecId) row("FEC committee ID", esc(c.fecId));
    row("Cycle checked", c.cycle ? esc(c.cycle) : CHECKING);

    var pending = "";
    if (c.status === "not-yet-verified") {
      pending = '<p class="margin-note arrow-note"><strong>Not yet verified.</strong> We have not finished checking ' +
        esc(c.name) + ", so it is not shown as clean. This page changes when the check is done.</p>";
    }

    var aside = '<aside class="entry-aside" aria-label="How to read this page">' +
      '<p class="margin-note"><strong>How to read this page.</strong> The line under the name is our plain-English summary. ' +
      "The taped clipping is the record itself, copied exactly. The list below it is the filing detail.</p>" +
      '<p class="margin-note">Spot something off? <a href="suggest.html">Ask for a correction</a>, with a source if you have one.</p>' +
      "</aside>";

    return '<p class="kicker">Catalog entry, Wave ' + esc(wave) + "</p>" +
      '<div class="entry-layout">' +
      '<article class="entry">' +
      '<header class="entry-head"><h1>' + esc(c.name) + "</h1>" + stamp(c.status, true) + "</header>" +
      '<p class="lede">' + esc(c.evidence) + "</p>" +
      pending +
      '<h2 class="visually-hidden">The record</h2>' +
      renderQuote(c, wave) +
      '<h2 class="visually-hidden">The particulars</h2>' +
      '<dl class="particulars">' + rows.join("") + "</dl>" +
      "</article>" + aside + "</div>" +
      '<a class="back" href="library.html">&larr; Back to the Library</a>';
  }

  /* ---------- page controllers ---------- */

  function bindMeta(meta) {
    var map = {
      wave: meta.wave,
      total: meta.total,
      "last-verified": formatDate(meta.lastVerified),
      "count-clean-verified": meta.counts && meta.counts["clean-verified"],
      "count-flagged": meta.counts && meta.counts.flagged,
      "count-not-yet-verified": meta.counts && meta.counts["not-yet-verified"]
    };
    var nodes = document.querySelectorAll("[data-bind]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-bind");
      if (map[key] != null) nodes[i].textContent = map[key];
    }
    var hidden = document.querySelectorAll("[data-needs-meta]");
    for (var j = 0; j < hidden.length; j++) hidden[j].hidden = false;
  }

  function initHome(data) {
    var companies = data.companies;
    var total = companies.length;
    var counts = countBy(companies, function (c) { return c.status; });

    // The legit places: every clean-verified company, A to Z, with its quoted source showing.
    var cleanList = document.getElementById("clean-list");
    if (cleanList) {
      cleanList.innerHTML = companies.filter(function (c) { return c.status === "clean-verified"; })
        .sort(byName).map(function (c) {
          return "<li>" +
            '<a class="name" href="' + esc(companyUrl(c.slug)) + '">' + esc(c.name) + "</a>" +
            '<span class="cat">' + esc(categoryLabel(c)) + ". " + esc(c.quoteSource) + ": “" +
            esc(c.quoteText) + "”</span>" +
            stamp(c.status) +
            "</li>";
        }).join("");
    }

    var tally = document.getElementById("tally");
    if (tally) {
      tally.innerHTML = '<caption class="visually-hidden">Companies by status, Wave ' + esc(data.meta.wave) + "</caption>" +
        "<tbody>" + STATUS_ORDER.map(function (s) {
          return '<tr><th scope="row"><a href="library.html?status=' + s + '" aria-label="' + esc(STATUS[s].label) +
            ', see all in the Library">' + stamp(s) + "</a></th>" +
            '<td class="num">' + (counts[s] || 0) + '</td><td class="of">of ' + total + "</td></tr>";
        }).join("") + "</tbody>" +
        '<tfoot><tr><th scope="row">All companies</th><td class="num">' + total +
        '</td><td class="of">Wave ' + esc(data.meta.wave) + "</td></tr></tfoot>";
    }

    var aisles = document.getElementById("aisles");
    if (aisles) {
      var perCat = countBy(companies, function (c) { return c.category || NONE; });
      aisles.innerHTML = categories(companies).map(function (cat) {
        return '<li><a href="library.html?category=' + encodeURIComponent(cat) + '">' + esc(cat) + "</a>" +
          '<span class="n" aria-label="' + plural(perCat[cat], "company", "companies") + '">' + perCat[cat] + "</span></li>";
      }).join("");
    }

    var shelves = document.getElementById("shelves");
    if (shelves) {
      var limits = { "clean-verified": 7, "flagged": 7, "not-yet-verified": 8 };
      var only = shelves.getAttribute("data-statuses");
      var shelfStatuses = only ? only.split(",") : STATUS_ORDER;
      // Keep any static notes in the container; only the loading line is replaced.
      var loading = shelves.querySelector(".loading");
      if (loading) loading.parentNode.removeChild(loading);
      shelves.insertAdjacentHTML("afterbegin", shelfStatuses.map(function (s) {
        var all = companies.filter(function (c) { return c.status === s; }).sort(byName);
        var shown = all.slice(0, limits[s]);
        var rest = all.length - shown.length;
        return '<section class="shelf" aria-label="' + esc(STATUS[s].label) + '">' +
          "<h3>" + stamp(s) + '<span class="visually-hidden"> companies</span></h3><ul>' +
          shown.map(function (c) {
            return '<li><a href="' + esc(companyUrl(c.slug)) + '">' + esc(c.name) + "</a>" +
              '<span class="cat">' + esc(c.categoryLabel || c.category || NO_CATEGORY) + "</span></li>";
          }).join("") + "</ul>" +
          '<a class="more" href="library.html?status=' + s + '">' +
          (rest > 0 ? "and " + rest + " more &rarr;" : "see all " + all.length + " &rarr;") + "</a></section>";
      }).join(""));
    }
  }

  function initLibrary(data) {
    var companies = data.companies.slice().sort(byName);
    var form = document.getElementById("filters");
    var q = document.getElementById("q");
    var cat = document.getElementById("category");
    var status = document.getElementById("status");
    var list = document.getElementById("results");
    var count = document.getElementById("result-count");
    var empty = document.getElementById("empty");
    var clear = document.getElementById("clear-filters");

    cat.innerHTML = '<option value="">All categories</option>' +
      categories(companies).sort().map(function (c) {
        return '<option value="' + esc(c) + '">' + esc(capitalize(c)) + "</option>";
      }).join("") +
      (companies.some(function (c) { return !c.category; })
        ? '<option value="' + NONE + '">' + NO_CATEGORY + "</option>" : "");

    status.innerHTML = '<option value="">All statuses</option>' +
      STATUS_ORDER.map(function (s) {
        return '<option value="' + s + '">' + esc(STATUS[s].label) + "</option>";
      }).join("");

    var params = new URLSearchParams(window.location.search);
    q.value = params.get("q") || "";
    if (params.get("category")) cat.value = params.get("category");
    if (params.get("status")) status.value = params.get("status");

    function update() {
      var opts = { q: q.value, category: cat.value, status: status.value };
      var results = filterCompanies(companies, opts);
      list.innerHTML = results.map(renderRow).join("");
      count.textContent = "Showing " + results.length + " of " + plural(companies.length, "company", "companies");
      empty.hidden = results.length !== 0;
      clear.hidden = !(opts.q || opts.category || opts.status);

      var p = new URLSearchParams();
      if (opts.q) p.set("q", opts.q);
      if (opts.category) p.set("category", opts.category);
      if (opts.status) p.set("status", opts.status);
      var qs = p.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
    }

    function clearAll() {
      q.value = ""; cat.value = ""; status.value = "";
      update();
      q.focus();
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); update(); });
    q.addEventListener("input", update);
    cat.addEventListener("change", update);
    status.addEventListener("change", update);
    clear.addEventListener("click", clearAll);
    var emptyClear = document.getElementById("empty-clear");
    if (emptyClear) emptyClear.addEventListener("click", clearAll);
    update();
  }

  function initCompany(data) {
    var slug = new URLSearchParams(window.location.search).get("slug") || "";
    var target = document.getElementById("company");
    var c = findCompany(data.companies, slug);
    if (!c) {
      document.title = "Company not found | SpendClean";
      target.innerHTML = '<p class="kicker">No entry</p><article class="entry">' +
        "<h1>We could not find that company</h1>" +
        '<p class="lede">It may not be in the catalog yet, or the link may have a typo in it.</p>' +
        '<p><a class="btn" href="library.html">Go to the Library</a> ' +
        '<a class="btn btn-plain" href="suggest.html">Suggest it for a future wave</a></p></article>';
      return;
    }
    document.title = c.name + " | SpendClean";
    target.innerHTML = renderCompanyDetail(c, data.meta.wave);
  }

  function initSuggest() {
    var form = document.getElementById("suggest-form");
    var thanks = document.getElementById("thanks");
    if (!form) return;
    var fields = ["name", "company", "note"];
    var messages = {
      name: "Please add your name.",
      company: "Please add the company name.",
      note: "Please add a short note."
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (id) {
        var input = document.getElementById(id);
        var err = document.getElementById(id + "-error");
        var ok = input.value.trim() !== "";
        input.setAttribute("aria-invalid", ok ? "false" : "true");
        err.textContent = ok ? "" : messages[id];
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) {
        firstBad.focus();
        return;
      }
      var company = document.getElementById("company").value.trim();
      // Nothing is sent or stored. This static site has no back end yet.
      thanks.innerHTML = "<p><strong>Thank you.</strong> Your note about " + esc(company) +
        " is written up, but this site has no back end yet, so it was not sent anywhere. " +
        "Once a form service is connected, notes like this will reach the project.</p>";
      form.reset();
      fields.forEach(function (id) { document.getElementById(id).setAttribute("aria-invalid", "false"); });
      thanks.focus();
    });
  }

  function markCurrentNav() {
    var page = (window.location.pathname.split("/").pop() || "index.html");
    if (page === "company.html") page = "library.html";
    var links = document.querySelectorAll(".site-nav a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("href") === page) links[i].setAttribute("aria-current", "page");
    }
  }

  function showLoadError() {
    var wrap = document.querySelector("#main .wrap");
    if (!wrap) return;
    var box = document.createElement("div");
    box.className = "load-error";
    box.setAttribute("role", "alert");
    box.innerHTML = "<p><strong>The company list could not load.</strong> If you opened this file straight from your computer, " +
      "start a small local web server in the site folder and visit it from there. The README explains how.</p>";
    wrap.insertBefore(box, wrap.firstChild);
  }

  function init() {
    markCurrentNav();
    var page = document.body.getAttribute("data-page");
    if (page === "suggest") initSuggest();

    fetch(DATA_URL, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        bindMeta(data.meta || {});
        if (page === "home") initHome(data);
        else if (page === "library") initLibrary(data);
        else if (page === "company") initCompany(data);
      })
      .catch(function () {
        if (page === "home" || page === "library" || page === "company") showLoadError();
      });
  }

  // Exposed for tests and for anyone extending the site.
  var api = {
    esc: esc, filterCompanies: filterCompanies, findCompany: findCompany,
    renderRow: renderRow, renderQuote: renderQuote, renderCompanyDetail: renderCompanyDetail,
    categories: categories, formatDate: formatDate, STATUS: STATUS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof document !== "undefined") {
    window.SpendClean = api;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();
