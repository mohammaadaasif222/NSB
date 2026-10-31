// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/BetDashboard.jsx. Original types/imports preserved; adapted for rlk-frontend.
import React, { useEffect, useState } from "react";
import { Trophy, Zap, Crown, Target, Clock, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/originalsAuthBridge";
import { useSocket } from "../../context/SocketContext";
import { getBetsApi } from "@/services/originals";
const chipsign = "/assets/img/chipsign.png";
const dimondsign = "/assets/img/walletDimondIcon.png";

const formatAmount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeCurrency = (raw) => {
  const v = String(raw || "").toLowerCase();
  return v === "diamonds" || v === "diamond" ? "diamonds" : "chips";
};

const mapBetRow = (raw) => {
  const game = raw?.gameName || raw?.game || "—";
  const username = raw?.userName || raw?.username || "Hidden";
  const time = formatTime(raw?.createdAt);
  const betAmountNum = Number(raw?.betAmount ?? 0);
  const payoutNum = Number(raw?.totalWin ?? 0);
  const multiplierNum = Number(raw?.multiplier ?? 0);
  const isWin = payoutNum > 0;
  return {
    _id: raw?._id || `${raw?.userId || ""}-${raw?.createdAt || Date.now()}`,
    userId: raw?.userId || null,
    game,
    username,
    time,
    betAmount: formatAmount(betAmountNum),
    multiplier: `${multiplierNum.toFixed(2)}x`,
    payout: formatAmount(payoutNum),
    currency: normalizeCurrency(raw?.playCurrency),
    isWin,
  };
};

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  return response?.data || response?.results || [];
};

const highRollersData = [
  {
    game: "VIP Always 6 Black...",
    username: "WhaleKing",
    time: "7:02 PM",
    multiplier: "3.45x",
    payout: "$12,500.00",
    isWin: true,
    betAmount: "$3,623.18",
  },
  {
    game: "Sweet Rush Bonanza",
    username: "HighStakes",
    time: "6:58 PM",
    multiplier: "2.10x",
    payout: "$8,400.00",
    isWin: true,
    betAmount: "$4,000.00",
  },
  {
    game: "Blackjack",
    username: "RiskTaker",
    time: "6:54 PM",
    multiplier: "1.50x",
    payout: "$6,750.00",
    isWin: true,
    betAmount: "$4,500.00",
  },
  {
    game: "Bee Keeper",
    username: "LuckyStrike",
    time: "6:48 PM",
    multiplier: "0.00x",
    payout: "$0.00",
    isWin: false,
    betAmount: "$5,000.00",
  },
  {
    game: "Sweet Rush Bonanza",
    username: "BetMaster",
    time: "6:42 PM",
    multiplier: "1.85x",
    payout: "$5,180.00",
    isWin: true,
    betAmount: "$2,800.00",
  },
];

const tabIcons = {
  "My Bets": Target,
  "Latest Bets": Zap,
  "High Rollovers": Crown,
  "Race Leader Board": Trophy,
};

const CurrencyIcon = ({ currency = "chips", size = 18 }) => (
  <img
    src={currency === "diamonds" ? dimondsign : chipsign}
    alt={currency}
    width={size}
    height={size}
    className="inline-block shrink-0 object-contain"
    style={{ width: size, height: size }}
  />
);

const BetTableColGroup = () => (
  <colgroup>
    <col style={{ width: "26%" }} />
    <col style={{ width: "18%" }} />
    <col style={{ width: "12%" }} />
    <col style={{ width: "16%" }} />
    <col style={{ width: "12%" }} />
    <col style={{ width: "16%" }} />
  </colgroup>
);

