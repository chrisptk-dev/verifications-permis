/* eslint-disable */

export default async (req, context) => {
  const url =
    "https://hhyslneujnkjpxzysvbh.supabase.co/rest/v1/verifications?select=id";

  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
  });

  const data = await res.json();
  console.log("Ping OK, lignes :", data.length);

  return new Response("Supabase pinged successfully!", { status: 200 });
};

// Planification : 1 fois par semaine
export const config = {
  schedule: "@weekly",
};
