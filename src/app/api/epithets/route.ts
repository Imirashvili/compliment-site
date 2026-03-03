import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("epithets")
    .select("text")
    .limit(800);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const epithets = (data ?? [])
    .map((x) => x.text)
    .filter(Boolean);

  return NextResponse.json({ epithets });
}