const BetTable = ({ data, headerRowClass, headerCellClass, rowClass }) => (
  <table className="w-full min-w-[900px] table-fixed border-separate border-spacing-0">
    <BetTableColGroup />
    <thead>
      <tr className={headerRowClass}>
        <th className={`${headerCellClass}`}>Game</th>
        <th className={`${headerCellClass}`}>Username</th>
        <th className={`${headerCellClass}`}>Time</th>
        <th className={`${headerCellClass} text-right`}>Bet Amount</th>
        <th className={`${headerCellClass} text-right`}>Multiplier</th>
        <th className={`${headerCellClass} text-right`}>Payout</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, index) => {
        const accent = item.isWin ? "text-[#5DFF00]" : "text-[#8B73D8]";
        return (
          <tr key={item._id || index} className={rowClass}>
            <td className="px-5 py-4">
              <span
                title={item.game}
                className="block truncate text-sm font-semibold tracking-tight text-white md:text-[15px]"
              >
                {item.game}
              </span>
            </td>
            <td className="px-5 py-4">
              <span
                title={item.username}
                className={`block truncate text-sm font-medium tracking-tight ${
                  item.username === "Hidden"
                    ? "text-[#7A6FB8] italic"
                    : "text-[#CFC8FF]"
                }`}
              >
                {item.username}
              </span>
            </td>
            <td className="px-5 py-4 truncate text-sm font-medium tabular-nums text-[#B3A9E5]">
              {item.time}
            </td>
            <td className="px-5 py-4 text-right">
              <div className="flex items-center justify-end gap-2 overflow-hidden">
                <span className="truncate text-sm font-semibold tabular-nums text-white">
                  {item.betAmount}
                </span>
                <CurrencyIcon currency={item.currency} />
              </div>
            </td>
            <td
              className={`px-5 py-4 truncate text-right text-sm font-bold tabular-nums ${accent}`}
            >
              {item.multiplier}
            </td>
            <td className={`px-5 py-4 text-right text-sm font-bold tabular-nums ${accent}`}>
              <div className="flex items-center justify-end gap-2 overflow-hidden">
                <span className="truncate">{item.payout}</span>
                <CurrencyIcon currency={item.currency} />
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="flex items-center justify-between px-5 pt-5 pb-3">
    <div>
      <h3 className="text-base font-bold tracking-wide text-white md:text-lg">
        {title}
      </h3>
      <p className="text-xs text-[#8C82C7]">{subtitle}</p>
    </div>
    <div className="hidden items-center gap-2 rounded-full bg-[#0F1233] px-3 py-1.5 ring-1 ring-[#2A2658] md:flex">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#5DFF00]" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B3A9E5]">
        Live
      </span>
    </div>
  </div>
);

const StatusPanel = ({ icon: Icon, title, subtitle, spin = false }) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B1A45] ring-1 ring-[#2A2658]">
      <Icon size={26} className={`text-[#8A5CFF] ${spin ? "animate-spin" : ""}`} />
    </div>
    <h4 className="mb-1 text-base font-bold tracking-tight text-white">
      {title}
    </h4>
    {subtitle && <p className="text-sm text-[#B3A9E5]">{subtitle}</p>}
  </div>
);

