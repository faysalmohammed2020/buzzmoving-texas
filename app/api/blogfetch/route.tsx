// app/api/blogfetch/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import sanitizeHtml from "sanitize-html";
import { load, CheerioAPI, Element } from "cheerio";

// --- helper: wrap orphan cells/rows into proper tables ---
function normalizeTables(rawHtml: string) {
  const $ = load(rawHtml, { decodeEntities: false });

  // 1) Wrap any <td>/<th> not inside a <tr> into a <tr>
  $("td, th").each((_, el) => {
    const $el = $(el);
    if ($el.closest("tr").length === 0) {
      const $tr = $("<tr></tr>");
      $el.replaceWith($tr.append($el));
    }
  });

  // 2) For each container that has <tr> not inside a <table>, group siblings into a table
  //    We'll scan all <tr> that are outside any table, then group consecutive ones per parent.
  const orphanTrs = $("tr").filter((_, el) => $(el).closest("table").length === 0);

  orphanTrs.each((_, el) => {
    const $tr = $(el);

    // if already processed (wrapped) skip
    if ($tr.parent().is("tbody") && $tr.closest("table").length) return;

    // group consecutive <tr> siblings under same parent (before/after)
    const parent = $tr.parent();
    const group: Element[] = [];
    // move backward to include previous consecutive trs
    let start = $tr;
    while (start.prev().is("tr") && start.prev().closest("table").length === 0) {
      start = start.prev();
    }
    // from start, collect consecutive trs
    let cur = start;
    while (cur.is("tr") && cur.closest("table").length === 0) {
      group.push(cur.get(0));
      const next = cur.next();
      if (!next.is("tr") || next.closest("table").length !== 0) break;
      cur = next;
    }

    // create table wrapper
    const $table = $('<table></table>');
    const $tbody = $('<tbody></tbody>');
    $table.append($tbody);

    // insert wrapper before first tr in group, then move all trs inside
    (group.length ? $(group[0]) : $tr).before($table);
    group.forEach((node) => {
      $tbody.append($(node)); // moves the node
    });

    // if parent became empty & was just a wrapper div/p/section with nothing else, it's fine to leave it
  });

  // 3) Also: Some people put cells directly inside <p> or <div>. If a single <tr> exists inside a <p>, above logic already wrapped.

  return $.html();
}

function sanitizeKeepTables(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption"
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      "*": ["colspan", "rowspan", "style", "class"]
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");

    const filters: any = {};
    if (category) filters.category = category;
    if (authorId) filters.post_author = parseInt(authorId);

    const blogPosts = await prisma.blogPost.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        post_title: true,
        post_content: true,
        category: true,
        tags: true,
        post_status: true,
        createdAt: true,
      },
    });

    const normalized = blogPosts.map((p) => {
      const raw = String(p.post_content ?? "");
      const withTables = normalizeTables(raw);
      const safe = sanitizeKeepTables(withTables);
      return { ...p, post_content: safe };
    });

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts." }, { status: 500 });
  }
}
