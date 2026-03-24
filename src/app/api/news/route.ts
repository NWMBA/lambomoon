import { NextResponse } from "next/server";

const FEEDS = [
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { name: "Decrypt", url: "https://decrypt.co/feed" },
];

function decodeEntities(text: string) {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseRss(xml: string, source: string) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 10);
  return items.map((match) => {
    const block = match[1];
    const title = decodeEntities(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "Untitled");
    const link = decodeEntities(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "#");
    const pubDate = decodeEntities(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "");
    return { title, link, source, pubDate };
  });
}

export async function GET() {
  try {
    const allItems = [] as Array<{ title: string; link: string; source: string; pubDate: string }>;

    for (const feed of FEEDS) {
      try {
        const response = await fetch(feed.url, { next: { revalidate: 1800 } });
        if (!response.ok) continue;
        const xml = await response.text();
        allItems.push(...parseRss(xml, feed.name));
      } catch {}
    }

    const deduped = Array.from(
      new Map(allItems.map((item) => [item.title.toLowerCase(), item])).values()
    ).slice(0, 20);

    return NextResponse.json({ generated_at: new Date().toISOString(), items: deduped });
  } catch (error) {
    return NextResponse.json({ generated_at: new Date().toISOString(), items: [] }, { status: 200 });
  }
}
