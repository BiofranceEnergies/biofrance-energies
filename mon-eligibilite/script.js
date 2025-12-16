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
    document
      .querySelectorAll('.faq__btn[aria-expanded="true"]')
      .forEach((btn) => setPanelHeight(btn.nextElementSibling));
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      document
        .querySelectorAll('.faq__btn[aria-expanded="true"]')
        .forEach((btn) => setPanelHeight(btn.nextElementSibling));
    });
  }
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
   SIMULATEUR PAC – Étapes + Calcul CEE (reste à charge)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form  = document.getElementById("form-estimation");
  const steps = Array.from(document.querySelectorAll("#simulateur .card-step"));
  if (!form || !steps.length) return;

  const spanCurrent = document.getElementById("step-current");
  const spanTotal   = document.getElementById("step-total");
  const bar         = document.getElementById("step-bar");
  const btnPrev     = document.getElementById("step-prev");
  const btnNext     = document.getElementById("step-next");

  const recap          = document.getElementById("recap");
  const recapContent   = document.getElementById("recap-content");
  const rcCards        = document.getElementById("rc-cards");
  const rcValMat       = document.getElementById("rc-val-materiel"); // laissé au cas où
  const telBanner      = document.getElementById("tel-banner");
  const sectionsToHide = document.querySelectorAll("[data-hide-after-sim='1']");

  const total = steps.length;
  if (spanTotal) spanTotal.textContent = String(total);

  let currentIndex = 0;

  /* ---------- 1) Navigation entre les étapes ---------- */
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
  // Par défaut, le bouton dit toujours "Suivant"
  btnNext.textContent = "Suivant";
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
   /* ---------- Changer le texte du bouton sur la dernière étape ---------- */
const selectChauffage = form.querySelector("#chauffage");

if (selectChauffage && btnNext) {
  selectChauffage.addEventListener("change", function () {
    if (currentIndex === total - 1 && this.value) {
      btnNext.textContent = "Afficher mon reste à charge";
    }
  });
}
/* ---------- Formatage du RFR (convertit 20000 → 20 000 au blur) ---------- */
const rfrInput = form.querySelector('#rfr');

if (rfrInput) {
  rfrInput.addEventListener('blur', formatRfr);
}

