// src/lib/api.js
import { getData, slugify } from "./data.js";

/** Liste des thèmes : id, nom, slug, count */
export async function getThemesList() {
  const { themes } = await getData();
  return themes.map((t) => ({
    id: t.id,
    nom: t.nom,
    slug: slugify(t.nom),
    count: t.verifs?.length ?? 0,
  }));
}

/** Détail d’un thème via son slug */
export async function getThemeBySlug(slug) {
  const { themes } = await getData();
  const theme = themes.find((t) => slugify(t.nom) === slug);
  if (!theme) return null;
  return { id: theme.id, nom: theme.nom, slug, verifs: theme.verifs ?? [] };
}

/** Tous les slugs (pour la pré-génération) */
export async function getAllThemeSlugs() {
  const { themes } = await getData();
  return themes.map((t) => slugify(t.nom));
}
