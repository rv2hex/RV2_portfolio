/* ==========================================================================
   RV2 — interaction layer
   Custom-coded. No libraries.
   --------------------------------------------------------------------------
   To point every "Fiverr" link at your gig, change FIVERR_URL below.
   ========================================================================== */
(function () {
  "use strict";

  var FIVERR_URL = "https://www.fiverr.com/";

  var body = document.body;
  var rootEl = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOff = function () { return rootEl.getAttribute("data-motion") === "off"; };
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (n, min, max) { return Math.max(min, Math.min(max, n)); };

  /* ---------- External links ---------- */
  $$("[data-fiverr]").forEach(function (a) { a.href = FIVERR_URL; });

  /* ---------- Preloader ---------- */
  var preloader = $("#preloader");
  var loadPct = $("#load-pct");
  var loadLine = $("#load-line");
  var loadFinished = false;

  function finishLoad() {
    if (loadFinished) return;
    loadFinished = true;
    body.classList.remove("is-loading");
    body.classList.add("is-loaded");
    if (preloader) {
      preloader.classList.add("is-done");
      window.setTimeout(function () {
        if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 1500);
    }
    schedulePan();
  }

  if (preloader) {
    if (reduceMotion || motionOff()) {
      if (loadPct) loadPct.textContent = "100";
      if (loadLine) loadLine.style.width = "100%";
      finishLoad();
    } else {
      var loadStart = performance.now();
      var loadDuration = 1450;
      var tickLoad = function (now) {
        var p = clamp((now - loadStart) / loadDuration, 0, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var value = Math.round(eased * 100);
        if (loadPct) loadPct.textContent = String(value).padStart(2, "0");
        if (loadLine) loadLine.style.width = value + "%";
        if (p < 1) {
          window.requestAnimationFrame(tickLoad);
        } else {
          window.setTimeout(finishLoad, 220);
        }
      };
      window.requestAnimationFrame(tickLoad);
      window.setTimeout(finishLoad, 4200);
    }
  } else {
    finishLoad();
  }

  /* ---------- IST clock ---------- */
  var clockFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  function updateClocks() {
    var value = clockFormatter.format(new Date());
    $$(".js-clock").forEach(function (el) { el.textContent = value; });
  }
  updateClocks();
  window.setInterval(updateClocks, 30000);

  /* ---------- Custom cursor ---------- */
  var cursor = $("#cursor");
  if (cursor && finePointer && !reduceMotion && !motionOff()) {
    body.classList.add("has-cursor");
    var cursorLabel = $(".cursor-label", cursor);
    var cursorRing = $(".cursor-ring", cursor);
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;

    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = "translate3d(" + mouseX + "px," + mouseY + "px,0)";
      cursor.classList.remove("is-hidden");
    });

    document.addEventListener("mouseleave", function () {
      cursor.classList.add("is-hidden");
    });

    document.addEventListener("mousedown", function () {
      cursor.classList.add("is-down");
    });

    document.addEventListener("mouseup", function () {
      cursor.classList.remove("is-down");
    });

    document.addEventListener("mouseover", function (e) {
      var link = e.target.closest("a, button, [role='button'], .stack-card, .work-row");
      var view = e.target.closest(".stack-card, .work-row, .preview-trigger");
      cursor.classList.toggle("is-link", !!link);
      cursor.classList.toggle("is-view", !!view);
      if (cursorLabel) cursorLabel.textContent = "View";
    });

    var cursorLoop = function () {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (cursorRing) {
        cursorRing.style.transform =
          "translate(calc(-50% + " + (ringX - mouseX) + "px), calc(-50% + " + (ringY - mouseY) + "px))";
      }
      window.requestAnimationFrame(cursorLoop);
    };
    window.requestAnimationFrame(cursorLoop);
  }

  /* ---------- Header + scroll progress ---------- */
  var header = $("#site-header");
  var progressBar = $("#progress i");
  var scrollTicking = false;

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 30);
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = clamp(pct, 0, 100) + "%";
    }
    schedulePan();
    scrollTicking = false;
  }

  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  var burger = $("#burger");
  var menu = $("#menu");

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) {
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      if ("inert" in menu) menu.inert = !open;
    }
  }

  if (burger && menu) {
    if ("inert" in menu) menu.inert = true;
    burger.addEventListener("click", function () {
      setMenu(!body.classList.contains("menu-open"));
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ---------- Hero card stack ---------- */
  var cards = $$(".stack-card");
  var stackDots = $$(".stack-dot");
  var stack = $("#stack");
  var heroStage = $("#hero-stage");
  var activeCard = 0;
  var stackTimer = null;
  var stackPaused = false;

  function setActiveCard(index, restart) {
    if (!cards.length) return;
    activeCard = ((index % cards.length) + cards.length) % cards.length;
    cards.forEach(function (card, i) {
      card.classList.toggle("is-active", i === activeCard);
      card.classList.toggle("is-left", i === (activeCard + cards.length - 1) % cards.length);
      card.classList.toggle("is-right", i === (activeCard + 1) % cards.length);
      card.setAttribute("aria-hidden", i === activeCard ? "false" : "true");
      card.tabIndex = i === activeCard ? 0 : -1;
    });
    stackDots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === activeCard);
      dot.setAttribute("aria-selected", i === activeCard ? "true" : "false");
    });
    if (restart) startStackTimer();
  }

  function startStackTimer() {
    if (stackTimer) window.clearInterval(stackTimer);
    if (reduceMotion || motionOff() || rootEl.getAttribute("data-motion") === "subtle") return;
    stackTimer = window.setInterval(function () {
      if (!stackPaused && !motionOff() && rootEl.getAttribute("data-motion") === "full") {
        setActiveCard(activeCard + 1, false);
      }
    }, 5400);
  }

  cards.forEach(function (card, i) {
    card.addEventListener("click", function () {
      if (i === activeCard) {
        openModal(card.getAttribute("data-project-key"), 0);
      } else {
        setActiveCard(i, true);
      }
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  stackDots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setActiveCard(parseInt(dot.getAttribute("data-go"), 10), true);
    });
  });

  if (heroStage) {
    heroStage.addEventListener("mouseenter", function () { stackPaused = true; });
    heroStage.addEventListener("mouseleave", function () {
      stackPaused = false;
      if (stack) stack.style.transform = "";
    });
    heroStage.addEventListener("mousemove", function (e) {
      if (!finePointer || reduceMotion || motionOff() || window.innerWidth <= 900 || !stack) return;
      var rect = heroStage.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      stack.style.transform = "rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 7) + "deg)";
    });
  }

  document.addEventListener("visibilitychange", function () {
    stackPaused = document.hidden;
  });

  setActiveCard(0, false);
  startStackTimer();

  /* ---------- Reveals ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion && !motionOff()) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Counters ---------- */
  function setCounter(el, value) {
    var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    el.textContent = pad ? String(value).padStart(pad, "0") : String(value);
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count") || "0", 10);
    if (reduceMotion || motionOff()) { setCounter(el, target); return; }
    var start = performance.now();
    var duration = 1500;
    var step = function (now) {
      var p = clamp((now - start) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      setCounter(el, Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
      else setCounter(el, target);
    };
    window.requestAnimationFrame(step);
  }

  var counters = $$(".stat-num");
  if ("IntersectionObserver" in window && !reduceMotion && !motionOff()) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) { setCounter(el, parseInt(el.getAttribute("data-count") || "0", 10)); });
  }

  /* ---------- Work index hover preview ---------- */
  var peek = $("#work-peek");
  var peekImg = peek ? $("img", peek) : null;
  if (peek && peekImg && finePointer && !reduceMotion && !motionOff()) {
    $$(".work-row").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        peekImg.src = row.getAttribute("data-peek");
        peek.classList.add("is-visible");
      });
      row.addEventListener("mousemove", function (e) {
        peek.style.left = e.clientX + "px";
        peek.style.top = (e.clientY - 150) + "px";
      });
      row.addEventListener("mouseleave", function () {
        peek.classList.remove("is-visible");
      });
    });
  }

  /* ---------- Scroll-driven screenshot pans ---------- */
  var projects = $$(".project");
  var panScheduled = false;

  function panProject(project) {
    var rect = project.getBoundingClientRect();
    var viewport = window.innerHeight || 1;
    var progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);

    var screen = $(".browser-screen", project);
    var image = screen ? $("img", screen) : null;
    if (screen && image && image.complete && image.naturalHeight) {
      var max = image.offsetHeight - screen.offsetHeight;
      image.style.transform = "translate3d(0," + (-progress * Math.max(0, max)) + "px,0)";
    }

    var phoneScreen = $(".phone-screen", project);
    var phoneImage = phoneScreen ? $("img", phoneScreen) : null;
    if (phoneScreen && phoneImage && phoneImage.complete && phoneImage.naturalHeight) {
      var phoneMax = phoneImage.offsetHeight - phoneScreen.offsetHeight;
      phoneImage.style.transform = "translate3d(0," + (-progress * Math.max(0, phoneMax)) + "px,0)";
    }
  }

  function panAll() {
    projects.forEach(panProject);
    panScheduled = false;
  }

  function schedulePan() {
    if (panScheduled) return;
    panScheduled = true;
    window.requestAnimationFrame(panAll);
  }

  $$(".pan-img").forEach(function (img) {
    if (img.complete) schedulePan();
    img.addEventListener("load", schedulePan);
  });

  /* ---------- Tilt ---------- */
  if (finePointer && !reduceMotion && !motionOff()) {
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = "perspective(1200px) rotateX(" + (-y * 3.2) + "deg) rotateY(" + (x * 4.2) + "deg)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });

    /* ---------- Magnetic buttons ---------- */
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = "translate(" + (x * 0.1) + "px," + (y * 0.14) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Bento spotlight ---------- */
  $$("[data-spot]").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
      card.style.setProperty("--my", (e.clientY - rect.top) + "px");
    });
  });

  /* ---------- Active nav ---------- */
  var navLinks = $$(".desk-nav a");
  var navSections = navLinks.map(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) !== "#" || href.length < 2) return null;
    try {
      return document.querySelector(href);
    } catch (error) {
      return null;
    }
  }).filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-38% 0px -55% 0px", threshold: 0 });
    navSections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Back to top ---------- */
  var toTop = $("#to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: (reduceMotion || motionOff()) ? "auto" : "smooth" });
    });
  }

  /* ---------- Live preview modal ---------- */
  var PROJECTS = {
    casa: {
      index: "01",
      title: "Casa Atelier",
      site: "work/casa-atelier/",
      accent: "#c9a227",
      pages: [
        { label: "Home", path: "index.html" },
        { label: "The Studio", path: "about.html" },
        { label: "Our Work", path: "designers.html" },
        { label: "Pricing", path: "pricing.html" },
        { label: "Contact", path: "contact.html" }
      ]
    },
    modul: {
      index: "02",
      title: "MODUL",
      site: "work/modul/",
      accent: "#d9b95c",
      pages: [
        { label: "Home", path: "index.html" },
        { label: "The Studio", path: "about.html" },
        { label: "Design Studio", path: "design.html" },
        { label: "Catalog", path: "catalog.html" },
        { label: "Pricing", path: "pricing.html" },
        { label: "Contact", path: "contact.html" }
      ]
    },
    furniture: {
      index: "03",
      title: "Furniture Now!",
      site: "work/furniture-now/",
      accent: "#a9663f",
      pages: [
        { label: "Home", path: "index.html" },
        { label: "About", path: "about.html" },
        { label: "Products", path: "products.html" },
        { label: "Services", path: "services.html" },
        { label: "Contact", path: "contact.html" }
      ]
    }
  };

  var modal = $("#preview-modal");
  var modalTitle = $("#modal-title");
  var modalIndex = $("#modal-index");
  var modalTabs = $("#modal-tabs");
  var modalOpen = $("#modal-open");
  var modalClose = $("#modal-close");
  var modalStage = $("#modal-stage");
  var deviceFrame = $("#device-frame");
  var deviceUrl = $("#device-url");
  var frame = $("#preview-frame");
  var frameLoader = $("#frame-loader");
  var deviceButtons = $$("#device-switch button");
  var deviceFit = $("#device-fit");
  var currentProjectKey = null;
  var currentPageIndex = 0;
  var lastFocused = null;
  var frameTimeout = null;

  function siteUrl(project, page) {
    return new URL(project.site + project.pages[page].path, document.baseURI).href;
  }

  function showFrameLoader() {
    if (frameLoader) frameLoader.classList.add("is-loading");
    if (frameTimeout) window.clearTimeout(frameTimeout);
    frameTimeout = window.setTimeout(hideFrameLoader, 9000);
  }

  function hideFrameLoader() {
    if (frameLoader) frameLoader.classList.remove("is-loading");
    if (frameTimeout) {
      window.clearTimeout(frameTimeout);
      frameTimeout = null;
    }
  }

  function fitDevice() {
    if (!deviceFrame || !deviceFit || !modalStage || !modal || !modal.classList.contains("is-open")) return;
    var device = deviceFrame.getAttribute("data-device") || "desktop";
    var dims = {
      desktop: [1400, 900],
      tablet: [820, 920],
      mobile: [390, 800]
    }[device] || [1400, 900];
    var cs = window.getComputedStyle(modalStage);
    var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var availW = Math.max(120, modalStage.clientWidth - padX);
    var availH = Math.max(120, modalStage.clientHeight - padY);
    var scale = Math.min(1, availW / dims[0], availH / dims[1]);
    scale = Math.max(0.15, scale);
    deviceFrame.style.transform = "scale(" + scale + ")";
  }

  function buildTabs(project) {
    if (!modalTabs) return;
    modalTabs.innerHTML = "";
    project.pages.forEach(function (page, i) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.textContent = page.label;
      button.addEventListener("click", function () { setPage(i); });
      modalTabs.appendChild(button);
    });
  }

  function setPage(index) {
    var project = PROJECTS[currentProjectKey];
    if (!project) return;
    currentPageIndex = clamp(index, 0, project.pages.length - 1);
    $$("button", modalTabs).forEach(function (button, i) {
      button.classList.toggle("is-active", i === currentPageIndex);
      button.setAttribute("aria-selected", i === currentPageIndex ? "true" : "false");
    });
    var url = siteUrl(project, currentPageIndex);
    if (deviceUrl) {
      var parsed = new URL(url);
      deviceUrl.textContent = parsed.host + parsed.pathname;
    }
    if (modalOpen) modalOpen.href = url;
    if (frame) {
      showFrameLoader();
      frame.src = url;
    }
  }

  function openModal(key, pageIndex) {
    var project = PROJECTS[key];
    if (!project || !modal) return;
    currentProjectKey = key;
    lastFocused = document.activeElement;
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalIndex) modalIndex.textContent = project.index;
    modal.style.setProperty("--accent", project.accent);
    if (deviceFrame) deviceFrame.setAttribute("data-device", "desktop");
    deviceButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-device") === "desktop");
    });
    buildTabs(project);
    setPage(pageIndex || 0);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    window.requestAnimationFrame(fitDevice);
    window.setTimeout(fitDevice, 80);
    window.setTimeout(function () {
      if (modalClose) modalClose.focus();
    }, 80);
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
    if (frame) {
      window.setTimeout(function () {
        if (!modal.classList.contains("is-open")) frame.src = "about:blank";
      }, 460);
    }
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  $$(".preview-trigger").forEach(function (button) {
    button.addEventListener("click", function () {
      openModal(button.getAttribute("data-project"), 0);
    });
  });

  $$(".page-chips button").forEach(function (button) {
    button.addEventListener("click", function () {
      var projectEl = button.closest(".project");
      if (!projectEl) return;
      var key = projectEl.getAttribute("data-project-key");
      var project = PROJECTS[key];
      if (!project) return;
      var path = button.getAttribute("data-page");
      var index = project.pages.findIndex(function (page) { return page.path === path; });
      openModal(key, index < 0 ? 0 : index);
    });
  });

  deviceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!deviceFrame) return;
      deviceFrame.setAttribute("data-device", button.getAttribute("data-device"));
      deviceButtons.forEach(function (b) { b.classList.toggle("is-active", b === button); });
      window.requestAnimationFrame(fitDevice);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalStage) {
    modalStage.addEventListener("click", function (e) {
      if (e.target === modalStage) closeModal();
    });
  }
  if (frame) {
    frame.addEventListener("load", function () {
      if (frame.src && frame.src !== "about:blank") hideFrameLoader();
    });
  }

  if (modal) {
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var project = PROJECTS[currentProjectKey];
        if (!project) return;
        var nextIndex = currentPageIndex + (e.key === "ArrowRight" ? 1 : -1);
        if (nextIndex >= 0 && nextIndex < project.pages.length) {
          e.preventDefault();
          setPage(nextIndex);
        }
        return;
      }
      if (e.key === "Tab") {
        var focusable = $$("button, a[href], iframe, [tabindex]:not([tabindex='-1'])", modal).filter(function (el) {
          return el.offsetParent !== null || el.tagName === "IFRAME";
        });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }


  /* ---------- Currency display ---------- */
  /* Indicative FX rates, updated 2 Nov 2026. Base currency: INR. */
  var CURRENCIES = {
    INR: { locale: "en-IN", rate: 1 },
    USD: { locale: "en-US", rate: 0.010517 },
    EUR: { locale: "en-IE", rate: 0.009436 },
    GBP: { locale: "en-GB", rate: 0.007865 },
    AED: { locale: "en-AE", rate: 0.03863 },
    JPY: { locale: "en-US", rate: 1.658972 },
    AUD: { locale: "en-US", rate: 0.014963 },
    CAD: { locale: "en-US", rate: 0.014713 },
    SGD: { locale: "en-US", rate: 0.013462 }
  };
  var CURRENCY_KEY = "rv2-currency";
  var currencySelect = $("#currency-select");
  var currencyNote = $("#currency-note");
  var contactFx = $("#contact-fx");

  function detectCurrency() {
    var tz = "";
    var region = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    try {
      if (window.Intl && Intl.Locale) region = new Intl.Locale(navigator.language || "en").region || "";
    } catch (e) {}
    if (region === "IN" || tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
    if (region === "JP" || tz === "Asia/Tokyo") return "JPY";
    if (region === "GB" || tz === "Europe/London") return "GBP";
    if (region === "AE" || tz === "Asia/Dubai") return "AED";
    if (region === "SG" || tz === "Asia/Singapore") return "SGD";
    if (region === "AU" || tz.indexOf("Australia/") === 0) return "AUD";
    if (region === "CA" || tz.indexOf("America/Toronto") === 0 || tz.indexOf("America/Vancouver") === 0) return "CAD";
    if (region === "US" || tz.indexOf("America/") === 0) return "USD";
    if (tz.indexOf("Europe/") === 0 || ["AT","BE","CY","DE","EE","ES","FI","FR","GR","IE","IT","LT","LU","LV","MT","NL","PT","SI","SK"].indexOf(region) !== -1) return "EUR";
    return "INR";
  }

  function currentCurrency() {
    var saved = "";
    try { saved = localStorage.getItem(CURRENCY_KEY) || ""; } catch (e) {}
    return CURRENCIES[saved] ? saved : detectCurrency();
  }

  function convertInr(inr, code) {
    var value = inr * CURRENCIES[code].rate;
    return value >= 1000 ? Math.round(value / 10) * 10 : Math.round(value);
  }

  function formatMoney(inr, code, compact) {
    var cfg = CURRENCIES[code];
    var options = {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    };
    if (compact) {
      options.notation = "compact";
      options.compactDisplay = "short";
      options.maximumFractionDigits = 1;
    }
    return new Intl.NumberFormat(cfg.locale, options).format(convertInr(inr, code));
  }

  function moneyAmount(inr, code) {
    var cfg = CURRENCIES[code];
    var parts = new Intl.NumberFormat(cfg.locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).formatToParts(convertInr(inr, code));
    var symbol = parts.filter(function (part) { return part.type === "currency"; }).map(function (part) { return part.value; }).join("").trim();
    var number = parts.filter(function (part) { return part.type !== "currency"; }).map(function (part) { return part.value; }).join("").trim();
    return { symbol: symbol, number: number };
  }

  function applyCurrency(code, persist) {
    if (!CURRENCIES[code]) code = "INR";
    $$(".money[data-inr]").forEach(function (el) {
      var inr = parseFloat(el.getAttribute("data-inr")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var compact = el.getAttribute("data-compact") === "true";
      el.textContent = formatMoney(inr, code, compact) + suffix;
      el.title = "₹" + inr.toLocaleString("en-IN") + " INR" + suffix;
    });
    $$(".price-amount[data-inr]").forEach(function (el) {
      var inr = parseFloat(el.getAttribute("data-inr")) || 0;
      var amount = moneyAmount(inr, code);
      el.innerHTML = "<span>" + amount.symbol + "</span>" + amount.number;
      el.title = "₹" + inr.toLocaleString("en-IN") + " INR";
    });
    if (currencySelect) currencySelect.value = code;
    if (currencyNote) {
      currencyNote.textContent = code === "INR" ? "Billed in INR" : "Indicative conversion · billed in INR";
    }
    if (contactFx) {
      contactFx.textContent = code === "INR" ? "" : "Approximate conversion · final invoice in INR";
    }
    if (persist) {
      try { localStorage.setItem(CURRENCY_KEY, code); } catch (e) {}
    }
  }

  if (currencySelect || document.querySelector(".money[data-inr]")) {
    applyCurrency(currentCurrency(), false);
    if (currencySelect) {
      currencySelect.addEventListener("change", function () {
        applyCurrency(currencySelect.value, true);
      });
    }
  }

  /* ---------- Theme studio ---------- */
  var themePanel = $("#theme-panel");
  var themeScrim = $("#theme-scrim");
  var themeFab = $("#theme-fab");
  var themeClose = $("#theme-close");
  var themeToggle = $("#theme-toggle");
  var themeReset = $("#theme-reset");
  var themeToast = $("#theme-toast");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var accentName = $("#accent-name");
  var themeTrigger = null;
  var themeToastTimer = null;

  var THEME_DEFAULTS = {
    theme: "light",
    accent: "terracotta",
    display: "playfair",
    body: "manrope",
    corners: "soft",
    buttons: "solid",
    motion: "full"
  };

  var ACCENT_NAMES = {
    terracotta: "Terracotta",
    red: "Signal red",
    ember: "Ember orange",
    brass: "Brass gold",
    teal: "Deep teal",
    cobalt: "Cobalt blue",
    lime: "Acid lime",
    violet: "Ultra violet"
  };

  var THEME_PRESETS = {
    maison: { theme: "light", accent: "terracotta", display: "playfair", body: "manrope", corners: "soft", buttons: "solid", motion: "full" },
    noir: { theme: "dark", accent: "red", display: "instrument", body: "manrope", corners: "sharp", buttons: "solid", motion: "full" },
    ivory: { theme: "light", accent: "red", display: "instrument", body: "manrope", corners: "soft", buttons: "solid", motion: "full" },
    brass: { theme: "dark", accent: "brass", display: "playfair", body: "manrope", corners: "soft", buttons: "outline", motion: "full" },
    atelier: { theme: "light", accent: "teal", display: "playfair", body: "inter", corners: "round", buttons: "solid", motion: "full" }
  };

  function readTheme() {
    return {
      theme: rootEl.getAttribute("data-theme") || "light",
      accent: rootEl.getAttribute("data-accent") || "terracotta",
      display: rootEl.getAttribute("data-font-display") || "playfair",
      body: rootEl.getAttribute("data-font-body") || "manrope",
      corners: rootEl.getAttribute("data-corners") || "soft",
      buttons: rootEl.getAttribute("data-buttons") || "solid",
      motion: rootEl.getAttribute("data-motion") || "full"
    };
  }

  var themeState = readTheme();

  function saveTheme() {
    try { localStorage.setItem("rv2-theme-v2", JSON.stringify(themeState)); } catch (e) {}
  }

  function showToast(message) {
    if (!themeToast) return;
    themeToast.textContent = message;
    themeToast.classList.add("is-visible");
    if (themeToastTimer) window.clearTimeout(themeToastTimer);
    themeToastTimer = window.setTimeout(function () {
      themeToast.classList.remove("is-visible");
    }, 2400);
  }

  function updateThemeUI() {
    if (themePanel) {
      $$("[data-mode]", themePanel).forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-mode") === themeState.theme);
      });
      $$("[data-accent-value]", themePanel).forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-accent-value") === themeState.accent);
      });
      $$("[data-display]", themePanel).forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-display") === themeState.display);
      });
      $$("[data-body]", themePanel).forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-body") === themeState.body);
      });
      $$("[data-corners-value]", themePanel).forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-corners-value") === themeState.corners);
      });
      $$("[data-buttons-value]", themePanel).forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-buttons-value") === themeState.buttons);
      });
      $$("[data-motion-value]", themePanel).forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-motion-value") === themeState.motion);
      });

      var keys = ["theme", "accent", "display", "body", "corners", "buttons", "motion"];
      $$("[data-preset]", themePanel).forEach(function (button) {
        var preset = THEME_PRESETS[button.getAttribute("data-preset")];
        var active = preset && keys.every(function (key) { return preset[key] === themeState[key]; });
        button.classList.toggle("is-active", !!active);
      });
    }

    $$(".theme-card[data-preset]").forEach(function (button) {
      var preset = THEME_PRESETS[button.getAttribute("data-preset")];
      var active = preset && ["theme", "accent", "display", "body", "corners", "buttons", "motion"].every(function (key) {
        return preset[key] === themeState[key];
      });
      button.classList.toggle("is-current", !!active);
    });

    if (accentName) accentName.textContent = ACCENT_NAMES[themeState.accent] || themeState.accent;
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", themeState.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", themeState.theme === "dark" ? "#070707" : "#f5efe6");
    }
  }

  function applyTheme(next, persist) {
    themeState = Object.assign({}, themeState, next);
    rootEl.setAttribute("data-theme", themeState.theme);
    rootEl.setAttribute("data-accent", themeState.accent);
    rootEl.setAttribute("data-font-display", themeState.display);
    rootEl.setAttribute("data-font-body", themeState.body);
    rootEl.setAttribute("data-corners", themeState.corners);
    rootEl.setAttribute("data-buttons", themeState.buttons);
    rootEl.setAttribute("data-motion", themeState.motion);
    if (persist !== false) saveTheme();
    updateThemeUI();

    if (themeState.motion === "off") {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
      counters.forEach(function (el) {
        setCounter(el, parseInt(el.getAttribute("data-count") || "0", 10));
      });
    }

    if (themeState.motion === "full") {
      startStackTimer();
    } else if (stackTimer) {
      window.clearInterval(stackTimer);
      stackTimer = null;
    }

    if (stack) stack.style.transform = "";
    document.dispatchEvent(new CustomEvent("rv2:themechange", { detail: themeState }));
  }

  function applyPreset(name) {
    var preset = THEME_PRESETS[name];
    if (!preset) return;
    applyTheme(preset);
    showToast(name.charAt(0).toUpperCase() + name.slice(1) + " theme applied");
  }

  function openThemePanel(trigger) {
    if (!themePanel) return;
    themeTrigger = trigger || document.activeElement;
    body.classList.add("theme-open");
    themePanel.setAttribute("aria-hidden", "false");
    themePanel.removeAttribute("inert");
    if (themeFab) themeFab.setAttribute("aria-expanded", "true");
    function focusPanelClose() {
      if (!themeClose || !body.classList.contains("theme-open")) return;
      if (themePanel.contains(document.activeElement)) return;
      themeClose.focus({ preventScroll: true });
    }
    focusPanelClose();
    window.setTimeout(focusPanelClose, 120);
    window.setTimeout(focusPanelClose, 320);
  }

  function closeThemePanel() {
    if (!themePanel) return;
    body.classList.remove("theme-open");
    themePanel.setAttribute("aria-hidden", "true");
    themePanel.setAttribute("inert", "");
    if (themeFab) themeFab.setAttribute("aria-expanded", "false");
    if (themeTrigger && typeof themeTrigger.focus === "function") themeTrigger.focus();
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = themeState.theme === "dark" ? "light" : "dark";
      applyTheme({ theme: next });
      showToast(next === "light" ? "Light mode" : "Dark mode");
    });
  }

  if (themeFab) {
    themeFab.addEventListener("click", function () { openThemePanel(themeFab); });
  }
  var openThemeStudio = $("#open-theme-studio");
  if (openThemeStudio) {
    openThemeStudio.addEventListener("click", function () { openThemePanel(openThemeStudio); });
  }
  if (themeClose) themeClose.addEventListener("click", closeThemePanel);
  if (themeScrim) themeScrim.addEventListener("click", closeThemePanel);
  if (themeReset) {
    themeReset.addEventListener("click", function () {
      applyTheme(THEME_DEFAULTS);
      showToast("Default theme restored");
    });
  }

  if (themePanel) {
    $$("[data-mode]", themePanel).forEach(function (button) {
      button.addEventListener("click", function () { applyTheme({ theme: button.getAttribute("data-mode") }); });
    });
    $$("[data-accent-value]", themePanel).forEach(function (button) {
      button.addEventListener("click", function () { applyTheme({ accent: button.getAttribute("data-accent-value") }); });
    });
    $$("[data-display]", themePanel).forEach(function (button) {
      button.addEventListener("click", function () { applyTheme({ display: button.getAttribute("data-display") }); });
    });
    $$("[data-body]", themePanel).forEach(function (button) {
      button.addEventListener("click", function () { applyTheme({ body: button.getAttribute("data-body") }); });
    });
    $$("[data-corners-value]", themePanel).forEach(function (button) {
      button.addEventListener("click", function () { applyTheme({ corners: button.getAttribute("data-corners-value") }); });
    });
    $$("[data-buttons-value]", themePanel).forEach(function (button) {
      button.addEventListener("click", function () { applyTheme({ buttons: button.getAttribute("data-buttons-value") }); });
    });
    $$("[data-motion-value]", themePanel).forEach(function (button) {
      button.addEventListener("click", function () { applyTheme({ motion: button.getAttribute("data-motion-value") }); });
    });
  }

  $$("[data-preset]").forEach(function (button) {
    button.addEventListener("click", function () { applyPreset(button.getAttribute("data-preset")); });
  });

  document.addEventListener("keydown", function (e) {
    if (!body.classList.contains("theme-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeThemePanel();
      return;
    }
    if (e.key === "Tab" && themePanel) {
      var focusable = $$("button, a[href], [tabindex]:not([tabindex='-1'])", themePanel).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  applyTheme(themeState, false);

  /* ---------- Resize ---------- */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (stack) stack.style.transform = "";
      schedulePan();
      fitDevice();
    }, 160);
  });

  /* ---------- Init ---------- */
  window.addEventListener("load", function () {
    schedulePan();
    onScroll();
  });

  onScroll();
})();
