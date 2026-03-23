"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type GoodName = "Neon Dust" | "Cloud Chips" | "Nova Pills";

interface Good {
  name: GoodName;
  minPrice: number;
  maxPrice: number;
}

interface GameState {
  cash: number;
  day: number;
  inventory: Record<GoodName, number>;
  prices: Record<GoodName, number>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const GOODS: Good[] = [
  { name: "Neon Dust",   minPrice: 10,  maxPrice: 100  },
  { name: "Cloud Chips", minPrice: 50,  maxPrice: 400  },
  { name: "Nova Pills",  minPrice: 200, maxPrice: 1500 },
];

const STARTING_CASH = 1000;
const MAX_DAYS = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomPrice(good: Good): number {
  return Math.floor(Math.random() * (good.maxPrice - good.minPrice + 1)) + good.minPrice;
}

function generatePrices(): Record<GoodName, number> {
  return Object.fromEntries(
    GOODS.map((g) => [g.name, randomPrice(g)])
  ) as Record<GoodName, number>;
}

function initialState(): GameState {
  return {
    cash: STARTING_CASH,
    day: 1,
    inventory: { "Neon Dust": 0, "Cloud Chips": 0, "Nova Pills": 0 },
    prices: generatePrices(),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MarketWarsPage() {
  const [game, setGame] = useState<GameState>(initialState);
  const [message, setMessage] = useState<string>("");

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  const buy = useCallback((good: GoodName) => {
    setGame((prev) => {
      const price = prev.prices[good];
      if (prev.cash < price) {
        notify("Not enough cash.");
        return prev;
      }
      return {
        ...prev,
        cash: prev.cash - price,
        inventory: { ...prev.inventory, [good]: prev.inventory[good] + 1 },
      };
    });
  }, []);

  const sell = useCallback((good: GoodName) => {
    setGame((prev) => {
      if (prev.inventory[good] === 0) {
        notify("Nothing to sell.");
        return prev;
      }
      const price = prev.prices[good];
      return {
        ...prev,
        cash: prev.cash + price,
        inventory: { ...prev.inventory, [good]: prev.inventory[good] - 1 },
      };
    });
  }, []);

  const nextDay = useCallback(() => {
    setGame((prev) => {
      if (prev.day >= MAX_DAYS) return prev;
      return {
        ...prev,
        day: prev.day + 1,
        prices: generatePrices(),
      };
    });
  }, []);

  const reset = useCallback(() => {
    setGame(initialState());
    setMessage("");
  }, []);

  const isGameOver = game.day >= MAX_DAYS;
  const netWorth = game.cash + GOODS.reduce((sum, g) => sum + g.minPrice * game.inventory[g.name], 0);

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Market Wars</h1>

      {/* Status bar */}
      <div style={styles.statusBar}>
        <span>Day <strong>{game.day}</strong> / {MAX_DAYS}</span>
        <span>Cash: <strong>${game.cash.toLocaleString()}</strong></span>
        <span>Net Worth: <strong>${netWorth.toLocaleString()}</strong></span>
      </div>

      {/* Notification */}
      {message && <div style={styles.notice}>{message}</div>}

      {/* Game over screen */}
      {isGameOver ? (
        <div style={styles.gameOver}>
          <h2>Game Over</h2>
          <p>Final cash: <strong>${game.cash.toLocaleString()}</strong></p>
          <p>Net worth: <strong>${netWorth.toLocaleString()}</strong></p>
          <button style={styles.btn} onClick={reset}>Play Again</button>
        </div>
      ) : (
        <>
          {/* Market table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Good</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Held</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {GOODS.map((good) => (
                <tr key={good.name}>
                  <td style={styles.td}>{good.name}</td>
                  <td style={styles.td}>${game.prices[good.name].toLocaleString()}</td>
                  <td style={styles.td}>{game.inventory[good.name]}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.btn}
                      onClick={() => buy(good.name)}
                      disabled={game.cash < game.prices[good.name]}
                    >
                      Buy
                    </button>{" "}
                    <button
                      style={{ ...styles.btn, ...styles.btnSell }}
                      onClick={() => sell(good.name)}
                      disabled={game.inventory[good.name] === 0}
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Inventory summary */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Inventory</h2>
            {GOODS.map((good) => (
              <div key={good.name} style={styles.invRow}>
                <span>{good.name}</span>
                <span>{game.inventory[good.name]} units</span>
              </div>
            ))}
          </div>

          {/* Advance day */}
          <button style={{ ...styles.btn, ...styles.btnNext }} onClick={nextDay}>
            Next Day →
          </button>
        </>
      )}
    </main>
  );
}

// ─── Inline styles (no external CSS needed) ───────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 600,
    margin: "40px auto",
    fontFamily: "monospace",
    padding: "0 16px",
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  statusBar: {
    display: "flex",
    gap: 24,
    padding: "8px 0",
    borderBottom: "1px solid #ccc",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  notice: {
    background: "#fef3cd",
    border: "1px solid #f0c36d",
    borderRadius: 4,
    padding: "6px 12px",
    marginBottom: 12,
    fontSize: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 24,
  },
  th: {
    textAlign: "left",
    borderBottom: "2px solid #333",
    padding: "6px 8px",
  },
  td: {
    padding: "8px 8px",
    borderBottom: "1px solid #ddd",
  },
  btn: {
    padding: "4px 12px",
    cursor: "pointer",
    background: "#222",
    color: "#fff",
    border: "none",
    borderRadius: 3,
    fontFamily: "monospace",
    fontSize: 13,
  },
  btnSell: {
    background: "#555",
  },
  btnNext: {
    marginTop: 8,
    padding: "8px 20px",
    fontSize: 15,
    background: "#0070f3",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    borderBottom: "1px solid #ccc",
    paddingBottom: 4,
  },
  invRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "3px 0",
    fontSize: 14,
  },
  gameOver: {
    textAlign: "center",
    padding: "40px 0",
  },
};
