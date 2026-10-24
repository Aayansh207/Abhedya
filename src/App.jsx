import React from "react";

export default function App() {
  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">THE VISHANTI CIPHER</p>
        <h1>Abhedya</h1>
        <p className="muted">Hide encrypted messages in plain sight.</p>
      </header>

      <section className="cards">
        <button className="action-card" type="button">
          <span className="card-title">Hide a message</span>
          <span className="muted">Encrypt a message and embed it in an image.</span>
        </button>
        <button className="action-card" type="button">
          <span className="card-title">Reveal a message</span>
          <span className="muted">Extract and decrypt a message from a PNG.</span>
        </button>
      </section>

      <p className="notice">
        Starter UI only — connect these actions to the core engine during integration.
      </p>
    </main>
  );
}
