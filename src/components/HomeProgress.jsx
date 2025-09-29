"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const THEMES = [
  { slug: "interieur", label: "Vérifications INTÉRIEUR", color: "#1f4f82" },
  { slug: "exterieur", label: "Vérifications EXTÉRIEUR", color: "#207ce5" },
  { slug: "securite", label: "Questions SÉCURITÉ ROUTIÈRE", color: "#f1b90b" },
  { slug: "secours", label: "Questions PREMIERS SECOURS", color: "#c14d2c" },
];

/** Ne compte que les "known"; retourne aussi 'seen' pour savoir si l’utilisateur a commencé */
function summarizeKnown(map, total) {
  const ids = Object.keys(map || {});
  const seen = ids.length;
  let known = 0;
  for (const k of ids) if (map[k] === "known") known++;
  const toLearn = Math.max((total || 0) - known, 0);
  const pctKnown = total ? Math.round((known / total) * 100) : 0;
  return { seen, known, toLearn, total, pctKnown };
}

export default function HomeProgress() {
  const [rowsData, setRowsData] = useState({}); // {slug: {seen, known, toLearn, total, pctKnown}}

  useEffect(() => {
    const readAll = () => {
      const next = {};
      for (const { slug } of THEMES) {
        try {
          const raw = localStorage.getItem(`rev-${slug}`); // statut des cartes
          const map = raw ? JSON.parse(raw) : {};
          const tRaw = localStorage.getItem(`rev-total-${slug}`); // total réel (écrit par TotalWriter)
          const total = tRaw ? parseInt(tRaw, 10) : 0;
          next[slug] = summarizeKnown(map, total);
        } catch {
          next[slug] = { seen: 0, known: 0, toLearn: 0, total: 0, pctKnown: 0 };
        }
      }
      setRowsData(next);
    };

    readAll();

    // MAJ si autre onglet modifie le storage ou si un thème dispatch "rev-progress"/"rev-total"
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key.startsWith("rev-")) readAll();
    };
    const onProgress = () => readAll();

    window.addEventListener("storage", onStorage);
    window.addEventListener("rev-progress", onProgress);
    window.addEventListener("rev-total", onProgress);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("rev-progress", onProgress);
      window.removeEventListener("rev-total", onProgress);
    };
  }, []);

  const rows = useMemo(
    () =>
      THEMES.map((t) => ({
        ...t,
        ...(rowsData[t.slug] || {
          seen: 0,
          known: 0,
          toLearn: 0,
          total: 0,
          pctKnown: 0,
        }),
      })),
    [rowsData]
  );

  // Afficher uniquement si l’utilisateur a AU MOINS commencé un thème
  const hasStarted = rows.some((r) => r.seen > 0);
  if (!hasStarted) return null;

  return (
    <section className="mt-8 w-full max-w-xl mx-auto">
      <h2 className="text-white text-lg font-semibold mb-4 text-center">
        Ta progression par thème
      </h2>

      <div
        className={`rounded-2xl bg-zinc-50/70 p-3 sm:p-4
              opacity-0 translate-y-2 animate-[fadeIn_280ms_ease-out_forwards]`
          .replace(/\s+/g, " ")
          .trim()}
      >
        <ul className="grid gap-4 sm:gap-5">
          {rows.map((r) => {
            const pastelBorder = `4px solid color-mix(in srgb, ${r.color} 35%, white)`;
            const pastelBtn = `color-mix(in srgb, ${r.color} 80%, white)`;
            const canReset = (r.known ?? 0) > 0;
            return (
              <li
                key={r.slug}
                className="rounded-2xl bg-white ring-1 ring-zinc-200 shadow-sm p-4 sm:p-5"
                style={{ borderLeft: pastelBorder }}
              >
                {/* Titre + CTA */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] sm:text-sm font-semibold text-zinc-900">
                    {r.label}
                  </p>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Link
                      href={`/theme/${r.slug}`}
                      className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:brightness-110 transition"
                      style={{ background: pastelBtn }}
                    >
                      Reprendre
                    </Link>
                    <button
                      onClick={() => {
                        if (!canReset) return;
                        try {
                          localStorage.removeItem(`rev-${r.slug}`);
                          setRowsData((prev) => ({
                            ...prev,
                            [r.slug]: {
                              ...prev[r.slug],
                              seen: 0,
                              known: 0,
                              toLearn: prev[r.slug]?.total || 0,
                              pctKnown: 0,
                            },
                          }));
                          window.dispatchEvent(new Event("rev-progress"));
                        } catch {}
                      }}
                      disabled={!canReset}
                      className={[
                        "text-[11px] transition",
                        canReset
                          ? "text-zinc-500 hover:text-zinc-700 hover:underline"
                          : "text-zinc-400 cursor-not-allowed opacity-50",
                      ].join(" ")}
                      title={
                        canReset
                          ? "Réinitialiser ce thème"
                          : "Rien à réinitialiser"
                      }
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>

                {/* Progression */}
                <div className="mt-3 sm:mt-4">
                  <div className="mb-1 flex items-center justify-between text-[12px] text-zinc-700">
                    <span>✅ {r.known} connues</span>
                    <span>{r.pctKnown}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${r.pctKnown}%` }}
                      aria-label={`Progression ${r.pctKnown}%`}
                    />
                  </div>
                  <div className="mt-1 text-[12px] text-zinc-600">
                    📘 {r.toLearn} à apprendre
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* keyframes locales pour le fade-in */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
