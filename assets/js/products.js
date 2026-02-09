(function () {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const resultsCountEl = document.getElementById("results-count");
  const sortSelect = document.getElementById("sort-select");
  const paginationEl = document.getElementById("pagination");

  const base = window.__SITE_BASE || "/";
  const jsonUrl = `${base}data/products.json`;

  const PAGE_SIZE = 12; // 4 per row * 3 rows

  let ALL = [];
  let state = { sort: "featured", page: 1 };

  const escapeHtml = (str = "") =>
    str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const toDateNum = (d) => {
    const x = (d || "").replaceAll("-", "");
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const fmtPrice = (n) => (!n || n <= 0 ? "" : "₹" + String(n));

  const iconAmazon = `
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg" style="display:block">
      <path d="M7 7.5C7 5.567 8.567 4 10.5 4H14.5C16.433 4 18 5.567 18 7.5V17.5C18 19.433 16.433 21 14.5 21H10.5C8.567 21 7 19.433 7 17.5V7.5Z" stroke="currentColor" stroke-width="2"/>
      <path d="M9.5 9H15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M9.5 12H15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M9.5 15H13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  const iconFlipkart = `
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg" style="display:block">
      <path d="M6 8.5C6 7.119 7.119 6 8.5 6H15.5C16.881 6 18 7.119 18 8.5V19H6V8.5Z"
        stroke="currentColor" stroke-width="2"/>
      <path d="M9 6V5.5C9 4.119 10.119 3 11.5 3H12.5C13.881 3 15 4.119 15 5.5V6"
        stroke="currentColor" stroke-width="2"/>
      <path d="M9 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M9 14H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  const hasUrl = (u) => typeof u === "string" && u.trim().length > 0;

  const cardHtml = (p) => {
    const title = escapeHtml(p.title || "");
    const primary = p?.images?.primary || "assets/img/placeholder.png";
    const secondary = p?.images?.secondary || primary;

    const amazon = p?.links?.amazon || "";
    const flipkart = p?.links?.flipkart || "";

    const badge = p.badge?.text
      ? `<div class="product-badge">
           <span class="badge-label ${escapeHtml(p.badge.class || "")} rounded">${escapeHtml(p.badge.text)}</span>
         </div>`
      : "";

    const price = (typeof p.price === "number" && p.price > 0) ? p.price : 0;
    const compare = (typeof p.compareAt === "number" && p.compareAt > 0) ? p.compareAt : 0;

    const priceHtml = price
      ? `<div class="product-card-price">
           <span class="card-price-regular">${fmtPrice(price)}</span>
           ${compare && compare > price ? `<span class="card-price-compare text-decoration-line-through">${fmtPrice(compare)}</span>` : ""}
         </div>`
      : "";

    // Buttons: Amazon always shown if present; Flipkart only if present
    const btnAmazon = hasUrl(amazon)
      ? `<a class="btn btn-sm btn-dark w-100 d-flex align-items-center justify-content-center gap-2"
            href="${amazon}" target="_blank" rel="noopener">
            ${iconAmazon}<span>Amazon</span>
         </a>`
      : "";

    const btnFlipkart = hasUrl(flipkart)
      ? `<a class="btn btn-sm btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
            href="${flipkart}" target="_blank" rel="noopener">
            ${iconFlipkart}<span>Flipkart</span>
         </a>`
      : "";

    const buttons = (btnAmazon || btnFlipkart)
      ? `<div class="d-grid gap-2 mt-3">
           ${btnAmazon}
           ${btnFlipkart}
         </div>`
      : "";

    // Card click fallback: prefer Amazon, else Flipkart, else #
    const cardLink = hasUrl(amazon) ? amazon : (hasUrl(flipkart) ? flipkart : "#");

    return `
      <div class="col-lg-3 col-md-4 col-6" data-aos="fade-up" data-aos-duration="700">
        <div class="product-card">
          <div class="product-card-img">
            <a class="hover-switch" href="${cardLink}" target="_blank" rel="noopener">
              <img class="secondary-img" src="${secondary}" alt="${title}">
              <img class="primary-img" src="${primary}" alt="${title}">
            </a>
            ${badge}
          </div>

          <div class="product-card-details">
            <h3 class="product-card-title">
              <a href="${cardLink}" target="_blank" rel="noopener">${title}</a>
            </h3>

            ${priceHtml}
            ${buttons}
          </div>
        </div>
      </div>
    `;
  };

  function applySort(items) {
    const out = items.slice();
    switch (state.sort) {
      case "newest":
        out.sort((a, b) => toDateNum(b.createdAt) - toDateNum(a.createdAt));
        break;
      case "price_asc":
        out.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_desc":
        out.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "az":
        out.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "za":
        out.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "featured":
      default:
        break;
    }
    return out;
  }

  function paginate(items) {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), totalPages);

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    return { total, totalPages, pageItems };
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;

    const p = state.page;

    const pageBtn = (label, page, disabled = false, active = false) => `
      <li class="item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
        <a class="link" href="#" data-page="${page}">${label}</a>
      </li>
    `;

    let html = "";
    html += pageBtn("‹", p - 1, p === 1);

    const start = Math.max(1, p - 2);
    const end = Math.min(totalPages, start + 4);

    for (let i = start; i <= end; i++) {
      html += pageBtn(String(i), i, false, i === p);
    }

    html += pageBtn("›", p + 1, p === totalPages);

    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll("a[data-page]").forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const next = parseInt(a.getAttribute("data-page"), 10);
        if (!Number.isFinite(next)) return;
        if (next < 1 || next > totalPages) return;
        state.page = next;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setResultsCount(total, totalPages) {
    if (!resultsCountEl) return;
    resultsCountEl.textContent = `${total} items • Page ${state.page} of ${totalPages}`;
  }

  function render() {
    const sorted = applySort(ALL);
    const { total, totalPages, pageItems } = paginate(sorted);

    setResultsCount(total, totalPages);

    if (!pageItems.length) {
      grid.innerHTML = `<div class="col-12"><p class="mb-0">No products found.</p></div>`;
      renderPagination(1);
      return;
    }

    grid.innerHTML = pageItems.map(cardHtml).join("");
    renderPagination(totalPages);
  }

  async function init() {
    try {
      const res = await fetch(jsonUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load JSON: ${res.status}`);
      const data = await res.json();
      ALL = Array.isArray(data) ? data : [];

      render();

      if (sortSelect) {
        sortSelect.addEventListener("change", () => {
          state.sort = sortSelect.value || "featured";
          state.page = 1;
          render();
        });
      }
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<div class="col-12"><p class="mb-0">Products failed to load.</p></div>`;
    }
  }

  init();
})();
