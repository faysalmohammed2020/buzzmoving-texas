import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // তোমার prisma client path

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slug = body.slug || "home";

  const row = await prisma.visitCounter.upsert({
    where: { slug },
    update: { count: { increment: 1 } },
    create: { slug, count: 1 },
  });

  return NextResponse.json({ ok: true, count: row.count });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "home";

  const row = await prisma.visitCounter.findUnique({ where: { slug } });
  return NextResponse.json({ count: row?.count || 0 });
}
