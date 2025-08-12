/* eslint-disable */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default async () => {
  const { error, count } = await supabase
    .from("verifications")
    .select("id", { count: "exact", head: true });

  if (error) return new Response(`ERROR: ${error.message}`, { status: 500 });
  return new Response(`ok - rows=${count ?? 0}`, { status: 200 });
};
