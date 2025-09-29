import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-4 text-center text-sm text-zinc-300">
      <div className="flex items-center justify-center gap-2">
        <Link
          href="https://back2web.fr" // ← ton site ici
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 hover:scale-105 transition"
        >
          <span>
            Réalisé par <strong className="text-white">back2web</strong>
          </span>
          <Image
            src="/logo-back2web.png"
            alt="Back2Web"
            width={34}
            height={34}
            className="rounded-full shadow"
          />
        </Link>
      </div>
    </footer>
  );
}
