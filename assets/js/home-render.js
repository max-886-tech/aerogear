(async function () {
  const root = document.getElementById("home-sections");
  if (!root) return;

  // Use your existing base logic if present (you already set window.__SITE_BASE in index.html)
  const base = (window.__SITE_BASE || "./").replace(/\/?$/, "/");

  async function fetchJSON(path) {
    const res = await fetch(base + path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  function esc(s = "") {
    return String(s).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[m]));
  }

 function sectionSlideshow(cfg) {
  const id = "heroCarousel";

  const slides = (cfg.slides || []).map((s, i) => {
    const align = (s.align === "start") ? "text-start" : "text-end";
    const tag = s.tag ? `<p class="mb-2 text-white-50">${esc(s.tag)}</p>` : "";
    const title = s.title ? `<h1 class="text-white fw-bold mb-0">${esc(s.title)}</h1>` : "";
    const cta = (s.ctaText && s.ctaHref)
      ? `<a class="btn btn-light mt-3 fw-semibold" href="${esc(s.ctaHref)}">${esc(s.ctaText)}</a>`
      : "";

    const desktop = esc(s.imgDesktop || "");
    const mobile = esc(s.imgMobile || s.imgDesktop || "");

    return `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <div class="position-relative">
          <picture>
            <source media="(max-width: 767px)" srcset="${mobile}">
            <img src="${desktop}" class="d-block w-100" alt="${esc(s.title || "Slide")}">
          </picture>

          <!-- overlay -->
          <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
            <div class="container">
              <div class="${align}">
                ${tag}
                ${title}
                ${cta}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const indicators = (cfg.slides || []).map((_, i) => `
    <button type="button"
      data-bs-target="#${id}"
      data-bs-slide-to="${i}"
      class="${i === 0 ? "active" : ""}"
      aria-current="${i === 0 ? "true" : "false"}"
      aria-label="Slide ${i + 1}">
    </button>
  `).join("");

  // Auto-scroll timing (ms). Use cfg.interval if you want from JSON
  const interval = Number(cfg.interval || 3500);

  return `
    <section class="position-relative">
      <div id="${id}" class="carousel slide" data-bs-ride="carousel" data-bs-interval="${interval}">
        <div class="carousel-indicators">
          ${indicators}
        </div>

        <div class="carousel-inner">
          ${slides}
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>

        <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </section>
  `;
}


  function sectionBanner(cfg) {
    const items = (cfg.items || []).slice(0, 2);
    return `
      <section class="py-5">
        <div class="container">
          <div class="row g-4">
            ${items.map(it => `
              <div class="col-md-6">
                <a href="${esc(it.href || "#")}" class="text-decoration-none d-block position-relative rounded overflow-hidden">
                  <img src="${esc(it.img)}" class="w-100" alt="">
                  <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end">
                    <div class="p-4 text-white" style="background: linear-gradient(transparent, rgba(0,0,0,.65)); width:100%">
                      <div class="small">${esc(it.titleSmall || "")}</div>
                      <div class="h4 fw-bold mb-0">${it.title || ""}</div>
                    </div>
                  </div>
                </a>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function sectionCategory(cfg) {
    const items = cfg.items || [];
    return `
      <section class="py-5 bg-light">
        <div class="container">
          <div class="text-center mb-4">
            <h2 class="fw-bold">${esc(cfg.heading || "Shop By Category")}</h2>
          </div>

          <div class="row g-4">
            ${items.map(it => `
              <div class="col-md-4">
                <a href="${esc(it.href || "#")}" class="text-decoration-none d-block rounded overflow-hidden bg-white">
                  <img src="${esc(it.img)}" class="w-100" alt="">
                  <div class="p-3">
                    <div class="small text-muted">${esc(it.tag || "")}</div>
                    <div class="fw-semibold">${esc(it.title || "")}</div>
                    <div class="small text-decoration-underline mt-1">SHOP COLLECTION</div>
                  </div>
                </a>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function sectionInstagram(cfg) {
    const imgs = cfg.images || [];
    return `
      <section class="py-5">
        <div class="container">
          <div class="text-center mb-4">
            <h2 class="fw-bold">${esc(cfg.heading || "Instagram")}</h2>
            <p class="text-muted mb-0">${esc(cfg.subheading || "")}</p>
          </div>

          <div class="row g-3">
            ${imgs.map(src => `
              <div class="col-6 col-md-3">
                <a href="shop.html" class="d-block rounded overflow-hidden">
                  <img src="${esc(src)}" class="w-100" alt="">
                </a>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function sectionBrands(cfg) {
    const imgs = cfg.images || [];
    return `
      <section class="py-4 border-top">
        <div class="container">
          <div class="row g-3 align-items-center justify-content-center">
            ${imgs.map(src => `
              <div class="col-4 col-md-2 text-center">
                <img src="${esc(src)}" class="img-fluid" alt="">
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  const renderers = {
    slideshow: sectionSlideshow,
    banner: sectionBanner,
    category: sectionCategory,
    instagram: sectionInstagram,
    brands: sectionBrands
    // collection: you can hook it to products.js next (so it becomes dynamic too)
  };

  try {
    const cfg = await fetchJSON("data/home.sections.json");
    const sections = (cfg.sections || []).filter(s => s.enabled !== false);

    root.innerHTML = sections.map(s => {
      const fn = renderers[s.type];
      return fn ? fn(s) : "";
    }).join("");
  } catch (e) {
    console.error(e);
  }
})();
