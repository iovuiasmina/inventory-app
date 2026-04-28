/**
 * server.js — Serverul Express pentru aplicatia de Inventar Personal
 * Autor: [NumeStudent1], [NumeStudent2]
 * Rol: Intermediar intre frontend (React) si json-server (baza de date JSON)
 * Porturi: Express :5000, json-server :3000
 */

const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;
const JSON_SERVER_URL = "http://localhost:3000/items";

// ─────────────────────────────────────────────────────────────
// Middleware-uri globale
// ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Directorul pentru poze uploadate
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Servim fisierele statice din /uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// ─────────────────────────────────────────────────────────────
// Configurare Multer pentru upload fotografii
// ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generam un nume unic pentru fisier
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Doar fisiere imagine sunt acceptate (jpg, png, gif, webp)"));
    }
  },
});

// ─────────────────────────────────────────────────────────────
// Schema de validare Joi pentru un articol de inventar
// ─────────────────────────────────────────────────────────────
const itemSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Numele articolului este obligatoriu",
    "string.max": "Numele nu poate depasi 100 de caractere",
  }),
  serialNumber: Joi.string().min(1).max(50).required().messages({
    "string.empty": "Numarul de serie este obligatoriu",
  }),
  value: Joi.number().positive().precision(2).required().messages({
    "number.base": "Valoarea trebuie sa fie un numar",
    "number.positive": "Valoarea trebuie sa fie pozitiva",
  }),
  category: Joi.string().max(50).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
  photo: Joi.string().optional().allow(null, ""),
});

// ─────────────────────────────────────────────────────────────
// Middleware: validare ID numeric sau UUID
// ─────────────────────────────────────────────────────────────
const validateId = (req, res, next) => {
  if (!req.params.id) return next();
  next();
};

// ─────────────────────────────────────────────────────────────
// Helper: fetch catre json-server
// ─────────────────────────────────────────────────────────────
async function fetchFromDB(url, options = {}) {
  const fetch = (await import("node-fetch")).default;
  const response = await fetch(url, options);
  return response;
}

