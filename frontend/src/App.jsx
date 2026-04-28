import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import ManagePage from "./pages/ManagePage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";

function App() {
  return (
    <Router>
      {/* Bara de navigare globala */}
      <Navbar />

      {/* Continutul principal al paginilor */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="/manage/:id" element={<ManagePage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
