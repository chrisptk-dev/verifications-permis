"use client";
import { useEffect } from "react";

export default function LastVisitedWriter({ slug }) {
  useEffect(() => {
    try {
      localStorage.setItem("last-theme", slug);
    } catch {}
  }, [slug]);
  return null;
}
