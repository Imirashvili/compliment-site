"use client";

import { useCallback, useEffect, useState } from "react";

/* ===============================
   ФОН ИЗ ДВИЖУЩИХСЯ ЭПИТЕТОВ
================================ */

function EpithetBackground() {
  const [epithets, setEpithets] = useState<string[]>([]);
  const [cols, setCols] = useState(8);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/epithets", { cache: "no-store" });
        const json = await res.json();
        const list: string[] = json.epithets ?? [];
        setEpithets(list.length ? list : ["нежная", "сияющая", "умная", "прекрасная"]);
      } catch {
        setEpithets(["нежная", "сияющая", "умная", "прекрасная"]);
      }
    })();
  }, []);

  // адаптивное количество колонок
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth || 1200;
      const c = w < 480 ? 5 : Math.max(6, Math.min(12, Math.floor(w / 140)));
      setCols(c);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sliceForCol = (colIndex: number) => {
    if (!epithets.length) return [];
    const size = 60; // больше = плотнее фон, без "плешей"
    const start = (colIndex * 37) % epithets.length;

    const part: string[] = [];
    for (let i = 0; i < size; i++) {
      part.push(epithets[(start + i) % epithets.length]);
    }
    return part;
  };

  return (
    <div className="bg-epithets" aria-hidden="true">
      <div className="bg-epithets-grid">
        {Array.from({ length: cols }).map((_, i) => {
          const words = sliceForCol(i);

          return (
            <div className="bg-col" key={i}>
              <div className="bg-track">
                <div className="bg-group">
                  {words.map((w, idx) => (
                    <div className="bg-word" key={`a-${i}-${idx}`}>
                      {w}
                    </div>
                  ))}
                </div>

                {/* Вторая такая же группа для бесшовной прокрутки */}
                <div className="bg-group" aria-hidden="true">
                  {words.map((w, idx) => (
                    <div className="bg-word" key={`b-${i}-${idx}`}>
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===============================
   ОСНОВНАЯ СТРАНИЦА
================================ */

export default function Home() {
  const [text, setText] = useState("Загружаю…");
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const loadRandom = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/random", { cache: "no-store" });
      const json = await res.json();
      setText(json.text ?? "Ты самая прекрасная");
      setAnimKey((k) => k + 1);
    } catch {
      setText("Ты самая прекрасная");
      setAnimKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRandom();
  }, [loadRandom]);

  return (
    <>
      {/* Фон */}
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
    </>
  );
}