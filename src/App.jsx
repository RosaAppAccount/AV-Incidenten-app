// Incidentenbeheer App - met live dark mode detectie ✨
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./index.css"; // Zorg dat je deze hebt!

export default function IncidentApp() {
  const [incidenten, setIncidenten] = useState([]);
  const [oplossingen, setOplossingen] = useState([]);
  const [handelingen, setHandelingen] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedOplossing, setSelectedOplossing] = useState(null);
  const [gekozenOplossingen, setGekozenOplossingen] = useState([]);
  const [afgevinkteHandelingen, setAfgevinkteHandelingen] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [userPassword] = useState("beheer2025");
  const [adminPassword] = useState("admin123");

  const [page, setPage] = useState("incidenten");
  const [logoURL, setLogoURL] = useState("/logo.png");

  // Detecteer dark mode
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    // Laad standaard Excel
    fetch("/standaard_excel.xlsx")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        setIncidenten(XLSX.utils.sheet_to_json(workbook.Sheets["Incidenten"]));
        setOplossingen(XLSX.utils.sheet_to_json(workbook.Sheets["Oplossingen"]));
        setHandelingen(XLSX.utils.sheet_to_json(workbook.Sheets["Handelingen"]));
      });

    // Luister naar wijziging in thema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      setIncidenten(XLSX.utils.sheet_to_json(workbook.Sheets["Incidenten"]));
      setOplossingen(XLSX.utils.sheet_to_json(workbook.Sheets["Oplossingen"]));
      setHandelingen(XLSX.utils.sheet_to_json(workbook.Sheets["Handelingen"]));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setLogoURL(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLogin = () => {
    if (inputPassword === userPassword) {
      setIsAuthorized(true);
      setIsAdmin(false);
    } else {
      alert("Ongeldig wachtwoord.");
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

  const handleLogout = () => {
    setIsAuthorized(false);
    setIsAdmin(false);
    setInputPassword("");
    setSelectedIncident(null);
    setSelectedOplossing(null);
    setPage("incidenten");
    setGekozenOplossingen([]);
    setAfgevinkteHandelingen([]);
    setLogoURL("/logo.png");
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
        className={`incident-box ${isGekozen ? "gekozen" : ""}`}
      >
        <strong>{isGekozen ? "✅ " : ""}{oplossing.Beschrijving}</strong>
        <p>💡 {oplossing.Consequentie}</p>
      </div>
    );
  };

  const renderHandelingen = () => (
    <table>
      <tbody>
        {handelingen.filter(h => h.OplossingID === selectedOplossing.ID).map((h, index) => (
          <tr key={h.ID}>
            <td>
              <label>
                <input
                  type="checkbox"
                  checked={afgevinkteHandelingen.includes(h.ID)}
                  onChange={() => toggleHandeling(h.ID)}
                />
                {index + 1}. {h.Beschrijving} — <span>{h.Verantwoordelijke}</span>
              </label>
              {h.Handleiding && (
                <div>
                  📄 <a href={`/handleidingen/${h.Handleiding}`} target="_blank" rel="noreferrer">Bekijk handleiding</a>
                </div>
              )}
            </td>
            <td>
              {h.AfbeeldingBestand && (
                <img
                  src={`/afbeeldingen/${h.AfbeeldingBestand}`}
                  alt="Uitleg"
                  style={{ maxWidth: '200px', borderRadius: '6px' }}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!isAuthorized) {
    return (
      <div className={isDarkMode ? "dark-mode" : "light-mode"}>
        <div className="login-container">
          <h1>🛠️ Incidentenbeheer App</h1>
          <p>Voer je wachtwoord in om verder te gaan:</p>
          <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} placeholder="Wachtwoord..." />
          <div>
            <button onClick={handleLogin}>Gebruiker</button>
            <button onClick={handleAdminLogin}>Admin</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark-mode" : "light-mode"}>
      <div className="app-container">
        <header>
          <div className="logo-section">
            <img src={logoURL} alt="Logo" />
            <h1>🛠️ Incidentenbeheer App</h1>
          </div>
          <button onClick={handleLogout}>Log uit</button>
        </header>

        {isAdmin && (
          <section className="admin-upload">
            <h2>🖼️ Upload een nieuw logo</h2>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            <h2>📁 Upload Excelbestand</h2>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
          </section>
        )}

        {page === "incidenten" && (
          <section>
            <h2>📋 Kies een incident</h2>
            {incidenten.map((incident) => (
              <button
                key={incident.ID}
                className="incident-button"
                onClick={() => {
                  setSelectedIncident(incident);
                  setSelectedOplossing(null);
                  setPage("oplossingen");
                  setGekozenOplossingen([]);
                }}
              >
                {incident.Beschrijving}
              </button>
            ))}
          </section>
        )}

        {page === "oplossingen" && selectedIncident && (
          <section className="oplossingen-layout">
            <button onClick={() => {
              setPage("incidenten");
              setGekozenOplossingen([]);
              setSelectedOplossing(null);
            }}>⬅ Terug</button>

            <div className="opties">
              <h3>💬 Opties voor: {selectedIncident.Beschrijving}</h3>
              {oplossingen.filter(o => o.IncidentID === selectedIncident.ID).map(renderOplossing)}
            </div>

            <div className="handelingen">
              <h4>📌 Handelingen</h4>
              {selectedOplossing ? renderHandelingen() : <p>Klik op een optie om de handelingen te zien.</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
