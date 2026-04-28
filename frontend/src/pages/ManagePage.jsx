import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addItem,
  updateItem,
  getItemById,
  uploadPhoto,
} from "../api/inventoryApi.js";
import Toast from "../components/Toast.jsx";

const CATEGORIES = [
  "Electronics",
  "Computers",
  "Furniture",
  "Clothing",
  "Books",
  "Tools",
  "Other",
];

const EMPTY_FORM = {
  name: "",
  serialNumber: "",
  value: "",
  category: "",
  description: "",
};

function ManagePage() {
  const { id } = useParams();          
  const navigate = useNavigate();
  const isEditing = Boolean(id);       

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});       
  const [loading, setLoading] = useState(false);  
  const [loadingItem, setLoadingItem] = useState(isEditing); 
  const [toast, setToast] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);         
  const [photoPreview, setPhotoPreview] = useState(null);   
  const [currentPhoto, setCurrentPhoto] = useState(null);   
  const [savedItemId, setSavedItemId] = useState(null);     

  useEffect(() => {
    if (!isEditing) return;

    async function loadItem() {
      setLoadingItem(true);
      try {
        const item = await getItemById(id);
        setForm({
          name: item.name || "",
          serialNumber: item.serialNumber || "",
          value: item.value?.toString() || "",
          category: item.category || "",
          description: item.description || "",
        });
        setCurrentPhoto(item.photo || null);
      } catch (err) {
        setToast({ message: err.message, type: "error" });
      } finally {
        setLoadingItem(false);
      }
    }

    loadItem();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setToast({
        message: "Doar imagini JPG, PNG, GIF sau WebP sunt acceptate.",
        type: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "Imaginea nu poate depasi 5MB.", type: "error" });
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Numele este obligatoriu.";
    if (!form.serialNumber.trim())
      newErrors.serialNumber = "Numărul de serie este obligatoriu.";
    if (!form.value) {
      newErrors.value = "Valoarea este obligatorie.";
    } else if (isNaN(form.value) || parseFloat(form.value) <= 0) {
      newErrors.value = "Valoarea trebuie să fie un număr pozitiv.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const itemData = {
        ...form,
        value: parseFloat(form.value),
      };

      let savedItem;
      if (isEditing) {
        savedItem = await updateItem(id, itemData);
        setToast({ message: "Articolul a fost actualizat! ✨", type: "success" });
      } else {
        savedItem = await addItem(itemData);
        setSavedItemId(savedItem.id);
        setToast({ message: "Articolul a fost adăugat! 🎉", type: "success" });
      }

      if (photoFile) {
        const targetId = isEditing ? id : savedItem.id;
        await uploadPhoto(targetId, photoFile);
      }

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingItem) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#9333ea" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
        <p>Se încarcă articolul...</p>
      </div>
    );
  }

  return (
    <div
      style={{ maxWidth: "640px", margin: "0 auto" }}
      className="animate-fade-in-up"
    >
      <div
        className="card-glass"
        style={{ padding: "2rem", marginBottom: "1.5rem" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #9333ea, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.25rem",
          }}
        >
          {isEditing ? "Editează Articolul" : "Articol Nou"}
        </h1>
        <p style={{ color: "#9b72bf", fontSize: "0.9rem" }}>
          {isEditing
            ? "Modifică detaliile articolului din inventar."
            : "Adaugă un nou articol în inventarul tău personal."}
        </p>
      </div>
      <div className="card-glass" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="name">
              Nume articol *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="ex: Xbox One, Samsung TV..."
              value={form.name}
              onChange={handleChange}
              style={errors.name ? { borderColor: "#dc2626" } : {}}
            />
            {errors.name && (
              <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                {errors.name}
              </p>
            )}
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="serialNumber">
              Număr de serie *
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              className="form-input"
              placeholder="ex: AXB124AXY"
              value={form.serialNumber}
              onChange={handleChange}
              style={{
                fontFamily: "monospace",
                ...(errors.serialNumber ? { borderColor: "#dc2626" } : {}),
              }}
            />
            {errors.serialNumber && (
              <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                {errors.serialNumber}
              </p>
            )}
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="value">
              Valoare estimată (USD) *
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9333ea",
                  fontWeight: "600",
                }}
              >
                RON
              </span>
              <input
                type="number"
                id="value"
                name="value"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={form.value}
                onChange={handleChange}
                style={{
                  paddingLeft: "1.75rem",
                  ...(errors.value ? { borderColor: "#dc2626" } : {}),
                }}
              />
            </div>
            {errors.value && (
              <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                {errors.value}
              </p>
            )}
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="category">
              Categorie
            </label>
            <select
              id="category"
              name="category"
              className="form-input"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">-- Selectează categoria --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="description">
              Descriere
            </label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              placeholder="Detalii suplimentare despre articol..."
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: "vertical", lineHeight: "1.5" }}
            />
          </div>
          <div style={{ marginBottom: "1.75rem" }}>
            <label className="form-label">Fotografie</label>
            {(photoPreview || currentPhoto) && (
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  borderRadius: "0.875rem",
                  overflow: "hidden",
                  marginBottom: "0.75rem",
                  border: "2px solid rgba(147,51,234,0.2)",
                }}
              >
                <img
                  src={photoPreview || currentPhoto}
                  alt="Previzualizare"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <label
              htmlFor="photo"
              className="btn-secondary"
              style={{ cursor: "pointer", display: "inline-flex" }}
            >
              📷 {photoFile ? photoFile.name : "Selectează imagine"}
            </label>
            <input
              type="file"
              id="photo"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <p style={{ fontSize: "0.75rem", color: "#b39dcc", marginTop: "0.35rem" }}>
              JPG, PNG, GIF sau WebP • Max 5MB
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ flex: 1, justifyContent: "center" }}
            >
              {loading
                ? "Se salvează..."
                : isEditing
                ? "Salvează modificările"
                : "Adaugă articolul"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/")}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
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

export default ManagePage;
