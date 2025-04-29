// AV Incidenten App - hoofdcomponent met routing
// Toont incidenten, opties (oplossingen) en handelingen op aparte pagina
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Startscherm />} />
        <Route path="/handelingen/:oplossingID" element={<HandelingenPagina />} />
      </Routes>
    </Router>
  );
}

// 🌐 Startpagina met incidenten en oplossingen
function Startscherm() {
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const navigate = useNavigate();

  // 📥 Excel ophalen vanuit localStorage of standaardbestand
  useEffect(() => {
    const opgeslagenData = localStorage.getItem("incidentenData");
    if (opgeslagenData) {
      const { incidenten, oplossingen } = JSON.parse(opgeslagenData);
      setIncidenten(incidenten);
      setOplossingen(oplossingen);
    } else {
      fetch("/Gegevens_avIncidentenApp.xlsx")
        .then((res) => res.arrayBuffer())
        .then((data) => {
          const wb = XLSX.read(data, { type: "array" });
          const incidentenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Incidenten"]);
          const oplossingenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Oplossingen"]);
          const handelingenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Handelingen"]);
          const alles = {
            incidenten: incidentenSheet,
            oplossingen: oplossingenSheet,
            handelingen: handelingenSheet,
          };
          localStorage.setItem("incidentenData", JSON.stringify(alles));
          setIncidenten(incidentenSheet);
          setOplossingen(oplossingenSheet);
        });
    }
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#006e4f", marginBottom: "30px" }}>🔊 AV Incidenten App</h1>

      {!selectedIncident && (
        <>
          <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>📋 Kies een incident:</h2>
          {incidenten.map((incident) => (
            <button
              key={incident.ID}
              onClick={() => setSelectedIncident(incident)}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "10px 16px",
                backgroundColor: "#006e4f",
                color: "white",
                borderRadius: "6px",
              }}
            >
              {incident.Beschrijving}
            </button>
          ))}
        </>
      )}

      {selectedIncident && (
        <>
          <button onClick={() => setSelectedIncident(null)} style={{ marginBottom: "20px" }}>⬅ Terug</button>
          <h2>💬 Opties: {selectedIncident.Beschrijving}</h2>

          {oplossingen
            .filter((o) => o.IncidentID === selectedIncident.ID)
            .map((oplossing) => {
              const isGekozen = gekozenOplossingen.includes(oplossing.ID);
              const isActief = oplossing.ID === gekozenOplossingen[gekozenOplossingen.length - 1];
              return (
                <div
                  key={oplossing.ID}
                  onClick={() => {
                    if (!isGekozen || isActief) {
                      if (!isGekozen) setGekozenOplossingen((prev) => [...prev, oplossing.ID]);
                      navigate(`/handelingen/${oplossing.ID}`);
                    }
                  }}
                  style={{
                    backgroundColor: isGekozen ? "#f0f0f4" : "#f0fdf4",
                    padding: "12px",
                    border: isActief ? "3px solid #22c55e" : "1px solid #ccc",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: isGekozen && !isActief ? "not-allowed" : "pointer",
                    opacity: isGekozen && !isActief ? 0.5 : 1,
                  }}
                >
                  <strong>{isGekozen ? "✅ " : ""}{oplossing.Beschrijving}</strong>
                  <p style={{ margin: "6px 0 0", color: "#6b7280" }}>💡 {oplossing.Consequentie}</p>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}

// 🧾 Pagina met handelingen per gekozen oplossing
function HandelingenPagina() {
  const { oplossingID } = useParams();
  const navigate = useNavigate();
  const [handelingen, setHandelingen] = useState([]);
  const [oplossing, setOplossing] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("incidentenData"));
    if (data) {
      setHandelingen(data.handelingen);
      const gevonden = data.oplossingen.find((o) => String(o.ID) === oplossingID);
      setOplossing(gevonden);
    }
  }, [oplossingID]);

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: "20px" }}>⬅ Terug</button>
      <h2>📌 Handelingen bij: {oplossing?.Beschrijving}</h2>
      <ul>
        {handelingen
          .filter((h) => String(h.OplossingID) === oplossingID)
          .map((h, index) => (
            <li key={h.ID} style={{ marginBottom: "14px" }}>
              <strong>{index + 1}. {h.Beschrijving}</strong> — <span style={{ color: "#15803d" }}>{h.Verantwoordelijke}</span>
              {h.Handleiding && (
                <div style={{ marginTop: "5px" }}>
                  📄 <a href={`/handleidingen/${h.Handleiding}`} target="_blank" rel="noreferrer">Bekijk handleiding</a>
                </div>
              )}
              {h.AfbeeldingBestand && (
                <div>
                  <img
                    src={`/afbeeldingen/${h.AfbeeldingBestand}`}
                    alt="Uitleg"
                    style={{ maxWidth: "300px", maxHeight: "200px", borderRadius: "6px", marginTop: "8px" }}
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
