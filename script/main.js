// * SOLARSUX - Main JavaScript File

(function () {
  "use strict";

  // ==========================================================================
  // UTILITY HELPERS
  // ==========================================================================

  /**
   * Generic accordion initializer.
   * Works with any list of .faq-item elements (or a custom selector).
   * Each item must contain:
   *   - .faq-item-header  (click target)
   *   - .faq-toggle       (button whose SVG path gets swapped)
   * @param {string} itemSelector  CSS selector for each accordion item
   */
  const initAccordion = (itemSelector) => {
    const items = document.querySelectorAll(itemSelector);
    if (!items.length) return;

    const ICON_MINUS = '<path d="M5 12h14"/>';
    const ICON_PLUS = '<path d="M12 5v14"/><path d="M5 12h14"/>';

    items.forEach((item) => {
      item.addEventListener("click", () => {
        const isActive = item.classList.contains("active");

        // Close all items first (accordion / single-open behavior)
        items.forEach((el) => {
          el.classList.remove("active");
          const toggleBtn = el.querySelector(".faq-toggle");
          if (toggleBtn) {
            toggleBtn.setAttribute("aria-label", "Expand answer");
            toggleBtn.querySelector("svg").innerHTML = ICON_PLUS;
          }
        });

        // Re-open the clicked item if it was closed
        if (!isActive) {
          item.classList.add("active");
          const toggleBtn = item.querySelector(".faq-toggle");
          if (toggleBtn) {
            toggleBtn.setAttribute("aria-label", "Collapse answer");
            toggleBtn.querySelector("svg").innerHTML = ICON_MINUS;
          }
        }
      });
    });
  };

  // ==========================================================================
  // SCROLL REVEAL ANIMATIONS
  // ==========================================================================
  const initScrollReveal = () => {
    if (typeof anime === "undefined") {
      console.warn("SolarSux: anime.js is not loaded.");
      return;
    }

    const targetSelectors = [
      // Headings
      "h1",
      "h2",

      // ── index.html ────────────────────────────────────────────────────────
      ".stat-card",
      ".feature-card",
      ".accordion-item",
      ".comparison-card",
      ".industry-tab-item",
      ".process-card",
      ".roi-card-input",
      ".roi-metric-card",
      ".project-card",
      ".pricing-card",
      ".testimonial-card",
      ".faq-item",
      ".faq-cta-card",
      ".footer-body-card",

      // ── about.html ────────────────────────────────────────────────────────
      ".purpose-card",
      ".journey-item",
      ".team-card",
      ".impact-card",

      // ── projects.html ─────────────────────────────────────────────────────
      ".project-full-card",

      // ── services.html ─────────────────────────────────────────────────────
      ".package-item",
      ".energy-flow-step",
      ".energy-flow-card",
      ".compare-card",

      // ── blogs.html & blog detail ──────────────────────────────────────────
      ".blog-card",
      ".blog-takeaway-card",
      ".blog-total-card",
      ".blog-testimonial-card",
      ".blog-cta-card",
      ".blog-author-card",

      // ── quote.html ────────────────────────────────────────────────────────
      ".quote-form-card",
      ".quote-summary-card",
      ".quote-contact-card",
    ];

    // ── Horizontal Slide selectors for large images ─────────────────────────
    const leftSelectors = [
      ".media-box",
      ".energy-banner",
      ".contact-office-card",
      ".blog-full-img"
    ];

    const rightSelectors = [
      ".media-wrapper",
      ".industry-display",
      ".who-image-card",
      ".journey-display",
      ".package-display-img-card",
      ".project-full-img-card",
      ".stat-image-card"
    ];

    // Tag left/right targets with initial CSS reveal classes
    const leftTargets = document.querySelectorAll(leftSelectors.join(", "));
    leftTargets.forEach((el) => el.classList.add("reveal-left"));

    const rightTargets = document.querySelectorAll(rightSelectors.join(", "));
    rightTargets.forEach((el) => el.classList.add("reveal-right"));

    // Tag standard targets with reveal-init (if not already tagged or child of one)
    const allTargets = document.querySelectorAll(targetSelectors.join(", "));
    const selectorString = targetSelectors.join(", ");

    allTargets.forEach((el) => {
      if (el.parentElement && el.parentElement.closest(selectorString)) return;
      el.classList.add("reveal-init");
    });

    // ── Vertical Reveal Observer ──
    let animationQueue = [];
    let queueTimeout = null;

    const animateBatch = () => {
      if (animationQueue.length === 0) return;

      anime({
        targets: animationQueue,
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 800,
        easing: "easeOutQuart",
        delay: anime.stagger(25),
      });

      animationQueue = [];
      queueTimeout = null;
    };

    const verticalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          verticalObserver.unobserve(entry.target);
          animationQueue.push(entry.target);
          if (!queueTimeout) {
            queueTimeout = setTimeout(animateBatch, 0);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10px 0px",
        threshold: 0.02,
      }
    );

    document.querySelectorAll(".reveal-init").forEach((el) => verticalObserver.observe(el));

    // ── Horizontal Reveal Observer ──
    const horizontalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          horizontalObserver.unobserve(entry.target);

          const isMobile = window.innerWidth < 768;
          const isLeft = entry.target.classList.contains("reveal-left");

          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateX: isMobile ? 0 : (isLeft ? [-80, 0] : [80, 0]),
            translateY: isMobile ? [30, 0] : 0,
            duration: 850,
            easing: "easeOutQuart",
          });
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10px 0px",
        threshold: 0.02,
      }
    );

    document.querySelectorAll(".reveal-left, .reveal-right").forEach((el) => horizontalObserver.observe(el));
  };
  // MAIN INIT
  // ==========================================================================

  const init = () => {
    console.log("SolarSux: Core engine initializing...");

    const header = document.querySelector(".site-header");

    // -------------------------------------------------------------------------
    // MOBILE NAV TOGGLE
    // -------------------------------------------------------------------------
    const mobileToggle = document.querySelector(".mobile-toggle");
    const overlay = document.querySelector(".mobile-overlay");

    const toggleMobileMenu = () => {
      if (!header) return;
      const isOpen = header.classList.toggle("menu-open");
      if (mobileToggle) {
        mobileToggle.classList.toggle("is-active");
        mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    if (mobileToggle) mobileToggle.addEventListener("click", toggleMobileMenu);
    if (overlay) overlay.addEventListener("click", toggleMobileMenu);

    // Close drawer when a nav link is clicked (same-page anchors)
    document
      .querySelectorAll(".nav-link:not(.dropdown-toggle)")
      .forEach((link) => {
        link.addEventListener("click", () => {
          if (header?.classList.contains("menu-open")) toggleMobileMenu();
        });
      });

    // -------------------------------------------------------------------------
    // MOBILE DROPDOWN TOGGLE (accordion-style, mobile only)
    // -------------------------------------------------------------------------
    const dropdowns = document.querySelectorAll(".nav-item-dropdown");

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      if (!toggle) return;

      toggle.addEventListener("click", (e) => {
        if (window.innerWidth > 991) return; // desktop: CSS :hover handles it

        e.preventDefault();
        e.stopPropagation();

        const isOpen = dropdown.classList.contains("is-open");

        // Accordion: close all siblings first
        dropdowns.forEach((other) => {
          if (other !== dropdown) other.classList.remove("is-open");
        });

        dropdown.classList.toggle("is-open", !isOpen);
      });
    });

    // Close dropdowns on outside click
    document.addEventListener("click", (e) => {
      if (!header?.contains(e.target)) {
        dropdowns.forEach((d) => d.classList.remove("is-open"));
      }
    });

    // Close mobile drawer on viewport expansion
    window.addEventListener("resize", () => {
      if (window.innerWidth > 991 && header?.classList.contains("menu-open")) {
        toggleMobileMenu();
      }
    });

    // -------------------------------------------------------------------------
    // HERO SHOWCASE BANNER SWITCHER
    // -------------------------------------------------------------------------
    const heroThumbnails = document.querySelectorAll(
      ".hero-thumbnails .thumbnail-card",
    );
    const mainHeroBanner = document.getElementById("main-hero-banner");

    if (heroThumbnails.length && mainHeroBanner) {
      heroThumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
          if (thumbnail.classList.contains("active")) return;

          heroThumbnails.forEach((t) => t.classList.remove("active"));
          thumbnail.classList.add("active");

          mainHeroBanner.style.opacity = "0";
          setTimeout(() => {
            mainHeroBanner.src = thumbnail.getAttribute("data-banner");
            mainHeroBanner.style.opacity = "1";
          }, 300);
        });
      });
    }

    // -------------------------------------------------------------------------
    // INDUSTRY SOLUTIONS TAB SWITCHER
    // -------------------------------------------------------------------------
    const industryTabs = document.querySelectorAll(".industry-tab-item");
    const displayImg = document.getElementById("industry-display-img");
    const displayBadge = document.getElementById("industry-display-badge");
    const displayTitle = document.getElementById("industry-display-title");
    const displayDesc = document.getElementById("industry-display-desc");

    const TAB_DATA = {
      residential: {
        img: "assets/images/home-page/industry-1.jpg",
        badge: "01 / RESIDENTIAL",
        title: "Homes",
        desc: "Luxury solar systems for villas and estates. Cut electricity bills and live off the grid in style with our premium residential solutions.",
      },
      commercial: {
        img: "assets/images/home-page/industry-2.jpg",
        badge: "02 / COMMERCIAL",
        title: "Business",
        desc: "High-performance solar integration for businesses and offices. Substantially lower your operating overheads and showcase environmental leadership.",
      },
      industrial: {
        img: "assets/images/home-page/industry-3.jpg",
        badge: "03 / INDUSTRIAL",
        title: "Factories",
        desc: "Heavy-duty industrial arrays designed to handle high loads and power manufacturing processes seamlessly with robust backup systems.",
      },
      agriculture: {
        img: "assets/images/home-page/industry-4.jpg",
        badge: "04 / AGRISOLAR",
        title: "Agriculture",
        desc: "Innovative dual-use solar layouts that shade crops, optimize water retention, and power farming machinery simultaneously.",
      },
    };

    if (
      industryTabs.length &&
      displayImg &&
      displayBadge &&
      displayTitle &&
      displayDesc
    ) {
      industryTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          if (tab.classList.contains("active")) return;

          const data = TAB_DATA[tab.getAttribute("data-tab")];
          if (!data) return;

          industryTabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");

          displayImg.style.opacity = "0.2";
          setTimeout(() => {
            displayImg.src = data.img;
            displayBadge.textContent = data.badge;
            displayTitle.textContent = data.title;
            displayDesc.textContent = data.desc;
            displayImg.style.opacity = "1";
          }, 250);
        });
      });
    }

    // -------------------------------------------------------------------------
    // PROJECT WEALTH — ROI ENGINE CALCULATOR
    // -------------------------------------------------------------------------

    // --- Solar production multipliers by US state ---
    const LOCATION_MULTIPLIERS = {
      California: 1.0,
      Texas: 0.95,
      Florida: 1.05,
      "New York": 0.75,
      Illinois: 0.7,
    };

    // --- System size base formula constants ---
    const KW_PER_DOLLAR_BILL = 0.05166; // produces ~6.2 kW at $120/mo
    const KW_PER_PANEL = 0.385; // 385W panel
    const SQFT_PER_PANEL = 22; // installation footprint per panel
    const COST_PER_KW = 2500; // installed cost $/kW
    const FEDERAL_ITC = 0.3; // 30% federal solar tax credit
    const SAVINGS_RATIO = 0.84167; // ~84% of bill saved at ideal system size

    // --- DOM references ---
    const billSlider = document.getElementById("roi-bill-slider");
    const billValueDisplay = document.getElementById("roi-bill-value");
    const locationSelect = document.getElementById("roi-location");
    const roofInput = document.getElementById("roi-roof-size");
    const homeTypeSelect = document.getElementById("roi-home-type");

    const valSystem = document.getElementById("roi-val-system");
    const valPanels = document.getElementById("roi-val-panels");
    const valCost = document.getElementById("roi-val-cost");
    const valMonthly = document.getElementById("roi-val-monthly");
    const valYearly = document.getElementById("roi-val-yearly");
    const val25Years = document.getElementById("roi-val-25years");
    const valPayback = document.getElementById("roi-val-payback");

    /** Fills the range slider track with a left-to-right fill. */
    const updateSliderProgress = (slider) => {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const val = parseFloat(slider.value) || 0;
      const percent = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(
        to right,
        var(--color-secondary) 0%,
        var(--color-secondary) ${percent}%,
        #e8eef0 ${percent}%,
        #e8eef0 100%
      )`;
    };

    const updateCalculator = () => {
      if (!billSlider) return;

      const bill = parseFloat(billSlider.value);
      const location = locationSelect?.value ?? "California";
      const homeType = homeTypeSelect?.value ?? "residential";
      const roofSize = roofInput?.value ? parseFloat(roofInput.value) : NaN;

      // Update live bill value label and slider fill
      if (billValueDisplay)
        billValueDisplay.textContent = `$${Math.round(bill)}`;
      updateSliderProgress(billSlider);

      // 1. Determine multipliers
      const locationMult = LOCATION_MULTIPLIERS[location] ?? 1.0;
      const homeMult = homeType === "commercial" ? 1.25 : 1.0;

      // 2. Ideal (unconstrained) system size in kW
      const idealSystem = bill * KW_PER_DOLLAR_BILL * locationMult * homeMult;

      // 3. Constrain by roof size if provided
      let systemSize = Math.round(idealSystem * 10) / 10;
      let panels = Math.round(systemSize / KW_PER_PANEL);
      panels = Math.max(panels, 1);

      if (!isNaN(roofSize) && roofSize > 0) {
        const maxPanelsByRoof = Math.floor(roofSize / SQFT_PER_PANEL);
        if (panels > maxPanelsByRoof) {
          panels = Math.max(maxPanelsByRoof, 1);
          systemSize = Math.round(panels * KW_PER_PANEL * 10) / 10;
        }
      }

      // 4. Financial calculations
      const grossCost = systemSize * COST_PER_KW;
      const netCost = grossCost * (1 - FEDERAL_ITC);
      const coverageRatio =
        idealSystem > 0 ? Math.min(1.0, systemSize / idealSystem) : 1.0;
      const monthlySavings = Math.min(
        bill * SAVINGS_RATIO * coverageRatio,
        bill,
      );
      const yearlySavings = monthlySavings * 12;
      const savings25Years = yearlySavings * 25;
      const paybackPeriod = yearlySavings > 0 ? netCost / yearlySavings : 0;

      // 5. Update the UI
      if (valSystem)
        valSystem.innerHTML = `${systemSize.toFixed(1)} <small>kW</small>`;
      if (valPanels) valPanels.textContent = String(panels);
      if (valCost)
        valCost.textContent = `$${Math.round(grossCost).toLocaleString()}`;
      if (valMonthly)
        valMonthly.textContent = `$${Math.round(monthlySavings).toLocaleString()}`;
      if (valYearly)
        valYearly.textContent = `$${Math.round(yearlySavings).toLocaleString()}`;
      if (val25Years)
        val25Years.textContent = `$${Math.round(savings25Years).toLocaleString()}`;
      if (valPayback)
        valPayback.innerHTML = `${paybackPeriod.toFixed(1)} <small>years</small>`;
    };

    if (billSlider) {
      // Bind both events for cross-browser reliability
      billSlider.addEventListener("input", updateCalculator);
      billSlider.addEventListener("change", updateCalculator);
      locationSelect?.addEventListener("change", updateCalculator);
      homeTypeSelect?.addEventListener("change", updateCalculator);

      if (roofInput) {
        roofInput.addEventListener("input", updateCalculator);
        roofInput.addEventListener("change", updateCalculator);
        // Block negative numbers and exponential notation in the input
        roofInput.addEventListener("keydown", (e) => {
          if (e.key === "-" || e.key === "e") e.preventDefault();
        });
      }

      // Run once on page load so the UI starts populated
      updateCalculator();
      console.log("SolarSux: ROI Engine initialized.");
    }

    // -------------------------------------------------------------------------
    // FAQ ACCORDION
    // -------------------------------------------------------------------------
    initAccordion(".faq-item");

    // -------------------------------------------------------------------------
    // WHY SOLAR ACCORDION
    // -------------------------------------------------------------------------
    const initWhySolarAccordion = () => {
      const accordionItems = document.querySelectorAll("#why-solar .accordion-item");
      const displayImg = document.querySelector("#why-solar .media-img");
      const displayBadge = document.querySelector("#why-solar .media-badge-text");
      const glassLabel = document.querySelector("#why-solar .glass-indicator-label");
      const glassValue = document.querySelector("#why-solar .glass-indicator-value");

      if (!accordionItems.length || !displayImg) return;

      accordionItems.forEach((item, index) => {
        const header = item.querySelector(".accordion-header");
        if (!header) return;

        header.addEventListener("click", () => {
          if (item.classList.contains("active")) return;

          // Remove active class from all items
          accordionItems.forEach((el) => el.classList.remove("active"));
          // Add active class to clicked item
          item.classList.add("active");

          // Update image, badge and glass indicator with smooth transition
          const imgUrl = item.getAttribute("data-image");
          const badgeText = item.getAttribute("data-badge");
          const glassLabelText = item.getAttribute("data-glass-label");
          const glassValueText = item.getAttribute("data-glass-value");

          // Update indicator dots in both decorations and glass card
          const allDotsSvgs = document.querySelectorAll("#why-solar .media-wrapper svg");
          allDotsSvgs.forEach((svg) => {
            const circles = svg.querySelectorAll("circle");
            if (circles.length === 3) {
              circles.forEach((circle, i) => {
                if (i === index) {
                  circle.setAttribute("fill", "#44D62C");
                  circle.removeAttribute("fill-opacity");
                } else {
                  circle.setAttribute("fill", "white");
                  circle.setAttribute("fill-opacity", "0.5");
                }
              });
            }
          });

          if (imgUrl) {
            displayImg.style.opacity = "0.2";
            if (glassLabel && glassValue) {
              glassLabel.style.opacity = "0.2";
              glassValue.style.opacity = "0.2";
            }
            setTimeout(() => {
              displayImg.src = imgUrl;
              if (displayBadge && badgeText) {
                displayBadge.textContent = badgeText;
              }
              if (glassLabel && glassValue) {
                if (glassLabelText) glassLabel.textContent = glassLabelText;
                if (glassValueText) glassValue.textContent = glassValueText;
                glassLabel.style.opacity = "1";
                glassValue.style.opacity = "1";
              }
              displayImg.style.opacity = "1";
            }, 250);
          }
        });
      });
    };

    initWhySolarAccordion();

    // -------------------------------------------------------------------------
    // PROJECT CARDS EXPANSION / GALLERY TOGGLE
    // -------------------------------------------------------------------------
    const initProjectCards = () => {
      const projectCards = document.querySelectorAll("#recent-projects .project-card");
      if (!projectCards.length) return;

      projectCards.forEach((card) => {
        card.addEventListener("click", (e) => {
          // If clicked on an anchor or button or something interactive inside, ignore
          if (e.target.closest("a") || e.target.closest("button")) {
            return;
          }

          if (card.classList.contains("project-card--highlighted")) {
            return;
          }

          // Deactivate all cards
          projectCards.forEach((c) => {
            c.classList.remove("project-card--highlighted");
          });

          // Activate the clicked card
          card.classList.add("project-card--highlighted");
        });
      });
    };

    initProjectCards();

    // -------------------------------------------------------------------------
    // SCROLL REVEAL ANIMATIONS
    // -------------------------------------------------------------------------
    initScrollReveal();
  };

  // ==========================================================================
  // OUR JOURNEY TIMELINE
  // ==========================================================================
  (function () {
    const items = document.querySelectorAll(".journey-item");
    if (!items.length) return;

    const displayImg = document.getElementById("journey-display-img");
    const displayYear = document.getElementById("journey-display-year");
    const displayIcon = document.getElementById("journey-display-icon");
    const displayTitle = document.getElementById("journey-display-title");
    const displayDesc = document.getElementById("journey-display-desc");

    // Icon SVG paths keyed by data-icon value
    const icons = {
      rocket: `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>`,
      award: `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`,
      zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
      globe: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
    };

    function activateItem(item) {
      // Remove active from all
      items.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");

      const year = item.dataset.year;
      const title = item.dataset.title;
      const desc = item.dataset.desc;
      const img = item.dataset.img;
      const icon = item.dataset.icon;

      // Fade image
      displayImg.style.opacity = "0";
      setTimeout(() => {
        displayImg.src = img;
        displayImg.alt = title;
        displayImg.style.opacity = "1";
      }, 250);

      // Update overlay content
      displayYear.textContent = year;
      displayTitle.innerHTML = title;
      displayDesc.textContent = desc;
      displayIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[icon] || icons.rocket}</svg>`;
    }

    items.forEach((item) => {
      item.addEventListener("click", () => activateItem(item));
    });
  })();

  // ==========================================================================
  // SOLAR PACKAGES
  // ==========================================================================
  (function () {
    const items = document.querySelectorAll(".package-item");
    if (!items.length) return;

    const displayImg = document.getElementById("package-display-img");
    const savingsValue = document.getElementById("package-savings-value");
    const savingsLabel = document.getElementById("package-savings-label");
    const badgeText = document.getElementById("package-badge-text");
    const featuresGrid = document.getElementById("package-features-grid");
    const ctaBtn = document.getElementById("package-cta-btn");

    function renderFeatures(features) {
      featuresGrid.innerHTML = features
        .map(
          (f) => `
      <div class="package-feature-item">
        <span class="package-feature-dot"></span>
        ${f}
      </div>
    `,
        )
        .join("");
    }

    function activatePackage(item) {
      items.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");

      const img = item.dataset.img;
      const savings = item.dataset.savings;
      const badge = item.dataset.badge;
      const cta = item.dataset.cta;
      const features = JSON.parse(item.dataset.features);

      // Fade image
      displayImg.style.opacity = "0";
      setTimeout(() => {
        displayImg.src = img;
        displayImg.style.opacity = "1";
      }, 250);

      // Update badges
      savingsValue.textContent = savings;
      savingsLabel.textContent = savings.toUpperCase();
      badgeText.textContent = badge;

      // Update features
      renderFeatures(features);

      // Update CTA
      ctaBtn.textContent = "";
      ctaBtn.innerHTML = `${cta} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;margin-left:0.5rem"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`;
    }

    // Init features on load
    const firstItem = document.querySelector(".package-item.active");
    if (firstItem) {
      renderFeatures(JSON.parse(firstItem.dataset.features));
    }

    items.forEach((item) => {
      item.addEventListener("click", () => activatePackage(item));
    });
  })();

  // ==========================================================================
  // PROJECTS FILTER
  // ==========================================================================
  (function () {
    const filterBtns = document.querySelectorAll(".projects-filter-btn");
    if (!filterBtns.length) return;

    const cards = document.querySelectorAll(".project-full-card");

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Update active button
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        cards.forEach((card) => {
          if (filter === "all" || card.dataset.category === filter) {
            card.style.display = "grid";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  })();

  // ==========================================================================
  // CASE STUDY ENERGY CHART
  // ==========================================================================
  (function () {
    const canvas = document.getElementById("energyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 180 * dpr;
      canvas.style.width = rect.width - 30 + "px";
      canvas.style.height = "180px";
      ctx.scale(dpr, dpr);
      drawChart(rect.width, 180);
    }

    function drawChart(w, h) {
      ctx.clearRect(0, 0, w, h);

      const padL = 32,
        padR = 16,
        padT = 12,
        padB = 28;
      const chartW = w - padL - padR;
      const chartH = h - padT - padB;

      const labels = [
        "06:00",
        "08:00",
        "10:00",
        "12:00",
        "14:00",
        "16:00",
        "18:00",
        "20:00",
      ];
      const generation = [0, 1.5, 5, 10, 9, 6.5, 2, 0];
      const consumption = [3, 3.2, 3.8, 4, 4.2, 3.9, 3.5, 3];
      const maxVal = 12;

      function xPos(i) {
        return padL + (i / (labels.length - 1)) * chartW;
      }
      function yPos(v) {
        return padT + chartH - (v / maxVal) * chartH;
      }

      // Y-axis gridlines
      ctx.strokeStyle = "rgba(0,61,53,0.06)";
      ctx.lineWidth = 1;
      [0, 3, 6, 9, 12].forEach((v) => {
        const y = yPos(v);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();
        ctx.fillStyle = "rgba(0,61,53,0.35)";
        ctx.font = "10px Manrope, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(v, padL - 6, y + 3.5);
      });

      // X-axis labels
      ctx.fillStyle = "rgba(0,61,53,0.35)";
      ctx.font = "10px Manrope, sans-serif";
      ctx.textAlign = "center";
      labels.forEach((l, i) => {
        ctx.fillText(l, xPos(i), h - 6);
      });

      // Generation fill
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, "rgba(68,214,44,0.35)");
      grad.addColorStop(1, "rgba(68,214,44,0)");
      ctx.beginPath();
      ctx.moveTo(xPos(0), yPos(generation[0]));
      generation.forEach((v, i) => {
        if (i === 0) return;
        const cp1x = xPos(i - 0.5);
        ctx.bezierCurveTo(
          cp1x,
          yPos(generation[i - 1]),
          cp1x,
          yPos(v),
          xPos(i),
          yPos(v),
        );
      });
      ctx.lineTo(xPos(generation.length - 1), padT + chartH);
      ctx.lineTo(xPos(0), padT + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Generation line
      ctx.beginPath();
      ctx.moveTo(xPos(0), yPos(generation[0]));
      generation.forEach((v, i) => {
        if (i === 0) return;
        const cp1x = xPos(i - 0.5);
        ctx.bezierCurveTo(
          cp1x,
          yPos(generation[i - 1]),
          cp1x,
          yPos(v),
          xPos(i),
          yPos(v),
        );
      });
      ctx.strokeStyle = "#44d62c";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Consumption dashed line
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.moveTo(xPos(0), yPos(consumption[0]));
      consumption.forEach((v, i) => {
        if (i === 0) return;
        const cp1x = xPos(i - 0.5);
        ctx.bezierCurveTo(
          cp1x,
          yPos(consumption[i - 1]),
          cp1x,
          yPos(v),
          xPos(i),
          yPos(v),
        );
      });
      ctx.strokeStyle = "rgba(0,61,53,0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  })();

  // ==========================================================================
  // BLOG FILTER + LOAD MORE
  // ==========================================================================
  (function () {
    const filterBtns = document.querySelectorAll(".blog-filter-btn");
    if (!filterBtns.length) return;

    const cards = Array.from(document.querySelectorAll(".blog-card"));
    const loadMoreWrap = document.getElementById("blog-load-more");
    const loadMoreBtn = document.getElementById("blog-load-more-btn");
    const INITIAL_COUNT = 3;

    let currentFilter = "all";
    let isExpanded = false;

    function getFilteredCards(filter) {
      return cards.filter(
        (c) => filter === "all" || c.dataset.category === filter,
      );
    }

    function applyFilter(filter) {
      currentFilter = filter;
      isExpanded = false;

      const filtered = getFilteredCards(filter);

      // Show/hide all cards
      cards.forEach((c) => c.classList.add("is-hidden"));
      filtered.forEach((c, i) => {
        if (i < INITIAL_COUNT) c.classList.remove("is-hidden");
      });

      // Show/hide load more
      if (filtered.length > INITIAL_COUNT) {
        loadMoreWrap.style.display = "flex";
      } else {
        loadMoreWrap.style.display = "none";
      }
    }

    // Filter button clicks
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
      });
    });

    // Load more click
    loadMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      isExpanded = true;
      const filtered = getFilteredCards(currentFilter);
      filtered.forEach((c) => c.classList.remove("is-hidden"));
      loadMoreWrap.style.display = "none";
    });

    // Init
    applyFilter("all");
  })();

  // ==========================================================================
  // SINGLE BLOG — TABLE OF CONTENTS ACTIVE STATE
  // ==========================================================================
  (function () {
    const tocLinks = document.querySelectorAll(".blog-toc-link");
    if (!tocLinks.length) return;

    const sections = Array.from(tocLinks)
      .map((link) => {
        const id = link.getAttribute("href").replace("#", "");
        return document.getElementById(id);
      })
      .filter(Boolean);

    function updateActiveToc() {
      const scrollY = window.scrollY + 140;
      let activeIndex = 0;

      sections.forEach((section, i) => {
        if (section.offsetTop <= scrollY) activeIndex = i;
      });

      // tocLinks.forEach((link, i) => {
      //   link.classList.toggle('active', i === activeIndex);
      // });
    }

    window.addEventListener("scroll", updateActiveToc, { passive: true });
    updateActiveToc();
  })();

  // ==========================================================================
  // VIDEO MODAL
  // ==========================================================================
  (function () {
    const openBtn = document.getElementById("btn-watch-reel");
    if (!openBtn) return;

    const modal = document.getElementById("video-modal");
    const backdrop = document.getElementById("video-modal-backdrop");
    const closeBtn = document.getElementById("video-modal-close");
    const iframe = document.getElementById("video-modal-iframe");

    // ── Replace with your YouTube video ID ──
    const VIDEO_ID = "DIkCQ1NU1E0";
    const VIDEO_SRC = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

    function openModal() {
      iframe.src = VIDEO_SRC; // Load + autoplay only on open
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      iframe.src = ""; // Stop video on close
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open"))
        closeModal();
    });
  })();

  // Run immediately if DOM is ready, otherwise wait for it
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
