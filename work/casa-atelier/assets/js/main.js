(function () {
    'use strict';

    /* ---- Loader ---- */
    var loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', function () {
            setTimeout(function () { loader.classList.add('done'); }, 400);
        });
        setTimeout(function () { loader.classList.add('done'); }, 2200);
    }

    /* ---- Progress bar ---- */
    var progress = document.getElementById('progress');
    function onScrollProgress() {
        var h = document.documentElement;
        var sc = h.scrollTop;
        var max = h.scrollHeight - h.clientHeight;
        progress.style.width = (max > 0 ? (sc / max) * 100 : 0) + '%';
    }

    /* ---- Header + toTop ---- */
    var header = document.getElementById('header');
    var toTop = document.getElementById('toTop');
    if (toTop) {
        toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    /* ---- Particles background ---- */
    var canvas = document.getElementById('particles');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var particles = [];
        function sizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        function makeParticles() {
            sizeCanvas();
            var count = Math.min(70, Math.floor(window.innerWidth / 12));
            particles = [];
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: 1 + Math.random() * 2.4,
                    spd: 0.15 + Math.random() * 0.45,
                    drift: (Math.random() - 0.5) * 0.3,
                    alpha: 0.15 + Math.random() * 0.35,
                    tw: Math.random() * Math.PI * 2
                });
            }
        }
        makeParticles();
        window.addEventListener('resize', makeParticles);
        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(function (p) {
                p.y -= p.spd;
                p.x += p.drift;
                p.tw += 0.03;
                if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(201,162,39,' + (p.alpha * (0.6 + 0.4 * Math.sin(p.tw))) + ')';
                ctx.fill();
            });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    /* ---- Drawer ---- */
    var burger = document.getElementById('burger');
    var drawer = document.getElementById('drawer');
    var scrim = document.getElementById('scrim');
    if (burger && drawer && scrim) {
        function closeDrawer() {
            burger.classList.remove('open');
            drawer.classList.remove('open');
            scrim.classList.remove('show');
            document.body.style.overflow = '';
        }
        burger.addEventListener('click', function () {
            var open = drawer.classList.toggle('open');
            burger.classList.toggle('open', open);
            scrim.classList.toggle('show', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
        scrim.addEventListener('click', closeDrawer);
        drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
    }

    /* ---- Reveal on scroll ---- */
    var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in-view'); revealObs.unobserve(e.target); }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

    /* ---- Counters ---- */
    var counterObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target, target = parseInt(el.dataset.target, 10), start = null, dur = 1600;
            function step(ts) {
                if (!start) start = ts;
                var pr = Math.min((ts - start) / dur, 1);
                el.textContent = Math.floor(pr * target).toLocaleString('en-IN');
                if (pr < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            counterObs.unobserve(el);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(function (c) { counterObs.observe(c); });

    /* ---- Typewriter (home hero) ---- */
    var tw = document.getElementById('typewriter');
    if (tw) {
        var words = ['love', 'live in', 'never want to leave'];
        var wi = 0, ci = 0, deleting = false;
        function type() {
            var word = words[wi];
            tw.textContent = word.slice(0, ci);
            if (!deleting) {
                if (ci < word.length) { ci++; setTimeout(type, 110); }
                else { deleting = true; setTimeout(type, 1800); }
            } else {
                if (ci > 0) { ci--; setTimeout(type, 50); }
                else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 300); }
            }
        }
        setTimeout(type, 800);
    }

    /* ---- Portfolio filter + lightbox ---- */
    var items = Array.prototype.slice.call(document.querySelectorAll('.p-item'));
    var chips = document.querySelectorAll('.chip');
    var lightbox = document.getElementById('lightbox');
    if (chips.length) {
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');
                var f = chip.dataset.filter;
                items.forEach(function (item) {
                    item.classList.toggle('hide', !(f === 'all' || item.dataset.cat === f));
                });
            });
        });
    }
    if (lightbox && items.length) {
        var lbImg = document.getElementById('lb-img');
        var lbCap = document.getElementById('lb-cap');
        var current = 0, visibleItems = [];
        function collectVisible() {
            visibleItems = items.filter(function (i) { return !i.classList.contains('hide'); });
        }
        function showLB() {
            var item = visibleItems[current];
            var img = item.querySelector('img');
            var cap = item.querySelector('.cap h4');
            lbImg.src = img.src.replace(/w=\d+/, 'w=1200');
            lbCap.textContent = cap ? cap.textContent : '';
        }
        function openLB(idx) {
            collectVisible();
            if (!visibleItems.length) return;
            current = idx;
            showLB();
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        items.forEach(function (item) {
            item.addEventListener('click', function () {
                collectVisible();
                var realIdx = visibleItems.indexOf(item);
                openLB(realIdx >= 0 ? realIdx : 0);
            });
        });
        function closeLB() { lightbox.classList.remove('show'); document.body.style.overflow = ''; }
        document.getElementById('lb-close').addEventListener('click', closeLB);
        lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLB(); });
        document.getElementById('lb-prev').addEventListener('click', function (e) { e.stopPropagation(); current = (current - 1 + visibleItems.length) % visibleItems.length; showLB(); });
        document.getElementById('lb-next').addEventListener('click', function (e) { e.stopPropagation(); current = (current + 1) % visibleItems.length; showLB(); });
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('show')) return;
            if (e.key === 'Escape') closeLB();
            if (e.key === 'ArrowLeft') { current = (current - 1 + visibleItems.length) % visibleItems.length; showLB(); }
            if (e.key === 'ArrowRight') { current = (current + 1) % visibleItems.length; showLB(); }
        });
    }

    /* ---- Testimonials carousel ---- */
    var track = document.getElementById('t-track');
    if (track) {
        var dots = document.querySelectorAll('.t-dots button');
        var tIdx = 0, timer;
        function goSlide(i) {
            tIdx = (i + dots.length) % dots.length;
            track.style.transform = 'translateX(-' + tIdx * 100 + '%)';
            dots.forEach(function (d, di) { d.classList.toggle('active', di === tIdx); });
        }
        dots.forEach(function (d) {
            d.addEventListener('click', function () { goSlide(parseInt(d.dataset.slide, 10)); restartAuto(); });
        });
        function restartAuto() {
            clearInterval(timer);
            timer = setInterval(function () { goSlide(tIdx + 1); }, 6000);
        }
        restartAuto();
        var tTouchX = null;
        document.querySelector('.t-slider').addEventListener('touchstart', function (e) { tTouchX = e.touches[0].clientX; });
        document.querySelector('.t-slider').addEventListener('touchend', function (e) {
            if (tTouchX === null) return;
            var dx = e.changedTouches[0].clientX - tTouchX;
            if (Math.abs(dx) > 40) { goSlide(tIdx + (dx < 0 ? 1 : -1)); restartAuto(); }
            tTouchX = null;
        });
    }

    /* ---- FAQ accordion ---- */
    document.querySelectorAll('.faq-item .q').forEach(function (q) {
        q.addEventListener('click', function () {
            var item = q.closest('.faq-item');
            var isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(function (o) {
                o.classList.remove('open');
                o.querySelector('.a').style.maxHeight = null;
            });
            if (!isOpen) {
                item.classList.add('open');
                item.querySelector('.a').style.maxHeight = item.querySelector('.a').scrollHeight + 'px';
            }
        });
    });

    /* ---- Contact form validation ---- */
    var form = document.getElementById('cform');
    if (form) {
        var formMsg = document.getElementById('formMsg');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var valid = true;
            form.querySelectorAll('.form-field').forEach(function (f) { f.classList.remove('error'); });
            function mark(el) { var f = el.closest('.form-field'); if (f) { f.classList.add('error'); valid = false; } }
            var fname = document.getElementById('fname');
            var lname = document.getElementById('lname');
            var email = document.getElementById('email');
            var phone = document.getElementById('phone');
            if (!fname.value.trim()) mark(fname);
            if (!lname.value.trim()) mark(lname);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) mark(email);
            if (!/^[+\d][\d\s-]{8,14}$/.test(phone.value.trim())) mark(phone);
            if (!valid) {
                formMsg.className = 'form-msg err';
                formMsg.textContent = 'Please fix the highlighted fields and try again.';
                return;
            }
            formMsg.className = 'form-msg ok';
            formMsg.textContent = 'Thank you! Our team will reach out within 24 hours to schedule your consultation.';
            form.reset();
            setTimeout(function () { formMsg.className = 'form-msg'; }, 6000);
        });
    }

    /* ---- Active nav (per current page) ---- */
    var page = document.body.dataset.page || 'home';
    var allNav = document.querySelectorAll('#bottom-nav a, #drawer .nav-links a, .desktop-nav a');
    allNav.forEach(function (a) { a.classList.toggle('active', a.dataset.nav === page); });

    /* ---- Scroll handler ---- */
    function onScroll() {
        onScrollProgress();
        if (header) header.classList.toggle('scrolled', window.scrollY > 40);
        if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
