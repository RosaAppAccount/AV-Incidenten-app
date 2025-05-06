// AV Incidenten App - hoofdcomponent
// Toont incidenten, opties en handelingen met aparte pagina voor handelingen

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Startscherm />} />
        <Route path="/handelingen/:oplossingID/:incidentID" element={<HandelingenPagina />} />
      </Routes>
    </Router>
  );
}

// ✅ Startpagina met incidenten en opties (oplossingen)
function Startscherm() {
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossingID, setSelectedOplossingID] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 📥 Gegevens ophalen bij opstart (van localStorage of standaard Excelbestand)
  useEffect(() => {
    const opgeslagenData = localStorage.getItem("incidentenData");
    if (opgeslagenData) {
      const { incidenten, oplossingen } = JSON.parse(opgeslagenData);
      setIncidenten(incidenten);
      setOplossingen(oplossingen);
    } else {
      fetch("/Gegevens_avIncidentenApp.xlsx")
        .then(res => res.arrayBuffer())
        .then(data => {
          const wb = XLSX.read(data, { type: "array" });
          const incidentenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Incidenten"]);
          const oplossingenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Oplossingen"]);
          const alles = { incidenten: incidentenSheet, oplossingen: oplossingenSheet };
          localStorage.setItem("incidentenData", JSON.stringify(alles));
          setIncidenten(incidentenSheet);
          setOplossingen(oplossingenSheet);
        });
    }
  }, []);

  // ⬅️ Komt terug uit handelingenpagina → zet weer incident + optie actief
  useEffect(() => {
    if (location.state?.terugNaarIncident) {
      const terugIncident = incidenten.find(i => String(i.ID) === String(location.state.terugNaarIncident));
      setSelectedIncident(terugIncident);
      setSelectedOplossingID(location.state.terugNaarOplossing);
    }
  }, [incidenten]);

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", color: "#006e4f", marginBottom: "20px" }}>🔊 AV Incidenten App</h1>

      {/* 📋 Incidentenlijst tonen als er nog geen incident geselecteerd is */}
      {!selectedIncident && (
        <>
          <h2>Kies een incident:</h2>
          {incidenten.map((incident) => (
            <button
              key={incident.ID}
              onClick={() => {
                setSelectedIncident(incident);
                setSelectedOplossingID(null);
              }}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "10px",
                backgroundColor: "#006e4f",
                color: "white",
                borderRadius: "6px"
              }}
            >
              {incident.Beschrijving}
            </button>
          ))}
        </>
      )}

      {/* 💡 Opties (oplossingen) bij een geselecteerd incident */}
      {selectedIncident && (
        <>
          <button onClick={() => setSelectedIncident(null)} style={{ marginBottom: "20px" }}>
            ⬅ Terug
          </button>
          <h2>Opties: {selectedIncident.Beschrijving}</h2>
          {oplossingen
            .filter(o => o.IncidentID === selectedIncident.ID)
            .map(o => {
              const isGekozen = gekozenOplossingen.includes(o.ID);
              const isActief = selectedOplossingID === o.ID;
              return (
                <div
                  key={o.ID}
                  onClick={() => {
                    if (!isGekozen || isActief) {
                      setSelectedOplossingID(o.ID);
                      if (!isGekozen) setGekozenOplossingen(prev => [...prev, o.ID]);
                      navigate(`/handelingen/${o.ID}/${selectedIncident.ID}`);
                    }
                  }}
                  style={{
                    backgroundColor: "#f0fdf4",
                    padding: "12px",
                    border: isActief ? "3px solid #22c55e" : "1px solid #ccc",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: isGekozen && !isActief ? "not-allowed" : "pointer",
                    opacity: isGekozen && !isActief ? 0.6 : 1
                  }}
                >
                  <strong>{isGekozen ? "✅ " : ""}{o.Beschrijving}</strong>
                  <p style={{ margin: "6px 0 0", color: "#6b7280" }}>💡 {o.Consequentie}</p>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}

// ✅ Handelingenpagina: toont handelingen met terugknop naar opties van het juiste incident
function HandelingenPagina() {
  const { oplossingID, incidentID } = useParams();
  const [handelingen, setHandelingen] = useState([]);
  const [oplossing, setOplossing] = useState(null);
  const navigate = useNavigate();

  // 📥 Laad handelingen en oplossing vanuit localStorage
  useEffect(() => {
    const opgeslagenData = localStorage.getItem("incidentenData");
    if (opgeslagenData) {
      const { handelingen, oplossingen } = JSON.parse(opgeslagenData);
      setHandelingen(handelingen);
      const gevonden = oplossingen.find(o => String(o.ID) === String(oplossingID));
      setOplossing(gevonden);
    }
  }, [oplossingID]);

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      {/* 🔙 Terug naar optiespagina met juiste incident actief */}
      <button
        onClick={() => navigate("/", { state: { terugNaarIncident: incidentID, terugNaarOplossing: oplossingID } })}
        style={{ marginBottom: "20px" }}
      >
        ⬅ Terug
      </button>

      <h2 style={{ marginBottom: "20px" }}>📌 Handelingen: {oplossing?.Beschrijving}</h2>

      <ul>
        {handelingen
          .filter(h => String(h.OplossingID) === String(oplossingID))
          .map((h, index) => (
            <li key={h.ID} style={{ marginBottom: "12px" }}>
              <strong>{index + 1}. {h.Beschrijving}</strong> — <span style={{ color: "#15803d" }}>{h.Verantwoordelijke}</span>

              {/* 📄 Toon handleiding-link als aanwezig */}
              {h.Handleiding && (
                <div>
                  📄 <a href={`/handleidingen/${h.Handleiding}`} target="_blank" rel="noreferrer">Bekijk handleiding</a>
                </div>
              )}

              {/* 🖼️ Toon afbeelding als aanwezig */}
              {h.AfbeeldingBestand && (
                <div>
                  <img
                    src={`/afbeeldingen/${h.AfbeeldingBestand}`}
                    alt="Uitleg"
                    style={{
                      maxWidth: "300px",
                      maxHeight: "200px",
                      borderRadius: "6px",
                      marginTop: "8px"
                    }}
                  />
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
