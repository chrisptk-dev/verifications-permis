import Image from "next/image";
import Link from "next/link.js";
import HomeResume from "@/components/HomeResume";
import HomeProgress from "@/components/HomeProgress";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#00264d] flex flex-col items-center justify-center px-4 py-8 space-y-6">
      <h1 className="text-white text-2xl font-bold mb-6">Choisis un thème</h1>
      <div className="w-full max-w-xs space-y-4">
        <Link
          href="/theme/interieur"
          className="block w-full py-4 rounded-xl bg-[#1f4f82] text-white font-bold text-center shadow-md"
        >
          Vérifications
          <br />
          INTÉRIEUR
        </Link>
        <Link
          href="/theme/exterieur"
          className="block w-full py-4 rounded-xl bg-[#207ce5] text-white font-bold text-center shadow-md"
        >
          Vérifications
          <br />
          EXTÉRIEUR
        </Link>
        <Link
          href="/theme/securite"
          className="block w-full py-4 rounded-xl bg-[#f1b90b] text-white font-bold text-center shadow-md"
        >
          Questions
          <br />
          SÉCURITÉ ROUTIÈRE
        </Link>
        <Link
          href="/theme/secours"
          className="block w-full py-4 rounded-xl bg-[#c14d2c] text-white font-bold text-center shadow-md"
        >
          Questions
          <br />
          PREMIER SECOURS
        </Link>
      </div>
      <HomeResume />{" "}
      {/* <= le bouton “Continuer là où j’en étais” apparaît ici */}
      <HomeProgress />{" "}
      {/* récap par thème (s’affiche seulement s’il y a déjà des vues) */}
    </main>
  );
}
