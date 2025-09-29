"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import UISwitch from "./UISwitch.jsx";
import LikeButton from "./LikeButton.jsx";


/* --- Hook localStorage (safe SSR) --- */
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setState(raw != null ? JSON.parse(raw) : initialValue);
    } catch {}
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state, hydrated]);

  return [state, setState, hydrated];
}


/* --- Composant principal --- */
export default function StudyList({ fiches, storageKey }) {
  const [statusById, setStatusById, readyStatus] = useLocalStorage(
    storageKey,
    {}
  );
  const [showAll, setShowAll, readyShowAll] = useLocalStorage(
    `${storageKey}__showAll`,
    false
  );

  const ready = readyStatus && readyShowAll;
  const hasProgress = Object.keys(statusById || {}).length > 0;

  // notifier le compteur global
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rev-progress", { detail: { key: storageKey } })
      );
    }
  }, [statusById, storageKey]);

  // filtrage
  const items = useMemo(() => {
    return showAll
      ? [...fiches]
      : fiches.filter((f) => statusById[f.id] !== "known");
  }, [fiches, showAll, statusById]);

  function setKnown(id) {
    setStatusById((prev) => ({ ...prev, [id]: "known" }));
  }
  function unsetKnown(id) {
    setStatusById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }
  function resetProgress() {
    setStatusById({});
  }

  if (!ready) {
    return <p className="text-sm text-zinc-500">Chargement…</p>;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Barre d’actions */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UISwitch value={showAll} onChange={setShowAll} />
          <span className="text-[12px] font-medium text-zinc-700 whitespace-nowrap">
            Afficher toutes les cartes
          </span>
        </div>

        <button
          onClick={resetProgress}
          disabled={!hasProgress}
          aria-disabled={!hasProgress}
          title={
            hasProgress
              ? "Réinitialiser toutes les réponses de ce thème"
              : "Rien à réinitialiser pour le moment"
          }
          className={[
            "rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition",
            hasProgress
              ? "ring-zinc-300 text-zinc-700 hover:bg-zinc-100"
              : "ring-zinc-200 text-zinc-400 bg-white cursor-not-allowed opacity-50",
          ].join(" ")}
        >
          Réinitialiser
        </button>
      </div>

      {!showAll && items.length === 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          🎉 Tout est connu sur ce thème.
        </div>
      )}
      <div className="mt-7 sm:mt-3" />
      <ul className="grid gap-5 sm:gap-6 md:grid-cols-2">
        {items.map((fiche, i) => (
          <StudyCard
            key={fiche.id}
            index={i + 1}
            fiche={fiche}
            isKnown={statusById[fiche.id] === "known"}
            onKnown={() => setKnown(fiche.id)}
            onReview={() => unsetKnown(fiche.id)}
          />
        ))}
      </ul>
    </div>
  );
}

/* --- Carte individuelle --- */
function StudyCard({ index, fiche, isKnown, onKnown, onReview }) {
  const [revealed, setRevealed] = useState(false);
  const [fading, setFading] = useState(false);

  // swipe
  const startX = useRef(null);
  function onDown(e) {
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? null;
  }
  function onUp(e) {
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? null;
    if (startX.current == null || x == null) return;
    const dx = x - startX.current;
    if (dx > 60) handleKnown();
    else if (dx < -60) onReview();
    startX.current = null;
  }

  function handleKnown() {
    setFading(true);
    setTimeout(() => {
      onKnown();
      setFading(false);
    }, 160);
  }

  return (
    <li
      className={[
        "group relative overflow-hidden rounded-2xl bg-white",
        "ring-1 ring-zinc-200 shadow-sm hover:shadow-md",
        "hover:-translate-y-[1px] transition",
        fading
          ? "opacity-0 translate-y-1 duration-200"
          : "opacity-100 duration-200",
      ].join(" ")}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onTouchStart={onDown}
      onTouchEnd={onUp}
    >
      {/* Barre pastel du thème (vrai élément) */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: "var(--c)", opacity: 0.3 }}
      />
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 select-none items-center justify-center
             rounded-full text-[11px] font-semibold ring-1 ring-inset ring-zinc-200"
              style={{
                backgroundColor: "color-mix(in srgb, var(--c) 20%, white)", // fond pastel
                color: "color-mix(in srgb, var(--c) 80%, black)", // texte adouci
              }}
            >
              {index}
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-tight text-zinc-900">
                {fiche.question}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:brightness-110 transition"
            style={{ background: "color-mix(in srgb, var(--c) 75%, white)" }}
          >
            {revealed ? "Masquer" : "Réponse"}
          </button>
        </div>

        {revealed && (
          <p className="mt-3 ml-9 whitespace-pre-line text-[13px] leading-relaxed text-zinc-700">
            {fiche.reponse}
          </p>
        )}

        {/* Bas de carte : groupe aligné TOUT À DROITE */}
        <div className="mt-3 flex justify-end pr-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-zinc-700">
              Je connais
            </span>
            <LikeButton
              liked={isKnown}
              onChange={(next) => (next ? handleKnown() : onReview())}
              size="sm"
            />
          </div>
        </div>
      </div>
    </li>
  );
}
