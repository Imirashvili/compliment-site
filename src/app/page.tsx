"use client";

import { useEffect, useState } from "react";

type Compliment = {
  text: string;
};

type EpithetsResp = {
  words: string[];
};

function EpithetBackground() {
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    const fallback = [
      "нежная",
      "сияющая",
      "умная",
      "прекрасная",
      "вдохновляющая",
      "элегантная",
      "уникальная",
      "волшебная",
      "добрая",
      "неповторимая",
      "восхитительная",
      "чуткая",
    ];

    fetch("/api/epithets", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: EpithetsResp) => {
        const list = Array.isArray(d.words) ? d.words : [];
        setWords(list.length ? list : fallback);
      })
      .catch(() => setWords(fallback));
  }, []);

  if (!words.length) return null;

  const columns = 8;
  const size = 60;

  const cols = Array.from({ length: columns }).map((_, i) => {
    const arr = Array.from({ length: size }).map(
      () => words[Math.floor(Math.random() * words.length)]
    );

    return (
      <div key={i} className="bg-col">
        <div className="bg-track">
          <div className="bg-group">
            {arr.map((w, j) => (
              <div key={j} className="bg-word">
                {w}
              </div>
            ))}
          </div>

          <div className="bg-group">
            {arr.map((w, j) => (
              <div key={j} className="bg-word">
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="bg-epithets">
      <div className="bg-epithets-grid">{cols}</div>
    </div>
  );
}

export default function Page() {
  const [text, setText] = useState<string>("ЗАГРУЖАЮ…");
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const loadRandom = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/compliment", { cache: "no-store" });
      const data: Compliment = await res.json();

      setText(data.text);
      setAnimKey((k) => k + 1);
    } catch {
      setText("ТЫ ПОТРЯСАЮЩАЯ");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRandom();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <EpithetBackground />

      <div className="corner-note fade-in">
        <div>С любовью и восхищением</div>
        <div>Отдел методологии и оцифровки</div>
      </div>

      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "min(720px, 100%)",
            textAlign: "center",
          }}
        >
          <div
            key={animKey}
            className="fade-in pop"
            style={{
              fontWeight: 900,
              letterSpacing: "0.5px",
              lineHeight: 1.05,
              fontSize: "clamp(36px, 7vw, 72px)",
              textTransform: "uppercase",
            }}
          >
            {text}
          </div>

          <div style={{ height: 24 }} />

          <button
            onClick={loadRandom}
            disabled={loading}
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              border: "0",
              borderRadius: 16,
              padding: "16px 18px",
              width: "min(420px, 100%)",
              fontWeight: 900,
              fontSize: "18px",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 30px rgba(255, 90, 150, 0.35)",
              transition: "transform 120ms ease",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            {loading ? "ГЕНЕРИРУЮ…" : "ЕЩЁ КОМПЛИМЕНТ"}
          </button>
        </div>
      </main>
    </div>
  );
}