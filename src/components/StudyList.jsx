"use client";
import { useEffect, useMemo, useState } from "react";

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
}


export default function StudyList({ fiches, storageKey }) {
  const [statusById, setStatusById] = useLocalStorage(storageKey, {});
  const [revealAll, setRevealAll] = useState(false);
  const [filter, setFilter] = useState("all");
  const [shuffle, setShuffle] = useState(false);

  const counts = useMemo(() => {
    let known = 0,
      doubt = 0,
      unknown = 0,
      seen = 0;
    for (const id of Object.keys(statusById)) {
      seen++;
      if (statusById[id] === "known") known++;
      else if (statusById[id] === "doubt") doubt++;
      else if (statusById[id] === "unknown") unknown++;
    }
    return { known, doubt, unknown, seen, total: fiches.length };
  }, [statusById, fiches.length]);

  const filtered = useMemo(() => {
    let arr = [...fiches];
    if (filter === "review") {
      arr = arr.filter((f) => ["doubt", "unknown"].includes(statusById[f.id]));
    } else if (filter === "unseen") {
      arr = arr.filter((f) => !statusById[f.id]);
    } else if (filter === "known") {
      arr = arr.filter((f) => statusById[f.id] === "known");
    }
    if (shuffle) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  }, [fiches, filter, shuffle, statusById]);

  function setStatus(id, s) {
    setStatusById((prev) => ({ ...prev, [id]: s }));
  }
  function resetProgress() {
    setStatusById({});
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label={`Toutes (${counts.total})`}
          />
          <FilterChip
            active={filter === "review"}
            onClick={() => setFilter("review")}
            label={`À revoir (${counts.doubt + counts.unknown})`}
          />
          <FilterChip
            active={filter === "unseen"}
            onClick={() => setFilter("unseen")}
            label={`Non vues (${counts.total - counts.seen})`}
          />
          <FilterChip
            active={filter === "known"}
            onClick={() => setFilter("known")}
            label={`Su (es) (${counts.known})`}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-zinc-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
              checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)}
            />
            Mélanger
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-zinc-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
              checked={revealAll}
              onChange={(e) => setRevealAll(e.target.checked)}
            />
            Tout afficher
          </label>
          <button
            onClick={resetProgress}
            className="rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ring-zinc-300 text-zinc-700 hover:bg-zinc-100"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <ul className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {filtered.map((fiche, i) => (
          <StudyCard
            key={fiche.id}
            index={i + 1}
            fiche={fiche}
            revealAll={revealAll}
            status={statusById[fiche.id] || null}
            onStatus={(s) => setStatus(fiche.id, s)}
          />
        ))}
      </ul>
    </div>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1.5 text-xs font-medium transition",
        active
          ? "text-white [background:var(--c)]"
          : "ring-1 ring-inset ring-zinc-300 text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function StudyCard({ index, fiche, revealAll, status, onStatus }) {
  const [revealed, setRevealed] = useState(revealAll);
  useEffect(() => {
    setRevealed(revealAll);
  }, [revealAll]);

  const statusLabel =
    status === "known"
      ? "Su (e)"
      : status === "doubt"
      ? "J’hésitais"
      : status === "unknown"
      ? "Je ne savais pas"
      : "Non vue";

  return (
    <li className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_1px_0_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-[1px] transition before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:[background:var(--c)]">
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-700 ring-1 ring-inset ring-black/5">
              {index}
            </span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-[17px] font-semibold leading-tight text-zinc-900 tracking-tight">
                {fiche.question}
              </h3>
              <div className="mt-1 text-[11px] text-zinc-500">
                {revealed
                  ? "Réponse affichée"
                  : "Cliquer pour afficher la réponse"}
                <span className="mx-1">•</span>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                    status === "known"
                      ? "text-emerald-700 ring-emerald-200 bg-emerald-50"
                      : status === "doubt"
                      ? "text-amber-700 ring-amber-200 bg-amber-50"
                      : status === "unknown"
                      ? "text-red-700 ring-red-200 bg-red-50"
                      : "text-zinc-700 ring-zinc-200 bg-zinc-50",
                  ].join(" ")}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setRevealed((v) => !v)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-white [background:var(--c)] hover:opacity-90"
            aria-expanded={revealed}
          >
            {revealed ? "Masquer" : "Afficher"}
          </button>
        </div>

        {revealed && (
          <p className="mt-3 ml-9 text-[13px] leading-relaxed text-zinc-700 whitespace-pre-line">
            {fiche.reponse}
          </p>
        )}

        <div className="mt-3 ml-9 flex flex-wrap gap-2">
          <EvalButton
            active={status === "known"}
            onClick={() => onStatus("known")}
            label="Je savais (1)"
            ring="ring-emerald-300"
          />
          <EvalButton
            active={status === "doubt"}
            onClick={() => onStatus("doubt")}
            label="J’hésitais (2)"
            ring="ring-amber-300"
          />
          <EvalButton
            active={status === "unknown"}
            onClick={() => onStatus("unknown")}
            label="Je ne savais pas (3)"
            ring="ring-red-300"
          />
        </div>
      </div>
    </li>
  );
}

function EvalButton({ active, onClick, label, ring }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1.5 text-[12px] font-medium ring-2",
        active
          ? "[background:var(--c)] text-white"
          : `ring-inset ${ring} text-zinc-700 hover:bg-zinc-100`,
      ].join(" ")}
    >
      {label}
    </button>
  );
}
