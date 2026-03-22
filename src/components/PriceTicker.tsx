"use client";

import { useState, useEffect } from "react";

interface PriceData {
  usd: number;
  usd_24h_change: number;
}

interface CryptoPrices {
  bitcoin: PriceData;
  ethereum: PriceData;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";

export default function PriceTicker() {
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const response = await fetch(COINGECKO_API);
      if (!response.ok) throw new Error("Failed to fetch prices");
      const data = await response.json();
      setPrices(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching crypto prices:", err);
      setError("Failed to load prices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price >= 100 ? 2 : price >= 1 ? 2 : 4,
      maximumFractionDigits: price >= 100 ? 2 : price >= 1 ? 2 : 4,
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const cryptoData = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "from-orange-500 to-yellow-500" },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "from-purple-500 to-blue-500" },
  ];

  if (loading && !prices) {
    return (
      <div className="w-full py-3 bg-card/50 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 animate-pulse" />
              <span className="text-muted-foreground">Loading prices...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-3 bg-card/50 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {error ? (
            <span className="text-muted-foreground text-sm">{error}</span>
          ) : (
            cryptoData.map((crypto) => {
              const priceData = prices?.[crypto.id as keyof CryptoPrices];
              const price = priceData?.usd ?? 0;
              const change = priceData?.usd_24h_change ?? 0;
              const isPositive = change >= 0;

              return (
                <div
                  key={crypto.id}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-background/60 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${crypto.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                    {crypto.symbol.slice(0, 1)}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">{crypto.symbol}</span>
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(price)}
                    </span>
                  </div>

                  {/* Change */}
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                      isPositive
                        ? "text-green-400 bg-green-500/10"
                        : "text-red-400 bg-red-500/10"
                    }`}
                  >
                    <span className="text-lg leading-none">
                      {isPositive ? "▲" : "▼"}
                    </span>
                    {formatChange(change)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}