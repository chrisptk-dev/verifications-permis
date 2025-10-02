"use client";
import { useRef, useState } from "react";

/** UISwitch Apple-like (68x32, knob 28, padding 2px, ombres douces) */
export default function UISwitch({ value = false, onChange, className = "" }) {
  // Constantes
  const TRACK_W = 68; // px
  const TRACK_H = 32; // px (h-8)
  const KNOB = 28; // px (h-7 w-7)
  const PAD = 2; // px (marge intérieure piste)
  const OFFSET = TRACK_W - KNOB - PAD * 2; // 36 px

  const trackRef = useRef(null);

  // Etat "drag" [0..1] ; null = pas de drag
  const [drag, setDrag] = useState(null);
  const pos = drag ?? (value ? 1 : 0);

  // Pour distinguer un "tap/clic" d'un vrai glisser
  const startXRef = useRef(null);
  const movedRef = useRef(false);

  const getX = (e) => e.touches?.[0]?.clientX ?? e.clientX ?? null;
  const clamp = (v) => Math.max(0, Math.min(1, v));

  function start(e) {
    const x = getX(e);
    if (x == null) return;
    const rect = trackRef.current.getBoundingClientRect();
    startXRef.current = x;
    movedRef.current = false;
    setDrag(clamp((x - rect.left) / rect.width)); // positionne le knob sous le doigt
    e.preventDefault();
  }

  function move(e) {
    if (drag == null) return;
    const x = getX(e);
    if (x == null) return;
    const rect = trackRef.current.getBoundingClientRect();
    const dx = Math.abs(x - (startXRef.current ?? x));
    if (dx > 6) movedRef.current = true; // seuil pour considérer un vrai glisser
    setDrag(clamp((x - rect.left) / rect.width));
  }

  function end() {
    if (drag == null) return;
    if (!movedRef.current) {
      // simple tap/clic -> toggle, peu importe où on a cliqué
      onChange?.(!value);
    } else {
      // vrai glisser -> on fixe selon la position
      onChange?.(drag > 0.5);
    }
    setDrag(null);
    startXRef.current = null;
    movedRef.current = false;
  }

  function toggle() {
    onChange?.(!value);
  }

  return (
    <div className={["inline-block align-middle", className].join(" ")}>
      <div
        ref={trackRef}
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggle()}
        // Pointeurs : un tap/clic déclenche start puis end -> toggle si pas de glisser
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        className={[
          "relative select-none rounded-full transition-colors duration-150",
          "h-8 w-[68px]",
          value ? "bg-emerald-500" : "bg-zinc-300",
          "shadow-inner ring-1 ring-black/5",
          "focus:outline-none focus:ring-2 focus:ring-emerald-300/60",
          "cursor-pointer",
        ].join(" ")}
        aria-label="switch"
      >
        {/* Knob */}
        <span
          className={[
            "absolute top-[2px] left-[2px]",
            "h-7 w-7 rounded-full bg-white",
            "shadow-[0_1px_2px_rgba(0,0,0,0.18),_0_4px_10px_rgba(0,0,0,0.10)]",
            "transition-transform duration-150 will-change-transform",
          ].join(" ")}
          style={{ transform: `translateX(${pos * OFFSET}px)` }}
        />
      </div>
    </div>
  );
}
