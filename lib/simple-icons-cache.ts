/**
 * Fetches and parses Simple Icons slugs.md to build skill→slug map and title list.
 * Cached in memory after first load.
 */

const SLUGS_MD_URL =
  "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/slugs.md"

function normalizeForLookup(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\./g, "dot")
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/\//g, "")
}

let cachedMap: Record<string, string> | null = null
let cachedTitles: string[] | null = null

async function fetchAndParse(): Promise<{
  map: Record<string, string>
  titles: string[]
}> {
  if (cachedMap && cachedTitles) return { map: cachedMap, titles: cachedTitles }

  const res = await fetch(SLUGS_MD_URL, {
    headers: { "User-Agent": "GitHub-Streak-Card/1.0" },
  })
  if (!res.ok) throw new Error("Failed to fetch Simple Icons slugs")
  const text = await res.text()

  const map: Record<string, string> = {}
  const titles: string[] = []
  const seenTitles = new Set<string>()

  const lineRe = /^\|\s*`([^`]*)`\s*\|\s*`([^`]*)`\s*\|/
  for (const line of text.split("\n")) {
    const m = line.match(lineRe)
    if (!m) continue
    const name = m[1].trim()
    const slug = m[2].trim()
    if (!name || !slug) continue

    const key = normalizeForLookup(name)
    map[key] = slug
    map[slug] = slug
    if (!seenTitles.has(name)) {
      seenTitles.add(name)
      titles.push(name)
    }
  }

  if (titles.length === 0) throw new Error("No skills parsed from Simple Icons slugs")
  titles.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
  cachedMap = map
  cachedTitles = titles
  return { map, titles }
}

export async function getSkillToSlugMap(): Promise<Record<string, string>> {
  const { map } = await fetchAndParse()
  return map
}

export async function getSkillTitles(): Promise<string[]> {
  const { titles } = await fetchAndParse()
  return titles
}
