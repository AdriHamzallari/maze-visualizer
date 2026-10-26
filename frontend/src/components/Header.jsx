
function Header({ apiStatus }) {
  const statusLabels = {
    checking: "Checking API",
    connected: "API online",
    offline: "API offline",
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          M
        </span>
        <span className="brand-name">
          maze<span className="brand-dot">.</span>lab
        </span>
      </div>

      <div
        className={`api-status api-status--${apiStatus}`}
        aria-live="polite"
      >
        <span className="status-dot" />
        {statusLabels[apiStatus]}
      </div>
    </header>
  );
}

export default Header;
