import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function IncidentApp() {
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState("incidenten");
  const [logoURL, setLogoURL] = useState("/logo.png");

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [userPassword, setUserPassword] = useState(() => localStorage.getItem("userPassword") || "beheer2025");
  const [adminPassword, setAdminPassword] = useState("admin123");

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("logoURL", reader.result);
      setLogoURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

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
  };

  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>🔐 Toegang vereist</h2>
        <p>Voer je wachtwoord in:</p>
        <input
          type="password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          style={{ padding: '10px', width: '100%', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <div>
          <button onClick={handleLogin} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Inloggen als gebruiker</button>
          <button onClick={handleAdminLogin} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Inloggen als admin</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      {/* Header met logo en eventueel admin logout knop */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoURL} alt="Logo" style={{ width: '40px', height: '40px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '0' }}>
            🛠️ Incidentenbeheer App
          </h1>
        </div>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Terug naar inlogscherm
        </button>
      </div>

      {/* Admin: extra functies */}
      {isAdmin && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h2 style={{ fontSize: '16px' }}>🖼️ Upload een nieuw logo</h2>
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
          <button onClick={handlePasswordChange} style={{ marginLeft: '20px' }}>🔑 Wijzig gebruikerswachtwoord</button>
        </div>
      )}

      {/* Admin: upload Excelbestand */}
      {isAdmin && page === "incidenten" && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>📁 Upload Excelbestand</h2>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ marginTop: '10px' }} />
        </div>
      )}

      {/* Lijst met incidenten */}
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
              }}
              style={{ display: 'block', marginBottom: '8px', padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              {incident.Beschrijving}
            </button>
          ))}</div>
          {!isAdmin && incidenten.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280' }}>
              📂 De gegevens zijn nog niet geladen. Vraag een administrator om een Excelbestand te uploaden.
            </p>
          )}
        </>
      )}

      {/* Oplossingen en handelingen */}
      {page === "oplossingen" && selectedIncident && (
        <div>
          <button onClick={() => setPage("incidenten")} style={{ marginBottom: '20px' }}>⬅ Terug</button>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              💬 Oplossingen voor: {selectedIncident.Beschrijving}
            </h3>
            <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              📌 Handelingen
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '400px' }}>{oplossingen.filter((o) => o.IncidentID === selectedIncident.ID).map((oplossing) => (
              <div key={oplossing.ID} onClick={() => setSelectedOplossing(oplossing)} style={{ border: selectedOplossing?.ID === oplossing.ID ? '2px solid #16a34a' : '1px solid #ccc', padding: '12px', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', backgroundColor: '#f0fdf4' }}>
                <strong style={{ fontSize: '16px' }}>{oplossing.Beschrijving}</strong>
                <p style={{ margin: '6px 0 0', color: '#6b7280' }}>💡 Consequentie: {oplossing.Consequentie}</p>
              </div>
            ))}</div>
            <div style={{ flex: 1, minWidth: '400px' }}>
              {selectedOplossing ? (
                <ul style={{ paddingLeft: '20px' }}>{handelingen.filter((h) => h.OplossingID === selectedOplossing.ID).map((h) => (
                  <li key={h.ID} style={{ marginBottom: '6px' }}>
                    ✅ {h.Beschrijving} — <span style={{ color: '#15803d' }}>{h.Verantwoordelijke}</span>
                  </li>
                ))}</ul>
              ) : (
                <p style={{ color: '#6b7280' }}>Klik op een oplossing om de handelingen te bekijken.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
