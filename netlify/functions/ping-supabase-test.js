/* eslint-disable */
// netlify/functions/ping-supabase-test.js
// Appelable via:
// https://verifications-permis.netlify.app/.netlify/functions/ping-supabase-test

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

    const text = await res.text(); // on garde le texte brut pour debug
    return new Response(
      `status=${res.status} ${res.statusText}\nbody=${text.slice(0, 300)}...`,
      { status: res.ok ? 200 : 500 }
    );
  } catch (e) {
    return new Response(`ERROR: ${e.message}`, { status: 500 });
  }
};