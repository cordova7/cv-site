export default function Loading() {
  return (
    <div className="marco-loading-screen" aria-busy="true" aria-label="Loading">
      <div className="marco-loading-card">
        <img className="marco-loading-logo" src="/assets/intro-logo.png" alt="Marco Cordova" />
        <div className="marco-loading-spinner" aria-hidden="true" />
      </div>
    </div>
  );
}
