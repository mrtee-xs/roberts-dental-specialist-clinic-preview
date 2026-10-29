/* Website Sales Factory — shared site behaviour (no dependencies, no secrets). */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  /* Mobile navigation (disclosure pattern) */
  var toggle = document.querySelector(".nav-toggle");
  var panel = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
  function setOpen(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    var label = toggle.querySelector(".nav-toggle__label");
    if (label) label.textContent = open ? "Close" : "Menu";
  }
  if (toggle && panel) {
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 56.01rem)").addEventListener("change", function (mq) { if (mq.matches) setOpen(false); });
  }

  /* Reveal on scroll (restrained) */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* WhatsApp enquiry form: composes a message and opens wa.me (no backend). */
  document.querySelectorAll("form[data-whatsapp]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form__status");
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var ok = field.value.trim() !== "";
        field.setAttribute("aria-invalid", String(!ok));
        if (!ok && valid) { field.focus(); valid = false; }
      });
      if (!valid) { if (status) status.textContent = "Please fill in the required fields."; return; }
      var lines = [form.getAttribute("data-intro") || "Hello, I'd like to make an enquiry."];
      form.querySelectorAll("input, select, textarea").forEach(function (field) {
        if (!field.name || !field.value.trim()) return;
        var label = form.querySelector('label[for="' + field.id + '"]');
        lines.push((label ? label.textContent.replace("*", "").trim() : field.name) + ": " + field.value.trim());
      });
      var number = form.getAttribute("data-whatsapp");
      var url = "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));
      if (status) status.textContent = "Opening WhatsApp with your message…";
      window.open(url, "_blank", "noopener");
    });
  });

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* ==========================================================================
   Roberts Dental Specialist Clinic — Interactive Treatment & HMO Selector
   Authentic High-Resolution Dental Photography & Seamless WhatsApp Booking
   ========================================================================== */

