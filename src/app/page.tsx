"use client";

import { useEffect, useMemo, useState } from "react";

type RandomResp = { text: string };
type EpithetsResp = { words: string[] };

function EpithetBackground() {
  const [words, setWords] = useState<string[]>([]);
  const [cols, setCols] = useState<number>(8);

  // загрузка эпитетов
  useEffect(() => {
    fetch("/api/epithets")
      .then((r) => r.json())
      .then((d: EpithetsResp) => setWords(d.words || []))
      .catch(() => setWords([]));
  }, []);

  // пересчёт колонок по ширине экрана
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const c = w < 480 ? 5 : Math.max(6, Math.min(12, Math.floor(w / 140)));
      setCols(c);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const columns = useMemo(() => {
    if (!words.length) return [];
    const out: string[][] = [];
    const size = 60 // меньше элементов = легче для мобильных

    for (let i = 0; i < cols; i++) {
      const start = (i * 7) % words.length;
      const col: string[] = [];
      for (let j = 0; j < size; j++) {
        col.push(words[(start + j) % words.length]);
      }
      out.push(col);
    }
    return out;
  }, [words, cols]);

  return (
    <div className="bg-epithets">
      <div className="bg-epithets-grid">
        {columns.map((col, i) => (
          <div className="bg-col" key={i}>
            <div className="bg-track">
              <div className="bg-group">
                {col.map((w, idx) => (
                  <div className="bg-word" key={`a-${i}-${idx}`}>
                    {w}
                  </div>
                ))}
              </div>

              {/* повтор для бесшовной прокрутки */}
              <div className="bg-group" aria-hidden="true">
                {col.map((w, idx) => (
                  <div className="bg-word" key={`b-${i}-${idx}`}>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [text, setText] = useState<string>("…");
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const loadRandom = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/random", { cache: "no-store" });
      const d: RandomResp = await r.json();
      setText(d.text);
      setAnimKey((k) => k + 1);
    } catch {
      setText("Ты невероятная");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandom();
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Фоновая анимация */}
      <EpithetBackground />

      {/* Подпись */}
      <div className="corner-note fade-in">
        <div>С любовью и восхищением</div>
        <div>Отдел методологии и оцифровки</div>
      </div>

      {/* Основной контент */}
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
        <div style={{ width: "min(720px, 100%)", textAlign: "center" }}>
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
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? "ГЕНЕРИРУЮ…" : "ЕЩЁ КОМПЛИМЕНТ"}
          </button>
        </div>
      </main>
    </div>
  );
}