// ─────────────────────────────────────────────────────────────
// GET /api/items — Returneaza toate articolele din inventar
// Suporta filtrare prin query: ?search=xbox&category=Electronics
// ─────────────────────────────────────────────────────────────
app.get("/api/items", async (req, res) => {
  try {
    const { search, category } = req.query;
    let url = JSON_SERVER_URL;

    // Filtrare dupa categorie daca e specificata
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }

    const response = await fetchFromDB(url);
    let items = await response.json();

    // Cautare full-text pe name, serialNumber, description
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.serialNumber.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json(items);
  } catch (error) {
    console.error("Eroare GET /api/items:", error.message);
    res.status(500).json({ error: "Eroare la preluarea articolelor" });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/items/:id — Returneaza un articol dupa ID
// ─────────────────────────────────────────────────────────────
app.get("/api/items/:id", validateId, async (req, res) => {
  try {
    const response = await fetchFromDB(`${JSON_SERVER_URL}/${req.params.id}`);
    if (response.status === 404) {
      return res.status(404).json({ error: "Articolul nu a fost gasit" });
    }
    const item = await response.json();
    res.status(200).json(item);
  } catch (error) {
    console.error("Eroare GET /api/items/:id:", error.message);
    res.status(500).json({ error: "Eroare la preluarea articolului" });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/items — Adauga un articol nou in inventar
// ─────────────────────────────────────────────────────────────
app.post("/api/items", async (req, res) => {
  // Validam datele cu Joi
  const { error, value } = itemSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ errors });
  }

  try {
    const newItem = {
      ...value,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const response = await fetchFromDB(JSON_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    const created = await response.json();
    res.status(201).json(created);
  } catch (err) {
    console.error("Eroare POST /api/items:", err.message);
    res.status(500).json({ error: "Eroare la adaugarea articolului" });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/items/:id — Actualizeaza un articol existent
// ─────────────────────────────────────────────────────────────
app.put("/api/items/:id", validateId, async (req, res) => {
  const { error, value } = itemSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ errors });
  }

  try {
    const response = await fetchFromDB(
      `${JSON_SERVER_URL}/${req.params.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      }
    );

    if (response.status === 404) {
      return res.status(404).json({ error: "Articolul nu a fost gasit" });
    }

    const updated = await response.json();
    res.status(200).json(updated);
  } catch (err) {
    console.error("Eroare PUT /api/items/:id:", err.message);
    res.status(500).json({ error: "Eroare la actualizarea articolului" });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/items/:id — Sterge un articol din inventar
// ─────────────────────────────────────────────────────────────
app.delete("/api/items/:id", validateId, async (req, res) => {
  try {
    // Preluam articolul pentru a sterge poza asociata
    const getResponse = await fetchFromDB(
      `${JSON_SERVER_URL}/${req.params.id}`
    );
    if (getResponse.status === 404) {
      return res.status(404).json({ error: "Articolul nu a fost gasit" });
    }
    const item = await getResponse.json();

    // Stergem poza daca exista
    if (item.photo) {
      const photoPath = path.join(UPLOADS_DIR, path.basename(item.photo));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    const response = await fetchFromDB(
      `${JSON_SERVER_URL}/${req.params.id}`,
      { method: "DELETE" }
    );

    if (response.status === 404) {
      return res.status(404).json({ error: "Articolul nu a fost gasit" });
    }

    res.status(200).json({ message: "Articolul a fost sters cu succes" });
  } catch (err) {
    console.error("Eroare DELETE /api/items/:id:", err.message);
    res.status(500).json({ error: "Eroare la stergerea articolului" });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/items/:id/photo — Upload fotografie pentru articol
// ─────────────────────────────────────────────────────────────
app.post(
  "/api/items/:id/photo",
  validateId,
  upload.single("photo"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Nu a fost furnizat niciun fisier" });
    }

    try {
      // Preluam articolul existent
      const getResponse = await fetchFromDB(
        `${JSON_SERVER_URL}/${req.params.id}`
      );
      if (getResponse.status === 404) {
        return res.status(404).json({ error: "Articolul nu a fost gasit" });
      }
      const item = await getResponse.json();

      // Stergem poza veche daca exista
      if (item.photo) {
        const oldPhotoPath = path.join(
          UPLOADS_DIR,
          path.basename(item.photo)
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // URL-ul pozei noi
      const photoUrl = `/uploads/${req.file.filename}`;

      // Actualizam articolul cu noua poza
      const updatedItem = { ...item, photo: photoUrl };
      await fetchFromDB(`${JSON_SERVER_URL}/${req.params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      res.status(200).json({ photoUrl, message: "Fotografia a fost incarcata" });
    } catch (err) {
      console.error("Eroare POST /api/items/:id/photo:", err.message);
      res.status(500).json({ error: "Eroare la incarcarea fotografiei" });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/export/csv — Exporta inventarul in format CSV
// ─────────────────────────────────────────────────────────────
app.get("/api/export/csv", async (req, res) => {
  try {
    const response = await fetchFromDB(JSON_SERVER_URL);
    const items = await response.json();

    // Generam CSV-ul
    const header = "Name,Serial Number,Value,Category,Description\n";
    const rows = items
      .map(
        (item) =>
          `"${item.name}","${item.serialNumber}","$${parseFloat(item.value).toFixed(2)}","${item.category || ""}","${item.description || ""}"`
      )
      .join("\n");

    const csv = header + rows;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventar.csv"
    );
    res.status(200).send(csv);
  } catch (err) {
    console.error("Eroare export CSV:", err.message);
    res.status(500).json({ error: "Eroare la exportul CSV" });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/export/html — Exporta inventarul ca raport HTML
// ─────────────────────────────────────────────────────────────
app.get("/api/export/html", async (req, res) => {
  try {
    const response = await fetchFromDB(JSON_SERVER_URL);
    const items = await response.json();

    const totalValue = items.reduce((sum, i) => sum + parseFloat(i.value), 0);

    const rows = items
      .map(
        (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.serialNumber}</td>
        <td>$${parseFloat(item.value).toFixed(2)}</td>
        <td>${item.category || "-"}</td>
        <td>${item.description || "-"}</td>
      </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Raport Inventar Personal</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 2rem; background: #fdf4ff; color: #3d1d5e; }
    h1 { color: #9333ea; border-bottom: 3px solid #ec4899; padding-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 12px 16px; text-align: left; }
    td { padding: 10px 16px; border-bottom: 1px solid #f3c5f5; }
    tr:hover { background: #fce7f3; }
    .total { margin-top: 1rem; font-size: 1.2rem; font-weight: bold; color: #9333ea; text-align: right; }
    .generated { color: #888; font-size: 0.85rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <h1>📦 Raport Inventar Personal</h1>
  <p class="generated">Generat la: ${new Date().toLocaleString("ro-RO")}</p>
  <table>
    <thead>
      <tr>
        <th>Nume</th>
        <th>Număr de Serie</th>
        <th>Valoare</th>
        <th>Categorie</th>
        <th>Descriere</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total">Valoare totală inventar: $${totalValue.toFixed(2)}</div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    console.error("Eroare export HTML:", err.message);
    res.status(500).json({ error: "Eroare la exportul HTML" });
  }
});

// ─────────────────────────────────────────────────────────────
// Pornim serverul Express
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server Express pornit pe http://localhost:${PORT}`);
  console.log(`📦 json-server asteptat pe http://localhost:3000`);
});
