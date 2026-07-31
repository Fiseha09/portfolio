/* ============================================================
   ALGOMAGE PORTFOLIO — main.js
   All interactive behaviour: nav, typewriter, scroll reveal,
   skill bars, demo store, cart, telegram demo, contact form.
   ============================================================ */

'use strict';

/* ── Utility helpers ────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   0. THEME TOGGLE — dark / light mode
   ============================================================ */
(function initTheme() {
  const root    = document.documentElement;
  const btn     = document.getElementById('themeToggle');
  const STORAGE = 'algomage-theme';

  /* Determine initial theme:
     1. User's saved preference
     2. OS preference
     3. Default: dark */
  function getPreferred() {
    const saved = localStorage.getItem(STORAGE);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (btn) {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  /* Apply on load without transition flash */
  root.style.transition = 'none';
  applyTheme(getPreferred());
  /* Re-enable transitions after first paint */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { root.style.transition = ''; });
  });

  /* Toggle on button click */
  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE, next);
    });
  }

  /* Sync with OS preference changes (when no manual override) */
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });
})();

/* ============================================================
   1. NAVIGATION
   ============================================================ */
(function initNav() {
  const nav        = $('#nav');
  const hamburger  = $('#hamburger');
  const navLinks   = $('#navLinks');
  const links      = $$('.nav__link');

  /* Scroll class */
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger toggle */
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close mobile nav on link click */
  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Active link on scroll (IntersectionObserver) — only track nav-linked sections */
  const navIds   = new Set(['home', 'about', 'certs', 'projects', 'contact']);
  const sections = $$('section[id]').filter(s => navIds.has(s.id));
  const navMap   = {};
  links.forEach(l => {
    const id = l.getAttribute('href').replace('#', '');
    navMap[id] = l;
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = navMap[entry.target.id];
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: `-${60}px 0px -55% 0px` });

  sections.forEach(s => io.observe(s));
})();


/* ============================================================
   2. TYPEWRITER — hero alias
   ============================================================ */
(function initTypewriter() {
  const el    = $('#typedAlias');
  if (!el) return;

  const words = ['AlgoMage', 'Fiseha.build()', 'new Vision()', 'Tech.Entrepreneur'];
  let   wIdx  = 0;
  let   cIdx  = 0;
  let   deleting = false;
  const SPEED_TYPE   = 90;
  const SPEED_DELETE = 45;
  const PAUSE_END    = 1800;
  const PAUSE_START  = 400;

  function tick() {
    const word    = words[wIdx];
    el.textContent = word.slice(0, cIdx);

    if (!deleting) {
      if (cIdx < word.length) {
        cIdx++;
        setTimeout(tick, SPEED_TYPE);
      } else {
        setTimeout(() => { deleting = true; tick(); }, PAUSE_END);
      }
    } else {
      if (cIdx > 0) {
        cIdx--;
        setTimeout(tick, SPEED_DELETE);
      } else {
        deleting = false;
        wIdx = (wIdx + 1) % words.length;
        setTimeout(tick, PAUSE_START);
      }
    }
  }

  tick();
})();

/* ============================================================
   3. FOOTER YEAR
   ============================================================ */
(function initYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();

  /* Profile photo fallback logic:
     If src is empty or image fails, show the placeholder.
     If src is set and loads successfully, hide the placeholder. */
  const img      = $('#profilePhoto');
  const fallback = $('#profilePhotoFallback');
  if (img && fallback) {
    if (!img.src || img.src === window.location.href) {
      /* src is blank — show fallback, hide img */
      img.style.display = 'none';
      fallback.style.display = 'flex';
    } else {
      img.addEventListener('load',  () => { fallback.style.display = 'none'; });
      img.addEventListener('error', () => {
        img.style.display = 'none';
        fallback.style.display = 'flex';
      });
    }
  }
})();

/* ============================================================
   4. SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  /* Add reveal class to targeted elements */
  const targets = [
    '.section-header',
    '.about__photo-col',
    '.about__bio-card',
    '.skill-card',
    '.cert-feature',
    '.cert-card',
    '.project-card',
    '.contact__form-col',
    '.contact__links-col',
  ];

  targets.forEach((sel, gi) => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      /* stagger siblings within same group */
      const delay = Math.min(i, 3);
      if (delay) el.classList.add(`reveal--delay-${delay}`);
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach(el => io.observe(el));
})();


