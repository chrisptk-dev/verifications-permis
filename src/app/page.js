import Image from "next/image";
import Link from "next/link.js";
import HomeProgress from "@/components/HomeProgress";
import Footer from "@/components/Footer";




export default function Home() {
  return (
    <main className="min-h-screen bg-[#00264d] flex flex-col items-center justify-center px-4 py-8 space-y-6">
      {/* En-tête : titre + sous-titre */}
      <header className="text-center mb-6 sm:mb-8">
        {/* >>> Choisis 1 des 3 titres ci-dessous (dé-commente celui que tu veux) <<< */}

        {/* 1) sobre + impliquant */}
        {/* <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
    Tes vérifications permis
  </h1> */}

        {/* 2) sérieux + un brin challenge */}
        <h1 className="mb-15 text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
          Vérifications permis&nbsp;
        </h1>
        

        {/* 3) un peu plus fun mais cadré */}
        {/* <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
    Vérif’ ton permis <span aria-hidden>🚦</span>
  </h1> */}

        <p className="mt-2 text-zinc-300 text-base sm:text-lg">
          Choisis un thème et entraîne-toi.
        </p>
      </header>

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
      {/* récap par thème (s’affiche seulement s’il y a déjà des vues) */}
      <HomeProgress />
      {/* Footer en bas */}
      <Footer />
    </main>
  );
}
