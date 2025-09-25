import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import StudyList from "@/components/StudyList";
import LastVisitedWriter from "@/components/LastVisitedWriter";



export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { slug } = await params;

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
  const { data: fichesRaw, error } = await supabase
    .from("verifications")
    .select("*")
    .eq("themes_id", theme.id);

  const fiches = Array.isArray(fichesRaw) ? fichesRaw : [];

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: THEME_COLORS.pageBg }}
    >
      <LastVisitedWriter slug={slug} />

      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Feuille centrale – on pose la couleur dans une CSS var --c */}
        <div
          className="relative isolate rounded-3xl bg-white ring-1 ring-black/5 shadow-lg"
          style={{ ["--c"]: color }}
        >
          {/* Header sticky, offset mobile + menu non coupé */}
          <div className="sticky z-20 top-2 sm:top-3 md:top-0 overflow-visible rounded-t-3xl border-b border-zinc-200/70 bg-white/95 supports-[backdrop-filter]:bg-white/70 backdrop-blur md:backdrop-blur-none">
            <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-3">
              {/* Ligne 1 : retour + titre + compteur coloré */}
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BackHome />
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                    {theme.label}
                  </h1>
                </div>

                {/* Chip du compteur = couleur du thème */}
                <span
                  className="
                    shrink-0 inline-flex items-center justify-center rounded-full
                    px-3 py-1 text-[11px] font-medium whitespace-nowrap min-w-[92px]
                    text-white
                    [background:var(--c)]
                  "
                >
                  {fiches.length} élément{fiches.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Ligne 2 : switcher desktop + mobile (coloré) */}
              <div className="flex items-center justify-between">
                <ThemeSwitcherDesktop current={slug} colors={THEME_COLORS} />
                <ThemeSwitcherMobile current={slug} colors={THEME_COLORS} />
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-3 pb-6 pt-4 sm:px-6">
            {error && (
              <p className="mb-3 text-sm text-red-600">
                Erreur : {error.message}
              </p>
            )}

            {fiches.length === 0 ? (
              <p className="text-zinc-800">
                Aucune fiche trouvée pour ce thème.
              </p>
            ) : (
              <StudyList fiches={fiches} storageKey={`rev-${slug}`} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===== UI bits ===== */

function BackHome() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset ring-black/5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
      aria-label="Retour à l’accueil"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12.78 15.53a.75.75 0 01-1.06 0l-5-5a.75.75 0 010-1.06l5-5a.75.75 0 111.06 1.06L8.31 9.25h7.44a.75.75 0 010 1.5H8.31l4.47 4.47a.75.75 0 010 1.06z" />
      </svg>
      Accueil
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

/** Carte : barre d’accent pleine couleur du thème (via var --c posée sur la feuille) */
function CardItem({ index, question, reponse }) {
  return (
    <li className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_1px_0_rgba(0,0,0,0.03)] before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:[background:var(--c)]">
      <details className="p-3 sm:p-4">
        <summary className="flex items-start gap-3 cursor-pointer list-none">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-700 ring-1 ring-inset ring-black/5">
            {index}
          </span>
          <h3 className="text-base sm:text-[17px] font-semibold leading-tight text-zinc-900 tracking-tight">
            {question}
          </h3>
        </summary>
        <p className="mt-2 ml-9 text-[13px] leading-relaxed text-zinc-700 whitespace-pre-line">
          {reponse}
        </p>
      </details>
    </li>
  );
}

