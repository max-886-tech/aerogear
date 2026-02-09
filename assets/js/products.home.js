(function () {
  const grid = document.getElementById("home-products-grid");
  if (!grid) return;

  const LIMIT = 8; // show 8 on home

  async function init() {
    try {
      const all = await window.AEProducts.loadProducts();
      const sorted = window.AEProducts.applySort(all, "featured").slice(0, LIMIT);
      grid.innerHTML = sorted.map(window.AEProducts.cardHtml).join("");
    } catch (e) {
      console.error(e);
      grid.innerHTML = `<div class="col-12"><p class="mb-0">Products failed to load.</p></div>`;
    }
  }

  init();
})();
