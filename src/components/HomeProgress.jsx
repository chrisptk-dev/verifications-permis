"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const THEMES = [
  { slug: "interieur", label: "Vérifications INTÉRIEUR", color: "#1f4f82" },
  { slug: "exterieur", label: "Vérifications EXTÉRIEUR", color: "#207ce5" },
  { slug: "securite", label: "Questions SÉCURITÉ ROUTIÈRE", color: "#f1b90b" },
  { slug: "secours", label: "Questions PREMIERS SECOURS", color: "#c14d2c" },
];

function summarize(obj, total) {
  // obj = { [id]: 'known'|'doubt'|'unknown' }
  let known = 0,
    doubt = 0,
    unknown = 0,
    seen = 0;
  for (const k in obj || {}) {
    seen++;
    if (obj[k] === "known") known++;
    else if (obj[k] === "doubt") doubt++;
    else if (obj[k] === "unknown") unknown++;
  }
  const unseen = Math.max(total - seen, 0);
  return { known, doubt, unknown, unseen, seen, total };
}

export default function HomeProgress() {
  const [data, setData] = useState(() => ({})); // { slug: {known,doubt,unknown,unseen,seen,total} }
  const [countsByTheme, setCountsByTheme] = useState(() => ({})); // { slug: total } si tu veux les totaux depuis le serveur un jour

  // Lecture initiale + écoute des changements de storage (autre onglet)
  useEffect(() => {
    const readAll = () => {
      const next = {};
      for (const { slug } of THEMES) {
        try {
          const raw = localStorage.getItem(`rev-${slug}`);
          const map = raw ? JSON.parse(raw) : {};
          // total: si tu veux la vraie valeur serveur, remonte-la via props; ici on approxime: total = seen + unseen (on ne connaît pas)
          // On ne connaît pas "total" depuis la Home — donc on mémorise total=seen+unseen si Home ne le sait pas.
          // Par défaut, on affichera surtout les catégories vues.
          const seen = Object.keys(map).length;
          next[slug] = summarize(map, seen); // sans info serveur, total=seen (unseen=0)
        } catch {
          next[slug] = summarize({}, 0);
        }
      }
      setData(next);
    };

    readAll();
    const onStorage = (e) => {
      if (!e || (e.key && !e.key.startsWith("rev-"))) return;
      readAll();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Option : si tu veux injecter les totaux réels un jour (depuis la page ou via props), on fusionnera ici.
  const rows = useMemo(() => {
    return THEMES.map((t) => {
      const s = data[t.slug] || {
        known: 0,
        doubt: 0,
        unknown: 0,
        unseen: 0,
        seen: 0,
        total: 0,
      };
      const total = s.total || s.seen; // faute d’info, total = vues
      const review = s.doubt + s.unknown;
      const pctKnown = total ? Math.round((s.known / total) * 100) : 0;
      const pctReview = total ? Math.round((review / total) * 100) : 0;
      return { ...t, ...s, total, review, pctKnown, pctReview };
    });
  }, [data]);

  // Si aucune carte n'a été vue, on n'affiche rien (option UX)
  const nothingYet = rows.every((r) => r.seen === 0);

  if (nothingYet) return null;

  return (
    <section className="mt-8 w-full max-w-xl mx-auto">
      <h2 className="text-white text-lg font-semibold mb-3 text-center">
        Ta progression par thème
      </h2>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r.slug}
            className="rounded-2xl bg-white/95 ring-1 ring-black/5 shadow p-3 sm:p-4"
            style={{ borderLeft: `6px solid ${r.color}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-zinc-800">
                  {r.label}
                </p>

                {/* Compteurs */}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-zinc-700">
                  <span className="inline-flex items-center gap-1">
                    ✅ Su: <strong>{r.known}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    ⚠️ À revoir: <strong>{r.review}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    👁️ Vues: <strong>{r.seen}</strong>
                  </span>
                </div>

                {/* Barre de progression (su + à revoir) */}
                <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${r.pctKnown}%`,
                      background: "#10b981", // emerald
                    }}
                    title={`Su: ${r.pctKnown}%`}
                  />
                  <div
                    className="h-full -mt-2"
                    style={{
                      width: `${r.pctReview}%`,
                      background: "#f59e0b", // amber
                      opacity: 0.9,
                    }}
                    title={`À revoir: ${r.pctReview}%`}
                  />
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link
                  href={`/theme/${r.slug}`}
                  className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
                  style={{ background: r.color }}
                >
                  Reprendre
                </Link>
                <button
                  onClick={() => {
                    try {
                      localStorage.removeItem(`rev-${r.slug}`);
                      // Met à jour l’état local
                      setData((prev) => ({
                        ...prev,
                        [r.slug]: summarize({}, 0),
                      }));
                    } catch {}
                  }}
                  className="text-[11px] text-zinc-600 hover:underline"
                  title="Réinitialiser ce thème"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
