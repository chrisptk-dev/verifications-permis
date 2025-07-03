import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { slug } = await params;

  const themeMap = {
    interieur: { id: 1, label: "Vérifications INTÉRIEUR" },
    exterieur: { id: 2, label: "Vérifications EXTÉRIEUR" },
    secours: { id: 3, label: "Questions PREMIERS SECOURS" },
    securite: { id: 4, label: "Questions SÉCURITÉ ROUTIÈRE" },
  };

  const theme = themeMap[slug];

  if (!theme) {
    return <main className="p-6 text-red-600">Thème inconnu</main>;
  }

  const { data: fiches, error } = await supabase
    .from("verifications")
    .select("*")
    .eq("themes_id", theme.id);

  return (
    <main className="min-h-screen p-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">{theme.label}</h1>

      {error && <p className="text-red-500">Erreur : {error.message}</p>}

      {fiches.length === 0 ? (
        <p>Aucune fiche trouvée pour ce thème.</p>
      ) : (
        <ul className="space-y-4">
          {fiches.map((fiche) => (
            <li key={fiche.id} className="bg-gray-100 p-4 rounded shadow">
              <p className="font-semibold">{fiche.question}</p>
              <p className="text-sm text-gray-600 mt-2">{fiche.reponse}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
