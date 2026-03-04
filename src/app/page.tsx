"use client";

import { useEffect, useMemo, useState } from "react";

type RandomResp = { text: string };
type EpithetsResp = { words: string[] };

function shuffle<T>(arr: T[], seed = 12345): T[] {
  let x = seed % 2147483647;
  const next = () => (x = (x * 48271) % 2147483647);

  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const r = next() % (i + 1);
    [a[i], a[r]] = [a[r], a[i]];
  }
  return a;
}

function EpithetBackground() {
  const [words, setWords] = useState<string[]>([]);
  const [columns, setColumns] = useState<number>(8);

  useEffect(() => {
    // определяем количество колонок по ширине экрана (ключ для "не режет слова")
    const apply = () => {
      const w = window.innerWidth || 390;
      if (w <= 420) setColumns(4);
      else if (w <= 820) setColumns(6);
      else setColumns(8);
    };

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

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

  const cols = useMemo(() => {
    if (!words.length) return [];

    const size = 70; // больше элементов => меньше заметных повторов
    const pool = shuffle(words, 777);

    const out: string[][] = [];
    const step = Math.max(1, Math.floor(pool.length / columns));

    for (let i = 0; i < columns; i++) {
      const start = (i * step) % pool.length;
      const col: string[] = [];
      for (let j = 0; j < size; j++) {
        col.push(pool[(start + j) % pool.length]);
      }
      out.push(col);
    }
    return out;
  }, [words, columns]);

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

  maxWidth: "18ch",
  margin: "0 auto",

  textAlign: "center",
  textWrap: "balance",

  hyphens: "none",
  wordBreak: "keep-all",
  overflowWrap: "normal",
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