document.addEventListener("DOMContentLoaded", function () {
  
  /* --- NAVIGATION SIMULATEUR --- */
  const steps = Array.from(document.querySelectorAll(".card-step"));
  const btnNext = document.getElementById("step-next");
  const btnPrev = document.getElementById("step-prev");
  const stepCurrentSpan = document.getElementById("step-current");
  const stepBar = document.getElementById("step-bar");
  
  let currentStep = 0;
  const totalSteps = steps.length;

  function updateUI() {
    steps.forEach((el, index) => {
      el.style.display = index === currentStep ? "block" : "none";
    });
    
    // Bar
    const progress = ((currentStep + 1) / totalSteps) * 100;
    stepBar.style.width = `${progress}%`;
    stepCurrentSpan.textContent = currentStep + 1;

    // Buttons
    btnPrev.style.visibility = currentStep === 0 ? "hidden" : "visible";
    if (currentStep === totalSteps - 1) {
      btnNext.textContent = "Calculer mon aide";
    } else {
      btnNext.textContent = "Suivant";
    }
  }

  btnNext.addEventListener("click", () => {
    // Validation
    const currentInputs = steps[currentStep].querySelectorAll("input, select");
    let valid = true;
    currentInputs.forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        valid = false;
      }
    });

    if (!valid) return;

    if (currentStep < totalSteps - 1) {
      currentStep++;
      updateUI();
    } else {
      // Afficher le "Gate" avant le résultat final
      document.getElementById("gate-overlay").style.display = "flex";
    }
  });

  btnPrev.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  });

  /* --- LOGIQUE "GATE" (Formulaire Capture Lead) --- */
  document.getElementById("gate-form").addEventListener("submit", function(e) {
    e.preventDefault();
    // Ici vous pourriez envoyer les données vers votre CRM
    
    document.getElementById("gate-overlay").style.display = "none";
    calculateResult();
  });

  /* --- CALCUL & AFFICHAGE RESULTAT --- */
  function calculateResult() {
    const cp = document.getElementById("cp").value;
    const surface = document.getElementById("surface").value;
    const foyer = document.getElementById("foyer").value;
    const rfr = document.getElementById("rfr").value;
    const chauffage = document.getElementById("chauffage").value;

    // Logique simplifiée (Simulacre)
    let rac = "1 €";
    let aide = "10 500 €";
    
    // Exemple logique basique
    const rfrClean = parseInt(rfr.replace(/\D/g, '')) || 0;
    if (rfrClean > 35000) { rac = "2 500 €"; aide = "6 000 €"; }
    if (rfrClean > 60000) { rac = "4 500 €"; aide = "3 000 €"; }

    // Remplissage DOM
    document.getElementById("rc-rac-amount").textContent = rac;
    document.getElementById("rc-annual").textContent = aide;
    document.getElementById("prod-prix").textContent = rac;
    
    document.getElementById("rc-dep").textContent = cp.substring(0, 2);
    document.getElementById("rc-profile").textContent = rfrClean > 30000 ? "Intermédiaire" : "Modeste";
    document.getElementById("rc-foyer").textContent = foyer + " pers.";
    document.getElementById("rc-rfr").textContent = rfr;
    document.getElementById("rc-chauffage").textContent = chauffage;
    
    const surfaceText = document.querySelector(`#surface option[value="${surface}"]`).text;
    document.getElementById("rc-surface").textContent = surfaceText;

    // Transition Hero -> Résultat
    document.getElementById("hero").style.display = "none";
    document.querySelectorAll('[data-hide-after-sim="1"]').forEach(el => el.style.display = "none");
    
    const recap = document.getElementById("recap");
    recap.style.display = "block";
    recap.scrollIntoView({ behavior: "smooth" });

    document.getElementById("prod").style.display = "block";
    document.getElementById("autofin").style.display = "block";
    
    // Bandeau SMS
    const telBanner = document.getElementById("tel-banner");
    telBanner.classList.add("tel-banner--visible");
  }

  /* --- UX INPUTS --- */
  // Espace millier RFR
  const rfrInput = document.getElementById("rfr");
  rfrInput.addEventListener("input", function(e) {
    let val = e.target.value.replace(/\D/g, '');
    e.target.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  });

  /* --- FAQ --- */
  document.querySelectorAll(".faq__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq__btn").forEach(b => {
        b.setAttribute("aria-expanded", "false");
        b.parentElement.classList.remove("is-open");
        b.nextElementSibling.style.maxHeight = null;
      });
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        btn.parentElement.classList.add("is-open");
        const panel = btn.nextElementSibling;
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* --- MENTIONS LEGALES --- */
  const mentionsBtn = document.getElementById("mentions-legales-link");
  const mentionsPopup = document.getElementById("mentions-popup");
  const closeMentions = document.getElementById("close-mentions");

  mentionsBtn.addEventListener("click", () => { mentionsPopup.style.display = "block"; });
  closeMentions.addEventListener("click", () => { mentionsPopup.style.display = "none"; });

  /* --- COOKIE TOAST --- */
  const toast = document.getElementById("cookie-toast");
  setTimeout(() => {
    if(!localStorage.getItem("cookieConsent")) {
      toast.classList.add("is-visible");
    }
  }, 1000);

  document.getElementById("btn-accept").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    toast.classList.remove("is-visible");
    if (typeof gtag === 'function') {
        gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted'
        });
    }
  });
  
  document.getElementById("btn-decline").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    toast.classList.remove("is-visible");
  });
});
