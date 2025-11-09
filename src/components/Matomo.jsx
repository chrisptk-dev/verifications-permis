"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Matomo() {
  const pathname = usePathname();

  const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
  const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  // Injection Matomo une seule fois
  useEffect(() => {
    if (!MATOMO_URL || !MATOMO_SITE_ID) return;
    if (document.getElementById("matomo-script")) return;

    const s = document.createElement("script");
    s.id = "matomo-script";
    s.innerHTML = `
      var _paq = window._paq = window._paq || [];
      _paq.push(['disableCookies']);             // RGPD
      _paq.push(['enableLinkTracking']);
      _paq.push(['enableHeartBeatTimer', 10]);
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

  // Pageview auto (SPA) — avec pathname uniquement
  useEffect(() => {
    if (!MATOMO_URL || !MATOMO_SITE_ID || !pathname) return;
    window._paq?.push(["setCustomUrl", pathname]);
    window._paq?.push(["setDocumentTitle", document.title]);
    window._paq?.push(["trackPageView"]);
  }, [pathname, MATOMO_URL, MATOMO_SITE_ID]);

  return null;
}
