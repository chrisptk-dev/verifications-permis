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
export default function StudyList({
  fiches,
  storageKey,
  initialFilter = "default",
}) {
  // états persistés
  const [statusById, setStatusById, readyStatus] = useLocalStorage(
    storageKey,
    {}
  );
  const [showAll, setShowAll, readyShowAll] = useLocalStorage(
    `${storageKey}__showAll`,
    false
  );

  // vue dérivée du paramètre initial
  const [view, setView] = useState(
    initialFilter === "known" ? "known" : "default"
  );

  const ready = readyStatus && readyShowAll;
  const hasProgress = Object.keys(statusById || {}).length > 0;

  // notifier le compteur global (RemainingBadge / KnownBadge)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rev-progress", { detail: { key: storageKey } })
      );
    }
  }, [statusById, storageKey]);

  // si l'URL change (?filter=...), synchroniser la vue
  useEffect(() => {
    setView(initialFilter === "known" ? "known" : "default");
  }, [initialFilter]);

  // Écoute un ordre de changement de vue (par ex. depuis RemainingBadge)
  useEffect(() => {
    function onSetView(e) {
      if (e?.detail?.key !== storageKey) return;
      const v = e.detail.view === "known" ? "known" : "default";
      setView(v);
    }
    window.addEventListener("rev-set-view", onSetView);
    return () => window.removeEventListener("rev-set-view", onSetView);
  }, [storageKey]);

  // --- filtrage des fiches selon la vue courante ---
  const items = useMemo(() => {
    let arr;
    if (view === "known") {
      // Vue "connues" : uniquement celles marquées known
      arr = fiches.filter((f) => statusById[f.id] === "known");
    } else {
      // Vue révision : on masque les connues (sauf si "Afficher toutes")
      arr = showAll
        ? [...fiches]
        : fiches.filter((f) => statusById[f.id] !== "known");
    }
    return arr;
  }, [fiches, showAll, statusById, view]);

  // actions
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

  // ✅ FIX: réinitialiser vraiment + revenir en vue normale + nettoyer l’URL
  function resetProgress() {
    // vider l’état persistant
    setStatusById({});
    // couper "Afficher toutes"
    setShowAll(false);
    // revenir en vue "À apprendre"
    setView("default");
    // notifier les badges
    try {
      window.dispatchEvent(
        new CustomEvent("rev-progress", { detail: { key: storageKey } })
      );
    } catch {}

    // enlever ?filter=known de l’URL (évite de rester bloqué si la page remonte l'URL)
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("filter")) {
        url.searchParams.delete("filter");
        window.history.replaceState(
          {},
          "",
          url.pathname + (url.search ? `?${url.searchParams}` : "")
        );
        // petit fallback si l'objet URL ne conserve pas bien les params
        if (!url.searchParams.toString()) {
          window.history.replaceState({}, "", url.pathname);
        }
      }
    } catch {}
  }

  // ✅ FIX UX: si on est en "Connues" et qu'il n'y en a plus, repasser en "À apprendre"
  useEffect(() => {
    if (view === "known") {
      const knownCount = fiches.reduce(
        (acc, f) => acc + (statusById[f.id] === "known" ? 1 : 0),
        0
      );
      if (knownCount === 0) setView("default");
    }
  }, [view, statusById, fiches]);

  if (!ready) {
    return <p className="text-sm text-zinc-500">Chargement…</p>;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Barre d’actions */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* désactiver le switch en vue 'connues' (sinon c'est incohérent) */}
          <UISwitch
            value={showAll}
            onChange={setShowAll}
            disabled={view === "known"}
          />
          <span
            className={`text-[12px] font-medium whitespace-nowrap ${
              view === "known" ? "text-zinc-400" : "text-zinc-700"
            }`}
          >
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

      {/* état vide (uniquement pour la vue révision) */}
      {view !== "known" && !showAll && items.length === 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          🎉 Tout est connu sur ce thème.
        </div>
      )}

      <div className="mt-7 sm:mt-3" />
      {/* Liste animée des cartes */}
      <ul
        className="grid gap-5 sm:gap-6 md:grid-cols-2 transition-all duration-300 ease-in-out"
        key={view} // 👈 change la clé pour relancer l’animation quand la vue change
      >
        {items.map((fiche, i) => (
          <div
            key={fiche.id}
            className="animate-fadeInUp"
            style={{
              animationDelay: `${i * 40}ms`,
              animationFillMode: "both",
            }}
          >
            <StudyCard
              index={i + 1}
              fiche={fiche}
              isKnown={statusById[fiche.id] === "known"}
              onKnown={() => setKnown(fiche.id)}
              onReview={() => unsetKnown(fiche.id)}
            />
          </div>
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
                backgroundColor: "color-mix(in srgb, var(--c) 20%, white)",
                color: "color-mix(in srgb, var(--c) 80%, black)",
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
          <div className="mt-4 mb-6 mx-auto text-sm text-zinc-700 bg-zinc-100 rounded-md px-4 py-3 whitespace-pre-line max-w-[90%]">
            {fiche.reponse}
          </div>
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