(function () {
  'use strict';

  var TREATMENTS = {
    'scaling': {
      name: 'Ultrasonic Scaling & Polishing',
      label: 'Scaling & Polishing',
      price: '₦25,000',
      duration: 'Duration: ~45 mins · Full Mouth Hygiene',
      image: 'assets/img/dental-cleaning.jpg',
      badge: '✨ Gentle Ultrasonic Scaler',
      desc: 'Deep plaque, tartar, and external stain removal using gentle ultrasonic water vibrations followed by clinical micro-polishing. Leaves your teeth silky smooth and refreshed.',
      hmoNote: 'Covered under most AXA Mansard, Reliance Health & Hygeia standard dental plans.'
    },
    'whitening': {
      name: 'Professional In-Office Teeth Whitening',
      label: 'Teeth Whitening',
      price: '₦60,000',
      duration: 'Duration: ~60 mins · Single-Visit Results',
      image: 'assets/img/dental-whitening.jpg',
      badge: '🦷 Up to 6 Shades Brighter',
      desc: 'Clinically supervised in-chair tooth brightening using pH-balanced, enamel-safe bleaching gel activated by cool LED light. Lifts years of discoloration safely without sensitivity.',
      hmoNote: 'Elective cosmetic treatment. Special subsidized clinic copay available for HMO policyholders.'
    },
    'fillings': {
      name: 'Composite Tooth Restorations & Fillings',
      label: 'Composite Fillings',
      price: '₦25,000',
      duration: 'Duration: ~40 mins · Shade-Matched',
      image: 'assets/img/dental-operatory.jpg',
      badge: '🛡️ Enamel-Matched Restoration',
      desc: 'High-strength, aesthetic composite resin fillings that repair tooth decay, fractures, and chips while blending flawlessly with your natural smile.',
      hmoNote: 'Standard restorative coverage under AXA Mansard, Reliance Health, and Leadway plans.'
    },
    'ortho': {
      name: 'Orthodontic & Clear Aligner Consultation',
      label: 'Orthodontics & Aligners',
      price: '₦10,000',
      duration: 'Duration: ~30 mins · Digital Assessment',
      image: 'assets/img/dental-consult.jpg',
      badge: '📐 Digital Smile Assessment',
      desc: 'Specialist dental surgeon evaluation with digital photography and bite analysis to determine eligibility for discreet clear aligners or fixed braces.',
      hmoNote: 'Specialist consultation covered under executive and comprehensive HMO corporate tiers.'
    }
  };

  var HMOS = {
    'private': {
      name: 'Private / Self-Pay',
      policyNote: 'Transparent clinic pricing with zero hidden fees. Cash, POS, and instant bank transfer accepted at reception.'
    },
    'axa': {
      name: 'AXA Mansard Health',
      policyNote: 'Accredited provider on 19 Ogunlana Drive. Present your AXA member ID or corporate code for seamless check-in.'
    },
    'reliance': {
      name: 'Reliance Health HMO',
      policyNote: 'Accredited clinic for Reliance Health enrollees. Fast digital verification and direct billing on arrival.'
    },
    'hygeia': {
      name: 'Hygeia HMO / Leadway',
      policyNote: 'Accredited network provider. Direct pre-authorization support for primary and specialist procedures.'
    }
  };

  var currentTreatmentKey = 'scaling';
  var currentHmoKey = 'private';

  function initDentalSelector() {
    var servicesContainer = document.querySelector('.services-section, section#services, .services');
    if (!servicesContainer) return;

    var selectorBox = document.createElement('div');
    selectorBox.className = 'container';
    selectorBox.innerHTML = [
      '<div id="dental-selector-box">',
      '  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 22px;">',
      '    <div style="display: flex; align-items: center; gap: 10px;">',
      '      <span class="hero-badge">🦷 Interactive Treatment & HMO Selector</span>',
      '      <span style="font-size: 0.85rem; color: #475569; font-weight: 600;">Transparent Rates & Co-Pay Guidance</span>',
      '    </div>',
      '    <span style="font-size: 0.85rem; color: #0369a1; font-weight: 600;">19 Ogunlana Drive (1st Floor) · Surulere</span>',
      '  </div>',
      '  ',
      '  <div class="dental-selector-grid">',
      '    <!-- Left: Authentic Treatment Photo Showcase -->',
      '    <div>',
      '      <div id="dental-photo-stage">',
      '        <div class="stage-badge-dental" id="dental-stage-badge">✨ Gentle Ultrasonic Scaler</div>',
      '        <img id="dental-photo-main" src="assets/img/dental-cleaning.jpg" alt="Dental Care at Roberts Dental Specialist Clinic">',
      '        <div class="stage-badge-hmo">',
      '          <span id="dental-stage-duration" style="color: #0369a1; font-weight: 700;">Duration: ~45 mins</span>',
      '          <span style="color: #475569;">100% Autoclave Sterile</span>',
      '        </div>',
      '      </div>',
      '      ',
      '      <div class="dental-specs-card" id="dental-specs-card">',
      '        <div class="dental-specs-label" id="dental-hmo-indicator">HMO COVERAGE GUIDANCE</div>',
      '        <div class="dental-specs-title" id="dental-card-title">Ultrasonic Scaling & Polishing · Private Pay</div>',
      '        <div class="dental-specs-desc" id="dental-card-desc">Covered under most AXA Mansard, Reliance Health & Hygeia standard dental plans.</div>',
      '      </div>',
      '    </div>',
      '    ',
      '    <!-- Right: HMO & Treatment Controls -->',
      '    <div>',
      '      <h3 style="font-size: 1.45rem; margin-bottom: 6px; color: #0f172a;">Plan Your Dental Visit</h3>',
      '      <p style="color: #475569; font-size: 0.925rem; margin-bottom: 20px;">Choose your procedure and payment preference to preview transparent fees and book instantly.</p>',
      '      ',
      '      <div style="margin-bottom: 18px;">',
      '        <div style="font-weight: 700; font-size: 0.825rem; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; margin-bottom: 8px;">1. Select Payment / HMO Coverage</div>',
      '        <div class="customizer-chips" id="dental-hmo-chips">',
      '          <button type="button" class="customizer-chip active" data-hmo="private">Private / Self-Pay</button>',
      '          <button type="button" class="customizer-chip" data-hmo="axa">AXA Mansard</button>',
      '          <button type="button" class="customizer-chip" data-hmo="reliance">Reliance Health</button>',
      '          <button type="button" class="customizer-chip" data-hmo="hygeia">Hygeia / Leadway</button>',
      '        </div>',
      '      </div>',
      '      ',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="font-weight: 700; font-size: 0.825rem; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; margin-bottom: 8px;">2. Select Dental Treatment</div>',
      '        <div class="customizer-chips" id="dental-treatment-chips">',
      '          <button type="button" class="customizer-chip active" data-treatment="scaling">Scaling & Polishing — ₦25,000</button>',
      '          <button type="button" class="customizer-chip" data-treatment="whitening">Teeth Whitening — ₦60,000</button>',
      '          <button type="button" class="customizer-chip" data-treatment="fillings">Tooth Restoration — ₦25,000</button>',
      '          <button type="button" class="customizer-chip" data-treatment="ortho">Ortho Consult — ₦10,000</button>',
      '        </div>',
      '      </div>',
      '      ',
      '      <div style="background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 14px; padding: 14px 16px; margin-bottom: 18px;">',
      '        <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: #0369a1; margin-bottom: 4px;">Procedure Details</div>',
      '        <div id="dental-treatment-description" style="font-size: 0.875rem; color: #334155; line-height: 1.45;">' + TREATMENTS.scaling.desc + '</div>',
      '      </div>',
      '      ',
      '      <div class="customizer-output">',
      '        <div>',
      '          <div style="font-size: 0.8rem; color: #64748b; font-weight: 600;" id="dental-selection-summary">Selected: Scaling & Polishing · Private Pay</div>',
      '          <div class="customizer-price-tag" id="dental-price">₦25,000</div>',
      '        </div>',
      '        <a id="dental-cta" href="#" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding: 12px 24px; text-decoration: none;">',
      '          Book on WhatsApp 💬',
      '        </a>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    servicesContainer.parentNode.insertBefore(selectorBox, servicesContainer.nextSibling);

    var photoEl = document.getElementById('dental-photo-main');
    var badgeEl = document.getElementById('dental-stage-badge');
    var durationEl = document.getElementById('dental-stage-duration');
    var hmoIndicatorEl = document.getElementById('dental-hmo-indicator');
    var cardTitleEl = document.getElementById('dental-card-title');
    var cardDescEl = document.getElementById('dental-card-desc');
    var treatmentDescEl = document.getElementById('dental-treatment-description');
    var summaryEl = document.getElementById('dental-selection-summary');
    var priceEl = document.getElementById('dental-price');
    var ctaEl = document.getElementById('dental-cta');

    function updateView() {
      var t = TREATMENTS[currentTreatmentKey];
      var h = HMOS[currentHmoKey];
      if (!t || !h) return;

      if (photoEl) {
        photoEl.classList.add('fading');
        setTimeout(function () {
          photoEl.src = t.image;
          photoEl.alt = t.name + ' at Roberts Dental Specialist Clinic';
          photoEl.classList.remove('fading');
        }, 120);
      }

      if (badgeEl) badgeEl.textContent = t.badge;
      if (durationEl) durationEl.textContent = t.duration;
      if (treatmentDescEl) treatmentDescEl.textContent = t.desc;

      if (hmoIndicatorEl) {
        hmoIndicatorEl.textContent = currentHmoKey === 'private' ? 'PATIENT GUIDANCE' : (h.name.toUpperCase() + ' COVERAGE');
      }

      if (cardTitleEl) {
        cardTitleEl.textContent = t.label + ' · ' + h.name;
      }

      if (cardDescEl) {
        cardDescEl.textContent = currentHmoKey === 'private' ? t.desc : (t.hmoNote + ' ' + h.policyNote);
      }

      if (summaryEl) {
        summaryEl.textContent = 'Selected: ' + t.label + ' (' + h.name + ')';
      }

      if (priceEl) {
        if (currentHmoKey === 'private') {
          priceEl.textContent = t.price;
        } else {
          priceEl.textContent = 'HMO Co-Pay / Covered';
        }
      }

      if (ctaEl) {
        var msg = 'Hello Roberts Dental Specialist Clinic, I would like to book an appointment for ' + t.name + ' under ' + h.name + ' at your 19 Ogunlana Drive clinic.';
        ctaEl.href = 'https://wa.me/2349060009228?text=' + encodeURIComponent(msg);
      }
    }

    var hmoChips = document.querySelectorAll('#dental-hmo-chips .customizer-chip');
    hmoChips.forEach(function (btn) {
      btn.addEventListener('click', function () {
        hmoChips.forEach(function (c) { c.classList.remove('active'); });
        btn.classList.add('active');
        currentHmoKey = btn.getAttribute('data-hmo');
        updateView();
      });
    });

    var treatmentChips = document.querySelectorAll('#dental-treatment-chips .customizer-chip');
    treatmentChips.forEach(function (btn) {
      btn.addEventListener('click', function () {
        treatmentChips.forEach(function (c) { c.classList.remove('active'); });
        btn.classList.add('active');
        currentTreatmentKey = btn.getAttribute('data-treatment');
        updateView();
      });
    });

    updateView();
  }

  function initStickyMobileBar() {
    var bar = document.createElement('div');
    bar.id = 'sticky-dental-bar';
    bar.innerHTML = [
      '<div>',
      '  <div style="font-size: 0.72rem; color: #0369a1; font-weight: 700; text-transform: uppercase;">19 Ogunlana Dr · Surulere</div>',
      '  <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a;">Roberts Dental</div>',
      '</div>',
      '<a href="https://wa.me/2349060009228?text=Hello%20Roberts%20Dental%2C%20I%20would%20like%20to%20book%20a%20dental%20appointment." target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding: 10px 18px; font-size: 0.875rem; text-decoration: none;">',
      '  Book on WhatsApp ⚡',
      '</a>'
    ].join('\n');
    document.body.appendChild(bar);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 350) {
        bar.classList.add('visible');
      } else {
        bar.classList.remove('visible');
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initDentalSelector();
      initStickyMobileBar();
    });
  } else {
    initDentalSelector();
    initStickyMobileBar();
  }
})();
