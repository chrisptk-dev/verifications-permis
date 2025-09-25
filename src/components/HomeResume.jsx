"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeResume({ autoRedirect = false }) {
  const [slug, setSlug] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const s = localStorage.getItem("last-theme");
      if (s) {
        setSlug(s);
        if (autoRedirect) router.replace(`/theme/${s}`);
      }
    } catch {}
  }, [autoRedirect, router]);

  if (!slug || autoRedirect) return null;

  return (
    <div className="mt-6 flex justify-center">
      <Link
        href={`/theme/${slug}`}
        className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white [background:#1f4f82] hover:opacity-90"
      >
        Continuer là où j’en étais
      </Link>
    </div>
  );
}
