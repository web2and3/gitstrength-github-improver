import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"

export const dynamic = "force-dynamic"
export const revalidate = 0

/** In-memory counter. Resets on cold start in serverless; for production consider Redis/KV. */
const store = new Map<string, number>()

const WEB2AND3_KEY = "web2and3"
const WEB2AND3_INITIAL = 9811
const LOCAL_BACKGROUND_PATH = path.join(process.cwd(), "public", "back.gif")

const MIN_DIGITS = 7
const DIGIT_WIDTH = 36
const ROW_GAP = 4
const PADDING_LEFT = 40
const PADDING_RIGHT = 12
const PADDING_TOP_BOTTOM = 10
const OUTER_PADDING = 12
const BORDER_STROKE = 2
const BORDER_RADIUS = 8

const ROW_SMALL_HEIGHT = 32
const ROW_CURRENT_HEIGHT = 52
const FONT_SMALL = 22
const FONT_CURRENT = 38
const LABEL_GAP = 8
const LABEL_FONT_SIZE = 20

function defaultTheme() {
  return {
    panelColor: "#1e1e1e",
    textColor: "#ffffff",
    labelColor: "#22f374",
    lastDigitColor: "#dc2626",
    borderColor: "#30363d",
    dividerColor: "#0a0a0a",
    backgroundColor: "#1a1b27",
  }
}

function parseTheme(themeParam: string | null) {
  if (!themeParam) return defaultTheme()
  try {
    const t = JSON.parse(decodeURIComponent(themeParam)) as Record<string, string>
    return {
      panelColor: t.panelColor ?? defaultTheme().panelColor,
      textColor: t.textColor ?? defaultTheme().textColor,
      labelColor: t.labelColor ?? defaultTheme().labelColor,
      lastDigitColor: t.lastDigitColor ?? defaultTheme().lastDigitColor,
      borderColor: t.borderColor ?? defaultTheme().borderColor,
      dividerColor: t.dividerColor ?? defaultTheme().dividerColor,
      backgroundColor: t.backgroundColor ?? defaultTheme().backgroundColor,
    }
  } catch {
    return defaultTheme()
  }
}

/** Renders a single digit cell at (0,0) in local coords: background + digit. rowHeight for prev/next vs current. */
function renderDigitCell(
  digit: string,
  isLast: boolean,
  theme: { panelColor: string; textColor: string; lastDigitColor: string },
  fontClass: string,
  rowHeight: number
): string {
  const fill = isLast ? theme.lastDigitColor : theme.panelColor
  return `<rect x="0" y="0" width="${DIGIT_WIDTH}" height="${rowHeight}" fill="${fill}" rx="${BORDER_RADIUS}"/>
<text class="${fontClass}" x="${DIGIT_WIDTH / 2}" y="${rowHeight / 2}" fill="${theme.textColor}">${escapeXml(digit)}</text>`
}

