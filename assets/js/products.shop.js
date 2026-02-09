(function () {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const resultsCountEl = document.getElementById("results-count");
  const sortSelect = document.getElementById("sort-select");
  const paginationEl = document.getElementById("pagination");

  const PAGE_SIZE = 12;
  let ALL = [];
  let state = { sort: "featured", page: 1 };

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
    const sorted = window.AEProducts.applySort(ALL, state.sort);
    const { total, totalPages, pageItems } = paginate(sorted);

    setResultsCount(total, totalPages);

    if (!pageItems.length) {
      grid.innerHTML = `<div class="col-12"><p class="mb-0">No products found.</p></div>`;
      renderPagination(1);
      return;
    }

    grid.innerHTML = pageItems.map(window.AEProducts.cardHtml).join("");
    renderPagination(totalPages);
  }

  async function init() {
    try {
      ALL = await window.AEProducts.loadProducts();
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
