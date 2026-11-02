(function () {
    'use strict';

    var finePointer = window.matchMedia && window.matchMedia('(pointer:fine)').matches;

    /* ================= LOADER ================= */
    var loader = document.getElementById('loader');
    if (loader) {
        var pctEl = loader.querySelector('.loader-pct');
        var barEl = loader.querySelector('.loader-bar i');
        var pct = 0;
        var lInt = setInterval(function () {
            pct += Math.floor(Math.random() * 14) + 5;
            if (pct >= 100) pct = 100;
            if (pctEl) pctEl.textContent = pct + '%';
            if (barEl) barEl.style.width = pct + '%';
            if (pct >= 100) {
                clearInterval(lInt);
                setTimeout(function () { loader.classList.add('done'); }, 250);
            }
        }, 120);
        window.addEventListener('load', function () {
            setTimeout(function () { clearInterval(lInt); loader.classList.add('done'); }, 1200);
        });
    }

    /* ================= PARTICLES ================= */
    var canvas = document.getElementById('particles');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var parts = [];
        function size() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        function spawn() {
            size();
            var count = Math.min(60, Math.floor(window.innerWidth / 14));
            parts = [];
            for (var i = 0; i < count; i++) parts.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: 0.8 + Math.random() * 2.2, spd: 0.12 + Math.random() * 0.4,
                drift: (Math.random() - 0.5) * 0.3, alpha: 0.1 + Math.random() * 0.3,
                tw: Math.random() * Math.PI * 2
            });
        }
        spawn();
        window.addEventListener('resize', spawn);
        (function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            parts.forEach(function (p) {
                p.y -= p.spd; p.x += p.drift; p.tw += 0.03;
                if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(201,162,39,' + (p.alpha * (0.6 + 0.4 * Math.sin(p.tw))) + ')';
                ctx.fill();
            });
            requestAnimationFrame(draw);
        })();
    }

    /* ================= CUSTOM CURSOR ================= */
    if (finePointer) {
        document.body.classList.add('cursor-on');
        var dot = document.createElement('div'); dot.id = 'c-dot';
        var ring = document.createElement('div'); ring.id = 'c-ring';
        document.body.appendChild(dot); document.body.appendChild(ring);
        var cx = 0, cy = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', function (e) {
            cx = e.clientX; cy = e.clientY;
            dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
        });
        (function loop() {
            rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16;
            ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
            requestAnimationFrame(loop);
        })();
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest('a, button, .p-item, .cfg-opt, .chip, .qv, .ba')) ring.classList.add('big');
        });
        document.addEventListener('mouseout', function (e) {
            if (e.target.closest('a, button, .p-item, .cfg-opt, .chip, .qv, .ba')) ring.classList.remove('big');
        });
    }

    /* ================= PROGRESS / HEADER / TOTOP ================= */
    var progress = document.getElementById('progress');
    var header = document.getElementById('header');
    var toTop = document.getElementById('toTop');
    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* ================= DRAWER ================= */
    var burger = document.getElementById('burger');
    var drawer = document.getElementById('drawer');
    var scrim = document.getElementById('scrim');
    if (burger && drawer && scrim) {
        function closeD() {
            burger.classList.remove('open'); drawer.classList.remove('open');
            scrim.classList.remove('show'); document.body.style.overflow = '';
        }
        burger.addEventListener('click', function () {
            var open = drawer.classList.toggle('open');
            burger.classList.toggle('open', open);
            scrim.classList.toggle('show', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
        scrim.addEventListener('click', closeD);
        drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeD); });
    }

    /* ================= REVEAL ================= */
    var revObs = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); revObs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revObs.observe(el); });

    /* ================= COUNTERS ================= */
    var cntObs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target, target = parseInt(el.dataset.target, 10), start = null;
            function step(ts) {
                if (!start) start = ts;
                var pr = Math.min((ts - start) / 1500, 1);
                el.textContent = Math.floor(pr * target).toLocaleString('en-IN');
                if (pr < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            cntObs.unobserve(el);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(function (c) { cntObs.observe(c); });

    /* ================= PARALLAX HERO ================= */
    var heroBg = document.querySelector('.hero-bg img');
    if (heroBg) {
        window.addEventListener('scroll', function () {
            var y = window.scrollY;
            if (y < window.innerHeight) heroBg.style.transform = 'translateY(' + (y * 0.25) + 'px) scale(1.08)';
        }, { passive: true });
    }

    /* ================= TILT CARDS ================= */
    if (finePointer) {
        document.querySelectorAll('.tilt').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(900px) rotateY(' + (px * 8) + 'deg) rotateX(' + (-py * 8) + 'deg)';
            });
            card.addEventListener('mouseleave', function () { card.style.transform = ''; });
        });
    }

    /* ================= BEFORE/AFTER ================= */
    var ba = document.querySelector('.ba');
    if (ba) {
        var pos = 50;
        function setPos(v) { pos = Math.max(4, Math.min(96, v)); ba.style.setProperty('--pos', pos + '%'); }
        function onMove(clientX) {
            var r = ba.getBoundingClientRect();
            setPos(((clientX - r.left) / r.width) * 100);
        }
        var dragging = false;
        ba.addEventListener('pointerdown', function (e) { dragging = true; onMove(e.clientX); });
        window.addEventListener('pointermove', function (e) { if (dragging) onMove(e.clientX); });
        window.addEventListener('pointerup', function () { dragging = false; });
        ba.addEventListener('touchmove', function (e) { e.preventDefault(); onMove(e.touches[0].clientX); }, { passive: false });
        ba.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') setPos(pos - 3);
            if (e.key === 'ArrowRight') setPos(pos + 3);
        });
        ba.setAttribute('tabindex', '0');
    }

    /* ================= TESTIMONIALS ================= */
    var track = document.getElementById('t-track');
    if (track) {
        var dots = document.querySelectorAll('.t-dots button');
        var tIdx = 0, timer;
        function go(i) {
            tIdx = (i + dots.length) % dots.length;
            track.style.transform = 'translateX(-' + tIdx * 100 + '%)';
            dots.forEach(function (d, di) { d.classList.toggle('active', di === tIdx); });
        }
        dots.forEach(function (d) { d.addEventListener('click', function () { go(parseInt(d.dataset.slide, 10)); auto(); }); });
        function auto() { clearInterval(timer); timer = setInterval(function () { go(tIdx + 1); }, 6000); }
        auto();
        var tx = null;
        document.querySelector('.t-slider').addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; });
        document.querySelector('.t-slider').addEventListener('touchend', function (e) {
            if (tx === null) return;
            var dx = e.changedTouches[0].clientX - tx;
            if (Math.abs(dx) > 40) { go(tIdx + (dx < 0 ? 1 : -1)); auto(); }
            tx = null;
        });
    }

    /* ================= FAQ ================= */
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

    /* ================= CATALOG FILTER + QUICKVIEW ================= */
    var catItems = Array.prototype.slice.call(document.querySelectorAll('.cat-card[data-cat]'));
    var chips = document.querySelectorAll('.chip');
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (c) { c.classList.remove('active'); });
            chip.classList.add('active');
            var f = chip.dataset.filter;
            catItems.forEach(function (it) { it.classList.toggle('hide', !(f === 'all' || it.dataset.cat === f)); });
        });
    });
    var qv = document.getElementById('qvModal');
    if (qv) {
        var qvImg = document.getElementById('qvImg'), qvTag = document.getElementById('qvTag'),
            qvTitle = document.getElementById('qvTitle'), qvDesc = document.getElementById('qvDesc'),
            qvSpecs = document.getElementById('qvSpecs'), qvPrice = document.getElementById('qvPrice');
        document.querySelectorAll('.qv').forEach(function (b) {
            b.addEventListener('click', function () {
                var card = b.closest('.cat-card');
                qvImg.src = card.dataset.img;
                qvTag.textContent = card.dataset.tag;
                qvTitle.textContent = card.dataset.title;
                qvDesc.textContent = card.dataset.desc;
                qvPrice.textContent = card.dataset.price;
                qvSpecs.innerHTML = '';
                card.dataset.specs.split('|').forEach(function (s) {
                    var parts = s.split(':');
                    var li = document.createElement('li');
                    li.innerHTML = '<span>' + parts[0] + '</span><span>' + parts[1] + '</span>';
                    qvSpecs.appendChild(li);
                });
                qv.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });
        function closeQv() { qv.classList.remove('show'); document.body.style.overflow = ''; }
        qv.addEventListener('click', function (e) { if (e.target === qv) closeQv(); });
        var qvClose = document.getElementById('qvClose');
        if (qvClose) qvClose.addEventListener('click', closeQv);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQv(); });
    }

    /* ================= CONFIGURATOR ================= */
    var config = document.getElementById('config');
    if (config) {
        var RATE = 16500;
        var LAYOUT_EXTRA = { straight: 0, l: 45000, u: 95000, peninsula: 70000, island: 85000 };
        var state = { layout: 'straight', length: 10 };
        var totalEl = document.getElementById('cfgTotal');
        var emiEl = document.getElementById('cfgEmi');
        var rowsEl = document.getElementById('cfgRows');
        var lenRange = document.getElementById('lenRange');
        var lenLabel = document.getElementById('lenLabel');
        var floorGroups = document.querySelectorAll('.fp-group');
        var fpLabel = document.getElementById('fpLabel');
        var FLOOR_LABELS = { straight: 'Straight', l: 'L-Shape', u: 'U-Shape', peninsula: 'Peninsula', island: 'Island' };

        function showFloor(layout) {
            floorGroups.forEach(function (g) { g.style.display = g.dataset.layout === layout ? 'block' : 'none'; });
            if (fpLabel) fpLabel.textContent = FLOOR_LABELS[layout] || layout;
        }
        showFloor('straight');

        function updateLabels() {
            document.querySelectorAll('.cfg-group').forEach(function (g) {
                var lbl = g.querySelector('.cur');
                if (!lbl) return;
                var acts = g.querySelectorAll('.cfg-opt.active');
                if (g.dataset.multi === 'true') {
                    var sum = 0;
                    acts.forEach(function (a) { sum += parseInt(a.dataset.price, 10) || 0; });
                    lbl.textContent = sum > 0 ? '₹' + sum.toLocaleString('en-IN') : '';
                } else if (acts.length) {
                    var p = parseInt(acts[0].dataset.price, 10) || 0;
                    lbl.textContent = p > 0 ? '₹' + p.toLocaleString('en-IN') : '';
                } else lbl.textContent = '';
            });
        }

        function update() {
            var base = state.length * RATE;
            var total = base + (LAYOUT_EXTRA[state.layout] || 0);
            var rows = [['Base cabinetry (' + state.length + ' ft × ₹16,500)', base]];
            document.querySelectorAll('.cfg-opt.active').forEach(function (o) {
                var p = parseInt(o.dataset.price, 10) || 0;
                if (p > 0) { total += p; rows.push([o.textContent.trim().replace(/\n/g, ' ').replace(/₹.*$/, '').trim(), p]); }
            });
            var layoutExtra = LAYOUT_EXTRA[state.layout];
            if (layoutExtra > 0) rows.push(['Layout premium (' + state.layout + ')', layoutExtra]);
            totalEl.innerHTML = '<small>₹</small>' + total.toLocaleString('en-IN');
            emiEl.innerHTML = '<b>₹' + Math.round(total / 24).toLocaleString('en-IN') + '</b>/month · 0% EMI for 24 months';
            rowsEl.innerHTML = rows.map(function (r) { return '<div class="est-row"><span>' + r[0] + '</span><b>₹' + r[1].toLocaleString('en-IN') + '</b></div>'; }).join('') + '<div class="est-row"><span>Installation &amp; aftercare</span><b>Included</b></div>';
            localStorage.setItem('modul_quote', JSON.stringify({ layout: state.layout, length: state.length, total: total, at: Date.now() }));
        }

        document.querySelectorAll('.cfg-opt').forEach(function (o) {
            o.addEventListener('click', function () {
                var g = o.closest('.cfg-group');
                var key = g.dataset.key;
                if (g.dataset.multi === 'true') {
                    if (o.dataset.value === 'none') {
                        g.querySelectorAll('.cfg-opt').forEach(function (x) { x.classList.remove('active'); });
                        o.classList.add('active');
                    } else {
                        o.classList.toggle('active');
                        var noneOpt = g.querySelector('.cfg-opt[data-value="none"]');
                        if (noneOpt) noneOpt.classList.remove('active');
                    }
                } else {
                    g.querySelectorAll('.cfg-opt').forEach(function (x) { x.classList.remove('active'); });
                    o.classList.add('active');
                }
                if (key === 'layout') { state.layout = o.dataset.value; showFloor(o.dataset.value); }
                updateLabels(); update();
            });
        });
        if (lenRange) {
            lenRange.addEventListener('input', function () {
                state.length = parseInt(lenRange.value, 10);
                lenLabel.textContent = state.length + ' ft';
                update();
            });
        }
        var saveQuote = document.getElementById('saveQuote');
        if (saveQuote) {
            saveQuote.addEventListener('click', function () {
                var q = JSON.parse(localStorage.getItem('modul_quote') || 'null');
                var msg = q ? 'Quote saved — ₹' + q.total.toLocaleString('en-IN') + ' ( ' + q.layout.charAt(0).toUpperCase() + q.layout.slice(1) + ' · ' + q.length + ' ft )' : 'Quote saved';
                showToast(msg);
                setTimeout(function () { window.location.href = 'contact.html'; }, 900);
            });
        }
        update();
    }

    /* ================= TOAST ================= */
    function showToast(msg) {
        var t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.style.cssText = 'position:fixed;bottom:150px;left:50%;transform:translateX(-50%) translateY(20px);z-index:9600;background:var(--gold);color:#141414;font-weight:600;font-size:.88rem;padding:14px 24px;border-radius:40px;box-shadow:0 14px 40px rgba(0,0,0,.5);opacity:0;transition:.4s;max-width:90vw;text-align:center;';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
        setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2600);
    }
    window.showToast = showToast;

    /* ================= QUOTE NOTE (contact page) ================= */
    var quoteNote = document.getElementById('quoteNote');
    if (quoteNote) {
        try {
            var q = JSON.parse(localStorage.getItem('modul_quote') || 'null');
            if (q) {
                quoteNote.innerHTML = 'Your saved quote: <b>₹' + q.total.toLocaleString('en-IN') + '</b> · ' +
                    q.layout.charAt(0).toUpperCase() + q.layout.slice(1) + ' · ' + q.length + ' ft. Mention it in your enquiry.';
                quoteNote.style.display = 'block';
            }
        } catch (e) { }
    }

    /* ================= FORM ================= */
    var form = document.getElementById('cform');
    if (form) {
        var formMsg = document.getElementById('formMsg');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var valid = true;
            form.querySelectorAll('.form-field').forEach(function (f) { f.classList.remove('error'); });
            function mark(el) { var f = el.closest('.form-field'); if (f) { f.classList.add('error'); valid = false; } }
            var fname = document.getElementById('fname'), lname = document.getElementById('lname'),
                email = document.getElementById('email'), phone = document.getElementById('phone');
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
            formMsg.textContent = 'Thank you! Our kitchen specialists will call you within 24 hours for a free site visit.';
            form.reset();
            setTimeout(function () { formMsg.className = 'form-msg'; }, 6000);
        });
    }

    /* ================= ACTIVE NAV ================= */
    var page = document.body.dataset.page || 'home';
    document.querySelectorAll('#bottom-nav a, #drawer .nav-links a, .desktop-nav a').forEach(function (a) {
        a.classList.toggle('active', a.dataset.nav === page);
    });

    /* ================= SCROLL ================= */
    function onScroll() {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
        if (header) header.classList.toggle('scrolled', window.scrollY > 40);
        if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
