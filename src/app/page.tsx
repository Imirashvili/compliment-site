"use client";

import { useEffect, useMemo, useState } from "react";

type RandomResp = { text: string };
type EpithetsResp = { words: string[] };

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

  // Колонки считаем один раз при смене words (чтобы фон НЕ менялся при клике)
  const cols = useMemo(() => {
    if (!words.length) return [];

    const columns = 8;
    const size = 60;

    // детерминированный псевдорандом
    const nextSeed = (seed: number) => (seed * 48271) % 2147483647;

    const out: string[][] = [];
    for (let i = 0; i < columns; i++) {
      let seed = 1000 + i * 97;
      const col: string[] = [];

      for (let j = 0; j < size; j++) {
        seed = nextSeed(seed);
        col.push(words[seed % words.length]);
      }

      out.push(col);
    }

    return out;
  }, [words]);

  if (!cols.length) return null;

  return (
    <div className="bg-epithets">
      <div className="bg-epithets-grid">
        {cols.map((col, i) => (
          <div key={i} className="bg-col">
            <div className="bg-track">
              <div className="bg-group">
                {col.map((w, j) => (
                  <div key={`a-${i}-${j}`} className="bg-word">
                    {w}
                  </div>
                ))}
              </div>

              {/* повтор для бесшовной прокрутки */}
              <div className="bg-group" aria-hidden="true">
                {col.map((w, j) => (
                  <div key={`b-${i}-${j}`} className="bg-word">
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
      setText("ТЫ ПОТРЯСАЮЩАЯ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandom();
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
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

              /* мобилка: чтобы длинные комплименты НЕ съезжали */
              maxWidth: "min(680px, 100%)",
              marginInline: "auto",
              paddingInline: "6px",
              textAlign: "center",
              overflowWrap: "anywhere",
              wordBreak: "keep-all",
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