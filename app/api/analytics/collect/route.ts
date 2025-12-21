import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safeStr(v: unknown, max = 500) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

function getClientIp(req: Request) {
  // Vercel / proxies
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  // fallback headers
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

async function geoLookup(ip: string) {
  // 1) DB cache first
  const cached = await prisma.geoIpCache.findUnique({ where: { ip } });
  if (cached) return cached;

  // 2) ip-api lookup (HTTP)
  // Use fields to minimize payload
  const fields = [
    "status",
    "message",
    "country",
    "city",
    "regionName",
    "lat",
    "lon",
    "isp",
    "query",
  ].join(",");

  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${encodeURIComponent(
    fields
  )}`;

  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as any;

  if (json?.status !== "success") {
    // store negative cache lightly (optional). For now return null.
    return null;
  }

  const created = await prisma.geoIpCache.create({
    data: {
      ip,
      country: typeof json.country === "string" ? json.country : null,
      city: typeof json.city === "string" ? json.city : null,
      region: typeof json.regionName === "string" ? json.regionName : null,
      lat: typeof json.lat === "number" ? json.lat : null,
      lon: typeof json.lon === "number" ? json.lon : null,
      isp: typeof json.isp === "string" ? json.isp : null,
    },
  });

  return created;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const event = safeStr(body?.event, 50);
    if (!event || !["session_start", "page_view", "heartbeat"].includes(event)) {
      return NextResponse.json({ ok: false, error: "Invalid event" }, { status: 400 });
    }

    const visitorId = safeStr(body?.visitorId, 100);
    const sessionId = safeStr(body?.sessionId, 100);
    if (!visitorId || !sessionId) {
      return NextResponse.json({ ok: false, error: "Missing ids" }, { status: 400 });
    }

    const tsNum = typeof body?.ts === "number" ? body.ts : Date.now();
    const ts = new Date(tsNum);

    const path = safeStr(body?.page?.path, 1000) ?? "/";
    const title = safeStr(body?.page?.title, 300);
    const referrer = safeStr(body?.page?.referrer, 1000);

    const utmSource = safeStr(body?.utm?.source, 120);
    const utmMedium = safeStr(body?.utm?.medium, 120);
    const utmCampaign = safeStr(body?.utm?.campaign, 120);

    const deviceType = safeStr(body?.device?.type, 50);
    const browser = safeStr(body?.device?.browser, 80);
    const os = safeStr(body?.device?.os, 80);
    const screen = safeStr(body?.device?.screen, 50);
    const lang = safeStr(body?.device?.lang, 30);

    const activeSeconds =
      event === "heartbeat" && typeof body?.engagement?.activeSeconds === "number"
        ? Math.max(0, Math.min(60, Math.floor(body.engagement.activeSeconds)))
        : 0;

    const userId = safeStr(body?.userId, 100);

    // ✅ Geo only for page_view/session_start (NOT heartbeat)
    let country: string | null = null;
    let city: string | null = null;

    if (event !== "heartbeat") {
      const ip = getClientIp(req);
      // avoid local/private ips
      if (ip && !ip.startsWith("127.") && ip !== "::1") {
        const geo = await geoLookup(ip);
        country = geo?.country ?? null;
        city = geo?.city ?? null;
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        ts,
        event: event as any,
        visitorId,
        sessionId,
        userId: userId ?? null,
        path,
        title,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        deviceType,
        browser,
        os,
        screen,
        lang,
        activeSeconds,
        country,
        city,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
