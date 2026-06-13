export default function Loading() {
  return (
    <div className="pepple-loading-screen" aria-busy="true" aria-label="Loading">
      <div className="pepple-loading-card">
        <img className="pepple-loading-logo" src="/assets/pepl-token-logo.png" alt="Pepple" />
        <div className="pepple-loading-spinner" aria-hidden="true" />
      </div>
    </div>
  );
}

