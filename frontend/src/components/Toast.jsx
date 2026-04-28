import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
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
