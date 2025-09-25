import React, { useState } from "react";

export default function Access() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/preview/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) location.href = "/";
    else setErr("Invalid code");
  };
  
  return (
    <div className="min-h-screen" style={{ background: "#0C1022" }}>
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <main style={{
          maxWidth: 420,
          margin: "10vh auto",
          padding: 24,
          background: "rgba(255,255,255,.02)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h2 style={{ color: "#E8EDFF", marginBottom: "1rem" }}>Private Preview</h2>
          <p style={{ color: "#96A0C2", marginBottom: "1.5rem" }}>
            Enter the preview code to access MashLab.
          </p>
          <form onSubmit={onSubmit}>
            <input 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="Preview code" 
              style={{
                width: "100%",
                padding: 12,
                margin: "12px 0",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                color: "#E8EDFF",
                fontSize: "14px"
              }}
            />
            <button 
              type="submit"
              style={{
                width: "100%",
                padding: 12,
                background: "#8A7CFF",
                color: "#0B0F22",
                border: "none",
                borderRadius: 8,
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "8px"
              }}
            >
              Enter
            </button>
          </form>
          {err && <div style={{ color: "#f66", marginTop: "12px", fontSize: "14px" }}>{err}</div>}
        </main>
      </div>
    </div>
  );
}