export default function CasinoTable() {
  const { user } = useAuth() || {};
  const { socketRef } = useSocket() || {};
  const isLoggedIn = !!user?._id;
  const [activeTab, setActiveTab] = useState(isLoggedIn ? "My Bets" : "Latest Bets");

  const [myBets, setMyBets] = useState([]);
  const [latestBets, setLatestBets] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [errorMy, setErrorMy] = useState(null);
  const [errorLatest, setErrorLatest] = useState(null);
  const [limit, setLimit] = useState(20);

  const tabs = isLoggedIn
    ? ["My Bets", "Latest Bets", "High Rollovers", "Race Leader Board"]
    : ["Latest Bets"];
  const limitOptions = [10, 20, 30, 50, 75, 100];

  useEffect(() => {
    if (!isLoggedIn && activeTab !== "Latest Bets") {
      setActiveTab("Latest Bets");
    }
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "My Bets") return;
    if (!user?._id) {
      setMyBets([]);
      setErrorMy(null);
      return;
    }
    setLoadingMy(true);
    setErrorMy(null);
    getBetsApi({ page: 1, limit, all: false, userId: user._id })
      .then((res) => {
        if (cancelled) return;
        setMyBets(extractList(res).map((r) => mapBetRow(r)));
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMy(err?.response?.data?.message || "Failed to load bets.");
      })
      .finally(() => {
        if (!cancelled) setLoadingMy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, user?._id, limit]);

  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "Latest Bets") return;
    setLoadingLatest(true);
    setErrorLatest(null);
    getBetsApi({ page: 1, limit, all: true })
      .then((res) => {
        if (cancelled) return;
        setLatestBets(extractList(res).map((r) => mapBetRow(r)));
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorLatest(err?.response?.data?.message || "Failed to load bets.");
      })
      .finally(() => {
        if (!cancelled) setLoadingLatest(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, limit]);

  useEffect(() => {
    if (!socketRef) return;

    const handleTableUpdate = (data) => {
      console.log("Received table update:", data);
      if (!data) return;
      const row = mapBetRow(data);

      const prepend = (list) => {
        if (list.some((item) => item._id === row._id)) return list;
        return [row, ...list].slice(0, limit);
      };

      setLatestBets((prev) => prepend(prev));
      if (user?._id && String(data.userId) === String(user._id)) {
        setMyBets((prev) => prepend(prev));
      }
    };

    socketRef.on("update_table_data", handleTableUpdate);
    return () => {
      socketRef.off("update_table_data", handleTableUpdate);
    };
  }, [socketRef, user?._id, limit]);

  const headerRowClass =
    "text-left text-[11px] md:text-xs font-semibold uppercase tracking-[0.12em] text-[#9D93D8]";
  const headerCellClass =
    "px-5 py-4 bg-[#1B1A45]/80 backdrop-blur-sm first:rounded-tl-xl last:rounded-tr-xl";
  const rowClass =
    "group border-b border-[#24224A]/70 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#1F1D52]/80 hover:to-[#1B1A45]/40";

  const renderContent = () => {
    switch (activeTab) {
      case "My Bets": {
        if (!user?._id) {
          return (
            <StatusPanel
              icon={Target}
              title="Sign in required"
              subtitle="Log in to view your personal bet history."
            />
          );
        }
        if (loadingMy) {
          return <StatusPanel icon={Loader2} title="Loading your bets…" spin />;
        }
        if (errorMy) {
          return <StatusPanel icon={Target} title="Couldn't load bets" subtitle={errorMy} />;
        }
        if (!myBets.length) {
          return (
            <StatusPanel
              icon={Target}
              title="No bets yet"
              subtitle="Place your first bet to see it appear here."
            />
          );
        }
        return (
          <BetTable
            data={myBets}
            headerRowClass={headerRowClass}
            headerCellClass={headerCellClass}
            rowClass={rowClass}
          />
        );
      }

      case "Latest Bets": {
        if (loadingLatest) {
          return <StatusPanel icon={Loader2} title="Loading latest bets…" spin />;
        }
        if (errorLatest) {
          return <StatusPanel icon={Zap} title="Couldn't load bets" subtitle={errorLatest} />;
        }
        if (!latestBets.length) {
          return (
            <StatusPanel
              icon={Zap}
              title="No recent bets"
              subtitle="Check back in a moment."
            />
          );
        }
        return (
          <BetTable
            data={latestBets}
            headerRowClass={headerRowClass}
            headerCellClass={headerCellClass}
            rowClass={rowClass}
          />
        );
      }

      case "High Rollovers":
        return (
          <BetTable
            data={highRollersData}
            headerRowClass={headerRowClass}
            headerCellClass={headerCellClass}
            rowClass={rowClass}
          />
        );

      case "Race Leader Board":
        return (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8A5CFF] to-[#6B3BFF] shadow-[0_8px_32px_rgba(138,92,255,0.45)]">
              <Clock size={36} className="text-white" />
            </div>
            <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              Coming Soon
            </h3>
            <p className="max-w-md text-sm text-[#B3A9E5] md:text-base">
              The Race Leader Board is on its way. Stay tuned for live standings,
              odds, and race results.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0F1233] px-4 py-2 ring-1 ring-[#2A2658]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#8A5CFF]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#CFC8FF]">
                In Development
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#05081D] py-4 text-white font-sans antialiased">
      {/* Tabs + Limit selector */}
      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl bg-[#0A0D2A] p-1.5 ring-1 ring-[#1F1D52] shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 md:px-5 py-2.5 text-xs md:text-sm font-bold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "text-white bg-gradient-to-r from-[#8A5CFF] to-[#6B3BFF] shadow-[0_4px_18px_rgba(138,92,255,0.45)]"
                    : "text-[#B3A9E5] hover:text-white hover:bg-[#1B1A45]/60"
                }`}
              >
                {Icon && <Icon size={15} className={isActive ? "text-white" : "text-[#8A5CFF]"} />}
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        <label className="relative flex items-center gap-2 rounded-2xl bg-[#0A0D2A] px-3 py-2 ring-1 ring-[#1F1D52] shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9D93D8]">
            Show
          </span>
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="appearance-none cursor-pointer rounded-lg bg-[#0A0D2A] py-1.5 pl-3 pr-8 text-sm font-bold text-white  outline-none transition-colors  "
            >
              {limitOptions.map((n) => (
                <option key={n} value={n} className=" text-white">
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8A5CFF]"
            />
          </div>
        </label>
      </div>

      {/* Table card */}
      <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#19183A] to-[#13122E] ring-1 ring-[#24224A] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <SectionHeader
          title={activeTab}
          subtitle={
            activeTab === "My Bets"
              ? "Your recent activity across all games"
              : activeTab === "Latest Bets"
              ? "Real-time bets from the platform"
              : activeTab === "High Rollovers"
              ? "Biggest bets across the platform right now"
              : "Live race standings, odds and points"
          }
        />
        <div className="w-full overflow-x-auto">{renderContent()}</div>
      </div>

      <style jsx>{`
        .clip-hexagon {
          clip-path: polygon(
            25% 6.7%,
            75% 6.7%,
            100% 50%,
            75% 93.3%,
            25% 93.3%,
            0% 50%
          );
        }
      `}</style>
    </div>
  );
}
