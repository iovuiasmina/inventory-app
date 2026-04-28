import { Link } from "react-router-dom";

function ItemCard({ item, onDelete, index = 0 }) {
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RON",
  }).format(item.value);

  const createdAt = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("ro-RO")
    : "-";

  return (
    <div
      className={`card-glass animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
      style={{ padding: "1.25rem" }}
    >
      <div
        style={{
          width: "100%",
          height: "160px",
          borderRadius: "0.875rem",
          overflow: "hidden",
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #f3e8ff, #fce7f3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.photo ? (
          <img
            src={`${import.meta.env.VITE_API_URL || ""}${item.photo}`}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: "3.5rem", opacity: 0.5 }}>📷</span>
        )}
      </div>
      <div>
        {item.category && (
          <span className="badge" style={{ marginBottom: "0.5rem" }}>
            {item.category}
          </span>
        )}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            fontWeight: "700",
            color: "#3d1d5e",
            margin: "0.4rem 0 0.25rem",
          }}
        >
          {item.name}
        </h3>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#9b72bf",
            fontFamily: "monospace",
            letterSpacing: "0.04em",
            marginBottom: "0.5rem",
          }}
        >
          S/N: {item.serialNumber}
        </p>
        {item.description && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "#7b5e99",
              marginBottom: "0.5rem",
              lineHeight: "1.4",
            }}
          >
            {item.description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "0.75rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid rgba(147,51,234,0.1)",
          }}
        >
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #9333ea, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {formattedValue}
          </span>
          <span style={{ fontSize: "0.72rem", color: "#b39dcc" }}>
            {createdAt}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "0.875rem",
          }}
        >
          <Link
            to={`/manage/${item.id}`}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
          >
            Editează
          </Link>
          <button
            className="btn-danger"
            onClick={() => onDelete(item.id, item.name)}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Șterge
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemCard;