function formatRfr() {
  let val = this.value.replace(/\s/g, '').replace(/[^\d]/g, '');
  if (!val) {
    this.value = '';
    return;
  }
  val = parseInt(val, 10).toString();
  this.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
/* ---------- Formatage du téléphone (06 12 34 56 78) ---------- */
const telInput = document.querySelector('#tel-banner input[type="tel"]');

if (telInput) {
  telInput.addEventListener('input', formatPhone);
  telInput.addEventListener('blur', formatPhone);
}

function formatPhone() {
  let val = this.value.replace(/\D/g, '');
  val = val.substring(0, 10); // On limite à 10 chiffres
  const groups = val.match(/.{1,2}/g);
  this.value = groups ? groups.join(' ') : '';
}
  /* ---------- 2) Données CEE & fonctions de calcul ---------- */

  const IDF_DEPARTMENTS = ["75","77","78","91","92","93","94","95"];

  const H1_DEPARTMENTS = [
    "01","02","03","05","08","10","14","15","19","21","23","25","27","28",
    "38","39","42","43","45","51","52","54","55","57","58","59","60","61",
    "62","63","67","68","69","70","71","73","74","75","76","77","78","80",
    "87","88","89","90","91","92","93","94","95"
  ];

  const H2_DEPARTMENTS = [
    "04","07","09","12","16","17","18","22","24","26","29","31","32","33",
    "35","36","37","40","41","44","46","47","48","49","50","53","56","64",
    "65","72","79","81","82","84","85","86"
  ];

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

  // Tableau RAC CEE
  const RAC_CEE = {
    BLEU: {
      H1: { "-70": 1, "70-90": 1, "90-110": 1, "110-130": 1, "130+": 1 },
      H2: { "-70": 1, "70-90": 1, "90-110": 1, "110-130": 1, "130+": 1 },
      H3: { "-70": 1, "70-90": 1, "90-110": 1, "110-130": 1, "130+": 1 }
    },
    JAUNE: {
      H1: { "-70": 2500, "70-90": 2500, "90-110": 2500, "110-130": 2500, "130+": 990 },
      H2: { "-70": 2500, "70-90": 2500, "90-110": 2500, "110-130": 2500, "130+": 2500 },
      H3: { "-70": 2500, "70-90": 2500, "90-110": 2500, "110-130": 2500, "130+": 2500 }
    },
    VIOLET: {
      H1: { "-70": 5200, "70-90": 4300, "90-110": 3200, "110-130": 2800, "130+": 1400 },
      H2: { "-70": 5490, "70-90": 4800, "90-110": 3900, "110-130": 3500, "130+": 1900 },
      H3: { "-70": 7500, "70-90": 7500, "90-110": 7500, "110-130": 7500, "130+": 7500 }
    }
  };
  RAC_CEE.ROSE = RAC_CEE.VIOLET; // même barème pour simplifier

  function getDepartement(cpRaw) {
    if (!cpRaw) return null;
    const s = String(cpRaw).trim();
    if (s.length < 2) return null;
    if (s.startsWith("97") || s.startsWith("98")) return s.slice(0, 3);
    return s.slice(0, 2);
  }

  function getZoneFromCp(cpRaw) {
    const dep = getDepartement(cpRaw);
    if (!dep) return null;
    if (H3_DEPARTMENTS.includes(dep)) return "H3";
    if (H2_DEPARTMENTS.includes(dep)) return "H2";
    if (H1_DEPARTMENTS.includes(dep)) return "H1";
    return null;
  }

  function isIleDeFrance(dep) {
    return dep && IDF_DEPARTMENTS.includes(dep);
  }

  function parseEuro(inputValue) {
    if (inputValue == null) return NaN;
    const s = String(inputValue).replace(/\s/g, "").replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? Math.round(n) : NaN;
  }

  function classifyProfile(rfr, foyerSize, cpRaw) {
    const dep = getDepartement(cpRaw);
    const idf = isIleDeFrance(dep);
    const table = idf ? RFR_THRESHOLDS.idf : RFR_THRESHOLDS.hors;

    const n = Math.max(1, Math.min(parseInt(foyerSize, 10) || 1, 5));
    const extraPersons = Math.max(0, (parseInt(foyerSize, 10) || 1) - 5);

    const row = table[n];
    if (!row) return null;

    const bleuMax   = row.bleu   + extraPersons * table.extra.bleu;
    const jauneMax  = row.jaune  + extraPersons * table.extra.jaune;
    const violetMax = row.violet + extraPersons * table.extra.violet;

    if (rfr <= bleuMax)   return "BLEU";
    if (rfr <= jauneMax)  return "JAUNE";
    if (rfr <= violetMax) return "VIOLET";
    return "ROSE";
  }

  function getRac(profile, zone, surfaceKey) {
    if (!profile || !zone || !surfaceKey) return null;
    const p = RAC_CEE[profile];
    if (!p) return null;
    const z = p[zone];
    if (!z) return null;
    return z[surfaceKey] != null ? z[surfaceKey] : null;
  }

  /* ---------- 3) Calcul principal PAC / CEE ---------- */

  function runPacSimulation() {
    const cp        = form.querySelector('#cp')?.value || '';
    const foyerVal  = form.querySelector('#foyer')?.value || '';
    const surface   = form.querySelector('#surface')?.value || '';
    const rfrRaw    = form.querySelector('#rfr')?.value || '';
    const chauffage = form.querySelector('#chauffage')?.value || '';

    const errors = [];

    if (!cp || cp.trim().length < 4) {
      errors.push("Merci d’indiquer un code postal valable.");
    }
    if (!surface) {
      errors.push("Merci d’indiquer la surface habitable.");
    }
    if (!foyerVal) {
      errors.push("Merci d’indiquer le nombre de personnes dans le foyer fiscal.");
    }

    const rfr = parseEuro(rfrRaw);
    if (!rfr || rfr <= 0) {
      errors.push("Merci d’indiquer votre revenu fiscal de référence.");
    }

    if (!chauffage) {
      errors.push("Merci de préciser le chauffage principal actuel.");
    }

    if (errors.length) {
      alert(errors[0]);
      return;
    }

    // --- Calcul CEE / profil ---
    const dep      = getDepartement(cp);
    const zone     = getZoneFromCp(cp) || 'H2';
    const foyerInt = parseInt(foyerVal, 10) || 1;
    const profile  = classifyProfile(rfr, foyerInt, cp);   // BLEU / JAUNE / VIOLET / ROSE
    const rac      = getRac(profile, zone, surface);       // reste à charge estimé

    if (rac == null) {
      alert("Impossible de calculer le reste à charge avec ces paramètres.");
      return;
    }

    // --- Affichage du bloc résultat ---
    if (recap) recap.style.display = 'block';
    if (rcCards) rcCards.style.display = 'block';

    const racSpan = document.getElementById('rc-rac-amount');
    if (racSpan) {
      racSpan.textContent = rac.toLocaleString('fr-FR') + ' €';
    }

    // Helpers d’affichage
    function setText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function formatSurface(key) {
      switch (key) {
        case '-70':     return '< 70 m²';
        case '70-90':   return '70 à 90 m²';
        case '90-110':  return '90 à 110 m²';
        case '110-130': return '110 à 130 m²';
        case '130+':    return '> 130 m²';
        default:        return '—';
      }
    }

    function getChauffageLabel() {
      const sel = form.querySelector('#chauffage');
      if (!sel) return '';
      const opt = sel.options[sel.selectedIndex];
      return opt ? opt.textContent : '';
    }

    // Rappel d’infos
    setText('rc-dep', dep || '—');
    setText('rc-zone', zone || '—');
    setText('rc-profile', profile || '—');
    setText('rc-foyer', foyerInt + (foyerInt > 1 ? ' personnes' : ' personne'));
    setText('rc-rfr', rfr.toLocaleString('fr-FR') + ' €');
    setText('rc-surface', formatSurface(surface));
    setText('rc-chauffage', getChauffageLabel());

    // Masquer les blocs marqués data-hide-after-sim="1"
    sectionsToHide.forEach((el) => {
      el.style.display = "none";
    });

    // Afficher le bandeau téléphone
    if (telBanner) {
      telBanner.classList.add("tel-banner--visible");
      telBanner.setAttribute("aria-hidden", "false");
    }

    // Scroll vers les résultats
    recap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- 4) Clics sur Suivant / Retour ---------- */

  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (currentIndex < total - 1) {
        if (!isCurrentStepValid()) return;
        showStep(currentIndex + 1);
      } else {
        // Dernière étape : on lance le calcul (pas de submit)
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
