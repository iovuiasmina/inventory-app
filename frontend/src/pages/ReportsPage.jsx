import { useState, useEffect } from "react";
import { getAllItems } from "../api/inventoryApi.js";

function ReportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAllItems();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalValue = items.reduce(
    (sum, item) => sum + parseFloat(item.value || 0),
    0
  );
  const maxItem = items.reduce(
    (max, item) => (!max || parseFloat(item.value) > parseFloat(max.value) ? item : max),
    null
  );

  const byCategory = items.reduce((acc, item) => {
    const cat = item.category || "Necategorizat";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const exportCSV = () => {
    const header = "Nume,Număr de Serie,Valoare,Categorie,Descriere\n";
    const rows = items
      .map(
        (item) =>
          `"${item.name}","${item.serialNumber}","$${parseFloat(item.value).toFixed(2)}","${item.category || ""}","${item.description || ""}"`
      )
      .join("\n");
    const csvContent = header + rows;

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
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

    const htmlContent = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Raport Inventar Personal</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 2rem; background: #fdf4ff; color: #3d1d5e; }
    h1 { color: #9333ea; border-bottom: 3px solid #ec4899; padding-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; box-shadow: 0 4px 16px rgba(147,51,234,0.1); border-radius: 0.75rem; overflow: hidden; }
    th { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 14px 18px; text-align: left; font-size: 0.9rem; }
    td { padding: 12px 18px; border-bottom: 1px solid #f3c5f5; font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fce7f3; }
    .summary { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .stat-card { background: white; border-radius: 0.75rem; padding: 1rem 1.5rem; border: 1px solid #f3c5f5; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #9333ea; }
    .stat-label { font-size: 0.8rem; color: #9b72bf; margin-top: 0.2rem; }
    .total { margin-top: 1.5rem; font-size: 1.1rem; font-weight: bold; color: #9333ea; text-align: right; }
    .generated { color: #b39dcc; font-size: 0.82rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <h1>Raport Inventar Personal</h1>
  <p class="generated">Generat la: ${new Date().toLocaleString("ro-RO")}</p>
  
  <div class="summary">
    <div class="stat-card">
      <div class="stat-value">${items.length}</div>
      <div class="stat-label">Total articole</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">RON${totalValue.toFixed(2)}</div>
      <div class="stat-label">Valoare totală</div>
    </div>
  </div>

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
  <div class="total">Valoare totală inventar: RON${totalValue.toFixed(2)}</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventar.html");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="card-glass" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
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
          Rapoarte Inventar
        </h1>
        <p style={{ color: "#9b72bf", fontSize: "0.9rem" }}>
          Exportați inventarul în format HTML sau CSV pentru arhivare sau imprimare.
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={exportHTML} disabled={loading || items.length === 0}>
            Export HTML
          </button>
          <button className="btn-secondary" onClick={exportCSV} disabled={loading || items.length === 0}>
            Export CSV
          </button>
        </div>
      </div>
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div className="card-glass" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #9333ea, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {items.length}
            </div>
            <div style={{ color: "#9b72bf", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Total articole
            </div>
          </div>
          <div className="card-glass" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #9333ea, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ${totalValue.toFixed(2)}
            </div>
            <div style={{ color: "#9b72bf", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Valoare totală
            </div>
          </div>
          {maxItem && (
            <div className="card-glass" style={{ padding: "1.25rem", textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  color: "#9333ea",
                }}
              >
                {maxItem.name}
              </div>
              <div style={{ color: "#ec4899", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                ${parseFloat(maxItem.value).toFixed(2)}
              </div>
              <div style={{ color: "#9b72bf", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                Cel mai valoros
              </div>
            </div>
          )}
          <div className="card-glass" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #9333ea, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {Object.keys(byCategory).length}
            </div>
            <div style={{ color: "#9b72bf", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Categorii
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9333ea" }}>
          Se încarcă datele...
        </div>
      )}

      {error && (
        <div className="card-glass" style={{ padding: "1.5rem", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="card-glass" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              color: "#9333ea",
              fontSize: "1.1rem",
              marginBottom: "1rem",
            }}
          >
            Previzualizare tabel inventar
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr>
                  {["Nume", "Număr de Serie", "Valoare", "Categorie", "Descriere"].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          background: "linear-gradient(135deg, #9333ea, #ec4899)",
                          color: "white",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.7)" : "rgba(243,232,255,0.3)",
                    }}
                  >
                    <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#3d1d5e" }}>
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontFamily: "monospace",
                        fontSize: "0.82rem",
                        color: "#7e22ce",
                      }}
                    >
                      {item.serialNumber}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: "700",
                        color: "#9333ea",
                      }}
                    >
                      ${parseFloat(item.value).toFixed(2)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {item.category ? (
                        <span className="badge">{item.category}</span>
                      ) : (
                        <span style={{ color: "#c4a8d8" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#7b5e99" }}>
                      {item.description || "-"}
                    </td>
                  </tr>
                ))}
                <tr
                  style={{
                    borderTop: "2px solid rgba(147,51,234,0.2)",
                    background: "rgba(243,232,255,0.5)",
                  }}
                >
                  <td
                    colSpan={2}
                    style={{
                      padding: "0.875rem 1rem",
                      fontWeight: "700",
                      color: "#9333ea",
                      textAlign: "right",
                    }}
                  >
                    TOTAL INVENTAR:
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontWeight: "700",
                      fontSize: "1rem",
                      background: "linear-gradient(135deg, #9333ea, #ec4899)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ${totalValue.toFixed(2)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="card-glass" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ color: "#9b72bf" }}>Nu există articole de exportat.</p>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
