"use client";

import { useEffect, useMemo, useState } from "react";

type RandomResp = { text: string };

/**
 * Плакатный перенос:
 * - если первое слово короткое (обычно "ТЫ") — выносим его в отдельную строку
 * - НЕ рвём слова (никаких изящ-ная)
 * - 3 слова: "ТЫ" / "остальные 2 слова"
 * - 4+ слов: делим оставшиеся слова на 2 строки максимально ровно по длине
 */
function splitCompliment(text: string): string[] {
  const w = text.trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return ["…"];
  if (w.length === 1) return [w[0]];

  const firstIsShort = w[0].length <= 3; // "ТЫ" или подобное

  // 2 слова
  if (w.length === 2) {
    // "ТЫ" / "КРАСИВАЯ"
    return [w[0], w[1]];
  }

  // 3 слова — как ты хочешь: "ТЫ" отдельно, остальное вместе
  if (w.length === 3) {
    if (firstIsShort) return [w[0], `${w[1]} ${w[2]}`];
    return [`${w[0]} ${w[1]}`, w[2]];
  }

  // 4+ слов
  // Если первое короткое — делим оставшиеся слова (w[1..]) на 2 строки как можно ровнее
  if (firstIsShort) {
    const rest = w.slice(1);
    const [a, b] = bestTwoLineSplit(rest);
    return [w[0], a, b].filter(Boolean);
  }

  // Если первое не короткое — делим все слова на 2 строки как можно ровнее
  const [a, b] = bestTwoLineSplit(w);
  return [a, b].filter(Boolean);
}

function bestTwoLineSplit(words: string[]): [string, string] {
  if (words.length <= 1) return [words.join(" "), ""];

  let bestIdx = 1;
  let bestDiff = Infinity;

  for (let i = 1; i <= words.length - 1; i++) {
    const left = words.slice(0, i).join(" ");
    const right = words.slice(i).join(" ");
    const diff = Math.abs(left.length - right.length);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }

  return [words.slice(0, bestIdx).join(" "), words.slice(bestIdx).join(" ")];
}

export default function Page() {
  const [text, setText] = useState("…");
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const lines = useMemo(() => splitCompliment(text), [text]);

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
    <>
      {/* подпись снизу справа (если у тебя она уже есть — можно убрать отсюда) */}
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
          {/* КОМПЛИМЕНТ */}
          <div
            key={animKey}
            className="fade-in pop"
            style={{
              fontWeight: 900,
              letterSpacing: "0.5px",
              lineHeight: 1.05,
              fontSize: "clamp(36px, 7vw, 72px)",
              textTransform: "uppercase",

              // центрируем весь блок строк
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",

              // запрет переносов внутри слов
              hyphens: "none",
              wordBreak: "keep-all",
              overflowWrap: "normal",
            }}
          >
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  // строка всегда 1 линия, перенос только между строками, которые мы сделали сами
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {line}
              </div>
            ))}
          </div>

          <div style={{ height: 24 }} />

          {/* КНОПКА */}
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