/* ============================================================
   5. SKILL BAR ANIMATION
   ============================================================ */
(function initSkillBars() {
  const fills = $$('.skill-card__fill');
  if (!fills.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(f => io.observe(f));
})();

/* ============================================================
   6. DEMO STORE — Product Catalog & Cart
   ============================================================ */
(function initDemoStore() {
  const grid      = $('#laptopGrid');
  const cartBadge = $('#cartBadge');
  const cartIcon  = $('#cartIcon');
  const cartModal = $('#cartModal');
  const cartOverlay = $('#cartOverlay');
  const cartClose = $('#cartClose');
  const cartItemsEl = $('#cartItems');
  const cartTotalEl = $('#cartTotal');
  const checkoutBtn = $('#checkoutBtn');
  const demoCartBtn = $('#demoCartBtn');

  if (!grid) return;

  /* Product data */
  const PRODUCTS = [
    { id: 1, name: 'UltraBook Pro',   emoji: '💻', price: 1299 },
    { id: 2, name: 'SwiftAir 14"',    emoji: '🖥️', price:  899 },
    { id: 3, name: 'CodeMachine X',   emoji: '⌨️', price: 1599 },
    { id: 4, name: 'ThinEdge Slim',   emoji: '📱', price:  749 },
  ];

  /* Cart state */
  const cart = {};  /* id → { product, qty } */

  /* Render product grid */
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'demo-product';
    card.innerHTML = `
      <div class="demo-product__thumb" aria-hidden="true">${p.emoji}</div>
      <p class="demo-product__name">${p.name}</p>
      <p class="demo-product__price">$${p.price.toLocaleString()}</p>
      <button class="demo-product__btn" data-id="${p.id}" aria-label="Add ${p.name} to cart">
        Add to Cart
      </button>`;
    grid.appendChild(card);
  });

  /* Add to cart handler */
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.demo-product__btn');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    /* Update cart state */
    if (cart[id]) {
      cart[id].qty++;
    } else {
      cart[id] = { product, qty: 1 };
    }

    /* Feedback on button */
    btn.textContent = 'Added ✓';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.classList.remove('added');
    }, 1200);

    updateCartUI();
    bounceCartBadge();
  });

  function totalItems() {
    return Object.values(cart).reduce((s, c) => s + c.qty, 0);
  }

  function totalPrice() {
    return Object.values(cart).reduce((s, c) => s + c.product.price * c.qty, 0);
  }

  function bounceCartBadge() {
    cartBadge.textContent = totalItems();
    cartBadge.classList.add('visible');
    cartBadge.animate([
      { transform: 'scale(1.6)' },
      { transform: 'scale(1)'   }
    ], { duration: 300, easing: 'cubic-bezier(0.4,0,0.2,1)' });
  }

  function updateCartUI() {
    const items = Object.values(cart);
    cartItemsEl.innerHTML = '';

    if (!items.length) {
      cartItemsEl.innerHTML = '<p class="cart-modal__empty">Your cart is empty.</p>';
    } else {
      items.forEach(({ product, qty }) => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <div class="cart-item__thumb" aria-hidden="true">${product.emoji}</div>
          <div class="cart-item__info">
            <p class="cart-item__name">${product.name}</p>
            <p class="cart-item__price">$${(product.price * qty).toLocaleString()}</p>
          </div>
          <div class="cart-item__qty">
            <button class="qty-btn" data-action="dec" data-id="${product.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${product.id}" aria-label="Increase quantity">+</button>
          </div>`;
        cartItemsEl.appendChild(el);
      });
    }

    cartTotalEl.textContent = `$${totalPrice().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /* Qty controls inside cart drawer */
  cartItemsEl.addEventListener('click', e => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const id     = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (!cart[id]) return;

    if (action === 'inc') {
      cart[id].qty++;
    } else {
      cart[id].qty--;
      if (cart[id].qty <= 0) delete cart[id];
    }

    cartBadge.textContent = totalItems();
    if (!totalItems()) {
      cartBadge.classList.remove('visible');
      cartTotalEl.textContent = '$10,000.00 Earned Through Projects';
    }
    updateCartUI();
  });

  /* Open / close cart drawer */
  function openCart()  { cartModal.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function closeCart() { cartModal.classList.remove('open'); document.body.style.overflow = ''; }

  cartIcon.addEventListener('click', openCart);
  /* Legacy id kept for backward compat */
  if (demoCartBtn) demoCartBtn.addEventListener('click', openCart);
  /* New data-driven demo trigger buttons */
  $$('.btn--demo-trigger[data-demo="cart"]').forEach(btn => {
    btn.addEventListener('click', openCart);
  });
  /* cartIcon keyboard (role=button) */
  cartIcon.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCart(); }
  });
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  /* Checkout mock */
  checkoutBtn.addEventListener('click', () => {
    if (!totalItems()) {
      checkoutBtn.textContent = 'Cart is empty!';
      setTimeout(() => { checkoutBtn.textContent = 'Proceed to Checkout'; }, 1500);
      return;
    }
    checkoutBtn.textContent = 'Processing… ✓';
    checkoutBtn.disabled = true;
    setTimeout(() => {
      Object.keys(cart).forEach(k => delete cart[k]);
      cartBadge.textContent = '0';
      cartBadge.classList.remove('visible');
      updateCartUI();
      checkoutBtn.textContent = 'Proceed to Checkout';
      checkoutBtn.disabled = false;
      closeCart();
    }, 1800);
  });

  /* init */
  updateCartUI();
})();


