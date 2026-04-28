/**
 * components/Navbar.jsx — Bara de navigare globala
 * Autor: [NumeStudent2]
 * Rute: / (Inventar), /manage (Adauga/Editeaza), /reports (Rapoarte)
 */
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  // Verifica daca o ruta este activa
  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <nav
      style={{
        background:
          "linear-gradient(135deg, rgba(147,51,234,0.95), rgba(236,72,153,0.95))",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 24px rgba(147,51,234,0.2)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          {/* Logo / Titlu aplicatie */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>📦</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "700",
                fontSize: "1.25rem",
                color: "white",
                letterSpacing: "0.01em",
              }}
            >
              Inventar Personal
            </span>
          </Link>

          {/* Linkuri de navigare */}
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {[
              { path: "/", label: "📋 Inventar" },
              { path: "/manage", label: "➕ Adaugă" },
              { path: "/reports", label: "📊 Rapoarte" },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.625rem",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "white",
                  transition: "all 0.2s ease",
                  background: isActive(path)
                    ? "rgba(255,255,255,0.25)"
                    : "transparent",
                  border: isActive(path)
                    ? "1px solid rgba(255,255,255,0.4)"
                    : "1px solid transparent",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
