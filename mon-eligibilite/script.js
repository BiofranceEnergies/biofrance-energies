/* =========================================================
   FAQ — Accordéon
   ========================================================= */
(function () {
  function setPanelHeight(panel) {
    if (!panel) return;
    panel.style.maxHeight = "0px";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const h = panel.scrollHeight;
        panel.style.maxHeight = h + "px";
        const onEnd = (e) => {
          if (e.propertyName !== "max-height") return;
          panel.style.maxHeight = "none";
          panel.removeEventListener("transitionend", onEnd);
        };
        panel.addEventListener("transitionend", onEnd);
      })
    );
  }

  function closePanel(panel) {
    if (!panel) return;
    if (getComputedStyle(panel).maxHeight === "none") {
      panel.style.maxHeight = panel.scrollHeight + "px";
      void panel.offsetHeight;
    }
    panel.style.maxHeight = "0px";
  }

  function openItem(btn) {
    const panel = btn.nextElementSibling;
    document.querySelectorAll('.faq__btn[aria-expanded="true"]').forEach((b) => {
      if (b !== btn) {
        b.setAttribute("aria-expanded", "false");
        closePanel(b.nextElementSibling);
        b.closest(".faq__item")?.classList.remove("is-open");
      }
    });
    btn.setAttribute("aria-expanded", "true");
    btn.closest(".faq__item")?.classList.add("is-open");
    setPanelHeight(panel);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq__btn");
    if (!btn) return;
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    const panel = btn.nextElementSibling;
    const it = btn.closest(".faq__item");
    if (isOpen) {
      btn.setAttribute("aria-expanded", "false");
      it?.classList.remove("is-open");
      closePanel(panel);
    } else {
      openItem(btn);
    }
  });

  window.addEventListener("load", () => {
    const firstBtn = document.querySelector(".faq__btn");
    if (firstBtn) openItem(firstBtn);
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll('.faq__btn[aria-expanded="true"]').forEach((btn) => setPanelHeight(btn.nextElementSibling));
  });
})();

