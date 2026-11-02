// Suratlar "assets/product/..." bukjasyndan alynýar.
// Serwerdäki public/assets bukjasyny index.html bilen ýanaşyk goý.
const IMG = "assets/product/";

const products = [
  [604, "Ermak gunebakar cigit 100gr", 20, "ermak-gunebakar-cigit-100gr-27-10-2026-14-41-47/NNnwi6NxKR-650x770.jpg"],
  [601, "MARTIN DUZSUZ GARA CIGIT GYZYL 100gr", 15, "martin-duzsuz-gara-cigit-gyzyl-100gr-02-11-2025-01-07-12/gajI3cavRh-650x770.jpg"],
  [600, "MARTIN DUZLY GARA CIGIT GOK 100gr", 15, "martin-duzly-gara-cigit-gok-100gr-02-11-2025-01-06-02/Rie1JfjCoq-650x770.jpg"],
  [599, "RYABA SYKMA MAYONEZ 67%", 13, "rita-sykma-mayonez-67-02-11-2025-01-04-16/nTq9gBSuIM-650x770.jpg"],
  [598, "RITA ananas 565gr", 35, "rita-ananas-565gr-02-11-2025-00-59-33/8fg1Z7liBx-650x770.jpg"],
  [597, "RITA mekgejowen 340gr", 23, "rita-mekgejowen-340gr-02-11-2025-00-58-06/nhK0g0jCIL-650x770.jpg"],
  [596, "SNIKCERS SUPER SOKOLAD 2li", 17, "snikcers-super-sokolad-2li-02-11-2025-00-56-49/J4TlSxdac1-650x770.jpg"],
  [595, "USLADA YOGURT 1.2% 95gr", 5, "uslada-yogurt-12-95gr-02-11-2025-00-55-26/jrKA1YugJ3-650x770.jpg"],
  [594, "Anakom lapsa 60gr", 4, "anakom-lapsa-60gr-27-10-2026-14-34-57-updated/pLtGsZFWWV-650x770.jpg"],
  [46, "MACCOFFE SARY 3/1 20gr", 3, "maccoffee-original-3v1-20-g-03-02-2024-08-54-19/TVpd1lmsPu-650x770.png"],
  [45, "Arcalyk powrize gazly suw 0.5l", 3, "arcalyk-powrize-gazly-suw-05l-11-05-2026-07-43-55-updated/pnBChxhiIp-650x770.jpg"],
  [44, "Arcalyk Kola 1.5L", 5, "arcalyk-kola-15l-11-05-2026-07-43-05-updated/BuEvWELEvB-650x770.jpg"],
  [43, "sliwocny margarin 180gr", 7, "sliwocny-margarin-180gr-29-06-2026-10-38-32-updated/EFtcWw64am-650x770.jpg"],
  [41, "Coca Cola 1L", 11, "coca-cola-1l-29-06-2026-10-40-18-updated/3XGH22vwAi-650x770.jpg"],
  [40, "Altin gabartma tozy", 1, "altin-gabartma-tozy-29-06-2026-10-42-04-updated/bBXxQyCqhL-650x770.jpg"],
  [39, "PERSIL KIR YUWUJY 3KG", 95, "persil-kir-yuwujy-3kg-02-11-2025-00-10-28-updated/Ph8QymokFx-650x770.jpg"],
  [38, "Rita garoh 400gr", 19, "rita-garoh-400gr-29-06-2026-10-44-19-updated/13voW4HMFh-650x770.jpg"],
  [37, "Jacobs Monarch cuyse 95 gr", 69, "jacobs-monarch-95-gr-03-02-2024-08-18-21/VFIgyKqJfF-650x770.png"],
  [36, "TUKEL CYPSY gyzyl bulgar 120gr", 16, "tukel-cypsy-gyzyl-bulgar-120gr-02-11-2025-00-49-07-updated/BwebGxfD98-650x770.jpg"],
  [35, "7 GUN SETDALY 330ml", 5, "7-gun-setdaly-330ml-02-11-2025-00-23-35-updated/uPYbBM8nbA-650x770.jpg"],
  [34, "7 GUN tropik 0.33ml", 5, "7-gun-tropik-033ml-02-11-2025-00-25-18-updated/kzOb2G4P3E-650x770.jpg"],
  [32, "Jacobs Latte 3/1 12 gr", 3, "jacobs-latte-31-12-gr-03-02-2024-08-04-58/vX17Wdm9Vo-650x770.png"],
  [27, "ULKER IKRAM KOKE GARA SOKOLADLY", 10, "ulker-ikram-koke-gara-sokoladly-02-11-2025-00-27-28-updated/PMFDOI9HR1-650x770.jpg"],
  [26, "JACOBS MONARCH 47.5gr cuyse", 48, "jacobs-monarch-47-gr-03-02-2024-07-52-34/0FADbcloll-650x770.png"],
  [25, "ULKER CIZI VIC KOKE 82 gr", 10, "ulker-cizi-vic-koke-82-gr-02-11-2025-00-30-23-updated/3wwiEggvIg-650x770.jpg"],
  [23, "AYAZ BABA MESGE YAGY 82.5% 200gr", 39, "ayaz-baba-mesge-yagy-825-200gr-02-11-2025-00-34-10-updated/eKMrFZGliO-650x770.jpg"],
  [22, "Alpen gold kismisli sokolad", 18, "alpen-gold-kismisli-sokolad-02-11-2025-00-35-09-updated/DEMIjl4Kkn-650x770.jpg"],
  [17, "JOS SETDALY SOK 0.97L", 10, "jos-setdaly-sok-097l-02-11-2025-00-39-12-updated/lUgGENdOPF-650x770.jpg"],
  [15, "JOS SMORODINA SOK 0.97L", 10, "jos-smorodina-sok-097l-02-11-2025-00-40-24-updated/pIIno9JE7d-650x770.jpg"],
  [11, "SEDROE LETO MARGARIN 500gr", 33, "sedroe-leto-margarin-500gr-02-11-2025-00-41-46-updated/xD4nu1BBv8-650x770.jpg"],
  [10, "Big Bon 95 gr", 15, "big-bon-95-gr-02-02-2024-14-12-39/mCpTCeOQGa-650x770.jpg"],
  [9, "Cola Çynar 0.5L", 5, "cola-cynar-05l-02-02-2024-14-09-37/bYg9tql6rQ-650x770.jpg"],
  [8, "SEDROE LETO MARGARIN 200gr", 14, "sedroe-leto-margarin-200gr-02-11-2025-00-44-35-updated/Mv0w1WjsWU-650x770.jpg"],
  [7, "Cola Çynar 1L", 8, "cola-cynar-1l-02-02-2024-14-08-09/rDCBgGvw4O-650x770.jpg"],
  [6, "Goşa çynar 0.5L", 5, "gosa-cynar-05l-02-02-2024-14-07-11/iAmzlhKzZi-650x770.jpg"],
  [5, "Big bon 75 gr", 8, "big-bon-75-gr-02-02-2024-14-05-49/gdYFhRVsLm-650x770.jpg"],
  [2, "Gunebakar yagy", 18, "gunebakar-yagy-20-08-2025-16-53-01-updated/h1IPIGwV3a-650x770.jpg"],
  [1, "Seker", 16, "seker-02-02-2024-11-32-02/oRYrupXOxW-650x770.jpg"],
].map(([id, name, price, img]) => ({ id, name, price, img: IMG + img }));

