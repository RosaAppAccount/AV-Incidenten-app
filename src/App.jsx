// AV Incidenten App - met routing naar aparte handelingenpagina

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Routes, Route, useNavigate } from "react-router-dom"; // ✅ routing toegevoegd

export default function App() {
  // 📊 Data-states
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);

  // 🔐 Inlog en app-status
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);
  const [afgevinkteHandelingen, setAfgevinkteHandelingen] = useState([]);

  const [logoURL, setLogoURL] = useState("/logo.png");

  const navigate = useNavigate(); // ✅ voor navigatie

  const userPassword = "beheer2025";
  const adminPassword = "admin123";

  // 📦 Laad data bij start
  useEffect(() => {
    fetch("/Gegevens_avIncidentenApp.xlsx") // ✅ nieuwe bestandsnaam
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        setIncidenten(XLSX.utils.sheet_to_json(workbook.Sheets["Incidenten"]));
        setOplossingen(XLSX.utils.sheet_to_json(workbook.Sheets["Oplossingen"]));
        setHandelingen(XLSX.utils.sheet_to_json(workbook.Sheets["Handelingen"]));
      });
  }, []);

  const handleLogin = () => {
    if (inputPassword === userPassword) {
      setIsAuthorized(true);
    } else if (inputPassword === adminPassword) {
      setIsAuthorized(true);
      setIsAdmin(true);
    } else {
      alert("Ongeldig wachtwoord.");
    }
  };

  const toggleHandeling = (id) => {
    setAfgevinkteHandelingen((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  // ✅ Loginpagina
  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: '480px', margin: '100px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#006e4f' }}>🔊 AV Incidenten App</h1>
        <p>Toont oplossingen en handelingen voor audiovisuele incidenten.</p>
        <input
          type="password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          placeholder="Wachtwoord..."
          style={{ padding: '10px', width: '100%', marginBottom: '15px' }}
        />
        <button onClick={handleLogin} style={{ backgroundColor: '#006e4f', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>Login</button>
      </div>
    );
  }

  // ✅ Hoofdscherm: incidenten en opties
  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
        <img src={logoURL} alt="Logo" style={{ width: '40px', height: '40px' }} />
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#006e4f" }}>🔊 AV Incidenten App</h1>
      </div>

      <Routes>
        {/* 🧭 Route voor incidenten + oplossingen */}
        <Route path="/" element={
          <>
            {!selectedIncident ? (
              <>
                <h2>Kies een incident:</h2>
                {incidenten.map((incident) => (
                  <button
                    key={incident.ID}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setSelectedOplossing(null);
                      setGekozenOplossingen([]);
                    }}
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      padding: "10px 16px",
                      backgroundColor: "#006e4f",
                      color: "white",
                      borderRadius: "6px",
                      width: "100%"
                    }}
                  >
                    {incident.Beschrijving}
                  </button>
                ))}
              </>
            ) : (
              <>
                <button onClick={() => setSelectedIncident(null)} style={{ marginBottom: "20px" }}>⬅ Terug</button>
                <h3>💬 Opties: {selectedIncident.Beschrijving}</h3>
                {oplossingen
                  .filter((o) => o.IncidentID === selectedIncident.ID)
                  .map((oplossing) => {
                    const isGekozen = gekozenOplossingen.includes(oplossing.ID);
                    const isActief = selectedOplossing?.ID === oplossing.ID;

                    return (
                      <div
                        key={oplossing.ID}
                        onClick={() => {
                          setSelectedOplossing(oplossing);
                          if (!isGekozen) {
                            setGekozenOplossingen((prev) => [...prev, oplossing.ID]);
                          }
                          navigate("/handelingen");
                        }}
                        style={{
                          border: isActief ? "3px solid #22c55e" : "1px solid #ccc",
                          backgroundColor: isGekozen ? "#e2e8f0" : "#f0fdf4",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "10px",
                          cursor: isGekozen && !isActief ? "not-allowed" : "pointer",
                          opacity: isGekozen && !isActief ? 0.6 : 1
                        }}
                      >
                        <strong>{isGekozen ? "✅ " : ""}{oplossing.Beschrijving}</strong>
                        <p style={{ margin: "6px 0 0", color: "#6b7280" }}>💡 {oplossing.Consequentie}</p>
                      </div>
                    );
                  })}
              </>
            )}
          </>
        } />

        {/* 🧭 Route voor handelingenpagina */}
        <Route path="/handelingen" element={
          <>
            <button
              onClick={() => navigate("/")}
              style={{ marginBottom: "20px" }}
            >
              ⬅ Terug naar opties
            </button>

            <h2>📌 Handelingen</h2>
            <table style={{ width: '100%' }}>
              <tbody>
                {handelingen.filter(h => h.OplossingID === selectedOplossing?.ID).map((h, index) => (
                  <tr key={h.ID}>
                    <td style={{ verticalAlign: 'top', paddingRight: '16px', width: '65%' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={afgevinkteHandelingen.includes(h.ID)}
                          onChange={() => toggleHandeling(h.ID)}
                          style={{ marginTop: '5px', accentColor: '#22c55e' }}
                        />
                        <div>
                          <span>{index + 1}. {h.Beschrijving} — <span style={{ color: '#15803d' }}>{h.Verantwoordelijke}</span></span>
                          {h.Handleiding && (
                            <div style={{ marginTop: '6px' }}>
                              📄 <a href={`/handleidingen/${h.Handleiding}`} target="_blank" rel="noreferrer">Bekijk handleiding</a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '35%' }}>
                      {h.AfbeeldingBestand && (
                        <img
                          src={`/afbeeldingen/${h.AfbeeldingBestand}`}
                          alt="Uitleg"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            border: '1px solid #ccc',
                            borderRadius: '6px'
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        } />
      </Routes>
    </div>
  );
}