/* =========================================================
   Mentions légales — Ouverture / Fermeture
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const link = document.getElementById("mentions-legales-link");
  const popup = document.getElementById("mentions-popup");
  const close = document.getElementById("close-mentions");
  if (!popup || !close) return;

  function openPopup(e) {
    if (e) e.preventDefault();
    popup.style.display = "block";
    close.focus();
  }
  function closePopup(e) {
    if (e) e.preventDefault();
    popup.style.display = "none";
  }

  if (link) link.addEventListener("click", openPopup);
  close.addEventListener("click", closePopup);

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && popup.style.display === "block") closePopup();
  });
});

/* =========================================================
   SIMULATEUR PAC – Étapes + Calcul CEE
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-estimation");
  const steps = Array.from(document.querySelectorAll("#simulateur .card-step"));
  if (!form || !steps.length) return;

  const spanCurrent = document.getElementById("step-current");
  const spanTotal = document.getElementById("step-total");
  const bar = document.getElementById("step-bar");
  const btnPrev = document.getElementById("step-prev");
  const btnNext = document.getElementById("step-next");

  const recap = document.getElementById("recap");
  const rcCards = document.getElementById("rc-cards");
  const telBanner = document.getElementById("tel-banner");
  const sectionsToHide = document.querySelectorAll("[data-hide-after-sim='1']");

  const total = steps.length;
  if (spanTotal) spanTotal.textContent = String(total);

  let currentIndex = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.style.display = i === index ? "block" : "none";
    });
    currentIndex = index;
    if (spanCurrent) spanCurrent.textContent = String(currentIndex + 1);
    if (bar) {
      const pct = Math.min(100, ((currentIndex + 1) / total) * 100);
      bar.style.width = pct + "%";
    }
    if (btnPrev) {
      btnPrev.style.visibility = currentIndex === 0 ? "hidden" : "visible";
    }
    if (btnNext) {
      btnNext.textContent = currentIndex === total - 1 ? "Calculer mes aides" : "Suivant";
    }
  }

  function isCurrentStepValid() {
    const stepEl = steps[currentIndex];
    if (!stepEl) return true;
    const fields = stepEl.querySelectorAll("input, select, textarea");
    for (const field of fields) {
      if (!field.hasAttribute("required")) continue;
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }
    return true;
  }

  showStep(0);

  // Formatage RFR
  const rfrInput = form.querySelector('#rfr');
  if (rfrInput) {
    rfrInput.addEventListener('input', function() {
        let val = this.value.replace(/\s/g, '').replace(/[^\d]/g, '');
        if (val) {
            this.value = parseInt(val, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        } else {
            this.value = '';
        }
    });
  }

  // Formatage Téléphone
  const telInput = document.querySelector('#tel-banner input[type="tel"]');
  if (telInput) {
    telInput.addEventListener('input', function() {
        let val = this.value.replace(/\D/g, '').substring(0, 10);
        const groups = val.match(/.{1,2}/g);
        this.value = groups ? groups.join(' ') : '';
    });
  }

  // Données CEE
  const IDF_DEPARTMENTS = ["75","77","78","91","92","93","94","95"];
  const H1_DEPARTMENTS = ["01","02","03","05","08","10","14","15","19","21","23","25","27","28","38","39","42","43","45","51","52","54","55","57","58","59","60","61","62","63","67","68","69","70","71","73","74","75","76","77","78","80","87","88","89","90","91","92","93","94","95"];
  const H2_DEPARTMENTS = ["04","07","09","12","16","17","18","22","24","26","29","31","32","33","35","36","37","40","41","44","46","47","48","49","50","53","56","64","65","72","79","81","82","84","85","86"];
  const H3_DEPARTMENTS = ["06","11","13","20","30","34","66","83"];

  const RFR_THRESHOLDS = {
    hors: {
      extra: { bleu: 5094, jaune: 6525, violet: 9254 },
      1: { bleu: 17173, jaune: 22015, violet: 30844 },
      2: { bleu: 25115, jaune: 32197, violet: 45340 },
      3: { bleu: 30206, jaune: 38719, violet: 54592 },
      4: { bleu: 35285, jaune: 45234, violet: 63844 },
      5: { bleu: 40388, jaune: 51775, violet: 73098 }
    },
    idf: {
      extra: { bleu: 7038, jaune: 8568, violet: 12122 },
      1: { bleu: 23768, jaune: 28933, violet: 40404 },
      2: { bleu: 34884, jaune: 42463, violet: 59394 },
      3: { bleu: 41893, jaune: 51000, violet: 71060 },
      4: { bleu: 48914, jaune: 59549, violet: 83637 },
      5: { bleu: 55961, jaune: 68123, violet: 95758 }
    }
  };

  const RAC_CEE = {
    BLEU: { H1: { "-70": 1, "70-90": 1, "90-110": 1, "110-130": 1, "130+": 1 }, H2: { "-70": 1, "70-90": 1, "90-110": 1, "110-130": 1, "130+": 1 }, H3: { "-70": 1, "70-90": 1, "90-110": 1, "110-130": 1, "130+": 1 } },
    JAUNE: { H1: { "-70": 2500, "70-90": 2500, "90-110": 2500, "110-130": 2500, "130+": 990 }, H2: { "-70": 2500, "70-90": 2500, "90-110": 2500, "110-130": 2500, "130+": 2500 }, H3: { "-70": 2500, "70-90": 2500, "90-110": 2500, "110-130": 2500, "130+": 2500 } },
    VIOLET: { H1: { "-70": 5200, "70-90": 4300, "90-110": 3200, "110-130": 2800, "130+": 1400 }, H2: { "-70": 5490, "70-90": 4800, "90-110": 3900, "110-130": 3500, "130+": 1900 }, H3: { "-70": 7500, "70-90": 7500, "90-110": 7500, "110-130": 7500, "130+": 7500 } }
  };
  RAC_CEE.ROSE = RAC_CEE.VIOLET;

  function getDepartement(cpRaw) {
    if (!cpRaw) return null;
    const s = String(cpRaw).trim();
    return s.length >= 2 ? (s.startsWith("97") ? s.slice(0, 3) : s.slice(0, 2)) : null;
  }

  function getZoneFromCp(cpRaw) {
    const dep = getDepartement(cpRaw);
    if (!dep) return null;
    if (H3_DEPARTMENTS.includes(dep)) return "H3";
    if (H2_DEPARTMENTS.includes(dep)) return "H2";
    if (H1_DEPARTMENTS.includes(dep)) return "H1";
    return null;
  }

  function parseEuro(inputValue) {
    if (inputValue == null) return NaN;
    const n = parseFloat(String(inputValue).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? Math.round(n) : NaN;
  }

  function classifyProfile(rfr, foyerSize, cpRaw) {
    const dep = getDepartement(cpRaw);
    const table = (dep && IDF_DEPARTMENTS.includes(dep)) ? RFR_THRESHOLDS.idf : RFR_THRESHOLDS.hors;
    const n = Math.max(1, Math.min(parseInt(foyerSize, 10) || 1, 5));
    const extra = Math.max(0, (parseInt(foyerSize, 10) || 1) - 5);
    const row = table[n];
    if (!row) return null;
    
    if (rfr <= (row.bleu + extra * table.extra.bleu)) return "BLEU";
    if (rfr <= (row.jaune + extra * table.extra.jaune)) return "JAUNE";
    if (rfr <= (row.violet + extra * table.extra.violet)) return "VIOLET";
    return "ROSE";
  }

  function runPacSimulation() {
    const cp = form.querySelector('#cp')?.value || '';
    const foyer = form.querySelector('#foyer')?.value || '';
    const surface = form.querySelector('#surface')?.value || '';
    const rfr = parseEuro(form.querySelector('#rfr')?.value);
    const chauffage = form.querySelector('#chauffage')?.value || '';

    if (!cp || cp.length < 4 || !surface || !foyer || isNaN(rfr) || !chauffage) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }

    const zone = getZoneFromCp(cp) || 'H2';
    const profile = classifyProfile(rfr, foyer, cp);
    const racRaw = RAC_CEE[profile]?.[zone]?.[surface];
    const rac = racRaw != null ? racRaw : 0;

    // Affichage
    if (recap) recap.style.display = 'block';
    if (rcCards) rcCards.style.display = 'block';
    const racSpan = document.getElementById('rc-rac-amount');
    if (racSpan) racSpan.textContent = rac.toLocaleString('fr-FR') + ' €';

    function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    setText('rc-dep', getDepartement(cp));
    setText('rc-zone', zone);
    setText('rc-profile', profile);
    setText('rc-foyer', foyer + ' pers.');
    setText('rc-rfr', rfr.toLocaleString('fr-FR') + ' €');
    
    // Labels Surface
    const surfLabels = { "-70": "< 70 m²", "70-90": "70-90 m²", "90-110": "90-110 m²", "110-130": "110-130 m²", "130+": "> 130 m²" };
    setText('rc-surface', surfLabels[surface] || surface);
    
    const chauffOpt = form.querySelector('#chauffage option:checked');
    setText('rc-chauffage', chauffOpt ? chauffOpt.textContent : chauffage);

    // Hide Main
    sectionsToHide.forEach(el => el.style.display = "none");
    if (telBanner) telBanner.classList.add("tel-banner--visible");
    recap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (currentIndex < total - 1) {
        if (!isCurrentStepValid()) return;
        showStep(currentIndex + 1);
      } else {
        if (!isCurrentStepValid()) return;
        runPacSimulation();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      if (currentIndex > 0) showStep(currentIndex - 1);
    });
  }
});

/* =========================================
   COOKIE TOAST
   ========================================= */
document.addEventListener("DOMContentLoaded", function() {
  const toast = document.getElementById('cookie-toast');
  const btnAccept = document.getElementById('btn-accept');
  const btnDecline = document.getElementById('btn-decline');

  if (!toast || !btnAccept || !btnDecline) return;

  setTimeout(() => {
    if (!localStorage.getItem('cookieConsent')) {
      toast.classList.add('is-visible');
      toast.setAttribute('aria-hidden', 'false');
    }
  }, 1000);

  btnAccept.addEventListener('click', function() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
    localStorage.setItem('cookieConsent', 'accepted');
    toast.classList.remove('is-visible');
  });

  btnDecline.addEventListener('click', function() {
    localStorage.setItem('cookieConsent', 'refused');
    toast.classList.remove('is-visible');
  });
});
