import { NextResponse } from "next/server"
import { getSkillTitles } from "@/lib/simple-icons-cache"

export async function GET() {
  try {
    const skills = await getSkillTitles()
    return NextResponse.json({ skills }, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("[API /skills]", err)
    return NextResponse.json(
      { error: "Failed to load skills", skills: [] },
      { status: 500 }
    )
  }
}
