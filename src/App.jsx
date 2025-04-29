// AV Incidenten App - hoofdcomponent
// Toont incidenten, opties (oplossingen) en handelingen inclusief afbeeldingen en handleidingen

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function App() {
  // ⬇️ State voor data en navigatie
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);

  // ✅ Data laden bij opstart, eerst uit localStorage, anders uit standaardbestand
  useEffect(() => {
    const opgeslagenData = localStorage.getItem("incidentenData");
    if (opgeslagenData) {
      const { incidenten, oplossingen, handelingen } = JSON.parse(opgeslagenData);
      setIncidenten(incidenten);
      setOplossingen(oplossingen);
      setHandelingen(handelingen);
    } else {
      // 📥 Als geen data in localStorage → laad standaardbestand uit public
      fetch("/Gegevens_avIncidentenApp.xlsx")
        .then(res => res.arrayBuffer())
        .then(data => {
          const wb = XLSX.read(data, { type: "array" });
          const incidentenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Incidenten"]);
          const oplossingenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Oplossingen"]);
          const handelingenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Handelingen"]);
          const alles = { incidenten: incidentenSheet, oplossingen: oplossingenSheet, handelingen: handelingenSheet };
          localStorage.setItem("incidentenData", JSON.stringify(alles));
          setIncidenten(incidentenSheet);
          setOplossingen(oplossingenSheet);
          setHandelingen(handelingenSheet);
        });
    }
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      {/* 🔊 Header met nieuwe titel */}
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#006e4f", marginBottom: "30px" }}>
        🔊 AV Incidenten App
      </h1>

      {/* 📋 Incidentenlijst */}
      {!selectedIncident && (
        <>
          <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Kies een incident:</h2>
          {incidenten.map(incident => (
            <button
              key={incident.ID}
              onClick={() => {
                setSelectedIncident(incident);
                setSelectedOplossing(null);
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
      )}

      {/* 💡 Oplossingen */}
      {selectedIncident && !selectedOplossing && (
        <>
          <button onClick={() => setSelectedIncident(null)} style={{ marginBottom: "20px" }}>
            ⬅ Terug
          </button>
          <h2>Opties: {selectedIncident.Beschrijving}</h2>
          {oplossingen
            .filter(o => o.IncidentID === selectedIncident.ID)
            .map(o => (
              <div
                key={o.ID}
                onClick={() => setSelectedOplossing(o)}
                style={{
                  backgroundColor: "#f0fdf4",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  cursor: "pointer"
                }}
              >
                <strong>{o.Beschrijving}</strong>
                <p style={{ margin: "6px 0 0", color: "#6b7280" }}>💡 {o.Consequentie}</p>
              </div>
            ))}
        </>
      )}

      {/* ✅ Handelingen */}
      {selectedOplossing && (
        <>
          <button onClick={() => setSelectedOplossing(null)} style={{ marginBottom: "20px" }}>
            ⬅ Terug
          </button>
          <h2>📌 Handelingen</h2>
          <ul>
            {handelingen
              .filter(h => h.OplossingID === selectedOplossing.ID)
              .map((h, index) => (
                <li key={h.ID} style={{ marginBottom: "12px" }}>
                  <strong>{index + 1}. {h.Beschrijving}</strong> — <span style={{ color: "#15803d" }}>{h.Verantwoordelijke}</span>
                  {h.Handleiding && (
                    <div>
                      📄 <a href={`/handleidingen/${h.Handleiding}`} target="_blank" rel="noreferrer">Bekijk handleiding</a>
                    </div>
                  )}
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
        </>
      )}
    </div>
  );
}
