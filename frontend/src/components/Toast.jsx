/**
 * components/Toast.jsx — Componenta pentru notificari temporare
 * Autor: [NumeStudent2]
 * Tipuri: "success" (gradient mov-roz) | "error" (rosu)
 */
import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
  // Inchidem automat dupa 3 secunde
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span style={{ marginRight: "0.5rem" }}>
        {type === "success" ? "✅" : "❌"}
      </span>
      {message}
    </div>
  );
}

export default Toast;
