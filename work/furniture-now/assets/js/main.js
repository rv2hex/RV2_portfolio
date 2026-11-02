(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  var loader = document.getElementById("loader");
  if (loader) {
    function finishLoader() {
      loader.classList.add("done");
    }
    window.addEventListener("load", function () {
      setTimeout(finishLoader, 320);
    });
    setTimeout(finishLoader, 2200);
  }

  /* ---------- Progress bar and header ---------- */
  var progress = document.getElementById("progress");
  var header = document.getElementById("header");

  function onScroll() {
    var root = document.documentElement;
    var max = root.scrollHeight - root.clientHeight;
    if (progress) {
      progress.style.width = (max > 0 ? (root.scrollTop / max) * 100 : 0) + "%";
    }
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 30);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");

  function setDrawer(open) {
    if (!burger || !drawer || !scrim) return;
    burger.classList.toggle("open", open);
    drawer.classList.toggle("open", open);
    scrim.classList.toggle("show", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (burger && drawer && scrim) {
    burger.addEventListener("click", function () {
      setDrawer(!drawer.classList.contains("open"));
    });
    scrim.addEventListener("click", function () {
      setDrawer(false);
    });
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setDrawer(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("open")) {
        setDrawer(false);
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("in-view");
    });
  }

  /* ---------- Counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".counter"));
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseFloat(el.getAttribute("data-target")) || 0;
          var decimals = el.getAttribute("data-decimals") === "1";
          var start = null;
          var duration = 1500;
          function step(timestamp) {
            if (!start) start = timestamp;
            var progressValue = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progressValue, 3);
            var current = target * eased;
            el.textContent = decimals
              ? current.toFixed(1)
              : Math.floor(current).toLocaleString("en-IN");
            if (progressValue < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = decimals
                ? target.toFixed(1)
                : Math.floor(target).toLocaleString("en-IN");
            }
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      }, { threshold: 0.55 });
      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    } else {
      counters.forEach(function (counter) {
        var target = parseFloat(counter.getAttribute("data-target")) || 0;
        counter.textContent = target.toLocaleString("en-IN");
      });
    }
  }

  /* ---------- Hero video ---------- */
  var heroVideo = document.getElementById("hero-video");
  if (heroVideo) {
    if (reduceMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    } else if ("IntersectionObserver" in window) {
      var heroVideoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var playAttempt = heroVideo.play();
            if (playAttempt && typeof playAttempt.catch === "function") {
              playAttempt.catch(function () {});
            }
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.15 });
      heroVideoObserver.observe(heroVideo);
    }
  }

  var rotator = document.getElementById("rotator");
  if (rotator && !reduceMotion) {
    var phrases = [
      "earns its place.",
      "fits your life.",
      "outlives the trend."
    ];
    var phraseIndex = 0;
    setInterval(function () {
      rotator.classList.add("is-out");
      setTimeout(function () {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        rotator.textContent = phrases[phraseIndex];
        rotator.classList.remove("is-out");
      }, 380);
    }, 4200);
  }

  /* ---------- Testimonials ---------- */
  var track = document.getElementById("t-track");
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll(".t-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".t-dot"));
    var slideIndex = 0;
    var timer = null;

    function goToSlide(index) {
      if (!slides.length) return;
      slideIndex = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + slideIndex * 100 + "%)";
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === slideIndex);
        dot.setAttribute("aria-selected", dotIndex === slideIndex ? "true" : "false");
      });
    }

    function startTimer() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () {
        goToSlide(slideIndex + 1);
      }, 6500);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goToSlide(parseInt(dot.getAttribute("data-slide"), 10) || 0);
        startTimer();
      });
    });

    var slider = track.parentElement;
    if (slider) {
      slider.addEventListener("mouseenter", function () {
        clearInterval(timer);
      });
      slider.addEventListener("mouseleave", startTimer);
    }

    var touchStartX = null;
    track.addEventListener("touchstart", function (event) {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    track.addEventListener("touchend", function (event) {
      if (touchStartX === null) return;
      var delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 38) {
        goToSlide(slideIndex + (delta < 0 ? 1 : -1));
        startTimer();
      }
      touchStartX = null;
    }, { passive: true });

    goToSlide(0);
    startTimer();
  }

  /* ---------- Product filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var productCards = Array.prototype.slice.call(document.querySelectorAll(".product-card"));
  var productCount = document.getElementById("product-count");

  function applyProductFilter(filter) {
    var visible = 0;
    productCards.forEach(function (card) {
      var show = filter === "all" || card.getAttribute("data-cat") === filter;
      card.classList.toggle("hide", !show);
      if (show) {
        visible += 1;
        card.classList.add("in-view");
      }
    });
    if (productCount) {
      productCount.textContent = visible + (visible === 1 ? " piece" : " pieces");
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (item) {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-selected", "true");
      applyProductFilter(chip.getAttribute("data-filter") || "all");
    });
  });

  if (productCards.length && productCount) {
    productCount.textContent = productCards.length + " pieces";
  }

  var requestedFilter = (window.location.hash || "").replace(/^#/, "").toLowerCase();
  if (requestedFilter) {
    var requestedChip = chips.filter(function (chip) {
      return chip.getAttribute("data-filter") === requestedFilter;
    })[0];
    if (requestedChip) requestedChip.click();
  }

  /* ---------- Product lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox && productCards.length) {
    var lbImage = document.getElementById("lb-img");
    var lbCategory = document.getElementById("lb-cat");
    var lbTitle = document.getElementById("lb-title");
    var lbDescription = document.getElementById("lb-desc");
    var lbPrice = document.getElementById("lb-price");
    var lbClose = document.getElementById("lb-close");
    var lastFocused = null;

    function openLightbox(card) {
      var image = card.querySelector("img");
      var title = card.getAttribute("data-name") || "Furniture Now piece";
      lastFocused = card.querySelector(".product-open") || document.activeElement;
      lbImage.src = card.getAttribute("data-img") || (image ? image.src : "");
      lbImage.alt = image ? image.alt : title;
      lbCategory.textContent = card.getAttribute("data-cat-label") || "";
      lbTitle.textContent = title;
      lbDescription.textContent = card.getAttribute("data-desc") || "";
      lbPrice.textContent = card.getAttribute("data-price") || "";
      lightbox.classList.add("show");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (lbClose) lbClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("show");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    productCards.forEach(function (card) {
      var trigger = card.querySelector(".product-open");
      if (trigger) {
        trigger.addEventListener("click", function () {
          openLightbox(card);
        });
      }
    });

    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("show")) {
        closeLightbox();
      }
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var button = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    if (!button || !answer) return;
    button.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        openItem.classList.remove("open");
        var openAnswer = openItem.querySelector(".faq-a");
        if (openAnswer) openAnswer.style.maxHeight = null;
        var openButton = openItem.querySelector(".faq-q");
        if (openButton) openButton.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Contact form ---------- */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var formMessage = document.getElementById("form-msg");
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var valid = true;
      contactForm.querySelectorAll(".form-field").forEach(function (field) {
        field.classList.remove("error");
      });

      function markInvalid(input) {
        var field = input.closest(".form-field");
        if (field) field.classList.add("error");
        valid = false;
      }

      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var phone = document.getElementById("phone");
      var message = document.getElementById("message");

      if (!name.value.trim()) markInvalid(name);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) markInvalid(email);
      if (phone.value.trim() && !/^[+\d][\d\s-]{8,18}$/.test(phone.value.trim())) markInvalid(phone);
      if (!message.value.trim()) markInvalid(message);

      if (!valid) {
        formMessage.className = "form-msg err";
        formMessage.textContent = "Please fill in your name, a valid email and a short message.";
        return;
      }

      formMessage.className = "form-msg ok";
      formMessage.textContent = "Thank you — your enquiry is ready. We will reply within one working day.";
      contactForm.reset();
      setTimeout(function () {
        formMessage.className = "form-msg";
        formMessage.textContent = "";
      }, 6500);
    });
  }

  /* ---------- Active nav link ---------- */
  var page = document.body.getAttribute("data-page") || "home";
  document.querySelectorAll(".desktop-nav a[data-nav], .drawer-links a[data-nav]").forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("data-nav") === page);
    if (link.getAttribute("data-nav") === page) {
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------- WhatsApp float ---------- */
  var whatsapp = document.getElementById("wa-float");
  if (whatsapp) {
    setTimeout(function () {
      whatsapp.classList.add("visible");
    }, 1800);
  }

  /* ---------- Ambient particles ---------- */
  var canvas = document.getElementById("particles");
  if (canvas && canvas.getContext && !reduceMotion) {
    var context = canvas.getContext("2d");
    var particles = [];
    var width = 0;
    var height = 0;

    function sizeCanvas() {
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function makeParticles() {
      sizeCanvas();
      var count = Math.min(38, Math.floor(width / 38));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.8 + Math.random() * 1.7,
          speed: 0.08 + Math.random() * 0.26,
          drift: (Math.random() - 0.5) * 0.18,
          alpha: 0.08 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2,
          warm: Math.random() > 0.45
        });
      }
    }

    function drawParticles() {
      context.clearRect(0, 0, width, height);
      particles.forEach(function (particle) {
        particle.y -= particle.speed;
        particle.x += particle.drift;
        particle.phase += 0.018;
        if (particle.y < -12) {
          particle.y = height + 12;
          particle.x = Math.random() * width;
        }
        var alpha = particle.alpha * (0.55 + 0.45 * Math.sin(particle.phase));
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.warm
          ? "rgba(169,102,63," + alpha + ")"
          : "rgba(37,59,47," + alpha * 0.8 + ")";
        context.fill();
      });
      requestAnimationFrame(drawParticles);
    }

    makeParticles();
    window.addEventListener("resize", makeParticles);
    drawParticles();
  }
})();