const $ = (s) => document.querySelector(s);
const grid = $("#products");
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 77"><rect width="65" height="77" fill="#f1f3f1"/><text x="50%" y="52%" font-size="8" text-anchor="middle" fill="#9ca3af" font-family="sans-serif">Surat ýok</text></svg>');

/* ---------- Harytlar ---------- */
function render(list) {
  grid.innerHTML = list
    .map(
      (p) => `
    <article class="card">
      <div class="card__img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>
        <div class="card__row">
          <span class="card__price">${p.price} manat</span>
          <button class="card__add" data-id="${p.id}">Sebede goş</button>
        </div>
      </div>
    </article>`
    )
    .join("");
  $("#empty").hidden = list.length > 0;
}

$("#search").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  render(products.filter((p) => p.name.toLowerCase().includes(q)));
});

/* ---------- Sebet ---------- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem("azyk_cart")) || {}; } catch { cart = {}; }

function saveCart() {
  try { localStorage.setItem("azyk_cart", JSON.stringify(cart)); } catch {}
  renderCart();
}

function renderCart() {
  const ids = Object.keys(cart);
  const count = ids.reduce((s, id) => s + cart[id], 0);
  const total = ids.reduce((s, id) => s + cart[id] * (products.find((p) => p.id == id)?.price || 0), 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = total + " manat";

  $("#cartItems").innerHTML = ids.length
    ? ids
        .map((id) => {
          const p = products.find((x) => x.id == id);
          if (!p) return "";
          return `
        <div class="cart-item">
          <img src="${p.img}" alt="" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
          <div class="cart-item__info">
            <div class="cart-item__name">${p.name}</div>
            <div class="cart-item__price">${p.price * cart[id]} manat</div>
            <div class="qty">
              <button data-dec="${id}">−</button><span>${cart[id]}</span><button data-inc="${id}">+</button>
            </div>
          </div>
          <button class="cart-item__remove" data-del="${id}">Poz</button>
        </div>`;
        })
        .join("")
    : `<p class="cart-empty">Sebet boş</p>`;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
}

grid.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  toast("Haryt sebede goşuldy!");
});

$("#cartItems").addEventListener("click", (e) => {
  const { inc, dec, del } = e.target.dataset;
  if (inc) cart[inc]++;
  if (dec && --cart[dec] <= 0) delete cart[dec];
  if (del) { delete cart[del]; toast("Haryt sebetden pozuldy!"); }
  saveCart();
});

const openCart = () => document.body.classList.add("cart-open");
const closeCart = () => document.body.classList.remove("cart-open");
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

$("#checkout").addEventListener("click", () => {
  if (!Object.keys(cart).length) return toast("Sebet boş");
  toast("Sargydyňyz kabul edildi!");
  cart = {};
  saveCart();
  closeCart();
});

/* ---------- Menýu ---------- */
$("#burger").addEventListener("click", () => $("#nav").classList.toggle("open"));
$("#year").textContent = new Date().getFullYear();

render(products);
renderCart();
