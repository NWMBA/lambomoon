"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  source: string;
};

export default function NewsTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        const data = await response.json();
        setItems(data.items || []);
      } catch {}
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const content = items.length
    ? items
    : [{ title: "Loading discovery news…", link: "#", source: "LamboMoon" }];

  return (
    <div className="w-full py-3 bg-card/50 border-b border-border/40 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <div className="shrink-0 text-xs font-semibold uppercase tracking-wide text-primary">News</div>
        <div className="relative overflow-hidden w-full">
          <div className="flex gap-8 whitespace-nowrap animate-[ticker_40s_linear_infinite] min-w-max">
            {[...content, ...content].map((item, index) => (
              <a
                key={`${item.title}-${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <span className="text-primary">•</span>
                <span>{item.title}</span>
                <span className="text-xs text-primary/80">[{item.source}]</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
