import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllItems, deleteItem } from "../api/inventoryApi.js";
import ItemCard from "../components/ItemCard.jsx";
import Toast from "../components/Toast.jsx";

const CATEGORIES = [
  "Toate",
  "Electronics",
  "Computers",
  "Furniture",
  "Clothing",
  "Books",
  "Tools",
  "Other",
];

function InventoryPage() {
  const [items, setItems] = useState([]);         
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState(null);       
  const [search, setSearch] = useState("");       
  const [category, setCategory] = useState("Toate"); 
  const [toast, setToast] = useState(null);        

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cat = category === "Toate" ? "" : category;
      const data = await getAllItems(search, cat);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(loadItems, 400);
    return () => clearTimeout(timer);
  }, [loadItems]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Sigur doresti sa stergi "${name}"?`)) return;
    try {
      await deleteItem(id);
      setToast({ message: `"${name}" a fost sters.`, type: "success" });
      loadItems();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const totalValue = items.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalValue);

  return (
    <div>
      <div
        className="card-glass animate-fade-in-up"
        style={{ padding: "2rem", marginBottom: "2rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #9333ea, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.25rem",
              }}
            >
              Inventarul Meu
            </h1>
            <p style={{ color: "#9b72bf", fontSize: "0.9rem" }}>
              {items.length} articol{items.length !== 1 ? "e" : ""} •{" "}
              Valoare totală:{" "}
              <strong style={{ color: "#9333ea" }}>{formattedTotal}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/manage" className="btn-primary" style={{ textDecoration: "none" }}>
              Articol nou
            </Link>
            <Link to="/reports" className="btn-secondary" style={{ textDecoration: "none" }}>
              Rapoarte
            </Link>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1rem",
              }}
            >
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Caută după nume, serial sau descriere..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          <select
            className="form-input"
            style={{ width: "auto", minWidth: "150px" }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9333ea" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
          <p>Se încarcă inventarul...</p>
        </div>
      )}
      {error && !loading && (
        <div
          className="card-glass"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "#dc2626",
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={loadItems}
            style={{ marginTop: "1rem" }}
          >
            Reîncearcă
          </button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div
          className="card-glass animate-fade-in-up"
          style={{ padding: "3rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              color: "#9333ea",
              marginBottom: "0.5rem",
            }}
          >
            {search || category !== "Toate"
              ? "Niciun articol găsit"
              : "Inventarul este gol"}
          </h3>
          <p style={{ color: "#9b72bf", marginBottom: "1.5rem" }}>
            {search || category !== "Toate"
              ? "Încearcă alte criterii de căutare."
              : "Adaugă primul articol în inventarul tău!"}
          </p>
          <Link
            to="/manage"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            Adaugă primul articol
          </Link>
        </div>
      )}
      {!loading && !error && items.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              index={index}
            />
          ))}
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default InventoryPage;
