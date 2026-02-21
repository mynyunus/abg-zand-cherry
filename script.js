const WA_PHONE = "60139888198";
const BASE_WA_TEXT = "Hi Mukhlis, saya nak tanya kereta Jetour dan nak check loan free";

const navbar = document.querySelector(".navbar");
const menuBtn = document.querySelector("#mobile-menu-btn");
const mobileMenu = document.querySelector("#mobile-menu");
const backToTopBtn = document.querySelector("#backToTop");

function buildWhatsAppLink(message) {
  return `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(message)}`;
}

function handleScrollState() {
  const isScrolled = window.scrollY > 24;
  navbar?.classList.toggle("is-scrolled", isScrolled);
  backToTopBtn?.classList.toggle("is-visible", window.scrollY > 500);
}

function toggleMobileMenu(forceOpen) {
  if (!menuBtn || !mobileMenu) return;
  const willOpen = typeof forceOpen === "boolean" ? forceOpen : !mobileMenu.classList.contains("is-open");
  mobileMenu.classList.toggle("is-open", willOpen);
  menuBtn.setAttribute("aria-expanded", String(willOpen));
}

function setupMobileNav() {
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", () => toggleMobileMenu());

  mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => toggleMobileMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) toggleMobileMenu(false);
  });
}

function setupRevealOnScroll() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealEls.forEach((el) => el.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function setupBackToTop() {
  if (!backToTopBtn) return;
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupLoanCalculator() {
  const form = document.querySelector("#loanForm");
  const priceInput = document.querySelector("#carPrice");
  const depositInput = document.querySelector("#downPayment");
  const rateInput = document.querySelector("#interestRate");
  const yearsInput = document.querySelector("#loanYears");
  const calcTypeInput = document.querySelector("#calcType");
  const principalOut = document.querySelector("#loanPrincipalOut");
  const monthlyOut = document.querySelector("#monthlyOut");
  const interestOut = document.querySelector("#interestOut");
  const totalOut = document.querySelector("#totalOut");
  const calcWhatsApp = document.querySelector("#calcWhatsApp");

  if (!form || !priceInput || !depositInput || !rateInput || !yearsInput || !calcTypeInput) return;

  const moneyFormat = new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2
  });

  function formatMoney(value) {
    return moneyFormat.format(Number.isFinite(value) ? value : 0);
  }

  function calculate() {
    const price = Math.max(Number(priceInput.value) || 0, 0);
    const deposit = Math.max(Number(depositInput.value) || 0, 0);
    const annualRate = Math.max(Number(rateInput.value) || 0, 0);
    const years = Math.min(Math.max(Number(yearsInput.value) || 1, 1), 9);
    const calcType = calcTypeInput.value;
    const calcTypeLabel = calcType === "reducing" ? "Reducing Balance" : "Flat Rate";

    const principal = Math.max(price - deposit, 0);
    const months = years * 12;
    let monthly = 0;
    let totalPayable = 0;
    let totalInterest = 0;

    if (principal > 0 && months > 0) {
      if (calcType === "reducing") {
        const monthlyRate = annualRate / 12 / 100;
        if (monthlyRate === 0) {
          monthly = principal / months;
        } else {
          monthly = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
        }
        totalPayable = monthly * months;
        totalInterest = totalPayable - principal;
      } else {
        totalInterest = principal * (annualRate / 100) * years;
        totalPayable = principal + totalInterest;
        monthly = totalPayable / months;
      }
    }

    principalOut.textContent = formatMoney(principal);
    monthlyOut.textContent = formatMoney(monthly);
    interestOut.textContent = formatMoney(totalInterest);
    totalOut.textContent = formatMoney(totalPayable);

    if (calcWhatsApp) {
      const message = `${BASE_WA_TEXT}. Saya dah guna loan calculator: harga ${formatMoney(price)}, deposit ${formatMoney(
        deposit
      )}, tempoh ${years} tahun, kadar ${annualRate}% (${calcTypeLabel}). Anggaran bulanan ${formatMoney(
        monthly
      )}. Boleh bantu semak kelayakan saya?`;
      calcWhatsApp.href = buildWhatsAppLink(message);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
  });

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(calculate);
  });

  calculate();
}

window.addEventListener("scroll", handleScrollState, { passive: true });
window.addEventListener("load", handleScrollState);

setupMobileNav();
setupRevealOnScroll();
setupBackToTop();
setupLoanCalculator();
