// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/MineGame.jsx. Original types/imports preserved; adapted for rlk-frontend.
import React, { useEffect, useMemo, useRef, useState } from "react";
// Footer file is named `footer.jsx` — use matching case to avoid module resolution failures on case-sensitive filesystems
import Footer from "./partials/Footer";
import Description from "./partials/Description";
import LatestBetTable from "./partials/LatestBetTable";
import { getOriginalsGame, getPlayerBalanceApi } from "@/services/originals";
// import { useSearchParams } from "next/navigation";
import { Button, IconButton } from "@mui/material";
// TEMPORARY: Rolluck logo mobile used as gem+bomb placeholders for visual check.
// Revert these back to /assets/mine/bomb.png + gem.png + related GIFs once done.
const bomb_static = "/assets/mine/temp-bomb.png";
const gemImg3 = "/assets/mine/temp-gem.png";
const gemImg2 = "/assets/mine/temp-gem.png";
const gemImg1 = "/assets/mine/temp-gem.png";
const gemImg = "/assets/mine/temp-gem.png";
const gemsaImg = "/assets/mine/temp-gem.png";
const bombaImg = "/assets/mine/temp-bomb.png";
const chipsign = "/assets/img/chipsign.png";
const dimondsign = "/assets/img/walletDimondIcon.png";
const bombImg = "/assets/mine/temp-bomb.png";
const BlackjackImg = "/assets/img/MineImg.png";
const FairplayImg = "/assets/img/Fairplay.png";

import BetDashboard from "./partials/BetDashboard";
// import useUser from '@/shared/query/user.query';
// import { useApiClient } from '@/shared/apiClient'
import { initSocket } from "@/lib/originalsSocket";
// import { useTranslations } from "next-intl"
// import LoaderContent from '@/src/loader.mdx'
const SplitImg = "/assets/img/split.png";
import "react-toastify/dist/ReactToastify.css";
import toast from "react-hot-toast";
import { buttonClickSoundFn, mineDiamond1, mineDiamond2, mineDiamond3, mineDiamond4, mineDiamond5, mineDiamond6, mineHoverHiddenBlockHover, GridSizeChangeMin, mineMineBomb, preloadSoundsMines, GridSizeChangeMin2 } from "@/lib/originalsSound";
// import state from '../../../../../../proxy/proxy'
import { useAuth } from '@/lib/originalsAuthBridge';
import { useActiveCurrencySymbol } from '@/lib/currencySymbols';
import { useRouter as useNextRouter } from 'next/router';
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
const waitingGif = "/assets/common/waiting01.gif";
const loseGif = "/assets/common/sad.gif";
const winGif = "/assets/common/happy01.gif";
const dollerSighn = "/assets/img/$.png";
const curruentProfNextPro = "/assets/img/curruentProfNextPro.png";
// import { useCurrency } from "../../../../../contexts/CurrencyContext";
import FairnessModal from "./partials/FairnessModal";

let playedSound = [];
let cardImageCache = {};
let cardImageMap = {};

