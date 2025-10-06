// src/lib/data.js
import { promises as fs } from "fs";
import path from "path";

/** Charge et normalise le JSON quelle que soit sa forme d'export Supabase */
export async function getData() {
  const file = path.join(process.cwd(), "public", "data", "verifications.json");
  const raw = await fs.readFile(file, "utf-8");
  let obj = JSON.parse(raw);

  // 1) Si c'est un tableau, on prend la 1re entrée
  if (Array.isArray(obj)) obj = obj[0] ?? {};

  // 2) Si c'est { data: { themes: [...] } }  → cas de ton screenshot
  if (obj && obj.data && Array.isArray(obj.data.themes)) {
    return { themes: obj.data.themes };
  }

  // 3) Si c'est { themes: [...] } déjà normalisé
  if (obj && Array.isArray(obj.themes)) {
    return { themes: obj.themes };
  }

  // 4) Si c'est un objet "à plat" { "Intérieur": [...], ... }
  if (obj && typeof obj === "object") {
    const entries = Object.entries(obj).filter(
      ([k, v]) => Array.isArray(v) && v.length && typeof v[0] === "object"
    );
    if (entries.length >= 2) {
      const themes = entries.map(([nom, verifs], i) => ({
        id: i + 1,
        nom,
        verifs,
      }));
      return { themes };
    }
  }

  // 5) Par défaut : structure vide (évite de crasher le rendu)
  return { themes: [] };
}

export function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
