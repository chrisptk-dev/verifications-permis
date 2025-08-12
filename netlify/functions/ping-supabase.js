/* eslint-disable */
// netlify/functions/ping-supabase.js

const URL =
  "https://hhyslneujnkjpxzysvbh.supabase.co/rest/v1/verifications?select=id";

export default async () => {
  try {
    const res = await fetch(URL, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });

    // On lit pour forcer la requête et logguer un résumé
    const data = await res.json().catch(() => null);
    console.log(
      `Ping Supabase → status=${res.status}, rows=${
        Array.isArray(data) ? data.length : "n/a"
      }`
    );

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("Ping error:", e);
    return new Response("error", { status: 500 });
  }
};

// Planification hebdo
export const config = { schedule: "@weekly" };