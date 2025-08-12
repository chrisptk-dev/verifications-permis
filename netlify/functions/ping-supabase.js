/* eslint-disable */
// netlify/functions/ping-supabase.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default async () => {
  const { error, count } = await supabase
    .from("verifications")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("Ping error:", error.message);
    return new Response("error", { status: 500 });
  }
  console.log("Ping Supabase OK - rows:", count ?? 0);
  return new Response("ok", { status: 200 });
};

export const config = { schedule: "@daily" };