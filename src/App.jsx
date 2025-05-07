// AV Incidenten App – Compactere opties, dynamisch consequentie-lampje, en vereenvoudigde handelingenpagina

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Routes, Route, useNavigate } from "react-router-dom";

export default function App() {
  // 📊 Data
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [checks, setChecks] = useState([]);

  // 🔐 Login
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  // 📌 Selecties
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);
  const [afgevinkteChecks, setAfgevinkteChecks] = useState([]);
  const [afgevinkteHandelingen, setAfgevinkteHandelingen] = useState([]);

  const [logoURL, setLogoURL] = useState("/logo.png");

  const navigate = useNavigate();

  const userPassword = "beheer2025";
  const adminPassword = "admin123";

  // 📥 Gegevens laden
  useEffect(() => {
    fetch("/Gegevens_avIncidentenApp.xlsx")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const wb = XLSX.read(data, { type: "array" });
        setIncidenten(XLSX.utils.sheet_to_json(wb.Sheets["Incidenten"] || []));
        setOplossingen(XLSX.utils.sheet_to_json(wb.Sheets["Oplossingen"] || []));
        setHandelingen(XLSX.utils.sheet_to_json(wb.Sheets["Handelingen"] || []));
        setChecks(XLSX.utils.sheet_to_json(wb.Sheets["Checks"] || []));
      });
  }, []);

  // 📤 Excel upload
  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      setIncidenten(XLSX.utils.sheet_to_json(wb.Sheets["Incidenten"] || []));
      setOplossingen(XLSX.utils.sheet_to_json(wb.Sheets["Oplossingen"] || []));
      setHandelingen(XLSX.utils.sheet_to_json(wb.Sheets["Handelingen"] || []));
      setChecks(XLSX.utils.sheet_to_json(wb.Sheets["Checks"] || []));
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  // 🖼️ Logo upload
  const handleLogoUpload = (e) => {
    const reader = new FileReader();
    reader.onloadend = () => setLogoURL(reader.result);
    reader.readAsDataURL(e.target.files[0]);
  };

  // ✅ Login
  const handleLogin = () => {
    if (inputPassword === userPassword) {
      setIsAuthorized(true);
      setIsAdmin(false);
    } else {
      alert("Wachtwoord ongeldig");
    }
  };

  const handleAdminLogin = () => {
    if (inputPassword === adminPassword) {
      setIsAuthorized(true);
      setIsAdmin(true);
    } else {
      alert("Admin wachtwoord ongeldig");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setIsAdmin(false);
    setInputPassword("");
    setSelectedIncident(null);
    setSelectedOplossing(null);
    setGekozenOplossingen([]);
    setAfgevinkteChecks([]);
    setAfgevinkteHandelingen([]);
  };

  const toggleCheck = (id) => {
    setAfgevinkteChecks((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleHandeling = (id) => {
    setAfgevinkteHandelingen((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  // 🔐 Login scherm
  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: "480px", margin: "100px auto", textAlign: "center" }}>
        <h1 style={{ color: "#006e4f" }}>🔊 AV Incidenten App</h1>
        <p>Deze app toont de juiste oplossingen en handelingen bij AV-noodgevallen.</p>
        <input
          type="password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          placeholder="Wachtwoord..."
          style={{ padding: "10px", width: "100%", marginBottom: "15px" }}
        />
        <div>
          <button onClick={handleLogin} style={{ backgroundColor: "#006e4f", color: "white", padding: "10px", marginRight: "10px" }}>
            Gebruiker
          </button>
          <button onClick={handleAdminLogin} style={{ backgroundColor: "#00a2a1", color: "white", padding: "10px" }}>
            Admin
          </button>
        </div>
      </div>
    );
  }

  // ✅ Hoofdapp
  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      <Routes>
        {/* INCIDENTENLIJST */}
        <Route
          path="/"
          element={
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img src={logoURL} alt="Logo" style={{ width: "40px", height: "40px" }} />
                  <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#006e4f" }}>🔊 AV Incidenten App</h1>
                </div>
              </div>

              {isAdmin && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <h2>📁 Upload Excel</h2>
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
                  <h2>🖼️ Upload Logo</h2>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} />
                </div>
              )}

              <h2>📋 Kies een incident:</h2>
              {incidenten.map((incident) => (
                <button
                  key={incident.ID}
                  onClick={() => {
                    setSelectedIncident(incident);
                    setSelectedOplossing(null);
                    setAfgevinkteChecks([]);
                    setAfgevinkteHandelingen([]);
                    setGekozenOplossingen([]);
                    const heeftChecks = checks.some(c => c.IncidentID === incident.ID);
                    navigate(heeftChecks ? "/checks" : "/oplossingen");
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    marginBottom: "8px",
                    padding: "10px 16px",
                    backgroundColor: "#006e4f",
                    color: "white",
                    borderRadius: "6px"
                  }}
                >
                  {incident.Beschrijving}
                </button>
              ))}
            </>
          }
        />

        {/* CHECKS */}
        <Route
          path="/checks"
          element={
            <>
              <button onClick={() => navigate("/")} style={{ marginBottom: "20px" }}>⬅ Terug</button>
              <h2>✅ Controleer eerst:</h2>
              <ul>
                {checks.filter(c => c.IncidentID === selectedIncident?.ID).map((c) => (
                  <li key={c.ID} style={{ marginBottom: "10px" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={afgevinkteChecks.includes(c.ID)}
                        onChange={() => toggleCheck(c.ID)}
                        style={{ marginRight: "8px", accentColor: "#22c55e" }}
                      />
                      {c.Beschrijving}
                    </label>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/oplossingen")}
                disabled={
                  checks.filter(c => c.IncidentID === selectedIncident?.ID)
                    .some(c => !afgevinkteChecks.includes(c.ID))
                }
                style={{
                  marginTop: "20px",
                  backgroundColor: "#006e4f",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "5px"
                }}
              >
                Doorgaan
              </button>
            </>
          }
        />

        {/* OPLOSSINGEN */}
        <Route
          path="/oplossingen"
          element={
            <>
              <button onClick={() => navigate("/")} style={{ marginBottom: "20px" }}>⬅ Terug</button>
              <h2>💬 Opties: {selectedIncident?.Beschrijving}</h2>
              {oplossingen.filter(o => o.IncidentID === selectedIncident?.ID).map((o) => {
                const isGekozen = gekozenOplossingen.includes(o.ID);
                const isActief = selectedOplossing?.ID === o.ID;
                return (
                  <div
                    key={o.ID}
                    onClick={() => {
                      if (!isGekozen || isActief) {
                        setSelectedOplossing(o);
                        if (!isGekozen) {
                          setGekozenOplossingen(prev => [...prev, o.ID]);
                        }
                        navigate("/handelingen");
                      }
                    }}
                    style={{
                      backgroundColor: isGekozen ? "#e2e8f0" : "#f0fdf4",
                      padding: "8px 12px",
                      border: isActief ? "3px solid #22c55e" : "1px solid #ccc",
                      borderRadius: "8px",
                      marginBottom: "6px",
                      cursor: isGekozen && !isActief ? "not-allowed" : "pointer"
                    }}
                  >
                    <strong>{isGekozen ? "✅ " : ""}{o.Beschrijving}</strong>
                    {o.Consequentie && (
                      <p style={{ fontSize: "13px", margin: "4px 0", color: "#6b7280" }}>
                        💡 {o.Consequentie}
                      </p>
                    )}
                  </div>
                );
              })}
            </>
          }
        />

        {/* HANDELINGEN */}
        <Route
          path="/handelingen"
          element={
            <>
              <button onClick={() => navigate("/oplossingen")} style={{ marginBottom: "20px" }}>⬅ Terug</button>
              <ul>
                {handelingen.filter(h => h.OplossingID === selectedOplossing?.ID).map((h, index) => (
                  <li key={h.ID} style={{ marginBottom: "16px" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={afgevinkteHandelingen.includes(h.ID)}
                        onChange={() => toggleHandeling(h.ID)}
                        style={{ marginRight: "8px", accentColor: "#22c55e" }}
                      />
                      {index + 1}. {h.Beschrijving} — <span style={{ color: "#15803d" }}>{h.Verantwoordelijke}</span>
                    </label>
                    {h.Handleiding && (
                      <div style={{ marginTop: "6px" }}>
                        📄 <a href={`/handleidingen/${h.Handleiding}`} target="_blank" rel="noreferrer">Bekijk handleiding</a>
                      </div>
                    )}
                    {h.AfbeeldingBestand && (
                      <div style={{ marginTop: "8px" }}>
                        <img
                          src={`/afbeeldingen/${h.AfbeeldingBestand}`}
                          alt="Afbeelding"
                          style={{ maxWidth: "300px", maxHeight: "200px", borderRadius: "6px" }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          }
        />
      </Routes>
    </div>
  );
}
