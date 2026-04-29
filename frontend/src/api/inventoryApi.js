const BASE_URL = `${"https://inventory-app-sk44.onrender.com"}/api/items`;


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

export async function getItemById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Articolul nu a fost gasit.");
  return response.json();
}

export async function addItem(itemData) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.errors?.join(", ") || "Nu s-a putut adauga articolul.");
  }
  return response.json();
}

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

export async function deleteItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Nu s-a putut sterge articolul.");
  return response.json();
}

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