/** Three rows: prev (small), current (big center), next (small). Optional border, padding, background, animate. */
function svg(
  prev: number,
  current: number,
  next: number,
  theme: ReturnType<typeof parseTheme>,
  options?: { backgroundDataUrl?: string; animateFromPrev?: boolean }
): string {
  const { panelColor, textColor, labelColor, lastDigitColor, borderColor, backgroundColor } = theme
  const prevStr = String(prev).padStart(MIN_DIGITS, "0")
  const currentStr = String(current).padStart(MIN_DIGITS, "0")
  const nextStr = String(next).padStart(MIN_DIGITS, "0")
  const prevMinus1Str = String(Math.max(0, prev - 1)).padStart(MIN_DIGITS, "0")

  const digitsWidth = MIN_DIGITS * DIGIT_WIDTH
  const labelWidth = 90
  const totalWidth = digitsWidth + labelWidth + PADDING_LEFT + PADDING_RIGHT
  const totalHeight =
    ROW_SMALL_HEIGHT + ROW_GAP + ROW_CURRENT_HEIGHT + ROW_GAP + ROW_SMALL_HEIGHT + PADDING_TOP_BOTTOM * 2

  const fullWidth = totalWidth + 2 * OUTER_PADDING + 2 * BORDER_STROKE
  const fullHeight = totalHeight + 2 * OUTER_PADDING + 2 * BORDER_STROKE
  const contentOffset = OUTER_PADDING + BORDER_STROKE

  const baseX = PADDING_LEFT
  let y = PADDING_TOP_BOTTOM

  const clipPathId = "visitorCountClip"
  const digitCellClipId = "digitCellClip"
  const digitCellClipSmallId = "digitCellClipSmall"
  const animateFromPrev = Boolean(options?.animateFromPrev)
  const defs = `<defs>
    <clipPath id="${clipPathId}">
      <rect x="0" y="0" width="${fullWidth}" height="${fullHeight}" rx="${BORDER_RADIUS}" ry="${BORDER_RADIUS}"/>
    </clipPath>
    ${animateFromPrev ? `<clipPath id="${digitCellClipId}"><rect x="0" y="0" width="${DIGIT_WIDTH}" height="${ROW_CURRENT_HEIGHT}"/></clipPath><clipPath id="${digitCellClipSmallId}"><rect x="0" y="0" width="${DIGIT_WIDTH}" height="${ROW_SMALL_HEIGHT}"/></clipPath>` : ""}
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#000" flood-opacity="0.35"/>
    </filter>
    <style>
      .digit-small { font-family: ui-monospace, "SF Mono", monospace; font-size: ${FONT_SMALL}px; font-weight: 700; text-anchor: middle; dominant-baseline: middle; }
      .digit-current { font-family: ui-monospace, "SF Mono", monospace; font-size: ${FONT_CURRENT}px; font-weight: 700; text-anchor: middle; dominant-baseline: middle; }
      .label-visitors { font-family: ui-sans-serif, system-ui, sans-serif; font-size: ${LABEL_FONT_SIZE}px; font-weight: 600; text-anchor: start; dominant-baseline: middle; }
    </style>
  </defs>`

  const hasBgImage = Boolean(options?.backgroundDataUrl)
  const bgColorRect = `<rect x="0" y="0" width="${fullWidth}" height="${fullHeight}" rx="${BORDER_RADIUS}" ry="${BORDER_RADIUS}" fill="${escapeXml(backgroundColor)}"${hasBgImage ? ' fill-opacity="0.7"' : ""}/>`
  const bgImageLayer = options?.backgroundDataUrl
    ? `<image href="${escapeXml(options.backgroundDataUrl)}" x="0" y="0" width="${fullWidth}" height="${fullHeight}" preserveAspectRatio="xMidYMid slice"/>`
    : ""
  const backgroundLayer = `<g clip-path="url(#${clipPathId})">${bgImageLayer}${bgColorRect}</g>`
  const borderRect = `<rect x="${BORDER_STROKE / 2}" y="${BORDER_STROKE / 2}" width="${fullWidth - BORDER_STROKE}" height="${fullHeight - BORDER_STROKE}" fill="none" stroke="${escapeXml(borderColor)}" stroke-width="${BORDER_STROKE}" rx="${BORDER_RADIUS}" ry="${BORDER_RADIUS}"/>`

  function renderRow(
    valueStr: string,
    rowHeight: number,
    fontClass: string,
    digitFill: string,
    digitOpacity: number,
    addVisitorsLabel: boolean
  ): string {
    let html = ""
    const rowY = y
    html += `<rect x="${baseX}" y="${rowY}" width="${digitsWidth}" height="${rowHeight}" fill="${panelColor}" filter="url(#shadow)" rx="${BORDER_RADIUS}"/>`
    const digits = valueStr.split("")
    for (let i = 0; i < digits.length; i++) {
      const isLast = i === digits.length - 1
      const dx = baseX + i * DIGIT_WIDTH
      if (isLast) {
        html += `<rect x="${dx}" y="${rowY}" width="${DIGIT_WIDTH}" height="${rowHeight}" fill="${lastDigitColor}" rx="${BORDER_RADIUS}"/>`
      }
      const textX = dx + DIGIT_WIDTH / 2
      const textY = rowY + rowHeight / 2
      html += `<text class="${fontClass}" x="${textX}" y="${textY}" fill="${digitFill}" opacity="${digitOpacity}">${escapeXml(digits[i] ?? "0")}</text>`
    }
    if (addVisitorsLabel) {
      const labelX = baseX + digitsWidth + LABEL_GAP
      const labelY = rowY + rowHeight / 2
      html += `<text class="label-visitors" x="${labelX}" y="${labelY}" fill="${labelColor}">Visitors</text>`
    }
    y += rowHeight + ROW_GAP
    return html
  }

  /** Renders one row with per-digit flip from fromStr to toStr. Used for prev, current, next when animateFromPrev. */
  function renderRowWithFlip(
    fromStr: string,
    toStr: string,
    rowY: number,
    rowHeight: number,
    fontClass: string,
    clipId: string,
    addLabel: boolean
  ): string {
    let html = ""
    html += `<rect x="${baseX}" y="${rowY}" width="${digitsWidth}" height="${rowHeight}" fill="${panelColor}" filter="url(#shadow)" rx="${BORDER_RADIUS}"/>`
    html += `<rect x="${baseX + (MIN_DIGITS - 1) * DIGIT_WIDTH}" y="${rowY}" width="${DIGIT_WIDTH}" height="${rowHeight}" fill="${lastDigitColor}" rx="${BORDER_RADIUS}"/>`
    for (let i = 0; i < MIN_DIGITS; i++) {
      const dx = baseX + i * DIGIT_WIDTH
      const isLast = i === MIN_DIGITS - 1
      if (fromStr[i] !== toStr[i]) {
        const cellFrom = renderDigitCell(fromStr[i] ?? "0", isLast, rowTheme, fontClass, rowHeight)
        const cellTo = renderDigitCell(toStr[i] ?? "0", isLast, rowTheme, fontClass, rowHeight)
        const slideContent = cellFrom + `<g transform="translate(0, ${rowHeight})">${cellTo}</g>`
        const beginSec = (MIN_DIGITS - 1 - i) * 0.12
        html += `<g transform="translate(${dx}, ${rowY})"><g clip-path="url(#${clipId})"><g transform="translate(0,0)"><animateTransform attributeName="transform" type="translate" from="0 0" to="0 -${rowHeight}" dur="0.4s" begin="${beginSec}s" fill="freeze"/>${slideContent}</g></g></g>`
      } else {
        html += `<text class="${fontClass}" x="${dx + DIGIT_WIDTH / 2}" y="${rowY + rowHeight / 2}" fill="${textColor}">${escapeXml(toStr[i] ?? "0")}</text>`
      }
    }
    if (addLabel) {
      html += `<text class="label-visitors" x="${baseX + digitsWidth + LABEL_GAP}" y="${rowY + rowHeight / 2}" fill="${labelColor}">Visitors</text>`
    }
    return html
  }

  const rowTheme = { panelColor, textColor, labelColor, lastDigitColor }
  let body = ""
  if (animateFromPrev) {
    body += renderRowWithFlip(prevMinus1Str, prevStr, y, ROW_SMALL_HEIGHT, "digit-small", digitCellClipSmallId, false)
    y += ROW_SMALL_HEIGHT + ROW_GAP
    body += renderRowWithFlip(prevStr, currentStr, y, ROW_CURRENT_HEIGHT, "digit-current", digitCellClipId, true)
    y += ROW_CURRENT_HEIGHT + ROW_GAP
    body += renderRowWithFlip(currentStr, nextStr, y, ROW_SMALL_HEIGHT, "digit-small", digitCellClipSmallId, false)
    y += ROW_SMALL_HEIGHT + ROW_GAP
  } else {
    body += renderRow(prevStr, ROW_SMALL_HEIGHT, "digit-small", textColor, 0.4, false)
    body += renderRow(currentStr, ROW_CURRENT_HEIGHT, "digit-current", textColor, 1, true)
    body += renderRow(nextStr, ROW_SMALL_HEIGHT, "digit-small", textColor, 1, false)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${fullWidth}" height="${fullHeight}" viewBox="0 0 ${fullWidth} ${fullHeight}">
${defs}
${backgroundLayer}
${borderRect}
<g transform="translate(${contentOffset}, ${contentOffset})">${body}</g>
</svg>`
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Visitor counter for GitHub README: each time the image is loaded (e.g. someone
 * visits your profile and the README renders), the count increments. Preview
 * requests (t= or preview=1) do not increment.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get("key")?.trim() || searchParams.get("username")?.trim()
  const themeParam = searchParams.get("theme")
  const preview = searchParams.get("preview") === "1" || searchParams.get("t") != null

  if (!key) {
    return new NextResponse("Query param 'key' (or 'username') is required", { status: 400 })
  }

  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64) || "default"
  const isWeb2and3 = safeKey === WEB2AND3_KEY
  const defaultValue = isWeb2and3 ? WEB2AND3_INITIAL - 1 : 0

  let prev: number
  let current: number
  if (preview) {
    current = store.get(safeKey) ?? (isWeb2and3 ? WEB2AND3_INITIAL : 0)
    prev = Math.max(0, current - 1)
  } else {
    prev = store.get(safeKey) ?? defaultValue
    current = prev + 1
    store.set(safeKey, current)
  }
  const next = current + 1

  let backgroundDataUrl: string | undefined
  if (isWeb2and3) {
    try {
      const buf = await readFile(LOCAL_BACKGROUND_PATH)
      backgroundDataUrl = `data:image/gif;base64,${(buf as Buffer).toString("base64")}`
    } catch {
      // no back.gif in public/; render without background
    }
  }

  const theme = parseTheme(themeParam)
  const body = svg(prev, current, next, theme, {
    backgroundDataUrl,
    animateFromPrev: !preview,
  })

  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, private",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
