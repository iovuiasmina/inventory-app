# 📦 Inventar Personal — Aplicație Web

**Proiect 19 — Urmărirea Inventarului**  
Disciplina: Tehnologii Web  
Facultatea de Economie și Administrarea Afacerilor

---

## 🏗️ Arhitectura aplicației

```
Browser (React :5173)
  ├── /             → InventoryPage    (afișare inventar + căutare)
  ├── /manage       → ManagePage       (adăugare articol nou)
  ├── /manage/:id   → ManagePage       (editare articol)
  └── /reports      → ReportsPage      (export HTML / CSV)
        ↓ fetch /api/*
Express server.js (:5000)
        ↓ proxy
json-server (:3000) ↔ db.json
```

## 📁 Structura fișierelor

```
inventory-app/
├── backend/
│   ├── server.js          ← serverul Express (API REST)
│   ├── db.json            ← baza de date JSON (json-server)
│   ├── uploads/           ← fotografii uploadate (creat automat)
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── api/
        │   └── inventoryApi.js    ← toate apelurile fetch
        ├── components/
        │   ├── Navbar.jsx         ← bara de navigare
        │   ├── ItemCard.jsx       ← card articol (reutilizabil)
        │   └── Toast.jsx          ← notificări temporare
        ├── pages/
        │   ├── InventoryPage.jsx  ← pagina principală
        │   ├── ManagePage.jsx     ← formular add/edit
        │   └── ReportsPage.jsx    ← export rapoarte
        ├── App.jsx                ← rutele React Router
        ├── main.jsx               ← punctul de intrare
        └── index.css              ← Tailwind v4 + stiluri custom
```

## 🚀 Instalare și rulare

### 1. Backend

```bash
cd backend
npm install
# Terminal 1: pornire json-server
npm run json-server
# Terminal 2: pornire Express
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicația va fi disponibilă la: **http://localhost:5173**

## ✨ Funcționalități implementate

| Funcționalitate | Status |
|-----------------|--------|
| Adăugare articol (nume, serie, valoare) | ✅ |
| Editare articol | ✅ |
| Ștergere articol cu confirmare | ✅ |
| Căutare full-text | ✅ |
| Filtrare pe categorie | ✅ |
| Export raport HTML | ✅ |
| Export raport CSV | ✅ |
| Upload fotografie | ✅ |
| Previzualizare fotografii | ✅ |
| Stocare persistentă JSON | ✅ |
| Design responsive | ✅ |
| Validare formulare (client + server) | ✅ |

## 🛠️ Tehnologii folosite

- **Frontend**: React 18, React Router v6, Tailwind CSS v4, Vite
- **Backend**: Node.js, Express.js, json-server, Joi, Multer
- **Stocare date**: JSON (db.json via json-server)
- **Design**: Tema roz & mov, glassmorphism, Google Fonts

## 📡 API Endpoints

| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| GET | /api/items | Toate articolele (suportă ?search= și ?category=) |
| GET | /api/items/:id | Un articol după ID |
| POST | /api/items | Adaugă articol nou |
| PUT | /api/items/:id | Actualizează articol |
| DELETE | /api/items/:id | Șterge articol |
| POST | /api/items/:id/photo | Upload fotografie |
| GET | /api/export/csv | Export CSV |
| GET | /api/export/html | Export HTML |
