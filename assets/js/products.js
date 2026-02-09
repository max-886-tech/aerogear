(function () {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const resultsCountEl = document.getElementById("results-count");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const categoryWrap = document.getElementById("category-filter");
  const paginationEl = document.getElementById("pagination");

  // Mobile sort support
  const mobileSortList = document.getElementById("mobile-sort-list");
  const mobileActiveSorting = document.getElementById("mobile-active-sorting");

  const base = window.__SITE_BASE || "/";
  const jsonUrl = `${base}data/products.json`;

  const PAGE_SIZE = 12;

  let ALL = [];
  let state = { q: "", sort: "featured", category: "All", page: 1 };

  const escapeHtml = (str = "") =>
    str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const toDateNum = (d) => {
    const x = (d || "").replaceAll("-", "");
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const fmtPrice = (n) => (!n || n <= 0 ? "" : "₹" + String(n));

  const sortLabel = (key) => ({
    featured: "Featured",
    newest: "Newest",
    price_asc: "Price: low to high",
    price_desc: "Price: high to low",
    az: "Alphabetically, A-Z",
    za: "Alphabetically, Z-A"
  }[key] || "Featured");

  const cardHtml = (p) => {
    const title = escapeHtml(p.title || "");
    const url = p.url || "#";
    const primary = p?.images?.primary || "assets/img/placeholder.png";
    const secondary = p?.images?.secondary || primary;

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

    return `
      <div class="col-lg-3 col-md-6 col-6" data-aos="fade-up" data-aos-duration="700">
        <div class="product-card">
          <div class="product-card-img">
            <a class="hover-switch" href="${url}" target="_blank" rel="noopener">
              <img class="secondary-img" src="${secondary}" alt="${title}">
              <img class="primary-img" src="${primary}" alt="${title}">
            </a>
            ${badge}
          </div>
          <div class="product-card-details">
            <h3 class="product-card-title">
              <a href="${url}" target="_blank" rel="noopener">${title}</a>
            </h3>
            ${priceHtml}
          </div>
        </div>
      </div>
    `;
  };

  function getCategories(items) {
    const set = new Set();
    items.forEach(p => set.add((p.category || "Other").trim() || "Other"));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }

  function renderCategories() {
    if (!categoryWrap) return;
    const cats = getCategories(ALL);

    categoryWrap.innerHTML = cats.map(c => {
      const active = (state.category === c);
      return `
        <button type="button"
          class="btn btn-sm ${active ? "btn-dark" : "btn-outline-dark"} text-start"
          data-cat="${escapeHtml(c)}"
          style="justify-content:flex-start;">
          ${escapeHtml(c)}
        </button>`;
    }).join("");

    categoryWrap.querySelectorAll("button[data-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.category = btn.getAttribute("data-cat") || "All";
        state.page = 1;
        renderCategories();
        render();
      });
    });
  }

  function applyFilters(items) {
    let out = items.slice();

    if (state.category && state.category !== "All") {
      out = out.filter(p => (p.category || "Other") === state.category);
    }

    const q = (state.q || "").trim().toLowerCase();
    if (q) {
      out = out.filter(p => {
        const hay = `${p.title || ""} ${(p.category || "")}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return out;
  }

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
        break; // JSON order
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

  function syncSortUI() {
    if (sortSelect) sortSelect.value = state.sort;
    if (mobileActiveSorting) mobileActiveSorting.textContent = sortLabel(state.sort);

    // highlight active item in mobile list (optional)
    if (mobileSortList) {
      mobileSortList.querySelectorAll("a[data-sort]").forEach(a => {
        const isActive = (a.getAttribute("data-sort") === state.sort);
        a.style.fontWeight = isActive ? "600" : "";
      });
    }
  }

  function render() {
    syncSortUI();

    const filtered = applyFilters(ALL);
    const sorted = applySort(filtered);
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

      renderCategories();
      render();

      // search
      if (searchInput) {
        let t = null;
        searchInput.addEventListener("input", () => {
          clearTimeout(t);
          t = setTimeout(() => {
            state.q = searchInput.value || "";
            state.page = 1;
            render();
          }, 150);
        });
      }

      // desktop sort
      if (sortSelect) {
        sortSelect.addEventListener("change", () => {
          state.sort = sortSelect.value || "featured";
          state.page = 1;
          render();
        });
      }

      // mobile sort list
      if (mobileSortList) {
        mobileSortList.querySelectorAll("a[data-sort]").forEach(a => {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            state.sort = a.getAttribute("data-sort") || "featured";
            state.page = 1;
            render();
          });
        });
      }

    } catch (err) {
      console.error(err);
      grid.innerHTML = `<div class="col-12"><p class="mb-0">Products failed to load.</p></div>`;
    }
  }

  init();
})();
