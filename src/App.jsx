// Incidentenbeheer App - React component
// Deze app toont opties bij noodgevallen en de bijbehorende handelingen (inclusief afbeeldingen)

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function IncidentApp() {
  // App-status
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);
  const [afgevinkteHandelingen, setAfgevinkteHandelingen] = useState([]);

  // Login & admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [userPassword, setUserPassword] = useState(() => localStorage.getItem("userPassword") || "beheer2025");
  const [adminPassword] = useState("admin123");

  const [page, setPage] = useState("incidenten");
  const [logoURL, setLogoURL] = useState("/logo.png");

  // Gegevens ophalen bij laden
  useEffect(() => {
    const opgeslagenData = localStorage.getItem("incidentenData");
    const opgeslagenLogo = localStorage.getItem("logoURL");
    if (opgeslagenData) {
      const { incidenten, oplossingen, handelingen } = JSON.parse(opgeslagenData);
      setIncidenten(incidenten);
      setOplossingen(oplossingen);
      setHandelingen(handelingen);
    }
    if (opgeslagenLogo) {
      setLogoURL(opgeslagenLogo);
    }
  }, []);

  // Excel verwerken
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const incidentenSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Incidenten"]);
      const oplossingenSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Oplossingen"]);
      const handelingenSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Handelingen"]);
      const dataObj = { incidenten: incidentenSheet, oplossingen: oplossingenSheet, handelingen: handelingenSheet };
      localStorage.setItem("incidentenData", JSON.stringify(dataObj));
      setIncidenten(incidentenSheet);
      setOplossingen(oplossingenSheet);
      setHandelingen(handelingenSheet);
    };
    reader.readAsArrayBuffer(file);
  };

  // Logo uploaden
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("logoURL", reader.result);
      setLogoURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Login handlers
  const handleLogin = () => {
    if (inputPassword === userPassword) {
      setIsAuthorized(true);
      setIsAdmin(false);
    } else {
      alert("Ongeldig wachtwoord. Probeer opnieuw.");
    }
  };

  const handleAdminLogin = () => {
    if (inputPassword === adminPassword) {
      setIsAuthorized(true);
      setIsAdmin(true);
    } else {
      alert("Ongeldig admin-wachtwoord.");
    }
  };

  const handlePasswordChange = () => {
    const nieuwWachtwoord = prompt("Nieuw gebruikerswachtwoord:");
    if (nieuwWachtwoord && nieuwWachtwoord.length >= 4) {
      localStorage.setItem("userPassword", nieuwWachtwoord);
      setUserPassword(nieuwWachtwoord);
      alert("Wachtwoord succesvol gewijzigd.");
    } else {
      alert("Wachtwoord moet minstens 4 tekens zijn.");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setIsAdmin(false);
    setInputPassword("");
    setSelectedIncident(null);
    setSelectedOplossing(null);
    setPage("incidenten");
    setGekozenOplossingen([]);
    setAfgevinkteHandelingen([]);
  };

  const toggleHandeling = (id) => {
    setAfgevinkteHandelingen((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const renderOplossing = (oplossing) => {
    const isGekozen = gekozenOplossingen.includes(oplossing.ID);
    return (
      <div
        key={oplossing.ID}
        onClick={() => {
          if (!isGekozen) {
            setSelectedOplossing(oplossing);
            setGekozenOplossingen((prev) => [...prev, oplossing.ID]);
          }
        }}
        style={{
          border: selectedOplossing?.ID === oplossing.ID ? "2px solid #00a2a1" : "1px solid #ccc",
          backgroundColor: isGekozen ? "#e2e8f0" : "#f0fdf4",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "10px",
          cursor: isGekozen ? "not-allowed" : "pointer",
        }}
      >
        <strong>{isGekozen ? "✅ " : ""}{oplossing.Beschrijving}</strong>
        <p style={{ margin: "6px 0 0", color: "#6b7280" }}>💡 {oplossing.Consequentie}</p>
      </div>
    );
  };

  const renderHandelingen = () => (
    <div>
      <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>📌 Handelingen</h4>
      <table style={{ width: '100%' }}>
        <tbody>
          {handelingen.filter(h => h.OplossingID === selectedOplossing.ID).map((h, index) => (
            <tr key={h.ID}>
              <td style={{ verticalAlign: 'top', paddingRight: '16px', width: '50%' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={afgevinkteHandelingen.includes(h.ID)}
                    onChange={() => toggleHandeling(h.ID)}
                    style={{ marginRight: '8px', accentColor: '#22c55e' }}
                  />
                  {index + 1}. {h.Beschrijving} — <span style={{ color: '#15803d' }}>{h.Verantwoordelijke}</span>
                </label>
              </td>
              <td style={{ width: '25%' }}>
                {h.AfbeeldingBestand && (
                  <img
                    src={`/afbeeldingen/${h.AfbeeldingBestand}`}
                    alt="Uitleg"
                    style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ccc', borderRadius: '6px' }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: '480px', margin: '100px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#006e4f' }}>🛠️ Incidentenbeheer App</h1>
        <p style={{ marginBottom: '20px', color: '#374151' }}>
          Deze app toont de juiste oplossingen en handelingen bij noodgevallen.
        </p>
        <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} placeholder="Wachtwoord..." style={{ padding: '10px', width: '100%', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <div>
          <button onClick={handleLogin} style={{ backgroundColor: '#006e4f', color: 'white', padding: '10px 20px', marginRight: '10px', borderRadius: '5px' }}>Gebruiker</button>
          <button onClick={handleAdminLogin} style={{ backgroundColor: '#00a2a1', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>Admin</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoURL} alt="Logo" style={{ width: '40px', height: '40px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '0', color: '#006e4f' }}>🛠️ Incidentenbeheer App</h1>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '5px' }}>Terug naar inlogscherm</button>
      </div>

      {isAdmin && (
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <h2>🖼️ Upload een nieuw logo</h2>
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
          <button onClick={handlePasswordChange} style={{ marginLeft: '20px' }}>🔑 Wijzig gebruikerswachtwoord</button>
        </div>
      )}

      {isAdmin && page === "incidenten" && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2>📁 Upload Excelbestand</h2>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ marginTop: '10px' }} />
        </div>
      )}

      {page === "incidenten" && (
        <>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>📋 Kies een incident uit de lijst</h2>
          <div>{incidenten.map((incident) => (
            <button
              key={incident.ID}
              onClick={() => {
                setSelectedIncident(incident);
                setSelectedOplossing(null);
                setPage("oplossingen");
                setGekozenOplossingen([]);
              }}
              style={{ display: 'block', marginBottom: '8px', padding: '10px 16px', backgroundColor: '#006e4f', color: 'white', borderRadius: '6px', width: '100%' }}>
              {incident.Beschrijving}
            </button>
          ))}</div>
        </>
      )}

      {page === "oplossingen" && selectedIncident && (
        <div>
          <button onClick={() => {
            setPage("incidenten");
            setGekozenOplossingen([]);
            setSelectedOplossing(null);
          }} style={{ marginBottom: '20px' }}>⬅ Terug</button>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '20px' }}>💬 Opties: {selectedIncident.Beschrijving}</h3>
            <h4 style={{ fontSize: '20px' }}>📌 Handelingen</h4>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>{oplossingen.filter((o) => o.IncidentID === selectedIncident.ID).map(renderOplossing)}</div>
            <div style={{ flex: 1 }}>{selectedOplossing ? renderHandelingen() : <p style={{ color: '#6b7280' }}>Klik op een optie om de handelingen te bekijken.</p>}</div>
          </div>
        </div>
      )}
    </div>
  );
}

