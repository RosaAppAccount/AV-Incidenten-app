// AV Incidenten App – hoofdcomponent
// Toont incidenten, oplossingen en handelingen inclusief afbeeldingen en handleidingen

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);

  useEffect(() => {
    const opgeslagenData = localStorage.getItem("incidentenData");
    if (opgeslagenData) {
      const { incidenten, oplossingen, handelingen } = JSON.parse(opgeslagenData);
      setIncidenten(incidenten);
      setOplossingen(oplossingen);
      setHandelingen(handelingen);
    } else {
      fetch("/Gegevens_avIncidentenApp.xlsx")
        .then((res) => res.arrayBuffer())
        .then((data) => {
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

  // ✅ Als gebruiker klikt op een oplossing
  const handleSelectOplossing = (oplossing) => {
    if (!gekozenOplossingen.includes(oplossing.ID)) {
      setGekozenOplossingen((prev) => [...prev, oplossing.ID]);
    }
    setSelectedOplossing(oplossing);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#006e4f", marginBottom: "30px" }}>
        🔊 AV Incidenten App
      </h1>

      {/* 📋 Incidentenlijst */}
      {!selectedIncident && (
        <>
          <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Kies een incident:</h2>
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

      {/* 💡 Oplossingen */}
      {selectedIncident && !selectedOplossing && (
        <>
          <button onClick={() => setSelectedIncident(null)} style={{ marginBottom: "20px" }}>
            ⬅ Terug
          </button>
          <h2>Opties: {selectedIncident.Beschrijving}</h2>
          {oplossingen
            .filter((o) => o.IncidentID === selectedIncident.ID)
            .map((o) => {
              const isGekozen = gekozenOplossingen.includes(o.ID);
              const isSelected = selectedOplossing?.ID === o.ID;
              return (
                <div
                  key={o.ID}
                  onClick={() => {
                    if (!isGekozen || isSelected) {
                      handleSelectOplossing(o);
                    }
                  }}
                  style={{
                    backgroundColor: isSelected ? "#ecfdf5" : isGekozen ? "#e5e7eb" : "#f0fdf4",
                    padding: "12px",
                    border: `3px solid ${isSelected ? "#22c55e" : "#ccc"}`,
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: isGekozen && !isSelected ? "not-allowed" : "pointer",
                    opacity: isGekozen && !isSelected ? 0.6 : 1,
                  }}
                >
                  <strong>{isGekozen ? "✅ " : ""}{o.Beschrijving}</strong>
                  <p style={{ margin: "6px 0 0", color: "#6b7280" }}>💡 {o.Consequentie}</p>
                </div>
              );
            })}
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
              .filter((h) => h.OplossingID === selectedOplossing.ID)
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
                          marginTop: "8px",
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
