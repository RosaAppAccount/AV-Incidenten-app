// Incidentenbeheer App - React component
// Deze app toont opties bij noodgevallen en de bijbehorende handelingen

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function IncidentApp() {
  // App-status
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]); // bijhouden welke opties gekozen zijn
  const [afgevinkteHandelingen, setAfgevinkteHandelingen] = useState([]); // checklist

  // Login & admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [userPassword, setUserPassword] = useState(() => localStorage.getItem("userPassword") || "beheer2025");
  const [adminPassword] = useState("admin123");

  const [page, setPage] = useState("incidenten");
  const [logoURL, setLogoURL] = useState("/logo.png");

  // Laad gegevens bij start
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

  // Verwerk Excelbestand
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

  // Login (gebruiker)
  const handleLogin = () => {
    if (inputPassword === userPassword) {
      setIsAuthorized(true);
      setIsAdmin(false);
    } else {
      alert("Ongeldig wachtwoord. Probeer opnieuw.");
    }
  };

  // Login (admin)
  const handleAdminLogin = () => {
    if (inputPassword === adminPassword) {
      setIsAuthorized(true);
      setIsAdmin(true);
    } else {
      alert("Ongeldig admin-wachtwoord.");
    }
  };

  // Wachtwoord wijzigen (admin)
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

  // Uitloggen
  const handleLogout = () => {
    setIsAuthorized(false);
    setIsAdmin(false);
    setInputPassword("");
    setSelectedIncident(null);
    setSelectedOplossing(null);
    setPage("incidenten");
    setGekozenOplossingen([]); // reset gekozen opties bij terug
    setAfgevinkteHandelingen([]);
  };

  // Checklist toggelen
  const toggleHandeling = (id) => {
    setAfgevinkteHandelingen((prev) => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  // === UI: Oplossingen ===
  const renderOplossing = (oplossing) => {
    const isGekozen = gekozenOplossingen.includes(oplossing.ID);
    return (
      <div
        key={oplossing.ID}
        onClick={() => {
          if (!isGekozen) {
            setSelectedOplossing(oplossing);
            setGekozenOplossingen(prev => [...prev, oplossing.ID]);
          }
        }}
        style={{
          border: selectedOplossing?.ID === oplossing.ID ? '2px solid #00a2a1' : '1px solid #ccc',
          backgroundColor: isGekozen ? '#e2e8f0' : '#f0fdf4',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '10px',
          cursor: isGekozen ? 'not-allowed' : 'pointer'
        }}>
        <strong>{isGekozen ? '✅ ' : ''}{oplossing.Beschrijving}</strong>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>💡 {oplossing.Consequentie}</p>
      </div>
    );
  };

  const renderHandelingen = () => (
    <ul>
      {handelingen.filter(h => h.OplossingID === selectedOplossing.ID).map(h => (
        <li key={h.ID}>
          <label>
            <input
              type="checkbox"
              checked={afgevinkteHandelingen.includes(h.ID)}
              onChange={() => toggleHandeling(h.ID)}
              style={{ marginRight: '8px', accentColor: '#22c55e' }} // groen vinkje
            />
            {h.Beschrijving} — <span style={{ color: '#15803d' }}>{h.Verantwoordelijke}</span>
          </label>
        </li>
      ))}
    </ul>
  );

  // Terug naar login
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

  // === UI hoofdscherm ===
  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoURL} alt="Logo" style={{ width: '40px', height: '40px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '0', color: '#006e4f' }}>🛠️ Incidentenbeheer App</h1>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '5px' }}>Terug naar inlogscherm</button>
      </div>

      {/* Admin logo & Excel */}
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
                setGekozenOplossingen([]); // reset opties bij nieuwe selectie
              }}
              style={{ display: 'block', marginBottom: '8px', padding: '10px 16px', backgroundColor: '#006e4f', color: 'white', borderRadius: '6px', width: '100%' }}>
              {incident.Beschrijving}
            </button>
          ))}</div>
        </>
      )}

      {/* Oplossingen en handelingen */}
      {page === "oplossingen" && selectedIncident && (
        <div>
          <button onClick={() => {
            setPage("incidenten");
            setGekozenOplossingen([]); // reset bij terug
            setSelectedOplossing(null);
          }} style={{ marginBottom: '20px' }}>⬅ Terug</button>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '20px' }}>💬 Opties: {selectedIncident.Beschrijving}</h3>
            <h4 style={{ fontSize: '20px' }}>📌 Handelingen</h4>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>{oplossingen.filter((o) => o.IncidentID === selectedIncident.ID).map(renderOplossing)}</div>
            <div style={{ flex: 1 }}>
              {selectedOplossing ? renderHandelingen() : <p style={{ color: '#6b7280' }}>Klik op een optie om de handelingen te bekijken.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
