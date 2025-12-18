/* =========================================================
   1. FAQ — Accordéon (Ne pas toucher)
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
})();

/* =========================================================
   2. Mentions légales — Popup (Ne pas toucher)
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
   3. SIMULATEUR PAC – Logique Complète
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form  = document.getElementById("form-estimation");
  // On cible les étapes qui sont DANS le bloc sim-step-1
  const steps = Array.from(document.querySelectorAll("#sim-step-1 .card-step"));
  
  if (!form || !steps.length) return;

  const spanCurrent = document.getElementById("step-current");
  const spanTotal   = document.getElementById("step-total");
  const bar         = document.getElementById("step-bar");
  const btnPrev     = document.getElementById("step-prev");
  const btnNext     = document.getElementById("step-next");

  const total = steps.length;
  if (spanTotal) spanTotal.textContent = String(total);

  let currentIndex = 0;

  /* ---------- Navigation entre les questions ---------- */
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

  // Initialisation
  showStep(0);

  /* ---------- Bouton final change de texte ---------- */
  const selectChauffage = form.querySelector("#chauffage");
  if (selectChauffage && btnNext) {
    selectChauffage.addEventListener("change", function () {
      if (currentIndex === total - 1 && this.value) {
        btnNext.textContent = "Afficher mon reste à charge";
      }
    });
  }

  /* ---------- Formatage RFR (Espace milliers) ---------- */
  const rfrInput = form.querySelector('#rfr');
  if (rfrInput) {
    rfrInput.addEventListener('blur', function() {
        let val = this.value.replace(/\s/g, '').replace(/[^\d]/g, '');
        if (!val) { this.value = ''; return; }
        val = parseInt(val, 10).toString();
        this.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    });
  }

  /* ---------- Formatage Téléphone (Espaces) ---------- */
  const telInput = document.getElementById('inline-phone');
  if (telInput) {
    telInput.addEventListener('input', function() {
        let val = this.value.replace(/\D/g, '');
        val = val.substring(0, 10);
        const groups = val.match(/.{1,2}/g);
        this.value = groups ? groups.join(' ') : '';
    });
  }

  /* =========================================================
     DONNÉES CEE & CALCULATEUR (Ne pas toucher)
     ========================================================= */
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
    BLEU: { H1: {"-70":1}, H2: {"-70":1}, H3: {"-70":1} }, // Simplifié pour l'exemple, force 1€ pour Bleu
    JAUNE: { H1: {"-70":2500}, H2: {"-70":2500}, H3: {"-70":2500} },
    VIOLET: { H1: {"-70":5200}, H2: {"-70":5490}, H3: {"-70":7500} }
  };

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

  function isIleDeFrance(dep) { return dep && IDF_DEPARTMENTS.includes(dep); }

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
    // Logique simplifiée
    const row = table[n];
    if (!row) return "ROSE";
    if (rfr <= row.bleu) return "BLEU";
    if (rfr <= row.jaune) return "JAUNE";
    if (rfr <= row.violet) return "VIOLET";
    return "ROSE";
  }

  /* =========================================================
     4. FONCTION "SWAP" - C'est ici que la magie opère !
     ========================================================= */
  function runPacSimulation() {
    const cp        = form.querySelector('#cp')?.value || '';
    const rfrRaw    = form.querySelector('#rfr')?.value || '';
    const foyerVal  = form.querySelector('#foyer')?.value || '1';
    
    // Calcul (Simplifié pour l'UX, tu peux garder tes calculs complexes si besoin)
    const rfr = parseEuro(rfrRaw);
    const profile = classifyProfile(rfr, foyerVal, cp);
    
    // Détermination du prix affiché
    let racDisplayAmount = "1 €"; // Par défaut (Bleu)
    
    if (profile === "JAUNE") racDisplayAmount = "2 500 €";
    if (profile === "VIOLET") racDisplayAmount = "4 500 €";
    if (profile === "ROSE") racDisplayAmount = "Audit requis";

    // --- LE SWAP : On cache le formulaire, on montre le résultat ---
    const step1 = document.getElementById('sim-step-1');
    const step2 = document.getElementById('sim-step-2');
    
    // On met à jour les textes de la carte résultat
    const racSpan = document.getElementById('new-rac-display');
    const depSpan = document.getElementById('res-dep');
    const dep = getDepartement(cp);

    if (racSpan) racSpan.textContent = racDisplayAmount;
    if (depSpan && dep) depSpan.textContent = dep;

    // Transition
    if(step1) step1.style.display = 'none';
    if(step2) step2.style.display = 'block';

    // Changement du titre du header pour féliciter
    const mainTitle = document.querySelector('.card__head .t1');
    const subTitle = document.querySelector('.card__head .t2');
    
    if(mainTitle) {
        mainTitle.innerHTML = "🎉 Estimation terminée !";
        mainTitle.style.color = "#ffffff";
    }
    if(subTitle) {
        subTitle.textContent = "Voici votre éligibilité et votre offre personnalisée.";
        subTitle.style.color = "#22c55e"; // Vert
        subTitle.style.fontWeight = "bold";
    }

    // Masquer le reste de la page pour focaliser l'attention
    const sectionsToHide = document.querySelectorAll("[data-hide-after-sim='1']");
    sectionsToHide.forEach(el => el.style.display = "none");

    // Scroll doux pour recentrer si besoin
    const card = document.querySelector('.card');
    if(card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ---------- Clics Suivant / Retour ---------- */
  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (currentIndex < total - 1) {
        if (!isCurrentStepValid()) return;
        showStep(currentIndex + 1);
      } else {
        // DERNIÈRE ÉTAPE : ON LANCE LE SWAP
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
