import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("compliments")
    .select("text");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ text: "Ты самая прекрасная" });
  }

  const pick = data[Math.floor(Math.random() * data.length)]!;
  return NextResponse.json({ text: pick.text });
}