/* ============================================================
   7. DEMO TELEGRAM — Animated Chat Preview
   ============================================================ */
(function initTelegramDemo() {
  const chatEl = $('#tgChat');
  if (!chatEl) return;

  /* Conversation script */
  const SCRIPT = [
    { role: 'bot',  text: '👋 Welcome to *preXam Elite Institute*!\n\nI am your automated admissions assistant. How can I help you today?' },
    { role: 'btns', buttons: ['📚 Apply Now', '💼 Business Info', 'ℹ️ About Us'] },
    { role: 'user', text: '📚 Apply Now' },
    { role: 'bot',  text: 'Great choice! Let\'s get started with your application.\n\nPlease send your *full name*:' },
    { role: 'user', text: 'Abebe Girma' },
    { role: 'bot',  text: '✅ Name recorded.\n\nNow select your *program of interest*:' },
    { role: 'btns', buttons: ['🔢 Math Elite', '💡 Science Pro', '💼 Business Track'] },
    { role: 'user', text: '🔢 Math Elite' },
    { role: 'bot',  text: '🎯 Excellent! Your application for *Math Elite* has been submitted.\n\nOur team will contact you within 24 hours. Welcome to the Home of Elites! 🏆' },
  ];

  let started = false;

  function appendMsg(msgData) {
    return new Promise(resolve => {
      const el = document.createElement('div');

      if (msgData.role === 'btns') {
        el.className = 'tg-msg tg-msg--btn-row';
        msgData.buttons.forEach(b => {
          const btn = document.createElement('span');
          btn.className = 'tg-btn';
          btn.textContent = b;
          el.appendChild(btn);
        });
      } else {
        el.className = `tg-msg tg-msg--${msgData.role === 'bot' ? 'bot' : 'user'}`;
        /* Render *bold* markers */
        el.innerHTML = msgData.text
          .replace(/\n/g, '<br>')
          .replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      }

      chatEl.appendChild(el);
      chatEl.scrollTop = chatEl.scrollHeight;
      setTimeout(resolve, msgData.role === 'user' ? 600 : 900);
    });
  }

  async function runScript() {
    if (started) return;
    started = true;
    for (const msg of SCRIPT) {
      /* Typing delay before bot messages */
      if (msg.role === 'bot' || msg.role === 'btns') {
        await delay(msg.role === 'btns' ? 300 : 700);
      } else {
        await delay(500);
      }
      await appendMsg(msg);
    }
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* Trigger when demo panel scrolls into view */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runScript();
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  io.observe(chatEl);
})();

/* ============================================================
   8. CONTACT FORM — Client-side validation & submit
   ============================================================ */
(function initContactForm() {
  const form       = $('#contactForm');
  if (!form) return;

  const nameInput  = $('#cfName');
  const emailInput = $('#cfEmail');
  const msgInput   = $('#cfMsg');
  const errName    = $('#errName');
  const errEmail   = $('#errEmail');
  const errMsg     = $('#errMsg');
  const successEl  = $('#formSuccess');

  function validate() {
    let valid = true;

    /* Name */
    if (nameInput.value.trim().length < 2) {
      showError(nameInput, errName, 'Please enter your full name.');
      valid = false;
    } else {
      clearError(nameInput, errName);
    }

    /* Email */
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(emailInput.value.trim())) {
      showError(emailInput, errEmail, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, errEmail);
    }

    /* Message */
    if (msgInput.value.trim().length < 10) {
      showError(msgInput, errMsg, 'Please write at least 10 characters.');
      valid = false;
    } else {
      clearError(msgInput, errMsg);
    }

    return valid;
  }

  function showError(input, errEl, msg) {
    input.classList.add('error');
    errEl.textContent = msg;
  }

  function clearError(input, errEl) {
    input.classList.remove('error');
    errEl.textContent = '';
  }

  /* Live validation on blur */
  [nameInput, emailInput, msgInput].forEach(input => {
    input.addEventListener('blur', () => validate());
    input.addEventListener('input', () => {
      /* Clear error as soon as user starts correcting */
      input.classList.remove('error');
      const errEl = {
        [nameInput.id]:  errName,
        [emailInput.id]: errEmail,
        [msgInput.id]:   errMsg,
      }[input.id];
      if (errEl) errEl.textContent = '';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const btnText   = submitBtn.querySelector('.btn__text');
    const btnIcon   = submitBtn.querySelector('.btn__icon');

    submitBtn.disabled = true;
    btnText.textContent = 'Sending…';
    btnIcon.textContent = '⟳';

    /* Simulate async send (replace with real fetch/emailjs as needed) */
    setTimeout(() => {
      submitBtn.disabled  = false;
      btnText.textContent = 'Send Message';
      btnIcon.textContent = '→';
      form.reset();
      successEl.textContent = '✅ Message sent! I\'ll get back to you soon.';
      successEl.classList.add('visible');
      setTimeout(() => successEl.classList.remove('visible'), 5000);
    }, 1600);
  });
})();


/* ============================================================
   9. SMOOTH ANCHOR SCROLL (offset for fixed nav)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   10. CERT GAUGE & COUNTER ANIMATION
   ============================================================ */
(function initCertGauge() {
  const gaugeFill = document.querySelector('.gauge-fill');
  const gaugeNum  = document.querySelector('.gauge-num');
  if (!gaugeFill || !gaugeNum) return;

  const TOTAL      = 502.65;
  const PCT        = parseFloat(gaugeFill.dataset.pct) || 0.7882;
  const TARGET_VAL = 472.91;
  let   animated   = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateGauge() {
    if (animated) return;
    animated = true;

    const DURATION  = 1600;
    const startTime = performance.now();
    const startOff  = TOTAL;
    const endOff    = TOTAL * (1 - PCT);

    function frame(now) {
      const elapsed = now - startTime;
      const t       = Math.min(elapsed / DURATION, 1);
      const eased   = easeOutCubic(t);
      gaugeFill.style.strokeDashoffset = startOff - (startOff - endOff) * eased;
      gaugeNum.textContent = (TARGET_VAL * eased).toFixed(2);
      if (t < 1) requestAnimationFrame(frame);
      else gaugeNum.textContent = TARGET_VAL.toFixed(2);
    }

    requestAnimationFrame(frame);
  }

  /* Also animate the subject score bars when the feature card enters view */
  function animateSubjectBars() {
    document.querySelectorAll('.exam-subject__fill').forEach(fill => {
      fill.classList.add('animated');
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateGauge();
        animateSubjectBars();
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  const featureCard = document.querySelector('.cert-feature');
  if (featureCard) io.observe(featureCard);
})();

/* ============================================================
   11. HERO AVATAR — fallback visibility on load
   ============================================================ */
(function initHeroAvatar() {
  const img      = document.getElementById('heroAvatarImg');
  const fallback = img ? img.nextElementSibling : null;
  if (!img || !fallback) return;

  /* Blank src → show fallback immediately */
  if (!img.getAttribute('src') || img.getAttribute('src') === '') {
    img.style.display    = 'none';
    fallback.style.display = 'flex';
    return;
  }

  img.addEventListener('load',  () => { fallback.style.display = 'none'; });
  img.addEventListener('error', () => {
    img.style.display    = 'none';
    fallback.style.display = 'flex';
  });
})();

/* ============================================================
   12. SUBTLE PARALLAX on hero code window
   ============================================================ */
(function initParallax() {
  const codeWindow = $('.hero__code-window');
  if (!codeWindow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      /* Only apply within the hero viewport height */
      if (scrollY < window.innerHeight) {
        codeWindow.style.transform = `translateY(${scrollY * 0.06}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();