const HOtKeys = [
  {
    name: "Make a bet",
    value: 'space',
  },
  {
    name: "Stop auto bet",
    value: 'o',
  },
  {
    name: "Double bet amount",
    value: 's',
  },
  {
    name: "Halve bet amount",
    value: 'a',
  },
  {
    name: "Zero bet amount",
    value: 'd',
  },
  {
    name: "Random Pick",
    value: 'q',
  },
  {
    name: "Cashout",
    value: 'w',
  },
]
const MineGame = () => {
  // const user = {
  //   "id": "cme5ot0gi0003g51fada1il6p",
  //   "email": "azmatshaikh@sdlccorp.com",
  //   "enable2FA": false,
  //   "nickname": "Peater ",
  //   "role": "USER",
  //   "avatar": "https://moneytree.fra1.cdn.digitaloceanspaces.com/users/profile_avatars/cme5ot0gi0003g51fada1il6p/c69a7693-7c7f-4a47-acbd-7be3a3d0feee.jpg",
  //   "wallet": null,
  //   "resetPasswordRequired": false,
  //   "canWithdraw": true,
  //   "playerTag": "Player_L3bxV4fW",
  //   "balance": 559503.8819,
  //   "debt": 0,
  //   "blockchain": null,
  //   "hasPassword": true,
  //   "biggestLoss": 5345,
  //   "biggestWin": 5350.86,
  //   "createdAt": "2025-08-10T12:55:58.098Z",
  //   "totalDeposit": 51.6307,
  //   "totalIssuedTo": 0,
  //   "totalSettled": 0,
  //   "totalLoss": 22292.9924,
  //   "totalWin": 27840.6204,
  //   "totalWithdraw": 2.9999,
  //   "volumePlayed": 22479.5243,
  //   "nonPlayableBalance": 0,
  //   "pnl": 5361.0961,
  //   "favoriteGames": [
  //     "Hotline",
  //     "Neonmal",
  //     "Sugar Rush",
  //     "Carnival Queen 2",
  //     "2027 ISS",
  //     "Romeo And Juliet"
  //   ],
  //   "favoriteCategory": "slots",
  //   "rank": "Rank Bronze",
  //   "level": 1,
  //   "totalRake": 0,
  //   "isBonusEnabled": true,
  //   "signUpEventSent": false
  // };
  // const apiClient = useApiClient()
  const { user, playCurrency } = useAuth();
  const { symbol: activeCurrencySymbol } = useActiveCurrencySymbol();

  let socket = initSocket(user?._id);
  // console.log('user info', user)
  // Demo mode flag — URL `?mode=demo` means "free play": no real money
  // moves, bet amount is pinned to 0, and the amount input + mutation
  // buttons (1/2, 2X, Max) are disabled. The ported game socket already
  // supports allowZero bets for the free-play preview flow.
  const _rlkRouter = useNextRouter();
  const isDemoMode = _rlkRouter?.query?.mode === 'demo';
  const [mode, setMode] = useState("manual");
  const [loadingGame, setLoadingGame] = useState(true);
  const [gameLoadError, setgameLoadError] = useState(false);
  const [betAmount, setBetAmount] = useState("0.00");
  // Keep betAmount at 0 while demo mode is active. Runs on mount + any
  // mode toggle; also catches an aggregator-sent betAmount that would
  // otherwise clobber the pinned 0.
  useEffect(() => {
    if (isDemoMode && betAmount !== "0" && betAmount !== "0.00") {
      setBetAmount("0");
    }
  }, [isDemoMode, betAmount]);
  const [mineCount, setMineCount] = useState(3);
  const [gridSize, setGridSize] = useState(25); // 5x5 default
  const [seed, setSeed] = useState(0); // change to re-roll bombs
  const [revealed, setRevealed] = useState([]); // boolean flags
  const [revealedIndex, setRevealedIndex] = useState(null); // boolean flags
  const [onWinIncrease, setOnWinIncrease] = useState(0);
  const [onWinStopBet, setOnWinStopBet] = useState(0);
  const [onLoseStopBet, setOnLoseStopBet] = useState(0);
  const [onLoseIncrease, setOnLoseIncrease] = useState(0);
  // Mirror stop limits in refs so the FINISH_GEM_N_MINES_GAME handler (registered
  // once per user/socket change) always reads the latest values instead of the
  // stale closure values from the time the listener was attached.
  const onWinStopBetRef = useRef(0);
  const onLoseStopBetRef = useRef(0);
  onWinStopBetRef.current = onWinStopBet;
  onLoseStopBetRef.current = onLoseStopBet;
  const [gameOver, setGameOver] = useState(false);
  const [showFairness, setShowFairness] = useState(false);
  const [result, setResult] = useState(null); // 'win' | 'loss' | null
  const [animatingTiles, setAnimatingTiles] = useState([]); // Track tiles with active animations
  const [IsBtnClick, setIsBtnClick] = useState(false);
  const [isbetStopeing, setisbetStopeing] = useState(false);
  // const [isAutoBetStoped, setisAutoBetStoped] = useState(false);
  const isAutoBetStoped = useRef(false);
  const nextRoundTimeOut = useRef(null);
  const [checked, setChecked] = useState(false);
  const [checkedAdv, setCheckedAdv] = useState(false);
  const [isAutoPlayOn, setisAutoPlayOn] = useState(false);
  const dimension = useMemo(() => Math.sqrt(gridSize) | 0, [gridSize]);
  const [gameStarted, setGameStarted] = useState(false);
  const [multiplier, setMultiplier] = useState(0);
  const [cells, setCells] = useState(Array.from({ length: 25 }, () => -1));
  const [MAX_BET, setMAX_BET] = useState(5000);
  const [remainingPositions, setremainingPositions] = useState([])
  const [isBomb, setisBomb] = useState(false)
  const [isAutoBomb, setisAutoBomb] = useState(false)
  const [numberOfBets, setNumberOfBets] = useState('Infinite')
  const [isFocused, setIsFocused] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(0)
  const [nextMultiplier, setNextMultiplier] = useState(0)
  const [selectedAutoPlayCards, setselectedAutoPlayCards] = useState([]);
  const [Slug, setSlug] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [isFavorite, setisFavorite] = useState(user?.favorites?.some(id => String(id) == String(gameData?.slug)));
  const [gameWinChanges, setGameWinChanges] = useState([]);
  const [BetLoading, setBetLoading] = useState(null);
  // const searchParams = useSearchParams();
  const [playedBombGif, setPlayedBombGif] = useState({});
  const [randomGemMap, setRandomGemMap] = useState({});
  const [showMultiplierIdx, setShowMultiplierIdx] = useState(null);
  const showMultiplierTimerRef = useRef(null);
  const { displayCurrency, currencySymbols, convertAmount } = {
    displayCurrency: "USD", currencySymbols: {
      "USD": "$",
      "NGN": "₦",
      "INR": "₹",
      "EUR": "€",
      "GBP": "£"
    }, convertAmount: (amountUSD, currencyOverride) => {
      if (isNaN(amountUSD)) return 0;
      const targetCurrency = currencyOverride || displayCurrency;
      if (targetCurrency === 'USD') return amountUSD;

      const rate = exchangeRates[targetCurrency];
      if (!rate) return amountUSD; // Fallback to USD if rate unknown

      return amountUSD * rate;
    }
  }
  const [gameMaxBet, setGameMaxBet] = useState(5000);

  // Add new state for tile multipliers
  const [tileMultipliers, setTileMultipliers] = useState({}); // { tileIndex: { value: number, expiry: timestamp } }
  useEffect(() => {
    return () => {
      if (showMultiplierTimerRef.current) {
        clearTimeout(showMultiplierTimerRef.current);
        showMultiplierTimerRef.current = null;
      }
    };
  }, []);
  const [ShowMAxBetBTN, setShowMAxBetBTN] = useState(true);
  const [ShowAnimation, setShowAnimation] = useState(true);
  const [playFast, setplayFast] = useState(false);
  const [hotkeysEnabled, setHotkeysEnabled] = useState(false);
  const [gifResult, setGifResult] = useState("chip-14");
  const [currentGif, setCurrentGif] = useState(gifResult);
  const [gifVisible, setGifVisible] = useState(true);
  const [showInBigScreen, setshowInBigScreen] = useState(false);
  const DEFAULT_STATS = {
    profit: 0,
    betAmount: 0,
    wins: 0,
    losses: 0,
  };
  const [endGameData, setEndGameData] = useState({});

  const [stats, setStats] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_STATS;

    const saved = localStorage.getItem("gameStats");
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });
  const bombIndices = useMemo(() => {
    const total = gridSize;
    const count = Math.min(mineCount, total - 1);
    const indices = new Set();
    const rng = (n) => Math.floor(Math.random() * n);
    while (indices.size < count) indices.add(rng(total));
    return indices;
  }, [gridSize, mineCount, seed]);
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    let minBet = convertAmount(0.01, displayCurrency).toFixed(2);
    const amount = parseFloat(betAmount || "0");
    if (amount > gameMaxBet) {
      setErrorMsg(`Maximum bet is ${gameMaxBet.toFixed(2)}`);
    } else if (Number(amount) < parseFloat(minBet) && Number(amount) != 0.00) {
      setErrorMsg(`Minimum bet is ${minBet}`);
    } else if (amount > MAX_BET) {
      setErrorMsg("Insufficient balance");
    } else {
      setErrorMsg("");
    }
    setPlayedBombGif({})
  }, [betAmount, MAX_BET, gameMaxBet]);
  // useEffect(() => {
  //     if (!gridSize) return;
  //     setCells(Array.from({ length: gridSize }, () => -1));
  // }, [gridSize]);
  // let cells = useMemo(() => {
  //   return Array.from({ length: gridSize }, (_, idx) =>
  //     bombIndices.has(idx) ? "bomb" : "gem"
  //   );
  // }, [gridSize, bombIndices]);

  const gridTemplateStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${dimension}, minmax(0, 1fr))` }),
    [dimension]
  );
  // let gameData = null;
  // useEffect(() => {

  //     const encoded = searchParams.get("data");

  //     if (encoded) {
  //         try {
  //             let gameData = JSON.parse(decodeURIComponent(encoded));
  //             setSlug(gameData?.id);
  //             getGameInfo(gameData?.id);
  //         } catch (e) {
  //             console.error("Failed to parse data", e);
  //         }
  //     }

  //     // console.log("Received game data:", gameData);
  // }, [searchParams])
  //   console.log("img URL:", `[${gameData?.image}]`);

  // Reset when seed/grid params change
  useEffect(() => {
    // setRevealed(Array.from({ length: gridSize }, () => false));
    setGameOver(false);
    setResult(null);
    setAnimatingTiles([]);
  }, [gridSize, seed, mineCount]);

  const safeReveals = useMemo(
    () => revealed.filter(Boolean).length,
    [revealed]
  );
  const roundFigure = (num) => {
    if (num >= 10000) {
      return Math.round(num / 500) * 500; // 500 ke nearest
    } else {
      return Math.round(num / 1000) * 1000; // 1000 ke nearest
    }
  };
  useEffect(() => {
    // const convert = async () => {
    //   if (displayCurrency) {
    //     const formatedNumber = await convertAmount(5000, displayCurrency).toFixed(2);
    //     const rounded = roundFigure(formatedNumber);
    //   }
    // };
    setGameMaxBet(5000);

    // convert();
    // getPlayerBalance(user?._id, "EUR");
  }, []);
  const slug = window.location.pathname.split("/").pop();
  console.log('slug', slug)
  useEffect(() => {
    if (slug) {
      console.log("Slug:", slug); // 👉 "dice"
      setSlug(slug);
      getGameInfo(slug);
    }
  }, [slug]);
  // Simple multiplier approximation like Mines: product over safe reveals
  // const multiplier = useMemo(() => {
  //     let m = 1;
  //     for (let i = 0; i < safeReveals; i += 1) {
  //         m *= (gridSize - i) / (gridSize - mineCount - i);
  //     }
  //     // guard against infinity when mineCount == gridSize
  //     if (!Number.isFinite(m)) return 1;
  //     return Math.max(1, m);
  // }, [safeReveals, gridSize, mineCount]);
  async function getGameInfo(Slug) {
    setLoadingGame(true);
    try {
      const data = await getOriginalsGame(Slug);
      if (data?.code == 200 && data?.data) {
        setGameData(data?.data)
        setGameWinChanges(data?.data?.roles_win_chance);
      } else {
        toast.error("Failed to load game data");
        setgameLoadError(true);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error?.response) {
        toast.error("Failed to load game data");
      }
      setgameLoadError(true);
      return null;
    } finally {

      setLoadingGame(false);

    }
  }
  async function getPlayerBalance(playerId, currency) {
    try {
      const payload = {
        action: "balance",
        player_id: playerId,
        currency: currency
      }
      const data = await getPlayerBalanceApi(payload);
      console.log('player data ', data)
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/mtoriginals/event`, {
      //     method: "POST",
      //     headers: {
      //         "Content-Type": "application/json"
      //     },
      //     body: JSON.stringify({
      //         action: "balance",
      //         player_id: playerId,
      //         currency: currency
      //     })
      // });

      // if (!res.ok) {
      //     throw new Error("Failed to fetch: " + res.status);
      // }

      // const data = await res.json();
      // console.log("Response: ", data);
      // const data = {
      //   "success": true,
      //   "statusCode": 200,
      //   "path": "/api/mtoriginals/event",
      //   "data": {
      //     "balance": 5595.04
      //   },
      //   "timestamp": "2026-03-19T06:24:25.147Z"
      // }
      if (data?.data) {
        const convertedAmount = await convertAmount(data?.data?.balance, displayCurrency);
        setMAX_BET(convertedAmount)
      }
      return data;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }
  useEffect(() => {
    preloadSoundsMines();
    getPlayerBalance(user?._id, "EUR");

    const chipImages = [
      gemImg1, bombImg, chipsign, curruentProfNextPro, gemImg2, gemImg3, bomb_static, gemImg, waitingGif, winGif, loseGif, dimondsign
    ];

    chipImages.forEach((src, idx) => {
      const img = new Image();
      img.src = typeof src === "string" ? src : (src).src;
      if (idx == 0) {
        cardImageMap[`${idx === 0 ? 'gem' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 0 ? 'gem' : 'bomb'}`] = img;
      } else if (idx == 1) {
        cardImageMap[`${idx === 0 ? 'gem' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 0 ? 'gem' : 'bomb'}`] = img;
      } else if (idx == 2) {
        cardImageMap[`${idx === 2 ? 'dolerSighn' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 2 ? 'dolerSighn' : 'bomb'}`] = img;
      } else if (idx == 3) {
        cardImageMap[`${idx === 3 ? 'curruentProfNextProfit' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 3 ? 'curruentProfNextProfit' : 'bomb'}`] = img;
      } else if (idx == 4) {
        cardImageMap[`${idx === 4 ? 'gem1' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 4 ? 'gem1' : 'bomb'}`] = img;
      } else if (idx == 5) {
        cardImageMap[`${idx === 5 ? 'gem2' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 5 ? 'gem2' : 'bomb'}`] = img;
      } else if (idx == 6) {
        cardImageMap[`${idx === 6 ? 'bomb_static' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 6 ? 'bomb_static' : 'bomb'}`] = img;
      } else if (idx == 7) {
        cardImageMap[`${idx === 7 ? 'gemImg' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 7 ? 'gemImg' : 'bomb'}`] = img;
      } else if (idx == 8) {
        cardImageMap[`${idx === 8 ? 'chip-14' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 8 ? 'chip-14' : 'bomb'}`] = img;
      } else if (idx == 9) {
        cardImageMap[`${idx === 9 ? 'chip-15' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 9 ? 'chip-15' : 'bomb'}`] = img;
      } else if (idx == 10) {
        cardImageMap[`${idx === 10 ? 'chip-16' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 10 ? 'chip-16' : 'bomb'}`] = img;
      } else if (idx == 11) {
        cardImageMap[`${idx === 11 ? 'dimondsign' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js image import gives {src, height, width}
        cardImageCache[`${idx === 11 ? 'dimondsign' : 'bomb'}`] = img;
      }
    });
  }, [user?._id])
  const profit = useMemo(() => {
    const amt = parseFloat(betAmount || "0");
    if (Number.isNaN(amt)) return 0;
    return amt * multiplier;
  }, [betAmount, multiplier]);

  const StopeAutoPlay = () => {
    if (nextRoundTimeOut.current) {
      clearTimeout(nextRoundTimeOut.current);
      nextRoundTimeOut.current = null;
    }
    setisbetStopeing(true)
    // setisAutoBetStoped(true);
    setPlayedBombGif({})
    setIsBtnClick(true)
    isAutoBetStoped.current = true;
    // setTimeout(() => {
    socket.emit('GEM_N_MINE_AUTO_BET_END');
    // }, 100)
  }
  const onBet = async () => {
    setisbetStopeing(false)
    playedSound = []
    setPlayedBombGif({})
    setGameOver(false);
    // setisAutoBetStoped(false);
    isAutoBetStoped.current = false;
    setisAutoPlayOn(false)
    setisBomb(false)
    setBetLoading(true)
    buttonClickSoundFn();
    if (gameStarted) return;
    // if (!checked && (Number(betAmount) <= 0 || betAmount === "")) {
    //     toast.error("Please enter a valid bet amount greater than 0")
    //     return
    // }

    setIsBtnClick(true);
    setCells(Array.from({ length: gridSize }, () => -1));
    setRevealed(Array.from({ length: gridSize }, () => false));
    setResult(null);
    setSeed((s) => s + 1);
    setremainingPositions([])

    if (mode === 'auto') {
      const request = {
        // playerId + rtp intentionally omitted — backend derives playerId from
        // the JWT-authenticated socket and RTP from the admin panel. Both were
        // dead code post pentest #2 F#1 + #3 F#2 fixes.
        betAmount,
        gridSize,
        minesCount: mineCount,
        numberOfBets: numberOfBets == "Infinite" ? 0 : Number(numberOfBets),
        autoPlaySelectedPositions: selectedAutoPlayCards,
        onWinIncrease,
        onLoseIncrease: onLoseIncrease,
        stopOnLose: onLoseStopBet,
        stopOnProfit: onWinStopBet,
      };
      // console.log('auto play request', request);
      setisAutoPlayOn(true)
      await socket.emit('GEM_N_MINE_START_AUTO_BET', request);
      toast.success("Auto play started")
    }
    else {
      // playerId derived from JWT socket, RTP from admin panel — both fields removed from payload.
      await socket.emit("START_NEW_GAME", { betAmount, gridSize, minesCount: mineCount });
    }

  };
  const cashOut = async () => {
    buttonClickSoundFn()
    if (gameStarted) {
      setisbetStopeing(false)
      setIsBtnClick(true)
      setisBomb(false)
      await socket.emit("CASHOUT_GEM_N_MINES");
    }
  }


  const revealIndex = (idx, playClickSoundTile) => {
    if (true) {
      setRandomGemMap(prev => {
        if (prev[idx]) return prev;  // already assigned
        const gems = [
          cardImageMap["gem"],
          cardImageMap["gem1"],
          cardImageMap["gem2"]

        ];
        const random = gems[Math.floor(Math.random() * gems.length)];
        return { ...prev, [idx]: random };
      });
    }
    if (mode === 'auto' && gameStarted === false) {
      if (playClickSoundTile) {
        mineHoverHiddenBlockHover()
      }
      if (selectedAutoPlayCards.includes(idx)) {
        setselectedAutoPlayCards(selectedAutoPlayCards.filter(i => i !== idx));
      } else if (selectedAutoPlayCards.length > 0) {
        setselectedAutoPlayCards([...selectedAutoPlayCards, idx]);
      } else if (selectedAutoPlayCards.length === 0) {
        setselectedAutoPlayCards([idx]);
      }
      setIsBtnClick(false)
      setBetLoading(false)
      return;
    }
    if (gameOver || revealed[idx]) return;
    if (!socket?.id) return;
    if (gameStarted === false) return;
    setBetLoading(true)
    setIsBtnClick(true)
    // console.log('caled reveal index', idx);
    // show multiplier badge for this tile and auto-hide after 2s
    setShowMultiplierIdx(idx)
    // Store multiplier for this tile
    const badgeData = {
      value: nextMultiplier,
      expiry: Date.now() + 2000
    };

    setTileMultipliers(prev => ({ ...prev, [idx]: badgeData }));

    // Set timeout to remove this badge
    setTimeout(() => {
      setTileMultipliers(prev => {
        const newMultipliers = { ...prev };
        delete newMultipliers[idx];
        return newMultipliers;
      });
    }, 2000);
    if (showMultiplierTimerRef.current) {
      clearTimeout(showMultiplierTimerRef.current);
    }
    showMultiplierTimerRef.current = setTimeout(() => {
      setShowMultiplierIdx(null);
      showMultiplierTimerRef.current = null;
    }, 2000);
    // playerId derived from JWT socket — omitted from payload.
    socket.emit("REVEAL_CARD", { cardPosition: idx });
    // Start animation for this tile
    setAnimatingTiles(prev => [...prev, idx]);

    setRevealed((prev) => {
      let copy = [...prev];
      copy[idx] = true;

      // Determine bombs revealed so far
      // const revealedBombs = copy
      //     .map((isR, i) => (isR && cells[i] === "bomb" ? i : -1))
      //     .filter((i) => i !== -1);

      // if (revealedBombs.length >= mineCount) {
      //     // Count bombs per row and per column
      //     const rowCounts = new Map();
      //     const colCounts = new Map();
      //     for (const i of revealedBombs) {
      //         const r = Math.floor(i / dimension);
      //         const c = i % dimension;
      //         rowCounts.set(r, (rowCounts.get(r) || 0) + 1);
      //         colCounts.set(c, (colCounts.get(c) || 0) + 1);
      //     }
      //     const alignedLoss =
      //         Array.from(rowCounts.values()).some((c) => c >= mineCount) ||
      //         Array.from(colCounts.values()).some((c) => c >= mineCount);

      //     // Randomize outcome when not aligned to feel more game-like (50/50)
      //     const finalLoss = alignedLoss
      //         ? true
      //         : Math.random() < 0.5
      //             ? false
      //             : true;

      //     setGameOver(true);
      //     setResult(finalLoss ? "loss" : "win");

      //     // If user won, open all remaining tiles as gems
      //     if (!finalLoss) {
      //         copy = Array.from({ length: gridSize }, () => true);
      //         // Animate all remaining tiles
      //         const allTiles = Array.from({ length: gridSize }, (_, i) => i);
      //         setAnimatingTiles(allTiles);
      //     }
      // }

      return copy;
    });
    setRevealedIndex(idx)
  };

  // Remove tile from animating state after animation completes
  useEffect(() => {
    if (animatingTiles.length > 0) {
      const timer = setTimeout(() => {
        setAnimatingTiles([]);
      }, 600); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
  }, [animatingTiles]);

  const pickRandomTile = () => {
    setIsBtnClick(true)
    setPlayedBombGif({})
    buttonClickSoundFn()
    const candidates = revealed
      .map((r, i) => (!r ? i : null))
      .filter((i) => i !== null);
    if (candidates.length === 0) return;
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    revealIndex(idx);
  };
  const pickRandomTileAuto = () => {
    setIsBtnClick(true);
    setPlayedBombGif({})
    buttonClickSoundFn();
    if (selectedAutoPlayCards?.length == (cells?.length - mineCount)) {

      setIsBtnClick(false);

      return
    }

    const n = Number(cells?.length || 0);
    if (n === 0) {
      setIsBtnClick(false);
      console.warn('No cells available');
      return;
    }

    // build numeric all indexes
    const allIndexes = Array.from({ length: n }, (_, i) => i);

    // normalize selected indexes to numbers (guard against strings)
    const selectedSet = new Set((selectedAutoPlayCards || []).map(x => Number(x)));

    // candidates are numeric indexes not selected
    const candidates = allIndexes.filter(idx => !selectedSet.has(idx));
    if (candidates.length === 0) {
      setIsBtnClick(false);
      return
    };

    // compute risk, treat undefined/missing as very high risk
    const MAX_RISK = Number.MAX_SAFE_INTEGER;
    let minRisk = MAX_RISK;

    candidates.forEach(idx => {
      const raw = mineCount?.[idx];
      const risk = Number.isFinite(raw) ? raw : MAX_RISK;
      if (risk < minRisk) minRisk = risk;
    });

    // pick safest tiles; if none (edge case) fallback to all candidates
    const safestTiles = candidates.filter(idx => {
      const raw = mineCount?.[idx];
      const risk = Number.isFinite(raw) ? raw : MAX_RISK;
      return risk === minRisk;
    });

    const pool = safestTiles.length > 0 ? safestTiles : candidates;
    const finalIdx = pool[Math.floor(Math.random() * pool.length)];

    // debug log
    // console.log({ minRisk, poolLength: pool.length, finalIdx });
    // if revealIndex expects something else, adapt here
    revealIndex(finalIdx);
  };



  const sizes = [25, 36, 49, 64];
  // const mineOptions = Array.from(
  //     { length: gridSize - 1 },
  //     (_, i) => i + 1
  // );
  const mineOptions = useMemo(() => {
    if (!gridSize || gridSize <= 1) return [];

    return Array.from(
      { length: gridSize - 1 },
      (_, i) => i + 1
    );
  }, [gridSize, mode]);

  // const t = useTranslations('')
  useEffect(() => {
    if (!socket) return;
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [user?._id]);
  let game
  // const content = useMemo(() => {
  //     if (game?.restricted) {
  //         return (
  //             <>
  //                 <div className="absolute top-0 left-0 h-full w-full bg-[#000000E6]"></div>
  //                 <div className="absolute top-0 left-0 flex flex-col items-center gap-4 justify-center w-full h-full">
  //                     <img
  //                         src={"/svgs/country-restriction.svg"}
  //                         alt="Restricted"
  //                         width={50}
  //                         height={50}
  //                     />
  //                     <span className="text-white text-center font-semibold text-md max-w-[300px] lg:max-w-[400px]">
  //                         {t("gamePage.notAvailableInYourRegion")}
  //                     </span>
  //                 </div>
  //             </>
  //         );
  //     }

  //     return (
  //         <>
  //             {!user?._id && (
  //                 <div className="absolute top-0   left-0 h-full w-full bg-[#000000E6]"></div>
  //             )}
  //             {!user?._id && (
  //                 <div className="absolute  top-0 left-0 flex items-center justify-center w-full h-full">
  //                     <button
  //                         className="bg-royalGreen-50 text-royalPurple-50 py-2 px-6 rounded-full font-bold text-[18px]"
  //                         onClick={() => {
  //                             if (user?._id) {
  //                                 setHasLoaded(true)
  //                                 return
  //                             }

  //                             state.loadLoginPage = true
  //                         }}
  //                     >
  //                         {t("gamePage.register")}
  //                     </button>
  //                 </div>
  //             )}
  //         </>
  //     );
  // }, [user?._id, game?.restricted, t,]);
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socketsssss callbacks");
    socket.on("GEM_N_MINE_GAME_INFO", (data) => {
      console.log("GEM_N_MINE_GAME_INFO", data);
      setCurrentMultiplier(data?.multiplier)
      setNextMultiplier(data?.nextMultiplier)
      setGridSize(data.gridSize);
      console.log('setGridSizssssae', data.gridSize)
      setBetLoading(false)
      if (data?.minesCount) {
        setMineCount(data.minesCount);
      }
      if (data?.betAmount) {
        setBetAmount(data.betAmount);
      }
      if (data?.board && Array.isArray(data.board)) {
        setCells(data?.board);
        console.log('set cell', data?.board)
        const list = data?.board.map(item => item === -1 ? false : true)
        // console.log('list', list)
        if (data?.multiplier && data?.nextMultiplier) {
          setCurrentMultiplier(data?.multiplier)
          setNextMultiplier(data?.nextMultiplier)
        }
        setRevealed(list);

      }
      if (data?.isPlayable) {
        setGameStarted(true);
      }
      setIsBtnClick(false)
    });

    // cleanup
    return () => {
      socket.off("GEM_N_MINE_GAME_INFO");
    };
  }, [user?._id, socket?.id]);
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socketsssss callbacks");
    socket.on("REVEAL_CARD", (data) => {
      // console.log("REVEAL_CARD", data);
      if (data?.betAmount) {
        setBetAmount(data?.betAmount)
      }
      // setGridSize(data.gridSize);
      // if (data?.minesCount) {
      //   setMineCount(data.minesCount);
      // }
      // if (data?.betAmount) {
      //   setBetAmount(data.betAmount);
      // }
      if (data?.board && Array.isArray(data.board)) {
        setCells(data.board);
        console.log('set cell', data?.board)
        if (data.multiplier && data.nextMultiplier) {
          setCurrentMultiplier(data.multiplier)
          setNextMultiplier(data.nextMultiplier)
        }
      }
      // if (data?.isPlayable) {
      //   setGameStarted(true);
      // }
      setIsBtnClick(false)
      setBetLoading(false)
    });

    // cleanup
    return () => {
      socket.off("REVEAL_CARD");
    };
  }, [user?._id, socket?.id]);
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socketsssss callbacks");
    socket.on("GEM_N_MINE_ALLOW_AUTO_BET", (data) => {
      // console.log("GEM_N_MINE_ALLOW_AUTO_BET", data);
      if (data?.betAmount) {
        setBetAmount(data?.betAmount)
      }
      if (data?.permission) {

      }
      setIsBtnClick(false)
    });

    // cleanup
    return () => {
      socket.off("GEM_N_MINE_ALLOW_AUTO_BET");
    };
  }, [user?._id, socket?.id]);
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socketsssss callbacks");
    socket.on("GEM_N_MINE_AUTO_BET_END", (data) => {
      // console.log("GEM_N_MINE_AUTO_BET_END", data);
      if (data?.betAmount) {
        setBetAmount(data?.betAmount)
      }
      if (data?.status) {
        setBetLoading(false)
        setTimeout(() => {
          // setCells(Array.from({ length: gridSize }, () => -1));
          // console.log('set cell', gridSize)
          setisAutoPlayOn(false);
          setremainingPositions([])
          // setselectedAutoPlayCards([])
          setAnimatingTiles([])
          setIsBtnClick(false)
          setGameStarted(false)
          setPlayedBombGif({})
          setGameOver(false);
          setErrorMsg('')
          setisbetStopeing(false)
          setTimeout(() => {
            setCells(Array.from({ length: data?.gridSize || 25 }, () => -1));
            // console.log('set cell end auto bet', gridSize, data?.gridSize)
            setGridSize(data?.gridSize || 25);
            toast.success("Auto play finished")
            setremainingPositions([])
            // setselectedAutoPlayCards([])
            setAnimatingTiles([])
            setPlayedBombGif({})
            setErrorMsg('')
            setisbetStopeing(false)
          }, 150);

        }, 120)
        getPlayerBalance(user?._id, "EUR");
      }
      setIsBtnClick(false)
    });
    return () => {
      socket.off("GEM_N_MINE_AUTO_BET_END");
    };
  }, [user?._id, socket?.id]);

  const handlePlayNextAutoRound = async () => {
    // if (!isAutoPlayOn) return false
    if (isbetStopeing) return false;
    if (isAutoBetStoped?.current) return;
    setIsBtnClick(true);

    // clear any previously scheduled next-round call
    if (nextRoundTimeOut.current) {
      clearTimeout(nextRoundTimeOut.current);
      nextRoundTimeOut.current = null;
    }

    const nextTimeOut = setTimeout(() => {
      // re-check stop flag just before emitting so a stop that arrives
      // while the timer was pending will prevent the request.
      if (isAutoBetStoped.current) {
        return;
      }
      socket.emit('GEM_N_MINE_AUTO_BET_NEXT_ROUND');
    }, 100);
    nextRoundTimeOut.current = nextTimeOut;
  }
  console.log('cells len', cells.length)
  console.log('grid siz', gridSize)
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socketsssss callbacks");
    socket.on("FINISH_GEM_N_MINES_GAME", (data) => {
      // bail out early if auto-bet has been stopped; nothing to do
      if (isAutoBetStoped.current) {
        return;
      }
      // console.log("FINISH_GEM_N_MINES_GAME", data);
      setBetLoading(false)
      console.log('setGridSizsssaaae', data?.finalBoard.length)
      setGridSize(data?.finalBoard.length > 0 ? data?.finalBoard.length : 25);
      // if (data?.minesCount) {
      //   setMineCount(data.minesCount);
      // }
      if (data?.betAmount) {
        setBetAmount(data?.betAmount)
      }
      if (data?.remainingPositions && Array.isArray(data.remainingPositions)) {
        setremainingPositions(data?.remainingPositions)
      }
      if (data?.finalBoard && Array.isArray(data.finalBoard)) {
        setTimeout(() => {
          console.log('set cells', data?.finalBoard.length)
          setCells(data.finalBoard);
        }, 200)
      }
      if (data?.multiplier) {
        setMultiplier(data.multiplier);
      }
      if (data?.autoPlay) {
        if (data.canPlayNext && (data?.remainingRounds > 0 || data?.remainingRounds === "∞")) {

          setTimeout(async () => {
            if (isAutoBetStoped.current) {
              return;
            }
            setGridSize(data?.finalBoard.length > 0 ? data?.finalBoard.length : 25);
            await setPlayedBombGif({})
            await setGameOver(false);
            await setCells(Array.from({ length: data?.finalBoard.length }, () => -1));
            setremainingPositions([])
            await handlePlayNextAutoRound();
          }, 600);
          setNumberOfBets(Number(data?.remainingRounds) ? Number(data?.remainingRounds) : 'Infinite')

        } else if (data?.autoPlay && data?.remainingRounds === 0) {
          setNumberOfBets(Number(data?.remainingRounds))
          setTimeout(() => {
            setGridSize(data?.finalBoard.length > 0 ? data?.finalBoard.length : 25);
            setPlayedBombGif({})
            setCells(Array.from({ length: data?.finalBoard.length }, () => -1));
            setisAutoPlayOn(false);
            setremainingPositions([])
            setGameOver(false);
            setisbetStopeing(false)
            setTimeout(() => {
              // Server stops auto-play for one of three reasons: stopOnProfit hit,
              // stopOnLose hit, or numberOfBets consumed. Pick the matching toast.
              const stopProfit = Number(onWinStopBetRef.current) || 0;
              const stopLose = Number(onLoseStopBetRef.current) || 0;
              const tp = Number(data?.totalProfit) || 0;
              const tl = Number(data?.totalLost) || 0;
              if (stopProfit > 0 && tp >= stopProfit) {
                toast.success("Auto bet stopped: profit target reached.");
              } else if (stopLose > 0 && tl >= stopLose) {
                toast.error("Auto bet stopped: loss limit reached.");
              } else {
                toast.success("Auto bet completed.");
              }
              setGridSize(data?.finalBoard.length > 0 ? data?.finalBoard.length : 25);
              setPlayedBombGif({})
              setCells(Array.from({ length: data?.finalBoard.length }, () => -1));
              setremainingPositions([])
              getPlayerBalance(user?._id, "EUR");
            }, 150);
          }, 600)
        } else if (!data.canPlayNext) {
          setNumberOfBets('Infinite')
          setTimeout(() => {
            setGridSize(data?.finalBoard.length > 0 ? data?.finalBoard.length : 25);
            setPlayedBombGif({})
            setCells(Array.from({ length: data?.finalBoard.length }, () => -1));
            setisAutoPlayOn(false);
            setremainingPositions([])
            setGameOver(false);
            setisbetStopeing(false)
            setTimeout(() => {
              // Same stop-reason resolution as above (this branch fires when the
              // server flips canPlayNext = false, which happens on both natural
              // completion and stopOnProfit/stopOnLose triggers).
              const stopProfit = Number(onWinStopBetRef.current) || 0;
              const stopLose = Number(onLoseStopBetRef.current) || 0;
              const tp = Number(data?.totalProfit) || 0;
              const tl = Number(data?.totalLost) || 0;
              if (stopProfit > 0 && tp >= stopProfit) {
                toast.success("Auto bet stopped: profit target reached.");
              } else if (stopLose > 0 && tl >= stopLose) {
                toast.error("Auto bet stopped: loss limit reached.");
              } else {
                toast.success("Auto bet completed.");
              }
              setGridSize(data?.finalBoard.length > 0 ? data?.finalBoard.length : 25);
              setPlayedBombGif({})
              setCells(Array.from({ length: data?.finalBoard.length }, () => -1));
              setremainingPositions([])
              getPlayerBalance(user?._id, "EUR");
            }, 150);

          }, 600)

        }
        if (data?.mineTriggered) {
          setisBomb(true)
          setisbetStopeing(false)
        } else if (data?.mineTriggered === false) {
          // setTimeout(() => {
          setisBomb(false)
          // }, 100)
        }
      } else {
        setisAutoPlayOn(false)
        setselectedAutoPlayCards([])
      }

      setGameOver(true);
      setGameStarted(false)
      setIsBtnClick(false);
      if (!data?.mineTriggered) {
        GridSizeChangeMin()
        updateStats({ ...data, isWin: true })
      } else {
        updateStats({ ...data, isWin: false })
      }
    });

    // cleanup
    return () => {
      socket.off("FINISH_GEM_N_MINES_GAME");
    };
  }, [user?._id, socket?.id]);
  useEffect(() => {
    // console.log('socket useeffect', socket);
    if (!socket?.id) return;

    console.log("Registering socket emit callbacks");
    socket.emit('INIT_GEM_N_MINES');
  }, [user?._id, socket?.id]);
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("Game_Error", async (data) => {
      // console.log("Game_Error:", data);

      // Format error message to be user-friendly
      const formatErrorMsg = (msg) => {
        if (!msg) return "Something went wrong";
        if (msg.includes("INSUFFICIENT_FUNDS") || msg.toLowerCase().includes("insufficient")) {
          return "Insufficient balance";
        }
        return msg;
      };

      if (data?.code === 400) {
        setGameStarted(false);
        setIsBtnClick(false)
        setGameOver(false)
        toast.error(formatErrorMsg(data?.msg))
        setisAutoPlayOn(false)
        setBetLoading(false)
        setGridSize(25)
        console.log('setGridSizsse', 25)
        setCells(Array.from({ length: 25 }, () => -1))
      } else if (data?.code === 409) {
        setIsBtnClick(false)
        setGameStarted(false);
        setGameOver(false)
        setisAutoPlayOn(false)
        setBetLoading(false)
        toast.error(formatErrorMsg(data?.msg))
        setGridSize(25)
        console.log('setGridSizsse', 25)
        setCells(Array.from({ length: 25 }, () => -1))
      }

      setremainingPositions([]);
      setAnimatingTiles([]);
      setPlayedBombGif([]);
      setselectedAutoPlayCards([])
      setGameOver(false);
      setisAutoBomb(false)
      setisAutoPlayOn(false)
      setBetLoading(false)
      setIsBtnClick(false)
      setGameStarted(false);

    });

    // cleanup
    return () => {
      socket.off("Game_Error");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [user?._id, socket?.id]);
  useEffect(() => {
    if (Number(betAmount) > 0) {
      if (checked) {
        setChecked(false)
      }
    }
    // setisBomb(false)
    // setGameOver(false)
    // setisAutoPlayOn(false)
    // setBetLoading(false)
    // // setCells(Array.from({ length: gridSize }, () => -1))
    // setremainingPositions([])
  }, [betAmount])
  useEffect(() => {
    if (!socket?.id) return;
    if (mode !== 'auto') return;
    socket.emit('GEM_N_MINE_WANTED_TO_PLAY_AUTO_BET');
  }, [socket?.id, user?._id, mode]);
  useEffect(() => {
    let gifResults = gameOver && !isBomb ? "chip-15" : gameOver && isBomb ? "chip-16" : "chip-14";
    console.log('gif result', gifResults)
    setGifResult(gifResults)
  }, [gameOver, isBomb, isAutoPlayOn,])
  useEffect(() => {
    if (gifResult === currentGif) return;

    setGifVisible(false); // fade out

    const t = setTimeout(() => {
      setCurrentGif(gifResult); // change src AFTER fade out
      setGifVisible(true);      // fade in
    }, 200); // fade duration

    return () => clearTimeout(t);
  }, [gifResult]);


  useEffect(() => {
    if (!hotkeysEnabled) return
    const handleKeyDown = (e) => {
      console.log('ee ', e)
      if (e?.code === "Space") {
        console.log(mode)
        e.preventDefault(); // Stop page scroll
        if (mode == "manual") {
          if ((gameStarted || IsBtnClick) || errorMsg) return;
          console.log('eeee', e)
          onBet()
        } else {
          if ((mode !== "auto" || isAutoPlayOn) || selectedAutoPlayCards.length === 0 || errorMsg) return;
          onBet()
        }

      } else if (e?.key === 's') {
        if (gameStarted) return;
        buttonClickSoundFn()
        setBetAmount((prev) =>
          Math.min(parseFloat(prev || "0") * 2).toFixed(2)
        )
      } else if (e?.key === 'a') {
        if (gameStarted) return;
        buttonClickSoundFn()
        setBetAmount((prev) => {
          let newVal = parseFloat(prev || "0") / 2;

          // if less than 0.01, force 0
          if (newVal < 0.01) {
            newVal = 0;
          }

          return newVal.toFixed(2); // always show 2 decimals
        });
      } else if (e?.key === "d") {
        if (gameStarted) return;
        setBetAmount('0.00')
      } else if (e?.key === "q") {
        if (mode == 'auto') {
          if (((isAutoPlayOn) || errorMsg || gameStarted) && mode == 'auto') return;
          pickRandomTileAuto()
        } else {
          if (!gameStarted || IsBtnClick) return;
          pickRandomTile()
        }
      } else if (e?.key === "w") {
        if ((!gameStarted || safeReveals === 0) || IsBtnClick) return;
        cashOut()
      } else if (e?.key === "o") {
        if (selectedAutoPlayCards.length === 0) return;
        StopeAutoPlay()
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeysEnabled, user?._id, mode, selectedAutoPlayCards, errorMsg, IsBtnClick, gameData, gameStarted, isAutoPlayOn, playedBombGif]);

  const updateStats = (data) => {
    const multiplier =
      parseFloat(data?.multiplier) || 0;

    const bet =
      parseFloat(betAmount) || 0;

    setStats(prev => {
      const updated = {
        ...prev,
        profit:
          multiplier > 0
            ? prev.profit + multiplier * bet
            : prev.profit,

        betAmount:
          bet > 0
            ? prev.betAmount + bet
            : prev.betAmount,

        wins: data?.isWin ? prev.wins + 1 : prev.wins,
        losses: !data?.isWin ? prev.losses + 1 : prev.losses,
      };

      // 🔥 Persist immediately
      localStorage.setItem("gameStats", JSON.stringify(updated));

      return updated;
    });
  }

  return (


    <>
      {
        user?._id && !loadingGame && !gameLoadError ?
          (
            <main key={displayCurrency} className="flex h-full w-full flex-col select-none  gap-5 rounded-xl">


              <div
                id="slot"
                className="w-full rounded-xl "
              >


                <div className="  ">
                {/* <div className=" lg:p-4 bg-[#18181A] mt-1  rounded-xl "> */}
                  <div className="rl-liquid-glow bg-white/[0.01] lg:flex lg:flex-col lg:justify-center lg:items-center md:flex md:flex-col md:justify-center md:items-center rounded-4xl">
                  {/* <div className=" lg:p-4 bg-[#262628] lg:flex lg:flex-col lg:justify-center lg:items-center  md:flex md:flex-col md:justify-center md:items-center rounded-xl "> */}

                    <div className={`rounded-b-4xl lg:rounded-br-4xl   w-full ${showInBigScreen ? 'w-[95vw] h-[83vh]' : "  lg:w-[100%] xl:w-[100%]"}text-white font-sans flex flex-col-reverse  lg:flex-row lg:justify-center bg-gradient-to-br from-[#18181A] via-#18181A] to-[#18181A]  rounded-4xl`}>
                      {/* Left sidebar */}
                      <div className={`order-1 lg:order-1     xl:w-[35%] lg:w-[30%]     `}>
                        <div className="flex flex-col-reverse  lg:flex-col   ">
                          <div className={`flex flex-col-reverse lg:overflow-y-auto scrollbar-hide rounded-4xl lg:rounded-tr-none lg:rounded-br-none gap-3 lg:flex-col pt-4 ${checkedAdv ? "pb-2 md:pb-2 sm:pb-2 lg:pb-0" : "pb-4 md:pb-5 sm:pb-4"} px-4 sm:pt-4 sm:px-4 md:pt-4 md:px-5 bg-gradient-to-r from-[#262628] to-[#262628] lg:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[600px]`}>
                          <div className="hidden lg:flex items-center gap-1 bg-[#18181A] rounded-full p-1 border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
                            {[
                              { key: "manual", label: "Manual" },
                              { key: "auto", label: "Auto" },
                            ].map((t) => (
                              <button
                                key={t.key}
                                onClick={() => {
                                  buttonClickSoundFn()
                                  if (gameStarted) return;
                                  if (isAutoPlayOn) return;
                                  // setselectedAutoPlayCards([])
                                  // setGridSize(25)
                                  setremainingPositions([])
                                  setCells(Array.from({ length: gridSize }, () => -1));
                                  setMode(t.key)
                                  setGameOver(false)
                                  setPlayedBombGif({})
                                  setisAutoPlayOn(false)
                                  setIsBtnClick(false)
                                }}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${mode === t.key
                                  ? "bg-[#333333] text-white border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.3)]"
                                  : "bg-transparent text-gray-400 hover:text-white"
                                  }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>

                            {/* Bet Amount */}
                            <div className="mt-2 hidden lg:block">
                              <div className="flex px-1 items-center font-medium justify-between text-gray-300 text-sm">
                                <span>Bet Amount</span>
                                <span className="text-xs text-white flex ">
                                  <span className='flex align-middle items-center'>

                                    {
                                      displayCurrency == 'USD'
                                        ?
                                        (
                                          <span className="inline-flex items-center justify-center font-semibold leading-none text-current">{activeCurrencySymbol}</span>
                                        )
                                        : null
                                      // (
                                      //     <span
                                      //         className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-100"
                                      //             }`}
                                      //     >
                                      //         {currencySymbols[displayCurrency] || displayCurrency}
                                      //     </span>
                                      // )
                                    }
                                  </span>
                                  <span> {displayCurrency == 'USD' ? betAmount : ' '}</span>
                                </span>                                                    </div>
                              <div className="relative mt-1">
                                <span
                                  className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocused ? "opacity-100" : "opacity-50"
                                    }`}
                                >
                                  {
                                    displayCurrency == 'USD'
                                      ?
                                      (
                                        <span className={`inline-flex items-center justify-center font-semibold leading-none ${isFocused ? "opacity-100" : "opacity-50"}`}>{activeCurrencySymbol}</span>
                                      )
                                      :
                                      (
                                        <span
                                          className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-50"
                                            }`}
                                        >
                                          {currencySymbols[displayCurrency] || displayCurrency}
                                        </span>
                                      )
                                  }
                                </span>
                                <input
                                  id="betAmountInput"
                                  data-tooltip-id="betError1"
                                  data-tooltip-place="top"
                                  data-tooltip-offset={10}
                                  data-tooltip-hidden={!errorMsg}
                                  data-tooltip-float={false}
                                  inputMode="decimal"
                                  type="text"
                                  disabled={isDemoMode}
                                  readOnly={isDemoMode}
                                  value={isDemoMode ? "0" : (betAmount ?? "0").toString()}
                                  onFocus={(e) => {
                                    if (isDemoMode) return;
                                    setIsFocused(true);
                                    if (["0", "0.0", "0.00", "0.000"].includes(e.target.value)) {
                                      setBetAmount(""); // clear when it's zero
                                    } else {
                                      e.target.select(); // select all if non-zero
                                    }

                                  }}
                                  onChange={(e) => {
                                    if (isDemoMode) return;
                                    if (gameStarted || isAutoPlayOn) return;
                                    // Allow only digits and decimal point
                                    setPlayedBombGif({})
                                    const raw = e.target.value;
                                    let numeric = raw.replace(/[^0-9.]/g, ""); // keep only 0-9 and .

                                    // Prevent multiple dots
                                    if (numeric.split(".").length > 2) {
                                      numeric = numeric.slice(0, numeric.lastIndexOf("."));
                                    }

                                    // Restrict to 2 decimal places
                                    if (numeric.includes(".")) {
                                      const [intPart, decPart] = numeric.split(".");
                                      numeric = intPart + "." + decPart.slice(0, 2);
                                    }

                                    setBetAmount(numeric); // limit to 2 decimals
                                  }}
                                  onBlur={() => {
                                    let val = betAmount;
                                    if (!val || isNaN(parseFloat(val))) {
                                      setBetAmount("0.00");
                                      return;
                                    }
                                    setIsFocused(false)
                                  }}
                                  placeholder="0.00"
                                  className={`w-full bg-[#18181A]   rounded-full pl-8 pr-32 py-2 outline-none    ${errorMsg ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-[#F9D028] "} text-[#94a59e]  focus:text-white`}
                                />
                                <Tooltip
                                  id="betError1"
                                  isOpen={Boolean(errorMsg)}
                                  clickable={false}
                                  place="top"
                                  className="!bg-black  !text-white
        !px-3 !py-2 !rounded-full 
        !backdrop-blur-sm !text-xs !font-medium
        !z-[9999]"
                                >
                                  {errorMsg}
                                </Tooltip>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-[2px]">
                                  <button
                                    disabled={isDemoMode}
                                    onClick={() => {
                                      if (isDemoMode) return;
                                      if (gameStarted) return;
                                      buttonClickSoundFn()
                                      setBetAmount((prev) => {
                                        let newVal = parseFloat(prev || "0") / 2;

                                        // if less than 0.01, force 0
                                        if (newVal < 0.01) {
                                          newVal = 0;
                                        }

                                        return newVal.toFixed(2); // always show 2 decimals
                                      });
                                    }
                                    }
                                    className={`px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333] rounded-l-full text-gray-200 ${isDemoMode ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  >
                                    1/2
                                  </button>
                                  <button
                                    disabled={isDemoMode}
                                    onClick={() => {
                                      if (isDemoMode) return;
                                      if (gameStarted) return;
                                      buttonClickSoundFn()
                                      setBetAmount((prev) =>
                                        Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                      )
                                    }
                                    }
                                    className={`px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333]  text-gray-200 ${!ShowMAxBetBTN ? "rounded-r-full" : ""} ${isDemoMode ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  >
                                    2X
                                  </button>
                                  {ShowMAxBetBTN && <button
                                    disabled={isDemoMode}
                                    onClick={() => {
                                      if (isDemoMode) return;
                                      if (gameStarted) return;
                                      buttonClickSoundFn()
                                      // setBetAmount(MAX_BET)
                                      // compute formatted value synchronously so we can show errors immediately
                                      const numericMax = Number(MAX_BET);
                                      const formatted = Number.isFinite(numericMax) ? numericMax.toFixed(2) : String(MAX_BET);
                                      setBetAmount(formatted);

                                      if (!Number.isFinite(numericMax) || numericMax <= 0) {
                                        setErrorMsg("Insufficient balance");
                                      } else {
                                        setErrorMsg("");
                                      }
                                    }
                                    }
                                    className="px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333] rounded-r-full text-gray-200 "
                                  >
                                    Max
                                  </button>}
                                </div>
                              </div>
                              {/* {gameOver && (
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold border border-[#333333] bg-[#1a1a1a]/80">
                                                            {result === "win" ? "You win" : "You lost"}
                                                        </div>
                                                    )} */}
                            </div>

                            {mode === "manual" ? (
                              <>
                                {/* Grid Size */}
                                <div className="mt-1">
                                  <div className="text-gray-300 text-sm font-medium px-1 mb-1">
                                    Grid Size
                                  </div>

                                  <div className="grid grid-cols-4 gap-[2px] bg-[#18181A] p-1 rounded-full">
                                    {sizes.map((size) => {
                                      const isSizeDisabled = [0].includes(size);
                                      const isDisabled = gameStarted || isSizeDisabled;

                                      return (
                                        <button
                                          key={size}
                                          disabled={isDisabled}
                                          onClick={() => {
                                            if (isAutoPlayOn) return;
                                            if (isDisabled) return;
                                            if (size < gridSize) {
                                              setMineCount(3)
                                            }
                                            setCells(Array.from({ length: size }, () => -1));
                                            GridSizeChangeMin2();
                                            setGridSize(size);
                                            setGameOver(false);
                                            setisBomb(false);
                                            setselectedAutoPlayCards([]);
                                            setremainingPositions([]);
                                          }}
                                          className={`
            py-2 ${size == 64 ? 'rounded-r-full' : size == 25 ? "rounded-l-full" : ''} text-sm transition-all
            ${gridSize === size
                                              ? "bg-[#F9D028] text-black font-semibold"
                                              : "bg-[#262628] hover:bg-[#333333] text-gray-200 hover:opacity-80"
                                            }
            ${isDisabled
                                              ? "opacity-50 cursor-not-allowed hover:bg-[#1a1a1a]"
                                              : ""
                                            }
          `}
                                        >
                                          {size}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>


                                {/* Mines & Gems */}
                                <div className="mt-1">
                                  <div className="text-gray-300 text-sm font-medium mb-1 px-1">
                                    Number of Mines
                                  </div>
                                  <div className="w-full  bg-[#18181A] px-1 py-1 rounded-full flex items-center justify-between gap-2">
                                    <div className=" w-[18%] flex justify-center items-center  bg-[#262628] p-1 rounded-full text-sm text-white">
                                      <img src={bomb_static} alt="BombaImg" className="w-8 h-8 p-1" /> <span className="inline-block w-6 text-left tabular-nums"> {mineCount}</span>
                                    </div>
                                    {/* Slider */}
                                    <div className="relative w-[60%]">
                                      <input
                                        type="range"
                                        min={1}
                                        max={mineOptions?.length}
                                        value={mineCount}
                                        onChange={(e) => setMineCount(Number(e.target.value))}
                                        className="w-full appearance-none bg-transparent cursor-pointer"
                                      />

                                      {/* Track background */}
                                      <div className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 rounded-full bg-white/10 border border-white/[0.06]" />

                                      {/* Thumb styling */}
                                      <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 40px;
            border-radius: 6px;
            background: #ffffff;
            box-shadow: 0 0 8px rgba(255,255,255,0.4);
            cursor: pointer;
            position: relative;
            margin-top: 4px; /* Center the thumb on the track */
            z-index: 2;
          }

          input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 40px;
            border-radius: 999px;
            background: #ffffff;
            box-shadow: 0 0 8px rgba(255,255,255,0.4);
            cursor: pointer;
          }
        `}</style>
                                    </div>
                                    <div className="w-[18%] flex justify-center items-center bg-[#262628] p-1 rounded-full text-sm text-white gap-1">
                                      <img src={gemImg} alt="gemsaImg" className="w-6 h-6 flex-shrink-0" />

                                      <span className="inline-block w-6 text-left tabular-nums">
                                        {gridSize - mineCount}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Current and last game profit */}
                                {(gameStarted) &&
                                  <div className="mt-2   rounded-2xl  p-2 bg-[#18181A] w-full transition-all duration-500 ease-in-out
            opacity-100 translate-y-0
">
                                    <div className="flex items-center justify-between text-sm p-3 text-white">

                                      {/* Current Profit */}
                                      <div className="flex flex-col items-center justify-between w-1/2">
                                        <span className="text-white">Current Profit</span>
                                        <span className="text-[#F9D028] flex align-middle  justify-center  mt-1">
                                          <span className="flex justify-center items-center align-middle"><span className="inline-flex items-center justify-center font-semibold leading-none">{activeCurrencySymbol}</span></span>
                                          <span className="font-medium">{((betAmount * currentMultiplier).toFixed(2))}</span> </span>

                                      </div>

                                      {/* Center Divider */}
                                      <div className="flex flex-col items-center justify-center ">
                                        {/* <span className="bg-[#2a2a2a] rounded-full h-5 w-5 flex items-center align-middle justify-center text-white font-bold text-[13px] ">
                                                                        &gt;
                                                                    </span> */}
                                        <img
                                          src={cardImageCache["curruentProfNextProfit"]?.src ?? "/dollar.png"}
                                          alt="dollar"
                                          width={18}
                                          height={18}
                                          className={`h-5 w-5 opacity-100 object-contain `}
                                        />
                                      </div>

                                      {/* Next */}
                                      <div className="flex flex-col items-center justify-between w-1/2">
                                        <span className="text-white">Next</span>
                                        <span className="text-[#F9D028] flex justify-center align-middle  mt-1">
                                          <span className="flex justify-center align-middle items-center"><span className="inline-flex items-center justify-center font-semibold leading-none">{activeCurrencySymbol}</span></span>
                                          <span className="font-medium">{nextMultiplier ? ((betAmount * nextMultiplier).toFixed(2)) : 0}</span>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="h-10 rounded-xl w-full  bg-[#262628] flex items-center justify-around">
                                      <div className="flex flex-col items-center justify-between w-1/2">

                                        <span className="text-[#F9D028] text-[14px] font-medium  ">{currentMultiplier.toFixed(2)}x</span>
                                      </div>
                                      <div className="h-full border border-[#18181A] border-r-[0.5px]">
                                      </div>
                                      <div className="flex flex-col items-center justify-between w-1/2">

                                        <span className="text-[#F9D028] font-medium   text-[14px] text-center">{nextMultiplier ? nextMultiplier.toFixed(2) : 0}x</span>
                                      </div>

                                    </div>
                                  </div>
                                }
                                {/* Profit */}
                                {/* <div className="mt-5">
                                                            <div className="flex items-center justify-between text-gray-300 text-sm">
                                                                <span>{`Total profit (${multiplier.toFixed(2)}x)`}</span>
                                                                <span className="text-xs text-gray-400">
                                                                    ${profit.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <div className="relative mt-2">
                                                                <input
                                                                    disabled
                                                                    value={(profit || 0).toFixed(9)}
                                                                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-full px-3 py-3 text-gray-100"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400">
                                                                    ⛃
                                                                </span>
                                                            </div>
                                                        </div> */}
                                {/* Bet Amount */}
                                <div className="mt-2 lg:hidden block">
                                  <div className="flex px-1 items-center font-medium justify-between text-gray-300 text-sm">
                                    <span>Bet Amount</span>
                                    <span className="text-xs text-white flex ">
                                      <span className='flex align-middle items-center'>

                                        {
                                          displayCurrency == 'USD'
                                            ?
                                            (
                                              <span className="inline-flex items-center justify-center font-semibold leading-none">{activeCurrencySymbol}</span>
                                            )
                                            : null
                                          // (
                                          //     <span
                                          //         className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-100"
                                          //             }`}
                                          //     >
                                          //         {currencySymbols[displayCurrency] || displayCurrency}
                                          //     </span>
                                          // )
                                        }
                                      </span>
                                      <span> {displayCurrency == 'USD' ? betAmount : ' '}</span>
                                    </span>                                                    </div>
                                  <div className="relative mt-2">
                                    <span
                                      className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocused ? "opacity-100" : "opacity-50"
                                        }`}
                                    >

                                      {
                                        displayCurrency == 'USD'
                                          ?
                                          (
                                            <span className={`inline-flex items-center justify-center font-semibold leading-none ${isFocused ? "opacity-100" : "opacity-50"}`}>{activeCurrencySymbol}</span>
                                          )
                                          :
                                          (
                                            <span
                                              className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-50"
                                                }`}
                                            >
                                              {currencySymbols[displayCurrency] || displayCurrency}
                                            </span>
                                          )
                                      }
                                    </span>
                                    <input
                                      id="betAmountInput"
                                      data-tooltip-id="betError2"
                                      data-tooltip-place="top"
                                      data-tooltip-offset={10}
                                      data-tooltip-hidden={!errorMsg}
                                      data-tooltip-float={false}
                                      inputMode="decimal"
                                      type="text"
                                      value={(betAmount ?? "0").toString()}
                                      onFocus={(e) => {
                                        setIsFocused(true);
                                        if (["0", "0.0", "0.00", "0.000"].includes(e.target.value)) {
                                          setBetAmount(""); // clear when it's zero
                                        } else {
                                          e.target.select(); // select all if non-zero
                                        }

                                      }}
                                      onChange={(e) => {
                                        if (gameStarted || isAutoPlayOn) return;
                                        // Allow only digits and decimal point
                                        setPlayedBombGif({})
                                        const raw = e.target.value;
                                        let numeric = raw.replace(/[^0-9.]/g, ""); // keep only 0-9 and .

                                        // Prevent multiple dots
                                        if (numeric.split(".").length > 2) {
                                          numeric = numeric.slice(0, numeric.lastIndexOf("."));
                                        }

                                        // Restrict to 2 decimal places
                                        if (numeric.includes(".")) {
                                          const [intPart, decPart] = numeric.split(".");
                                          numeric = intPart + "." + decPart.slice(0, 2);
                                        }

                                        setBetAmount(numeric); // limit to 2 decimals
                                      }}
                                      onBlur={() => {
                                        let val = betAmount;
                                        if (!val || isNaN(parseFloat(val))) {
                                          setBetAmount("0.00");
                                          return;
                                        }
                                        setIsFocused(false)
                                      }}
                                      placeholder="0.00"
                                      className={`w-full bg-[#18181A]   rounded-full pl-8 pr-32 py-2 outline-none    ${errorMsg ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-[#F9D028] "} text-[#94a59e]  focus:text-white`}
                                    />
                                    <Tooltip
                                      id="betError2"
                                      isOpen={Boolean(errorMsg)}
                                      clickable={false}
                                      place="top"
                                      className="!bg-black  !text-white
        !px-3 !py-2 !rounded-full 
        !backdrop-blur-sm !text-xs !font-medium
        !z-[9999]"
                                    >
                                      {errorMsg}
                                    </Tooltip>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-[2px]">
                                      <button
                                        onClick={() => {
                                          if (gameStarted) return;
                                          buttonClickSoundFn()
                                          setBetAmount((prev) => {
                                            let newVal = parseFloat(prev || "0") / 2;

                                            // if less than 0.01, force 0
                                            if (newVal < 0.01) {
                                              newVal = 0;
                                            }

                                            return newVal.toFixed(2); // always show 2 decimals
                                          });
                                        }
                                        }
                                        className="px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333] rounded-l-full text-gray-200 "
                                      >
                                        1/2
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (gameStarted) return;
                                          buttonClickSoundFn()
                                          setBetAmount((prev) =>
                                            Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                          )
                                        }
                                        }
                                        className={`px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333] ${!ShowMAxBetBTN ? "rounded-r-full" : ""} text-gray-200 `}
                                      >
                                        2X
                                      </button>
                                      {ShowMAxBetBTN && <button
                                        onClick={() => {
                                          if (gameStarted) return;
                                          buttonClickSoundFn()
                                          // setBetAmount(MAX_BET)
                                          // compute formatted value synchronously so we can show errors immediately
                                          const numericMax = Number(MAX_BET);
                                          const formatted = Number.isFinite(numericMax) ? numericMax.toFixed(2) : String(MAX_BET);
                                          setBetAmount(formatted);

                                          if (!Number.isFinite(numericMax) || numericMax <= 0) {
                                            setErrorMsg("Insufficient balance");
                                          } else {
                                            setErrorMsg("");
                                          }
                                        }
                                        }
                                        className="px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333]  rounded-r-full text-gray-200 "
                                      >
                                        Max
                                      </button>}
                                    </div>
                                  </div>
                                  {/* {gameOver && (
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold border border-[#333333] bg-[#1a1a1a]/80">
                                                            {result === "win" ? "You win" : "You lost"}
                                                        </div>
                                                    )} */}
                                </div>
                                {/* Random tile */}
                                <div className="mt-2 grid grid-cols-2 gap-3">

                                  <button
                                    onClick={pickRandomTile}
                                    disabled={!gameStarted || IsBtnClick}
                                    className={` w-full    font-medium  py-3 rounded-full ${!gameStarted || IsBtnClick ? "cursor-not-allowed bg-[#262628] border-2 border-[#000000] text-gray-300" : "bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] ring-[#F9D028] hover:ring-[#F9D028] text-black"}`}
                                  >
                                    Pick Random
                                  </button>
                                  <button
                                    onClick={() => cashOut()}
                                    disabled={(!gameStarted || safeReveals === 0) || IsBtnClick}
                                    className={`w-full font-medium py-3 rounded-full  transition-colors    ${(!gameStarted || safeReveals === 0) || IsBtnClick
                                      ? "bg-[#262628] border-2 border-[#000000]  cursor-not-allowed text-gray-300"
                                      : "bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] ring-[#F9D028] hover:ring-[#F9D028] text-black"
                                      }`}
                                  >
                                    Cashout
                                  </button>
                                </div>

                                {/* Actions */}
                                <button
                                  disabled={(gameStarted || IsBtnClick) || errorMsg}
                                  onClick={onBet}
                                  className={`w-full mb-2 mt-2 font-medium flex items-center justify-center  ring-2 text-black disabled:cursor-not-allowed  py-3 rounded-full transition-colors ${gameStarted || IsBtnClick ? " bg-[#262628]  ring-[#000000] cursor-not-allowed" : "bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] ring-[#F9D028] hover:ring-[#F9D028]   "}`}
                                >
                                  {BetLoading ? (
                                    <img
                                      src={SplitImg}
                                      alt="Dealing..."
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 object-contain animate-shake-zoom"
                                    />
                                  ) : (

                                    betAmount == 0 || betAmount == "0.00" ? "Place Bet" : "Place Bet"
                                  )}

                                </button>

                              </>
                            ) : (
                              <>
                                {/* Auto tab fields - exact layout */}
                                <div className="mt-1">
                                  <div className="text-gray-300 text-sm font-medium mb-1 px-1">
                                    Grid Size
                                  </div>

                                  <div className="grid grid-cols-4 gap-[2px] rounded-full bg-[#18181A] p-1">
                                    {sizes.map((size) => {
                                      const isSizeDisabled = [0].includes(size);
                                      const isDisabled = isAutoPlayOn || isSizeDisabled;

                                      return (
                                        <button
                                          key={size}
                                          disabled={isDisabled}
                                          onClick={() => {
                                            if (isDisabled) return;
                                            if (isAutoPlayOn) return;
                                            if (size < gridSize) {
                                              setMineCount(3)
                                            }
                                            setCells(Array.from({ length: size }, () => -1));
                                            GridSizeChangeMin2();
                                            setGridSize(size);
                                            setGameOver(false);

                                            setisBomb(false);
                                            setselectedAutoPlayCards([]);
                                            setremainingPositions([]);
                                          }}
                                          className={`
            py-2 ${size == 64 ? 'rounded-r-full' : size == 25 ? "rounded-l-full" : ''}   text-sm transition-all
            ${gridSize === size
                                              ? "bg-[#F9D028] text-black font-semibold"
                                              : "bg-[#262628] hover:bg-[#333333] text-white hover:opacity-80"
                                            }
            ${isDisabled
                                              ? "opacity-50 cursor-not-allowed hover:bg-[#1a1a1a]"
                                              : ""
                                            }
          `}
                                        >
                                          {size}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>


                                {/* Mines & Gems */}
                                <div className="mt-1">
                                  <div className="text-gray-300 text-sm font-medium mb-1 px-1">
                                    Number of Mines
                                  </div>
                                  <div className="w-full  bg-[#18181A] px-1 py-1 rounded-full flex items-center justify-between gap-2">
                                    <div className=" w-[18%] flex justify-center items-center  bg-[#262628] p-1 rounded-full text-sm text-white">
                                      <img src={bomb_static} alt="BombaImg" className="w-8 h-8 p-1" /> <span className="inline-block w-6 text-left tabular-nums"> {mineCount}</span>
                                    </div>
                                    {/* Slider */}
                                    <div className="relative w-[60%]">
                                      <input
                                        type="range"
                                        min={1}
                                        max={24}
                                        value={mineCount}
                                        onChange={(e) => setMineCount(Number(e.target.value))}
                                        className="w-full appearance-none bg-transparent cursor-pointer"
                                      />

                                      {/* Track background */}
                                      <div className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 rounded-full bg-white/10 border border-white/[0.06]" />

                                      {/* Thumb styling */}
                                      <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 40px;
            border-radius: 6px;
            background: #ffffff;
            box-shadow: 0 0 8px rgba(255,255,255,0.4);
            cursor: pointer;
            position: relative;
            margin-top: 4px; /* Center the thumb on the track */
            z-index: 2;
          }

          input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 40px;
            border-radius: 999px;
            background: #ffffff;
            box-shadow: 0 0 8px rgba(255,255,255,0.4);
            cursor: pointer;
          }
        `}</style>
                                    </div>
                                    <div className="w-[18%] flex justify-center items-center bg-[#262628] p-1 rounded-full text-sm text-white gap-1">
                                      <img src={gemImg} alt="gemsaImg" className="w-6 h-6 flex-shrink-0" />

                                      <span className="inline-block w-6 text-left tabular-nums">
                                        {gridSize - mineCount}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Number of bets */}
                                <div className="mt-1">
                                  <div className="text-gray-300 font-medium text-sm mb-1 px-1">
                                    Number of bets
                                  </div>
                                  <div className="relative">
                                    <input
                                      value={numberOfBets === "Infinite" ? "Infinite" : numberOfBets}
                                      placeholder={numberOfBets === "Infinite" ? "" : "0"}
                                      onFocus={(e) => {
                                        // ✅ RainBet behavior: clicking input clears Infinite mode instantly
                                        if (numberOfBets === "Infinite") {
                                          setNumberOfBets("");
                                          setTimeout(() => e.target.focus(), 0); // ensure focus returns for typing
                                        } else if (numberOfBets === 0 || numberOfBets === "0") {
                                          setNumberOfBets(""); // clear 0 for easy typing
                                        } else {
                                          e.target.select(); // if not infinite or zero, select all
                                        }
                                      }}
                                      onBlur={() => {
                                        let val = numberOfBets;
                                        // If empty or invalid → set to 0.00
                                        if (!val || isNaN(parseFloat(val))) {
                                          setNumberOfBets("Infinite");
                                          return;
                                        }
                                      }}
                                      onChange={(e) => {
                                        if (gameStarted || isAutoPlayOn) return;
                                        const val = e.target.value;
                                        const num = val.replace(/[^0-9]/g, "");
                                        setNumberOfBets(num === "" ? "" : parseInt(num));
                                      }}
                                      type="text"
                                      inputMode="numeric"

                                      className="w-full bg-[#18181A]   rounded-full outline-none   focus:ring-2 focus:ring-[#F9D028] px-3 py-2 text-gray-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isAutoPlayOn) return;
                                        // toggle infinite mode manually via ∞ button
                                        if (numberOfBets === "Infinite") {
                                          setNumberOfBets("1"); // back to normal input mode
                                        } else {
                                          setNumberOfBets("Infinite");
                                        }
                                      }}
                                      className={`absolute text-[20px] sm:text-[20px] md:text-[22px] lg:text-[22px] xl:text-[22px] right-3 top-[42.2%] -translate-y-1/2 transition-colors ${numberOfBets === "Infinite"
                                        ? "text-white"
                                        : "text-gray-400 hover:text-gray-200"
                                        }`}
                                    >
                                      ∞
                                    </button>
                                  </div>
                                </div>
                                {/* On Win */}

                                <div className="flex mt-1 mr-2 justify-between items-center text-gray-300 text-sm">
                                  <span className='font-medium px-1'>Advanced</span>
                                  <button
                                    type="button"
                                    onClick={() => setCheckedAdv(!checkedAdv)}
                                    className={`relative inline-flex h-5 w-12 border-[1px] border-[#333333] items-center rounded-full transition-colors duration-200 ${checkedAdv ? "bg-[#F9D028]" : "bg-gray-400"}`}
                                  >
                                    <span className={`inline-block h-4 w-5 transform rounded-full shadow transition-transform duration-200 ${checkedAdv ? "translate-x-6 bg-[#000000]" : "translate-x-1 bg-[#333333]"}`} />
                                  </button>
                                </div>
                                {checkedAdv &&
                                  (<>
                                    <div className="mt-1">
                                      <div className="text-gray-300 font-medium text-sm mb-1 px-1">On Win</div>
                                      <div className="flex items-center justify-between bg-[#18181A] p-1 rounded-full outline-none focus-within:ring-2 focus-within:ring-[#F9D028] ">
                                        <div className="flex items-center">
                                          {/* ✅ Reset button fades when value <= 0 */}
                                          <button
                                            disabled={parseFloat(onWinIncrease || "0") <= 0}
                                            onClick={() => {
                                              if (gameStarted || isAutoPlayOn) return;
                                              buttonClickSoundFn();
                                              setOnWinIncrease("0.00");
                                            }}
                                            className={`px-2 font-medium py-[8px] rounded-full text-sm text-white transition   
          ${parseFloat(onWinIncrease || "0") > 0
                                                ? "bg-[#262628]  hover:bg-[#333333] cursor-pointer"
                                                : "bg-[#262628]  cursor-not-allowed "
                                              }`}
                                          >
                                            Reset
                                          </button>

                                          <button className="px-2 py-[8px] ml-2 font-medium rounded-full text-[#FFFFFFB2] text-sm">
                                            Increase by:
                                          </button>

                                          <input
                                            disabled={gameStarted}
                                            type="text"
                                            step="0.01"
                                            min="0"
                                            value={onWinIncrease}
                                            placeholder="0.00"
                                            onChange={(e) => {
                                              if (gameStarted || isAutoPlayOn) return;
                                              let raw = e.target.value;

                                              // Keep only digits and decimal point
                                              let numeric = raw.replace(/[^0-9.]/g, "");

                                              // Prevent multiple dots
                                              if (numeric.split(".").length > 2) {
                                                numeric = numeric.slice(0, numeric.lastIndexOf("."));
                                              }

                                              // Restrict to 2 decimal places
                                              if (numeric.includes(".")) {
                                                const [intPart, decPart] = numeric.split(".");
                                                numeric = intPart + "." + decPart.slice(0, 2);
                                              }
                                              setOnWinIncrease(numeric === "" ? "" : numeric);
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setOnWinIncrease("");
                                              else e.target.select();
                                            }}
                                            className="w-1/3 bg-[#18181A] font-medium outline-none rounded-full px-2 py-2 text-gray-200"
                                          />
                                        </div>

                                        <span className="px-2 py-2 font-medium rounded-full text-gray-200">%</span>
                                      </div>
                                    </div>

                                    {/* On Loss */}
                                    <div className="mt-1">
                                      <div className="text-gray-300 text-sm font-medium mb-1 px-1">On Loss</div>
                                      <div className="flex items-center justify-between bg-[#18181A] p-1 rounded-full outline-none focus-within:ring-2 focus-within:ring-[#F9D028] ">
                                        <div className="flex items-center">
                                          {/* ✅ Reset button fades when value <= 0 */}
                                          <button
                                            disabled={parseFloat(onLoseIncrease || "0") <= 0}
                                            onClick={() => {
                                              if (gameStarted || isAutoPlayOn) return;

                                              buttonClickSoundFn();
                                              setOnLoseIncrease("0.00");
                                            }}
                                            className={`px-2 font-medium py-[7px] rounded-full text-sm text-white transition 
          ${parseFloat(onLoseIncrease || "0") > 0
                                                ? "bg-[#262628]  hover:bg-[#333333] cursor-pointer"
                                                : "bg-[#262628]  cursor-not-allowed "
                                              }`}
                                          >
                                            Reset
                                          </button>

                                          <button className="px-2 py-[8px] ml-2 font-medium rounded-full text-[#FFFFFFB2] text-sm ">
                                            Increase by:
                                          </button>

                                          <input
                                            disabled={gameStarted}
                                            type="text"
                                            step="0.01"
                                            min="0"
                                            value={onLoseIncrease}
                                            placeholder="0.00"
                                            onChange={(e) => {
                                              if (gameStarted || isAutoPlayOn) return;
                                              let raw = e.target.value;

                                              // Keep only digits and decimal point
                                              let numeric = raw.replace(/[^0-9.]/g, "");

                                              // Prevent multiple dots
                                              if (numeric.split(".").length > 2) {
                                                numeric = numeric.slice(0, numeric.lastIndexOf("."));
                                              }

                                              // Restrict to 2 decimal places
                                              if (numeric.includes(".")) {
                                                const [intPart, decPart] = numeric.split(".");
                                                numeric = intPart + "." + decPart.slice(0, 2);
                                              }
                                              setOnLoseIncrease(numeric === "" ? "" : numeric);
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setOnLoseIncrease("");
                                              else e.target.select();
                                            }}
                                            className="w-1/3 font-medium bg-[#18181A] outline-none rounded-full px-2 py-2 text-gray-200"
                                          />
                                        </div>

                                        <span className="px-2 py-2 font-medium rounded-full text-gray-200">%</span>
                                      </div>
                                    </div>


                                    <div className="flex justify-between gap-3">
                                      <div className="mt-1">
                                        <div className="flex items-center justify-between text-gray-300 text-sm">
                                          <span className='font-medium px-1'>Stop on profit</span>
                                        </div>
                                        <div className="relative mt-2">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a59e] select-none">

                                            {
                                              displayCurrency == 'USD'
                                                ?
                                                (
                                                  <span className="inline-flex items-center justify-center font-semibold leading-none opacity-80">{activeCurrencySymbol}</span>
                                                )
                                                :
                                                (
                                                  <span
                                                    className={`w-[1em] h-[1em] object-contain opacity-80`}
                                                  >
                                                    {currencySymbols[displayCurrency] || displayCurrency}
                                                  </span>
                                                )
                                            }
                                          </span>
                                          <input
                                            disabled={gameStarted}
                                            value={onWinStopBet}
                                            inputMode="text"
                                            placeholder='0.00'
                                            onChange={(e) => {
                                              if (gameStarted || isAutoPlayOn) return;
                                              let raw = e.target.value;

                                              // Keep only digits and decimal point
                                              let numeric = raw.replace(/[^0-9.]/g, "");

                                              // Prevent multiple dots
                                              if (numeric.split(".").length > 2) {
                                                numeric = numeric.slice(0, numeric.lastIndexOf("."));
                                              }

                                              // Restrict to 2 decimal places
                                              if (numeric.includes(".")) {
                                                const [intPart, decPart] = numeric.split(".");
                                                numeric = intPart + "." + decPart.slice(0, 2);
                                              }
                                              setOnWinStopBet(numeric)
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setOnWinStopBet("");
                                              else e.target.select();
                                            }}

                                            className="w-full  bg-[#18181A] outline-none focus:ring-2 focus:ring-[#F9D028]   rounded-full pl-10 pr-8 py-2 text-gray-200"
                                          />
                                        </div>
                                      </div>

                                      {/* Stop on Loss */}
                                      <div className="mt-1">
                                        <div className="flex items-center justify-between text-gray-300 text-sm">
                                          <span className='font-medium px-1'>Stop on Loss</span>
                                        </div>
                                        <div className="relative mt-2">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a59e] select-none">

                                            {
                                              displayCurrency == 'USD'
                                                ?
                                                (
                                                  <span className="inline-flex items-center justify-center font-semibold leading-none opacity-80">{activeCurrencySymbol}</span>
                                                )
                                                :
                                                (
                                                  <span
                                                    className={`w-[1em] h-[1em] object-contain opacity-80`}
                                                  >
                                                    {currencySymbols[displayCurrency] || displayCurrency}
                                                  </span>
                                                )
                                            }
                                          </span>
                                          <input
                                            disabled={gameStarted}
                                            placeholder='0.00'
                                            value={onLoseStopBet}
                                            inputMode="text"
                                            onChange={(e) => {
                                              if (gameStarted || isAutoPlayOn) return;
                                              let raw = e.target.value;

                                              // Keep only digits and decimal point
                                              let numeric = raw.replace(/[^0-9.]/g, "");

                                              // Prevent multiple dots
                                              if (numeric.split(".").length > 2) {
                                                numeric = numeric.slice(0, numeric.lastIndexOf("."));
                                              }

                                              // Restrict to 2 decimal places
                                              if (numeric.includes(".")) {
                                                const [intPart, decPart] = numeric.split(".");
                                                numeric = intPart + "." + decPart.slice(0, 2);
                                              }
                                              setOnLoseStopBet(numeric)
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setOnLoseStopBet("");
                                              else e.target.select();
                                            }}

                                            className="w-full bg-[#18181A]  outline-none focus:ring-2 focus:ring-[#F9D028]   rounded-full pl-10 pr-8 py-2 text-gray-200"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </>)

                                }
                                {/* Bet Amount */}
                                <div className="mt-2 lg:hidden block">
                                  <div className="flex items-center px-1 font-medium justify-between text-gray-300 text-sm">
                                    <span>Bet Amount</span>
                                    <span className="text-xs text-white flex ">
                                      <span className='flex align-middle items-center'>

                                        {
                                          displayCurrency == 'USD'
                                            ?
                                            (
                                              <span className="inline-flex items-center justify-center font-semibold leading-none">{activeCurrencySymbol}</span>
                                            )
                                            : null
                                          // (
                                          //     <span
                                          //         className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-100"
                                          //             }`}
                                          //     >
                                          //         {currencySymbols[displayCurrency] || displayCurrency}
                                          //     </span>
                                          // )
                                        }
                                      </span>
                                      <span> {displayCurrency == 'USD' ? betAmount : ' '}</span>
                                    </span>                                                    </div>
                                  <div className="relative mt-2">
                                    <span
                                      className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocused ? "opacity-100" : "opacity-50"
                                        }`}
                                    >

                                      {
                                        displayCurrency == 'USD'
                                          ?
                                          (
                                            <span className={`inline-flex items-center justify-center font-semibold leading-none ${isFocused ? "opacity-100" : "opacity-50"}`}>{activeCurrencySymbol}</span>
                                          )
                                          :
                                          (
                                            <span
                                              className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-50"
                                                }`}
                                            >
                                              {currencySymbols[displayCurrency] || displayCurrency}
                                            </span>
                                          )
                                      }
                                    </span>
                                    <input
                                      id="betAmountInput"
                                      data-tooltip-id="betError3"
                                      data-tooltip-place="top"
                                      data-tooltip-offset={10}
                                      data-tooltip-hidden={!errorMsg}
                                      data-tooltip-float={false}
                                      inputMode="decimal"
                                      type="text"
                                      value={(betAmount ?? "0").toString()}
                                      onFocus={(e) => {
                                        setIsFocused(true);
                                        if (["0", "0.0", "0.00", "0.000"].includes(e.target.value)) {
                                          setBetAmount(""); // clear when it's zero
                                        } else {
                                          e.target.select(); // select all if non-zero
                                        }

                                      }}
                                      onChange={(e) => {
                                        if (gameStarted || isAutoPlayOn) return;
                                        // Allow only digits and decimal point
                                        setPlayedBombGif({})
                                        const raw = e.target.value;
                                        let numeric = raw.replace(/[^0-9.]/g, ""); // keep only 0-9 and .

                                        // Prevent multiple dots
                                        if (numeric.split(".").length > 2) {
                                          numeric = numeric.slice(0, numeric.lastIndexOf("."));
                                        }

                                        // Restrict to 2 decimal places
                                        if (numeric.includes(".")) {
                                          const [intPart, decPart] = numeric.split(".");
                                          numeric = intPart + "." + decPart.slice(0, 2);
                                        }

                                        setBetAmount(numeric); // limit to 2 decimals
                                      }}
                                      onBlur={() => {
                                        let val = betAmount;
                                        if (!val || isNaN(parseFloat(val))) {
                                          setBetAmount("0.00");
                                          return;
                                        }
                                        setIsFocused(false)
                                      }}
                                      placeholder="0.00"
                                      className={`w-full bg-[#18181A]   rounded-full pl-8 pr-32 py-2 outline-none    ${errorMsg ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-[#F9D028] "} text-[#94a59e]  focus:text-white`}
                                    />
                                    <Tooltip
                                      id="betError3"
                                      isOpen={Boolean(errorMsg)}
                                      clickable={false}
                                      place="top"
                                      className="!bg-black  !text-white
        !px-3 !py-2 !rounded-full 
        !backdrop-blur-sm !text-xs !font-medium
        !z-[9999]"
                                    >
                                      {errorMsg}
                                    </Tooltip>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-[2px]">
                                      <button
                                        onClick={() => {
                                          if (gameStarted) return;
                                          buttonClickSoundFn()
                                          setBetAmount((prev) => {
                                            let newVal = parseFloat(prev || "0") / 2;

                                            // if less than 0.01, force 0
                                            if (newVal < 0.01) {
                                              newVal = 0;
                                            }

                                            return newVal.toFixed(2); // always show 2 decimals
                                          });
                                        }
                                        }
                                        className="px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333] rounded-l-full text-gray-200 "
                                      >
                                        1/2
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (gameStarted) return;
                                          buttonClickSoundFn()
                                          setBetAmount((prev) =>
                                            Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                          )
                                        }
                                        }
                                        className={`px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333] ${!ShowMAxBetBTN ? "rounded-r-full" : ""} text-gray-200 `}
                                      >
                                        2X
                                      </button>
                                      {ShowMAxBetBTN && <button
                                        onClick={() => {
                                          if (gameStarted) return;
                                          buttonClickSoundFn()
                                          // setBetAmount(MAX_BET)
                                          // compute formatted value synchronously so we can show errors immediately
                                          const numericMax = Number(MAX_BET);
                                          const formatted = Number.isFinite(numericMax) ? numericMax.toFixed(2) : String(MAX_BET);
                                          setBetAmount(formatted);

                                          if (!Number.isFinite(numericMax) || numericMax <= 0) {
                                            setErrorMsg("Insufficient balance");
                                          } else {
                                            setErrorMsg("");
                                          }
                                        }
                                        }
                                        className="px-2 py-1 text-xs bg-[#262628] hover:bg-[#333333]  rounded-r-full text-gray-200 "
                                      >
                                        Max
                                      </button>}
                                    </div>
                                  </div>
                                  {/* {gameOver && (
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold border border-[#333333] bg-[#1a1a1a]/80">
                                                            {result === "win" ? "You win" : "You lost"}
                                                        </div>
                                                    )} */}
                                </div>
                                <div className={`flex justify-between gap-3  ${checkedAdv ? "lg:sticky lg:bottom-0 lg:pb-4 lg:pt-1 lg:w-full lg:bg-[#262628] lg:ring-4 lg:ring-[#262628]" : ""} `}>
                                  {
                                    isAutoPlayOn && mode === 'auto'
                                      ?
                                      <button
                                        disabled={selectedAutoPlayCards.length === 0 || isbetStopeing}
                                        onClick={StopeAutoPlay}
                                        className={`mt-2 w-full   text-black bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] font-medium py-3 rounded-full transition-colors ${selectedAutoPlayCards.length === 0 ? " bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] ring-2 ring-[#F9D028] cursor-not-allowed" : "bg-[#linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] ring-2 ring-[#F9D028] hover:ring-[#F9D028]    "}`}
                                      >
                                        {isbetStopeing ? 'Stopping...' : 'Stop Bet'}
                                      </button>

                                      :
                                      <button
                                        disabled={(mode !== "auto" || isAutoPlayOn) || selectedAutoPlayCards.length === 0 || errorMsg}
                                        onClick={onBet}
                                        className={`mt-2 w-full flex items-center justify-center disabled:bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] disabled:ring-2 disabled:ring-[#F9D028]  disabled:cursor-not-allowed  text-black font-medium py-3 rounded-full transition-colors ${(mode !== "auto" || isAutoPlayOn) || selectedAutoPlayCards.length === 0 ? " bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)]  ring-2 ring-[#F9D028]  cursor-not-allowed" : " ring-2 ring-[#F9D028] hover:ring-[#F9D028]   bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)]"}`}
                                      >
                                        {BetLoading ? (
                                          <img
                                            src={SplitImg}
                                            alt="Dealing..."
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 object-contain animate-shake-zoom"
                                          />
                                        ) : (
                                          
                                          betAmount == 0 || betAmount == "0.00" ? "Place Bet" : "Place Bet"
                                        )}
                                      </button>

                                  }
                                  {
                                    <button
                                      disabled={(isAutoPlayOn) || errorMsg || gameStarted}
                                      onClick={pickRandomTileAuto}
                                      className={`mt-2 w-full flex items-center justify-center  text-black font-medium py-3 rounded-full transition-colors ${(isAutoPlayOn) ? " bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)] ring-2 ring-[#F9D028]  cursor-not-allowed" : "bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)]  ring-2 ring-[#F9D028] hover:ring-[#F9D028] "}`}
                                    >
                                      Random Pick
                                    </button>

                                  }
                                </div>
                              </>
                            )}
                          {/* Tabs */}
                          <div className="lg:hidden flex items-center gap-1 bg-[#18181A] rounded-full p-1 border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)] mt-2">
                            {[
                              { key: "manual", label: "Manual" },
                              { key: "auto", label: "Auto" },
                            ].map((t) => (
                              <button
                                key={t.key}
                                onClick={() => {
                                  buttonClickSoundFn()
                                  if (gameStarted) return;
                                  if (isAutoPlayOn) return;
                                  // setselectedAutoPlayCards([])
                                  // setGridSize(25)
                                  setremainingPositions([])
                                  setCells(Array.from({ length: gridSize }, () => -1));
                                  setMode(t.key)
                                  setGameOver(false)
                                  setPlayedBombGif({})
                                  setisAutoPlayOn(false)
                                  setIsBtnClick(false)
                                }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors ${mode === t.key
                                  ? "bg-[#333333] text-white border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.3)]"
                                  : "bg-transparent text-gray-400 hover:text-white"
                                  }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                          </div>
                        </div>

                      </div>

                      {/* Right content: grid */}


                      <div className="order-2 lg:w-[70%] xl:w-[65%] flex flex-col lg:relative justify-center align-middle items-center w-full lg:min-h-[500px] xl:min-h-[500px] 2xl:min-h-[600px]">
                        {/* <div className="flex flex-row justify-between  items-center bg-gradient-to-br from-[#3c3a55] via-[#4a4967] to-[#8f8da6] rounded-t-xl "> */}
                        {/* <div className="w-full  text-white lg:rounded-lr-xl lg:flex flex-row justify-between  items-center p-1 bg-gradient-to-r from-[#FFFFFF4D] to-[#FFFFFF33] ">
                          <div direction="row" spacing={2} >
                            <Button
                              style={{
                                fontWeight: "500",
                                fontSize: "16px",
                                color: "white",
                                textTransform: "none",

                              }}
                            >
                              <img src={BlackjackImg} alt="Blackjack" className="w-[16px] h-[18px] mr-1" />
                              Blackjack
                            </Button>
                          </div>

                          <div>
                            <Button
                              style={{
                                // background: "#F9D028",
                                fontWeight: "500",
                                fontSize: "16px",
                                color: "white",
                                textTransform: "none",

                              }}
                            >
                              <img src={FairplayImg} alt="Blackjack" className="w-[14px] h-[18px] mr-1" />
                              Fairness
                            </Button>
                          </div>
                        </div> */}
                        {/* </div> */}
                        <div className="lg:order-1 w-full md:w-full relative lg:min-h-[500px] xl:min-h-[500px] 2xl:min-h-[600px] flex items-center justify-center">
                          <div className="relative w-full h-full rounded-2xl p-3 md:p-5 lg:p-6 xl:p-8 flex items-center justify-center">
                            {/* subtle center watermark */}
                            {/* <img
                                                        src={watermarkImg}
                                                        alt="watermark"
                                                        fill
                                                        className="pointer-events-none select-none absolute inset-0 m-auto w-1/2 opacity-1 object-contain"
                                                    /> */}

                            <div
                              className={`relative grid gap-2 z-10`}
                              style={{
                                ...gridTemplateStyle,
                                gridAutoRows: "1fr",
                                width: "min(80vw, 80vh)",
                                height: "min(80vw, 80vh)",
                                maxWidth: "600px",
                                maxHeight: "600px",
                                margin: "auto",
                              }}
                            >
                              {cells.map((type, idx) => {
                                // const isRevealed = revealed[idx];
                                // const isBomb = type === "bomb";
                                const isRevealed = type === 1 || type === 0;
                                const isBomb = type === 0;
                                const isAnimating = animatingTiles.includes(idx);
                                const isAutoIndexSelected = selectedAutoPlayCards.includes(idx) && mode === 'auto';
                                // console.log('is auto selected', isAutoIndexSelected)
                                const lowOpacity = remainingPositions.includes(idx);
                                if ((!lowOpacity && isBomb) && (isRevealed && idx === revealedIndex)) {
                                  setRevealedIndex(null)
                                  mineMineBomb();
                                  if (!isAutoPlayOn) {
                                    setisBomb(true)
                                  }
                                } else if (((isRevealed && !isBomb) && idx === revealedIndex) && !lowOpacity) {
                                  setRevealedIndex(null)
                                  // console.log('play diamond sound', playedSound);
                                  mineDiamond1();
                                  // if (playedSound.length <= 4) {
                                  //     mineDiamond1();
                                  // } else if (playedSound.length <= 9) {
                                  //     mineDiamond2();
                                  // } else if (playedSound.length <= 13) {
                                  //     mineDiamond3();
                                  // } else if (playedSound.length <= 18) {
                                  //     mineDiamond4();
                                  // } else if (playedSound.length <= 22) {
                                  //     mineDiamond5();
                                  // } else if (playedSound.length <= 25) {
                                  //     mineDiamond6();
                                  // } else {
                                  //     mineDiamond6();
                                  // }
                                  playedSound = playedSound.length > 0 ? [...playedSound, idx] : [idx];
                                }
                                let cellFunction = () => {
                                  if (mode === 'auto') {
                                    return isAutoPlayOn;
                                  } else if (mode) {
                                    return !gameStarted || isRevealed || IsBtnClick;
                                  }
                                }

                                // if (isBomb && isRevealed && !playedBombGif[idx]) {
                                //     setPlayedBombGif(prev => ({ ...prev, [idx]: true }));
                                // }
                                let disableBtn = cellFunction();
                                if ((isBomb && !lowOpacity) && ShowAnimation) {

                                  setTimeout(() => {
                                    setPlayedBombGif(prev => ({ ...prev, [idx]: true }));

                                    // setBombPlayedMap(prev => ({ ...prev, [idx]: true }));
                                  }, 860);
                                }
                                return (
                                  <button
                                    key={idx}
                                    disabled={disableBtn}
                                    // onMouseOver={() => { if (!isRevealed && !isAutoPlayOn) return mineHoverHiddenBlockHover() }}
                                    onClick={() => revealIndex(idx, true)}
                                    className={`rounded-2xl z-50 rl-liquid-glow ${lowOpacity ? "opacity-40" : ""}
                  transition-all relative flex items-center aspect-square
                   justify-center
                   ${tileMultipliers[idx] ? 'overflow-visible' : 'overflow-hidden'}

                  ${isRevealed && !lowOpacity
                                        ? "!bg-white/[0.10]"
                                        : `!bg-transparent !backdrop-blur-0 ${!isAutoPlayOn && !isAutoIndexSelected && ShowAnimation ? "lg:hover:scale-95 origin-top hover:w-full  lg:hover:shadow-[0_6px_0_0_#F9D028,0_14px_18px_rgba(0,0,0,0.25)] bubble-effect bubblee lg:active:origin-center  lg:active:shadow-none lg:active:scale-100" : ""} `

                                      } ${isAutoIndexSelected ? ` !bg-[#2a2a2a] ring-2 ring-[#F9D028] ${ShowAnimation ? "lg:hover:shadow-[0_6px_0_0_#F9D028,0_14px_18px_rgba(0,0,0,0.25)]  lg:hover:scale-95 origin-top hover:w-full bubble-effect bubblee lg:active:origin-center lg:active:shadow-none lg:active:scale-100" : ""}   ` : ""}`}
                                  >
                                    {/* {!isRevealed && <span className="absolute inset-0" />} */}

                                    {isRevealed && (
                                      <span
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                          background:
                                            "linear-gradient(120deg, rgba(9.73,65) 0%, rgba(9.73,65) 100%)",
                                          borderRadius: "inherit",
                                          zIndex: 1,
                                        }}
                                      />
                                    )}

                                    {isRevealed && (
                                      <div className="absolute inset-0 flex items-center justify-center z-10 p-1">
                                        <div
                                          className={`w-full h-full flex items-center justify-center `}
                                        >


                                          <img
                                            src={isBomb ? (
                                              (playedBombGif[idx] || lowOpacity) || (isAutoPlayOn || !ShowAnimation)
                                                ? cardImageMap["bomb_static"]   // freeze after first time
                                                : cardImageMap["bomb"]          // play GIF only once
                                            ) : !ShowAnimation ? cardImageMap["gem1"] : randomGemMap[idx] ?? cardImageMap["gem1"]}
                                            alt={isBomb ? "bomb" : "gem"}
                                            width={100}
                                            height={95}
                                            className={`object-contain w-[80%] h-[74%] ${isAnimating ? "animate-zoom-in-center" : ""}`}
                                          />

                                          {/* ✨ Shiny sparkles for gems only */}
                                          {/* {!isBomb && (
                                                                                    <div className="sparkle-container">
                                                                                        <div className="sparkle" />
                                                                                        <div className="sparkle" />
                                                                                        <div className="sparkle" />
                                                                                    </div>
                                                                                )} */}
                                          {/* show current multiplyier here for 500 mili seconts */}
                                          {!isBomb && mode == "manual" && tileMultipliers[idx] && (
                                            <div
                                              className="
      absolute bottom-[-8px]
      text-[7px] sm:text-xs
      h-[16px] w-[28px] md:h-[20px] md:w-auto
      md:p-2 lg:px-1
       flex items-center justify-center
      font-normal
      rounded-full
      pointer-events-none
      border-[1px] border-[#F9D028]
      text-black
      bg-[linear-gradient(180deg,#F9D028_0%,#F9D028_100%)]
      shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]
      z-[500]
      animate-zoom-in-center
    "
                                            // style={{
                                            //   background: "linear-gradient(180deg, #7EF0C4 0%, #1FBF84 100%)",
                                            //   transform: 'translateY(0)'
                                            // }}
                                            >
                                              {tileMultipliers[idx].value.toFixed(2)}x
                                            </div>
                                          )}
                                        </div>

                                        {/* highlight ring */}
                                        {/* <div
                                                                                className={`absolute inset-0 rounded-full ${isBomb ? "ring-2 ring-red-600/30" : "ring-2 ring-emerald-500/30"
                                                                                    }`}
                                                                            /> */}
                                      </div>
                                    )}

                                  </button>

                                );
                              })}
                            </div>


                            {/* Win blast overlay */}
                            {gameOver && result === "win" && (
                              <div className="pointer-events-none absolute inset-0 z-30">
                                <div className="flash-win-loop absolute inset-0" />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-4 border-emerald-400/70 shadow-[0_0_30px_rgba(16,185,129,.35)] shockwave-win-loop" />
                                {Array.from({ length: 16 }).map((_, i) => (
                                  <span
                                    key={`pwin-${i}`}
                                    className="particle-loop"
                                    style={{
                                      background: i % 2 ? "#34d399" : "#10b981",
                                      transformOrigin: "center",
                                      ["--tx"]: `${Math.cos((i / 16) * 6.283) * 140}px`,
                                      ["--ty"]: `${Math.sin((i / 16) * 6.283) * 140}px`,
                                      ["--delay"]: `${i * 0.03}s`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Loss blast overlay */}
                            {gameOver && result === "loss" && (
                              <div className="pointer-events-none absolute inset-0 z-30">
                                <div className="flash-loss-loop absolute inset-0" />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-4 border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,.35)] shockwave-loss-loop" />
                                {Array.from({ length: 18 }).map((_, i) => (
                                  <span
                                    key={`ploss-${i}`}
                                    className="particle-loop"
                                    style={{
                                      background:
                                        i % 3 === 0
                                          ? "#f87171"
                                          : i % 3 === 1
                                            ? "#ef4444"
                                            : "#fb923c",
                                      transformOrigin: "center",
                                      ["--tx"]: `${Math.cos((i / 18) * 6.283) * 150}px`,
                                      ["--ty"]: `${Math.sin((i / 18) * 6.283) * 150}px`,
                                      ["--delay"]: `${i * 0.025}s`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Animated result messages */}
                            {(gameOver && !isBomb) && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                                <div className="animate-popIn px-6 py-3 rounded-2xl rl-liquid-glow bg-[#F9D028]/15 border-2 border-[#F9D028] text-white shadow-[0_0_30px_rgba(249,208,40,0.35)] backdrop-blur-md">
                                  <div className="flex-col flex items-center justify-center w-20 gap-2">
                                    <span className="text-lg font-semibold text-[#F9D028]">
                                      {multiplier.toFixed(2)} X
                                    </span>

                                    <span className="border border-white/40 w-4"></span>
                                    <span className="text-base font-semibold flex items-center justify-center">
                                      <span className="select-none mr-1">
                                        <span className="inline-flex items-center justify-center font-semibold leading-none">{activeCurrencySymbol}</span>
                                      </span>
                                      {(Number(betAmount) * Number(multiplier)).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {gameOver && result === "loss" && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                                <div className="animate-popIn px-6 py-3 rounded-2xl bg-red-600/20 border border-red-400 text-red-100 shadow-xl backdrop-blur-sm">
                                  <span className="text-lg font-semibold">
                                    Sorry, better luck next time 💥
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* <div className={`absolute bottom-3 ${gameOver && !isBomb ? "-right-[1rem] " : "-right-[2rem] "}  z-20 pointer-events-none`}>
                                                <img
                                                    key={currentGif}
                                                    src={cardImageCache[currentGif]?.src}
                                                    alt="Gift animation"
                                                    width={80}
                                                    height={80}
                                                    className={`
      hidden lg:block
      lg:w-[11rem] xl:w-[15rem] 2xl:w-[16rem]
      object-contain
      transition-opacity duration-200 ease-in-out
      ${gifVisible ? "opacity-100" : "opacity-0"}
    `}
                                                    // unoptimized
                                                />
                                            </div> */}
                      </div>

                    </div>

                  </div>
                  <div className="px-2 lg:px-0 pb-2 lg:pb-0">
                    <Footer setisFavorite={setisFavorite} isFavorite={isFavorite} setStats={setStats} stats={stats} gameData={gameData} ShowMAxBetBTN={ShowMAxBetBTN} setShowMAxBetBTN={setShowMAxBetBTN} setplayFast={setplayFast} playFast={playFast} setShowAnimation={setShowAnimation} ShowAnimation={ShowAnimation} setHotkeysEnabled={setHotkeysEnabled} hotkeysEnabled={hotkeysEnabled} socket={socket} showInBigScreen={showInBigScreen} setshowInBigScreen={setshowInBigScreen} gameHotKeys={HOtKeys} />
                    {/* <Description gameData={gameData} setisFavorite={setisFavorite} isFavorite={isFavorite} /> */}
                    {/* <BetDashboard /> */}
                    {/* <div className="mt-[10px]">
                      <LatestBetTable />
                    </div> */}
                 
                  </div>
                </div>


              </div>

            </main >
          )
          :
          (
            (loadingGame) ? (
              <div className="flex flex-col justify-center  gap-6 items-center p-4 h-full">
                {/* <LoaderContent /> ✅ custom loader */}
                Loading...
              </div>
            )
              :
              gameLoadError ? (
                <div className="flex flex-col justify-center  gap-6 items-center p-4 h-full">
                  <span className="text-red-500">Something Wrong !</span></div>
              ) : (<>
                <main className="flex h-full w-full select-none flex-col  my-2 gap-5 md:min-h-[80vh]">
                  {/* Back button */}

                  {/* Main layout */}
                  <div className="flex flex-col md:flex-row items-center h-full min-w-full min-h-[400px]">
                    {/* Sidebar */}
                    <div
                      className="gamification_widget h-auto md:h-full max-h-[600px] md:max-h-none absolute right-[16px] left-[16px] md:static gamanzaSidebar z-[2]"
                      data-type="sidebar"
                      id="sidebar"
                    ></div>

                    {/* Game content */}
                    {false ? (<div className="flex flex-col items-center w-full h-full  min-h-[300px] md:min-h-[400px] px-2 md:px-4 md:py-2">
                      <div className="flex flex-col w-full">
                        {/* Game area */}
                        <div
                          id="slot"
                          className="relative overflow-hidden w-full bg-[#000000] rounded-t-2xl h-[400px] md:h-[600px] lg:h-[800px]"
                        >
                          <div
                            className={`${!user?._id ? "bg-contain" : "bg-cover"} h-full bg-center bg-no-repeat rounded-t-2xl`}
                            style={{
                              backgroundImage: `url(${String(
                                (gameData?.image || "/assets/games/default-game-bg.jpg")
                              )
                                .replace("/refs/heads", "") // remove invalid GitHub segment
                                .replace("%2520", "%20")    // fix double encoding
                                .trim()})`,
                            }}
                          ></div>
                          {content}
                        </div>

                        {/* Game footer */}
                        <div className="w-full rounded-b-2xl flex flex-col p-4 md:p-8" style={{ backgroundColor: '#262628' }}>
                          <div className="flex flex-row justify-between w-full">
                            <div className="flex flex-col justify-center h-full">
                              <p className="text-royalGrey-50 text-[20px] md:text-[24px] font-bold">
                                {gameData?.name || "Mines Game"}
                              </p>
                              <p className="text-royalGrey-100 text-[14px] md:text-[16px] font-light">
                                {gameData?.provider === 'MT_ORIGINALS' ? "Money Tree Originals" : 'Money Tree Originals'}
                              </p>
                            </div>
                            <div className="flex items-center justify-center h-full cursor-pointer">
                              {/* Example icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="48"
                                viewBox="0 -960 960 960"
                                width="48"
                                fill="#94a59e"
                              >
                                <path d="M200-200v-200h80v120h120v80H200Zm0-360v-200h200v80H280v120h-80Zm360 360v-80h120v-120h80v200H560Zm120-360v-120H560v-80h200v200h-80Z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>) : (<div className="flex flex-col justify-center select-none  gap-6 items-center p-4 h-full">
                      {/* <LoaderContent /> ✅ custom loader */}
                      Loading...
                    </div>)}
                  </div>
                  <div className="w-full px-3 md:px-4">
                    {/* <BetDashboard socket={socket} playerId={user?._id} Slug={Slug} gameName={gameData?.name} compactBetsSectionOnly /> */}
                  </div>
                </main> </>)

          )
      }



      {/* Add CSS for the card flip animation */}
      <style>{`
            @keyframes popIn { from { opacity: 0; transform: scale(.9) } to { opacity: 1; transform: scale(1) } }
            .animate-popIn { animation: popIn .35s ease-out both }

            @keyframes shockwave { 0% { transform: translate(-50%, -50%) scale(.4); opacity: .8 } 100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0 } }
            .shockwave-win-loop { animation: shockwave .9s ease-out infinite }
            .shockwave-loss-loop { animation: shockwave .9s ease-out infinite }

            @keyframes flash { 0% { opacity:.0 } 10% { opacity:.35 } 100% { opacity:0 } }
            .flash-win-loop { animation: flash 1.2s ease-out infinite; background: radial-gradient(ellipse at center, rgba(16,185,129,.35), transparent 60%) }
            .flash-loss-loop { animation: flash 1.2s ease-out infinite; background: radial-gradient(ellipse at center, rgba(239,68,68,.35), transparent 60%) }

            @keyframes burst { 0% { transform: translate(-50%, -50%) scale(.6); opacity:1 } 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.1); opacity:0 } }
            .particle-loop { position:absolute; left:50%; top:50%; width:10px; height:10px; border-radius:2px; animation: burst .9s ease-out var(--delay, 0s) infinite }

            @keyframes shake { 10%, 90% { transform: translateX(-1px) } 20%, 80% { transform: translateX(2px) } 30%, 50%, 70% { transform: translateX(-4px) } 40%, 60% { transform: translateX(4px) } }
            .shake-once { animation: shake .45s ease-in-out 1 }
            
            @keyframes bubblee {
              0% { transform: scale(1);}
              50% { transform: scale(1.08);}
              100% { transform: scale(1);}
            }
            .hover\:animate-bubble:hover {
              animation: bubble 0.28s cubic-bezier(.4,2,.6,1) 1;
            }
            .glossy-tile {
              position: relative;
              overflow: hidden;
            }
            .bubble-effect:hover {
              animation: bubble 0.28s cubic-bezier(.4,2,.6,1) 1;
            }
            
            /* Drop animation for revealed tiles */
            @keyframes drop-in {
              0% {
                transform: translateY(-30px) rotate(-15deg);
                opacity: 0;
              }
              80% {
                transform: translateY(5px) rotate(5deg);
              }
              100% {
                transform: translateY(0) rotate(0);
                opacity: 1;
              }
            }
            .animate-drop-in {
              animation: drop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes zoom-in-center {
              0% {
                transform: scale(0);
                opacity: 0;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-zoom-in-center {
              animation: zoom-in-center 0.6s ease forwards;
            }
            
            @media (max-width: 1024px) {
                .mines-grid-responsive {
                  width: 90vw !important;
                  height: 90vw !important;
                  max-width: 90vh !important;
                  max-height: 90vh !important;
                }
              }
              @media (max-width: 640px) {
                .mines-grid-responsive {
                  width: 96vw !important;
                  height: 96vw !important;
                  max-width: 96vh !important;
                  max-height: 96vh !important;
                }
              }
                @keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0.6) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
}

.sparkle-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
  z-index: 20;
}

.sparkle {
  position: absolute;
  width: 10%;
  height: 10%;
  background: radial-gradient(white 40%, transparent 60%);
  border-radius: 50%;
  filter: blur(1px);
  animation: sparkle 1.5s infinite ease-in-out;
}

.sparkle::before, .sparkle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 180%;
  height: 2px;
  background: white;
  transform: translate(-50%, -50%) rotate(45deg);
  opacity: 0.9;
}

.sparkle::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* multiple sparkle positions and delays for natural effect */
.sparkle:nth-child(1) { top: 20%; left: 35%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 55%; left: 70%; animation-delay: 0.6s; }
.sparkle:nth-child(3) { top: 40%; left: 50%; animation-delay: 1.2s; }

          `}</style>

      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </>
  );
};

export default MineGame;