(function () {
  // --- helpers ---
  const esc = (str = "") =>
    String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));

  const toDateNum = (d) => {
    const x = String(d || "").replaceAll("-", "");
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const fmtPrice = (n) => (!n || n <= 0 ? "" : "₹" + String(n));

  const hasUrl = (u) => typeof u === "string" && u.trim().length > 0;

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

  function cardHtml(p) {
    const title = esc(p.title || "");
    const primary = p?.images?.primary || "assets/img/placeholder.png";
    const secondary = p?.images?.secondary || primary;

    // support both formats
    const amazon = (p?.links?.amazon || p?.url || "").trim();
    const flipkart = (p?.links?.flipkart || "").trim();

    const badge = p.badge?.text
      ? `<div class="product-badge">
           <span class="badge-label ${esc(p.badge.class || "")} rounded">${esc(p.badge.text)}</span>
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

    const btnAmazon = hasUrl(amazon)
      ? `<a class="ae-btn ae-btn-amazon" href="${amazon}" target="_blank" rel="noopener">
           <span class="ae-btn-ic">${iconAmazon}</span><span>Amazon</span>
         </a>`
      : "";

    const btnFlipkart = hasUrl(flipkart)
      ? `<a class="ae-btn ae-btn-flipkart" href="${flipkart}" target="_blank" rel="noopener">
           <span class="ae-btn-ic">${iconFlipkart}</span><span>Flipkart</span>
         </a>`
      : "";

    const buttons = (btnAmazon || btnFlipkart)
      ? `<div class="ae-btn-wrap">${btnAmazon}${btnFlipkart}</div>`
      : "";

    const cardLink = hasUrl(amazon) ? amazon : (hasUrl(flipkart) ? flipkart : "#");

    return `
      <div class="col-lg-3 col-md-4 col-6">
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
  }

  function applySort(items, sort) {
    const out = items.slice();
    switch (sort) {
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

  async function loadProducts() {
    const base = (window.__SITE_BASE || "./").replace(/\/?$/, "/");
    const jsonUrl = `${base}data/products.json`;
    const res = await fetch(jsonUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load products.json: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // Public API
  window.AEProducts = {
    loadProducts,
    applySort,
    cardHtml
  };
})();
