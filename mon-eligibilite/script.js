document.addEventListener("DOMContentLoaded", function () {
  
  /* --- 1. NAVIGATION SIMULATEUR --- */
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
    
    // Progress Bar
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
    // Validation simple
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
      calculateResult();
    }
  });

  btnPrev.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  });

  /* --- 2. CALCUL RESULTAT (LOGIQUE CEE SIMPLIFIÉE) --- */
  function calculateResult() {
    // Récupération des valeurs
    const cp = document.getElementById("cp").value;
    const surface = document.getElementById("surface").value;
    const foyer = document.getElementById("foyer").value;
    const rfr = document.getElementById("rfr").value;
    const chauffage = document.getElementById("chauffage").value;

    // Logique simplifiée pour démo (Tu peux remettre ta logique complexe ici)
    let rac = "1 €"; // Par défaut cible marketing
    
    // Si revenus élevés (RFR > 50000 approximatif pour l'exemple) -> reste à charge plus haut
    const rfrClean = parseInt(rfr.replace(/\D/g, '')) || 0;
    if (rfrClean > 35000) {
      rac = "2 500 €";
    }
    if (rfrClean > 60000) {
      rac = "4 500 €";
    }

    // Affichage
    document.getElementById("rc-rac-amount").textContent = rac;
    document.getElementById("rc-dep").textContent = cp.substring(0, 2);
    document.getElementById("rc-profile").textContent = rfrClean > 30000 ? "Modeste" : "Très Modeste";
    document.getElementById("rc-foyer").textContent = foyer + " pers.";
    document.getElementById("rc-rfr").textContent = rfr;
    document.getElementById("rc-chauffage").textContent = chauffage;

    // Masquer le hero et afficher le résultat
    document.getElementById("hero").style.display = "none";
    document.querySelectorAll('[data-hide-after-sim="1"]').forEach(el => el.style.display = "none");
    
    const resultSection = document.getElementById("recap");
    resultSection.style.display = "block";
    resultSection.scrollIntoView({ behavior: "smooth" });

    // Afficher bandeau SMS
    document.querySelector(".tel-banner").classList.add("tel-banner--visible");
  }

  /* --- 3. FORMATAGE INPUTS --- */
  // Espace automatique pour le RFR (ex: 20 000)
  const rfrInput = document.getElementById("rfr");
  rfrInput.addEventListener("input", function(e) {
    let val = e.target.value.replace(/\D/g, '');
    e.target.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  });

  /* --- 4. FAQ ACCORDÉON --- */
  document.querySelectorAll(".faq__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      
      // Fermer tous les autres
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

  /* --- 5. COOKIE TOAST --- */
  const toast = document.getElementById("cookie-toast");
  setTimeout(() => {
    if(!localStorage.getItem("cookieConsent")) {
      toast.classList.add("is-visible");
    }
  }, 1000);

  document.getElementById("btn-accept").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    toast.classList.remove("is-visible");
  });
  
  document.getElementById("btn-decline").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    toast.classList.remove("is-visible");
  });
});
