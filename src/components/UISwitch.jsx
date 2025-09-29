"use client";
import { useRef, useState } from "react";

/** UISwitch Apple-like (68x32, knob 28, padding 2px, ombres douces) */
export default function UISwitch({ value = false, onChange, className = "" }) {
  // Constantes de géométrie -> évite le décalage
  const TRACK_W = 68; // px
  const TRACK_H = 32; // px (h-8)
  const KNOB = 28; // px (h-7 w-7)
  const PAD = 2; // px (marge intérieure piste)
  const OFFSET = TRACK_W - KNOB - PAD * 2; // 36 px

  const trackRef = useRef(null);
  const [drag, setDrag] = useState(null); // 0..1 pendant le drag (null = pas de drag)
  const pos = drag ?? (value ? 1 : 0);

  const getX = (e) => e.touches?.[0]?.clientX ?? e.clientX ?? null;
  const clamp = (v) => Math.max(0, Math.min(1, v));

  function start(e) {
    const x = getX(e);
    if (x == null) return;
    const rect = trackRef.current.getBoundingClientRect();
    setDrag(clamp((x - rect.left) / rect.width));
    e.preventDefault();
  }
  function move(e) {
    if (drag == null) return;
    const x = getX(e);
    if (x == null) return;
    const rect = trackRef.current.getBoundingClientRect();
    setDrag(clamp((x - rect.left) / rect.width));
  }
  function end() {
    if (drag == null) return;
    onChange?.(drag > 0.5);
    setDrag(null);
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
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        className={[
          "relative select-none rounded-full transition-colors duration-150",
          "h-8 w-[68px]", // 68x32
          value ? "bg-emerald-500" : "bg-zinc-300",
          "shadow-inner ring-1 ring-black/5", // ombre piste
          "focus:outline-none focus:ring-2 focus:ring-emerald-300/60",
        ].join(" ")}
        aria-label="switch"
      >
        {/* Knob */}
        <span
          className={[
            "absolute top-[2px] left-[2px]", // padding exact
            "h-7 w-7 rounded-full bg-white",
            "shadow-[0_1px_2px_rgba(0,0,0,0.18),_0_4px_10px_rgba(0,0,0,0.10)]",
            "transition-transform duration-150 will-change-transform",
          ].join(" ")}
          // translateX de 0 à 36px -> jamais hors de la piste
          style={{ transform: `translateX(${pos * OFFSET}px)` }}
        />
      </div>
    </div>
  );
}
