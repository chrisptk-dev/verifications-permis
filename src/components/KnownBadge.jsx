"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KnownBadge({ slug }) {
  const [count, setCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false); // 👈 gère l’animation
  const router = useRouter();

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(`rev-${slug}`);
        const map = raw ? JSON.parse(raw) : {};
        setCount(Object.values(map).filter((v) => v === "known").length);
      } catch {
        setCount(0);
      }
    };
    read();
    const rerender = () => read();
    window.addEventListener("storage", rerender);
    window.addEventListener("rev-progress", rerender);
    return () => {
      window.removeEventListener("storage", rerender);
      window.removeEventListener("rev-progress", rerender);
    };
  }, [slug]);

  if (count === 0) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium
                   ring-1 ring-inset ring-zinc-200 text-zinc-400 select-none"
        title="Aucune carte connue pour l’instant"
      >
        ✓ 0
      </span>
    );
  }

  function handleClick() {
    // 👈 effet visuel
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 250);

    // ✅ Informe StudyList de passer en vue "connues"
    window.dispatchEvent(
      new CustomEvent("rev-set-view", {
        detail: { key: `rev-${slug}`, view: "known" },
      })
    );

    // ✅ Met à jour l’URL (facultatif mais propre)
    router.replace(`?filter=known`, { scroll: false });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        "ring-1 ring-inset ring-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition",
        isPulsing ? "scale-110 shadow-lg" : "scale-100 shadow-sm", // 👈 effet pulse
        "transition-transform duration-200 ease-out",
      ].join(" ")}
      title="Afficher uniquement les cartes connues"
      aria-label="Cartes connues"
    >
      ✓ {count}
    </button>
  );
}
