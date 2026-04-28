/**
 * src/api/inventoryApi.js — Toate apelurile fetch catre backend
 * Autor: [NumeStudent1]
 * 
 * Toate cererile trec prin Express (:5000) → proxy → json-server (:3000)
 * React nu comunica niciodata direct cu json-server.
 */

const BASE_URL = "/api/items";

// ─────────────────────────────────────────────────────────────
// GET /api/items — Preia toate articolele
// Optional: search (string) si category (string) pentru filtrare
// ─────────────────────────────────────────────────────────────
export async function getAllItems(search = "", category = "") {
  let url = BASE_URL;
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Nu s-au putut prelua articolele.");
  return response.json();
}

// ─────────────────────────────────────────────────────────────
// GET /api/items/:id — Preia un articol dupa ID
// ─────────────────────────────────────────────────────────────
export async function getItemById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Articolul nu a fost gasit.");
  return response.json();
}

// ─────────────────────────────────────────────────────────────
// POST /api/items — Adauga un articol nou
// @param {Object} itemData - { name, serialNumber, value, category, description }
// ─────────────────────────────────────────────────────────────
export async function addItem(itemData) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const err = await response.json();
    // Erorile de validare Joi vin ca array in `errors`
    throw new Error(err.errors?.join(", ") || "Nu s-a putut adauga articolul.");
  }
  return response.json();
}

// ─────────────────────────────────────────────────────────────
// PUT /api/items/:id — Actualizeaza un articol existent
// ─────────────────────────────────────────────────────────────
export async function updateItem(id, itemData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      err.errors?.join(", ") || "Nu s-a putut actualiza articolul."
    );
  }
  return response.json();
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/items/:id — Sterge un articol
// ─────────────────────────────────────────────────────────────
export async function deleteItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Nu s-a putut sterge articolul.");
  return response.json();
}

// ─────────────────────────────────────────────────────────────
// POST /api/items/:id/photo — Upload fotografie pentru articol
// @param {string} id - ID-ul articolului
// @param {File} file - Fisierul imagine selectat de utilizator
// ─────────────────────────────────────────────────────────────
export async function uploadPhoto(id, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${BASE_URL}/${id}/photo`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Nu s-a putut incarca fotografia.");
  return response.json();
}
