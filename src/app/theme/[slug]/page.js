import Link from "next/link";
import { getThemeBySlug, getAllThemeSlugs } from "../../../lib/api.js";
import StudyList from "@/components/StudyList";
import LastVisitedWriter from "@/components/LastVisitedWriter";
import RemainingBadge from "@/components/RemainingBadge";
import TotalWriter from "@/components/TotalWriter";
import KnownBadge from "@/components/KnownBadge";

export async function generateStaticParams() {
  const slugs = await getAllThemeSlugs();
  return slugs.map((slug) => ({ slug }));
}




export const dynamic = "force-static";

export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;

  // 1) Slugs -> libellés
  const themeMap = {
    interieur: { id: 1, label: "Vérifications INTÉRIEUR" },
    exterieur: { id: 2, label: "Vérifications EXTÉRIEUR" },
    securite: { id: 4, label: "Questions SÉCURITÉ ROUTIÈRE" },
    secours: { id: 3, label: "Questions PREMIERS SECOURS" },
  };

  // 2) Palette CENTRALISÉE (reprise de ta home)
  const THEME_COLORS = {
    pageBg: "#00264d", // fond général
    interieur: "#1f4f82", // bleu foncé
    exterieur: "#207ce5", // bleu clair
    securite: "#f1b90b", // jaune
    secours: "#c14d2c", // rouge
  };

  const theme = themeMap[slug];
  if (!theme) return <main className="p-6 text-red-600">Thème inconnu</main>;

  const color = THEME_COLORS[slug] ?? THEME_COLORS.interieur;

  // 3) Data
  // Gère les slugs "courts" (securite → securite-routiere, secours → premier-secours)
  const aliasMap = {
    securite: "securite-routiere",
    secours: "premier-secours",
  };

  const realSlug = aliasMap[slug] ?? slug;

  const themeData = await getThemeBySlug(realSlug);
  if (!themeData)
    return <main className="p-6 text-red-600">Thème introuvable</main>;

  const fiches = themeData.verifs ?? [];
  const initialFilter = sp?.filter ?? "default";

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: THEME_COLORS.pageBg }}
    >
      <LastVisitedWriter slug={slug} />
      <TotalWriter slug={slug} total={fiches.length} />

      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Feuille centrale – on pose la couleur dans une CSS var --c */}
        <div
          className="relative isolate rounded-3xl bg-white ring-1 ring-black/5 shadow-lg"
          style={{ ["--c"]: color }}
        >
          <div className="sticky z-20 top-2 sm:top-3 md:top-0 overflow-visible rounded-t-3xl border-b border-zinc-200/70 bg-white/95 supports-[backdrop-filter]:bg-white/70 backdrop-blur md:backdrop-blur-none">
            <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-3">
              {/* L1: Maison (gauche) • Changer de thème (droite) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HomeButton />
                </div>
                <ThemeSwitcherMobile current={slug} colors={THEME_COLORS} />
              </div>

              {/* L2: Titre + compteurs (gauche) • Switcher desktop (droite) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                    {theme.label}
                  </h1>

                  {/* Compteur restant + badge connues */}
                  <div className="flex items-center gap-2">
                    <RemainingBadge
                      storageKey={`rev-${slug}`}
                      total={fiches.length}
                      color={color}
                    />
                    <KnownBadge slug={slug} />
                  </div>
                </div>

                <ThemeSwitcherDesktop current={slug} colors={THEME_COLORS} />
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-3 pb-8 pt-4 sm:px-6">
            {fiches.length === 0 ? (
              <p className="text-zinc-800">
                Aucune fiche trouvée pour ce thème.
              </p>
            ) : (
              <div className="rounded-2xl bg-zinc-50 p-3 sm:p-4">
                <StudyList
                  fiches={fiches}
                  storageKey={`rev-${slug}`}
                  initialFilter={initialFilter}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===== UI bits ===== */

function HomeButton() {
  return (
    <Link
      href="/"
      aria-label="Accueil"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset ring-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
    >
      {/* icône maison */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 10.5l9-7 9 7V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z"
          fill="currentColor"
        />
      </svg>
    </Link>
  );
}


const THEMES = [
  { slug: "interieur", label: "Intérieur" },
  { slug: "exterieur", label: "Extérieur" },
  { slug: "securite", label: "Sécurité routière" },
  { slug: "secours", label: "Premiers secours" },
];

/** Switcher desktop : pastilles PLEINE couleur du thème.
 *  Active = opacité 100 + anneau.
 *  Inactive = opacité 80 (toujours la même couleur).
 */
function ThemeSwitcherDesktop({ current, colors }) {
  return (
    <nav
      className="hidden sm:flex items-center gap-2"
      aria-label="Changer de thème"
    >
      {THEMES.map((t) => {
        const active = current === t.slug;
        const c = colors[t.slug];
        return (
          <Link
            key={t.slug}
            href={`/theme/${t.slug}`}
            aria-current={active ? "page" : undefined}
            style={{ ["--c"]: c }}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-medium text-white transition",
              "[background:var(--c)]",
              active
                ? "opacity-100 ring-2 ring-offset-1 ring-[var(--c)]"
                : "opacity-80 hover:opacity-90",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Menu mobile : liste avec point coloré du thème + liens */
function ThemeSwitcherMobile({ current, colors }) {
  return (
    <details className="relative sm:hidden">
      <summary className="list-none select-none rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ring-zinc-300 text-zinc-700 bg-white hover:bg-zinc-100 cursor-pointer">
        Changer de thème
      </summary>

      <ul
        className="
          absolute left-0 top-full mt-2
          w-64 max-w-[calc(100vw-2rem)]
          rounded-2xl bg-white ring-1 ring-black/5 shadow-lg p-2 space-y-1 z-30
        "
      >
        {THEMES.map((t) => {
          const active = current === t.slug;
          return (
            <li key={t.slug}>
              <Link
                href={`/theme/${t.slug}`}
                className={[
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-100",
                ].join(" ")}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors[t.slug] }}
                />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}


