"use client";
import { useState } from "react";

/** Bouton Like rond (pouce) avec ondes + anim
 * liked: boolean, onChange(next:boolean)
 * size: "sm" | "md"
 */
export default function LikeButton({ liked = false, onChange, size = "sm" }) {
  const [pulse, setPulse] = useState(false);
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconCls = size === "sm" ? "h-[18px] w-[18px]" : "h-[20px] w-[20px]";

  function toggle() {
    const next = !liked;
    setPulse(true);
    setTimeout(() => setPulse(false), 320);
    if (navigator?.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
    onChange?.(next);
  }

  return (
    <button
      type="button"
      aria-pressed={liked}
      onClick={toggle}
      className={[
        "relative inline-flex items-center justify-center rounded-full select-none",
        dim,
        // OFF = outline blanc, bord gris ; ON = pastille couleur thème (var --c)
        liked
          ? "text-white ring-0"
          : "bg-white text-zinc-500 ring-1 ring-inset ring-zinc-300",
        "transition-transform active:scale-95 shadow",
        "focus:outline-none focus:ring-2 focus:ring-[var(--c)]/40",
      ].join(" ")}
      // Couleur du fond quand liked
      style={liked ? { background: "var(--c)" } : undefined}
      title={liked ? "Marqué comme connu" : "Marquer comme connu"}
    >
      {/* Ondes */}
      {pulse && (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-full border border-white/60 animate-likewave" />
          <span className="pointer-events-none absolute inset-0 rounded-full border border-white/35 animate-likewave-slow" />
        </>
      )}

      {/* Icône pouce - toujours blanc si liked, sinon gris */}
      <svg viewBox="0 0 24 24" className={iconCls} aria-hidden="true">
        <path
          d="M2 12h4v10H2V12zm6 10h8a3 3 0 0 0 3-3v-7a2 2 0 0 0-2-2h-5l.77-3.08A2 2 0 0 0 11.84 4L9 9v13z"
          fill={liked ? "#fff" : "#6b7280"}
        />
      </svg>

      <style jsx>{`
        @keyframes likewave {
          0% {
            transform: scale(1);
            opacity: 0.45;
          }
          70% {
            transform: scale(1.55);
            opacity: 0.15;
          }
          100% {
            transform: scale(1.85);
            opacity: 0;
          }
        }
        .animate-likewave {
          animation: likewave 360ms ease-out forwards;
        }
        .animate-likewave-slow {
          animation: likewave 520ms ease-out forwards;
        }
      `}</style>
    </button>
  );
}
