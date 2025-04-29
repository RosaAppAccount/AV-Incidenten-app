import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function IncidentApp() {
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);
  const [afgevinkteHandelingen, setAfgevinkteHandelingen] = useState([]);

  // Laad Excel of lokale opslag
useEffect(() => {
  const opgeslagenData = localStorage.getItem("incidentenData");

  if (opgeslagenData) {
    const { incidenten, oplossingen, handelingen } = JSON.parse(opgeslagenData);
    setIncidenten(incidenten);
    setOplossingen(oplossingen);
    setHandelingen(handelingen);
  } else {
    fetch("/Gegevens_avIncidentenApp.xlsx")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Excelbestand niet gevonden.");
        }
        return res.arrayBuffer();
      })
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        const incidentenSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Incidenten"]);
        const oplossingenSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Oplossingen"]);
        const handelingenSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Handelingen"]);
        const dataObj = { incidenten: incidentenSheet, oplossingen: oplossingenSheet, handelingen: handelingenSheet };
        localStorage.setItem("incidentenData", JSON.stringify(dataObj));
        setIncidenten(incidentenSheet);
        setOplossingen(oplossingenSheet);
        setHandelingen(handelingenSheet);
      })
      .catch((error) => {
        console.error("Fout bij laden standaard Excel:", error);
      });
  }
}, []);

  const toggleHandeling = (id) => {
    setAfgevinkteHandelingen((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const renderOplossing = (oplossing) => {
    const isGekozen = gekozenOplossingen.includes(oplossing.ID);
    const isActief = selectedOplossing?.ID === oplossing.ID;
    const magKlikken = !isGekozen || isActief;

    return (
      <div
        key={oplossing.ID}
        onClick={() => {
          if (magKlikken) {
            setSelectedOplossing(oplossing);
            if (!isGekozen) {
              setGekozenOplossingen((prev) => [...prev, oplossing.ID]);
            }
          }
        }}
        style={{
          backgroundColor: "#f8fafc",
          border: isActief ? "3px solid #2563eb" : "1px solid #ccc",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "10px",
          cursor: magKlikken ? "pointer" : "not-allowed",
          opacity: magKlikken ? 1 : 0.6,
        }}
      >
        <strong>{isGekozen ? "✅ " : ""}{oplossing.Beschrijving}</strong>
        <p style={{ margin: "6px 0 0", color: "#6b7280" }}>💡 {oplossing.Consequentie}</p>
      </div>
    );
  };

  const renderHandelingen = () => (
    <div>
      <h4>📌 Handelingen</h4>
      <table style={{ width: "100%" }}>
        <tbody>
          {handelingen
            .filter((h) => h.OplossingID === selectedOplossing?.ID)
            .map((h, index) => (
              <tr key={h.ID}>
                <td style={{ verticalAlign: "top", paddingRight: "16px", width: "65%" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={afgevinkteHandelingen.includes(h.ID)}
                      onChange={() => toggleHandeling(h.ID)}
                      style={{ marginTop: "5px", accentColor: "#22c55e" }}
                    />
                    <div>
                      <span>
                        {index + 1}. {h.Beschrijving} —{" "}
                        <span style={{ color: "#15803d" }}>{h.Verantwoordelijke}</span>
                      </span>
                      {h.Handleiding && (
                        <div style={{ marginTop: "6px" }}>
                          📄 <a href={`/handleidingen/${h.Handleiding}`} target="_blank" rel="noreferrer">Bekijk handleiding</a>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ width: "35%" }}>
                  {h.AfbeeldingBestand && (
                    <img
                      src={`/afbeeldingen/${h.AfbeeldingBestand}`}
                      alt="Uitleg"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        border: "1px solid #ccc",
                        borderRadius: "6px"
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img src="/logo.png" alt="Logo" style={{ width: "40px", height: "40px" }} />
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#006e4f" }}>🔊 AV Incidenten App</h1>
      </div>

      {page === "incidenten" && (
        <>
          <h2>📋 Kies een incident</h2>
          {incidenten.map((incident) => (
            <button
              key={incident.ID}
              onClick={() => {
                setSelectedIncident(incident);
                setSelectedOplossing(null);
                setPage("oplossingen");
              }}
              style={{
                display: "block",
                marginBottom: "8px",
                padding: "10px 16px",
                backgroundColor: "#006e4f",
                color: "white",
                borderRadius: "6px",
                width: "100%",
              }}
            >
              {incident.Beschrijving}
            </button>
          ))}
        </>
      )}

      {page === "oplossingen" && selectedIncident && (
        <div>
          <button onClick={() => setSelectedOplossing(null)} style={{ marginBottom: "20px" }}>⬅ Terug</button>
          <h3>💬 Opties: {selectedIncident.Beschrijving}</h3>
          {oplossingen
            .filter((o) => o.IncidentID === selectedIncident.ID)
            .map(renderOplossing)}
          {selectedOplossing && renderHandelingen()}
        </div>
      )}
    </div>
  );
}
