"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function Matomo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
  const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  // 🧪 Vérif des variables d'environnement
  console.log("MATOMO_URL =", MATOMO_URL);
  console.log("MATOMO_SITE_ID =", MATOMO_SITE_ID);

  // Injecte Matomo une seule fois
  useEffect(() => {
    console.log("✅ Matomo component mounted");
    if (!MATOMO_URL || !MATOMO_SITE_ID) return;
    if (document.getElementById("matomo-script")) return;

    const s = document.createElement("script");
    s.id = "matomo-script";
    s.innerHTML = `
      var _paq = window._paq = window._paq || [];
      _paq.push(['disableCookies']);            // RGPD: sans cookies
      _paq.push(['enableLinkTracking']);        // clics liens sortants / downloads
      _paq.push(['enableHeartBeatTimer', 10]);  // temps passé plus précis (10s)
      (function() {
        var u='${process.env.NEXT_PUBLIC_MATOMO_URL}';
        _paq.push(['setTrackerUrl', u + 'matomo.php']);
        _paq.push(['setSiteId', '${process.env.NEXT_PUBLIC_MATOMO_SITE_ID}']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u + 'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    `;
    document.head.appendChild(s);
  }, [MATOMO_URL, MATOMO_SITE_ID]);

  // Pageview à chaque navigation (SPA)
  useEffect(() => {
    if (!MATOMO_URL || !MATOMO_SITE_ID) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    window._paq?.push(["setCustomUrl", url]);
    window._paq?.push(["setDocumentTitle", document.title]);
    window._paq?.push(["trackPageView"]);
  }, [pathname, searchParams, MATOMO_URL, MATOMO_SITE_ID]);

  return null;
}
