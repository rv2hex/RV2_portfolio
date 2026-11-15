/* RV2 — website audit scorecard
 *
 * Runs entirely in the browser: nothing is uploaded, no analytics, no storage.
 * The six checks live in the markup (website-audit/index.html) so the questions
 * are readable with JavaScript disabled — this file only scores them.
 *
 * PAGESPEED_KEY (optional):
 *   Paste a free Google API key to add live Google Performance / SEO scores.
 *   Without it the scorecard still works completely — it is an upgrade, not a
 *   dependency. Get one at: console.cloud.google.com → APIs & Services →
 *   Credentials → Create credentials → API key → enable "PageSpeed Online API".
 */
var PAGESPEED_KEY = "";

(function () {
  "use strict";

  var form = document.getElementById("audit-form");
  if (!form) return;

  var urlInput = document.getElementById("site-url");
  var result = document.getElementById("result");
  var status = document.getElementById("aud-status");

  // Specific, actionable fix for each check — the point of the tool is that the
  // answer tells the owner exactly what to do, not that they scored badly.
  var FIXES = {
    https: {
      high: "Turn on HTTPS. It is free with Let’s Encrypt and most hosts enable it in one click — without it browsers warn visitors away before your page loads.",
      url: "Switch this site to HTTPS — the padlock is free and most hosts enable it in one click."
    },
    phone: {
      high: "Rebuild the layout for small screens: single column, tap targets at least 44px, no horizontal scrolling. Most lost enquiries come from a phone visitor who could not use the page.",
      url: "Make the site properly usable on a phone — single column, big tap targets, no pinch-zoom."
    },
    cta: {
      high: "Put one clear action in the first screen — a call button or a WhatsApp link with a pre-written message. A visitor should not have to scroll to find out how to reach you.",
      url: "Add a clear call or WhatsApp button in the first screen of the site."
    },
    prices: {
      high: "Publish your prices, even as ranges. “Contact for pricing” filters out the people who are ready to buy today.",
      url: "Publish the prices on the site instead of hiding them behind an email."
    },
    proof: {
      high: "Show three real reviews with names or faces, plus your Google rating. Proof is what turns an enquiry into a decision.",
      url: "Add three real customer reviews with names to the site."
    },
    find: {
      high: "Set up a Google Business Profile and put your city in the page title and heading. People searching what you do plus your city are the warmest leads you will ever get.",
      url: "Get found locally: Google Business Profile plus the city in the page title."
    }
  };

  var IMPACT = { 20: "HIGH IMPACT", 15: "WORTH FIXING", 10: "QUICK WIN" };

  function gradeFor(score) {
    if (score >= 85) return { g: "A · Strong", v: "This site is doing its job. The remaining work is refinement, not rescue." };
    if (score >= 70) return { g: "B · Solid", v: "Sound foundation with a few gaps that are quietly costing you enquiries." };
    if (score >= 50) return { g: "C · Leaking", v: "The site looks acceptable, but several gaps are turning visitors away before they contact you." };
    return { g: "D · Losing work", v: "Right now this site is working against you — visitors arrive and leave without contacting anyone." };
  }

  function normalizeUrl(raw) {
    var v = (raw || "").trim();
    if (!v) return "";
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    return v;
  }

  function collect() {
    var url = normalizeUrl(urlInput && urlInput.value);
    var blocks = form.querySelectorAll(".q");
    var answers = [];
    var missing = null;

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var name = b.getAttribute("data-q");
      var picked = b.querySelector('input[type="radio"]:checked');
      if (!picked) { missing = b; break; }

      var val = picked.value;
      // The address bar beats the checkbox: an http:// URL is not HTTPS, whatever
      // the visitor believes.
      if (name === "https" && /^http:\/\//i.test(url)) val = "no";

      answers.push({
        id: name,
        weight: parseInt(b.getAttribute("data-weight"), 10) || 10,
        value: val
      });
    }

    return { url: url, answers: answers, missing: missing };
  }

  function score(answers) {
    var total = 100;
    var failed = [];

    for (var i = 0; i < answers.length; i++) {
      var a = answers[i];
      if (a.value === "no") {
        total -= a.weight;
        failed.push(a);
      } else if (a.value === "unsure") {
        // Not knowing is a real finding, but it is not proof of a fault.
        total -= Math.round(a.weight / 2);
        failed.push(a);
      }
    }

    failed.sort(function (x, y) { return y.weight - x.weight; });
    return { total: Math.max(0, Math.min(100, total)), failed: failed };
  }

  function render(data, s) {
    var g = gradeFor(s.total);

    document.getElementById("score-num").innerHTML = s.total + "<small>OUT OF 100</small>";
    document.getElementById("score-grade").textContent = g.g;
    document.getElementById("score-verdict").textContent = g.v;

    var list = document.getElementById("fix-list");
    list.innerHTML = "";
    if (s.failed.length === 0) {
      list.innerHTML = '<li><span class="w">ALL CLEAR</span><span class="t">Every check passed — focus next on traffic: local search and reviews.</span></li>';
    }
    for (var i = 0; i < s.failed.length; i++) {
      var f = s.failed[i];
      var li = document.createElement("li");
      var w = document.createElement("span");
      w.className = "w";
      w.textContent = IMPACT[f.weight] || "WORTH FIXING";
      var t = document.createElement("span");
      t.className = "t";
      t.innerHTML = "<b>" + f.id.toUpperCase() + "</b> — " + FIXES[f.id].high;
      li.appendChild(w);
      li.appendChild(t);
      list.appendChild(li);
    }

    var first = document.getElementById("first-fix-text");
    if (s.failed.length) {
      first.textContent = FIXES[s.failed[0].id].high;
      document.getElementById("first-fix").style.display = "block";
    } else {
      document.getElementById("first-fix").style.display = "none";
    }

    // Report is carried in the WhatsApp message — the visitor sends their own
    // findings to us, which is a far warmer introduction than a cold email.
    var lines = ["Website audit score: " + s.total + "/100 (" + g.g + ")"];
    if (data.url) lines.push("Site: " + data.url);
    for (var j = 0; j < s.failed.length; j++) lines.push("• " + FIXES[s.failed[j].id].url);
    if (!s.failed.length) lines.push("• All six checks passed");
    lines.push("");
    lines.push("Can you help me fix this?");

    var wa = document.getElementById("wa-report");
    wa.href = "https://wa.me/919987279570?text=" + encodeURIComponent(lines.join("\n"));

    result.classList.add("on");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = collect();

    if (data.missing) {
      status.textContent = "Answer all six questions first.";
      data.missing.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!data.url) {
      status.textContent = "Add your website address above.";
      urlInput.focus();
      return;
    }

    status.textContent = "Scored in your browser — nothing was sent.";
    var s = score(data.answers);
    render(data, s);

    if (PAGESPEED_KEY) runPageSpeed(data.url);
  });

  /* Optional upgrade — degrades silently if the key is missing, the quota is
     exhausted or the request fails. The scorecard above never depends on it. */
  function runPageSpeed(url) {
    var line = document.getElementById("psi-line");
    var endpoint = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
      + "?url=" + encodeURIComponent(url) + "&strategy=mobile&key=" + encodeURIComponent(PAGESPEED_KEY);

    fetch(endpoint)
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) {
        var cats = (d.lighthouseResult && d.lighthouseResult.categories) || {};
        var parts = [];
        ["performance", "accessibility", "best-practices", "seo"].forEach(function (k) {
          if (cats[k] && typeof cats[k].score === "number") {
            parts.push(k.replace("-", " ") + " " + Math.round(cats[k].score * 100));
          }
        });
        if (parts.length) line.textContent = "Google PageSpeed (mobile): " + parts.join(" · ");
      })
      .catch(function () { /* silent — the scorecard already stands on its own */ });
  }
})();
