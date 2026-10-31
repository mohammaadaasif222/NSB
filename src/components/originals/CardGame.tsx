// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/CardGame.jsx. Original types/imports preserved; adapted for rlk-frontend.
// 'use client'
// ♥ Hearts

const HA = "/assets/h/A.png";
const H2 = "/assets/h/2.png";
const H3 = "/assets/h/3.png";
const H4 = "/assets/h/4.png";
const H5 = "/assets/h/5.png";
const H6 = "/assets/h/6.png";
const H7 = "/assets/h/7.png";
const H8 = "/assets/h/8.png";
const H9 = "/assets/h/9.png";
const HT = "/assets/h/T.png";
const HJ = "/assets/h/J.png";
const HQ = "/assets/h/Q.png";
const HK = "/assets/h/K.png";



// ♦ Diamonds
const DA = "/assets/d/A.png";
const D2 = "/assets/d/2.png";
const D3 = "/assets/d/3.png";
const D4 = "/assets/d/4.png";
const D5 = "/assets/d/5.png";
const D6 = "/assets/d/6.png";
const D7 = "/assets/d/7.png";
const D8 = "/assets/d/8.png";
const D9 = "/assets/d/9.png";
const DT = "/assets/d/T.png";
const DJ = "/assets/d/J.png";
const DQ = "/assets/d/Q.png";
const DK = "/assets/d/K.png";

// ♣ Clubs
const CA = "/assets/c/A.png";
const C2 = "/assets/c/2.png";
const C3 = "/assets/c/3.png";
const C4 = "/assets/c/4.png";
const C5 = "/assets/c/5.png";
const C6 = "/assets/c/6.png";
const C7 = "/assets/c/7.png";
const C8 = "/assets/c/8.png";
const C9 = "/assets/c/9.png";
const CT = "/assets/c/T.png";
const CJ = "/assets/c/J.png";
const CQ = "/assets/c/Q.png";
const CK = "/assets/c/K.png";

// ♠ Spades
const SA = "/assets/s/A.png";
const S2 = "/assets/s/2.png";
const S3 = "/assets/s/3.png";
const S4 = "/assets/s/4.png";
const S5 = "/assets/s/5.png";
const S6 = "/assets/s/6.png";
const S7 = "/assets/s/7.png";
const S8 = "/assets/s/8.png";
const S9 = "/assets/s/9.png";
const ST = "/assets/s/T.png";
const SJ = "/assets/s/J.png";
const SQ = "/assets/s/Q.png";
const SK = "/assets/s/K.png";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getOriginalsGame, getPlayerBalanceApi } from "@/services/originals";
const BlackjackImg = "/assets/img/Blackjack.png";
const FairplayImg = "/assets/img/Fairplay.png";
const HitImg = "/assets/img/hit.png";
const StandImg = "/assets/img/stand.png";
const SplitImg = "/assets/img/split.png";
const DoubleImg = "/assets/img/double.png";
const dollerSighn = "/assets/img/$.png";
const chipsign = "/assets/img/chipsign.png";
const dimondsign = "/assets/img/walletDimondIcon.png";

const DealingImg = "/assets/img/Dealing.png";
import Footer from "./partials/Footer";
import Description from "./partials/Description";
import BetDashboard from "./partials/BetDashboard";
import LatestBetTable from "./partials/LatestBetTable";
import FairnessModal from "./partials/FairnessModal";
// import LoaderContent from '@/src/loader.mdx'
import { FaRegStar } from "react-icons/fa";
import { Button, IconButton } from "@mui/material";
import { Settings } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";
const chipReset = "/assets/img/chip-reset.png";
const chip1 = "/assets/img/chip-1.png";
const chip5 = "/assets/img/chip-5.png";
const chip25 = "/assets/img/chip-25.png";
const chip100 = "/assets/img/chip-100.png";
const chip200 = "/assets/img/chip-200.png";
const centerLogo = "/assets/img/centerLogo.png";
const deckStack = "/assets/blackjack/righttopcornercard.png";
const deckStack1 = "/assets/blackjack/righttopcornercard1.png";
const cardbackside = "/assets/h/cardbackside.png";
const waitingGif = "/assets/common/waiting01.gif";
const loseGif = "/assets/common/sad.gif";
const winGif = "/assets/common/happy01.gif";
import { initSocket } from "@/lib/originalsSocket";
import {
  playCardSlideSound,
  playCardFlipSound,
  buttonClickSoundFn,
  cardSetRemovingFn,
  preloadSounds
} from "@/lib/originalsSound";

// import { toast } from "react-toastify";
import toast from "react-hot-toast";
// import state from '@/proxy/proxy'
// import img from "next/image";
// import useUser from '@/shared/query/user.query';
// import { useApiClient } from '@/shared/apiClient'
import { useAuth } from '@/lib/originalsAuthBridge';
import { useRouter as useNextRouter } from 'next/router';
import { Tooltip } from 'react-tooltip';
// import { useCurrency } from "../../../../../contexts/CurrencyContext";

let cardImageMap = {};        // maps "suit-rank" → url
let cardImageCache = {};      // maps "suit-rank" → HTMLImageElement
const eventQueue = [];
let processing = false;

const HOtKeys = [
  {
    name: "Make a bet",
    value: 'space'
  },
  {
    name: "Double bet amount",
    value: 's'
  },
  {
    name: "Halve bet amount",
    value: 'a'
  },
  {
    name: "Zero bet amount",
    value: 'd'
  },
  {
    name: "Hit",
    value: 'q'
  },
  {
    name: "Stand",
    value: 'w'
  },
  {
    name: "Split",
    value: 'e'
  },
  {
    name: "Double",
    value: 'r'
  },
  {
    name: "Accept insurance",
    value: 't'
  },
  {
    name: "No insurance",
    value: 'y'
  },
  {
    name: "Place Bet",
    value: 'z'
  },
]


export default function CardGame() {
  // const apiClient = useApiClient()
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
  // }

  const { user, playCurrency } = useAuth();

  let socket = initSocket(user?._id);
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

  // console.log('user info', user)
  // if (!socket) return <div>Loading...</div>
  // console.log('socket', socket)

  const [loadingGame, setLoadingGame] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [Slug, setSlug] = useState(null);
  const [gameLoadError, setgameLoadError] = useState(false);
  // Demo mode flag — URL `?mode=demo` locks the main bet amount to 0 and
  // disables the amount input + 1/2 / 2X / Max buttons. Side bets
  // (Perfect Pair, 21+3) are driven by the same demo flag below.
  const _rlkRouter = useNextRouter();
  const isDemoMode = _rlkRouter?.query?.mode === 'demo';
  const [betAmount, setBetAmount] = useState("0.00");
  useEffect(() => {
    if (isDemoMode && betAmount !== "0" && betAmount !== "0.00") {
      setBetAmount("0");
    }
  }, [isDemoMode, betAmount]);
  const [playerDisplayPoints, setplayerDisplayPoints] = useState();
  const [playerDisplayPoints2, setplayerDisplayPoints2] = useState();
  const [dealerDisplayPoints, setdealerDisplayPoints] = useState();
  const clickedOn = useRef("");
  const [splitClick, setSplitClick] = useState(false);
  const [playerCards, setPlayerCards] = useState([]);
  const [playerCardsScore, setPlayerCardsScore] = useState(0);
  const [splitScores, setSplitScores] = useState(0);
  const [dealerCards, setDealerCards] = useState([]);
  const [dealerCardsScore, setDealerCardsScore] = useState(0);
  const [splitCards, setSplitCards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeHand, setActiveHand] = useState(''); // 'main' or 'split'
  const [gameStarted, setGameStarted] = useState(false);
  const [initialDealing, setInitialDealing] = useState(false);
  const [allAnimationsComplete, setAllAnimationsComplete] = useState(false);
  const [dealingStep, setDealingStep] = useState(0);
  const timerRef = useRef(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const deckRef = useRef(null);
  const [btnClickRef, setbtnClickRef] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [errorMsg, setBetError] = useState("");
  const [errorMsgParfectPair, seterrorMsgParfectPair] = useState("");
  const [errorMsgPlus21, seterrorMsgPlus21] = useState("");
  const [AlreadyActivated, setAlreadyActivated] = useState(false);
  const gameObject = useRef(null);
  const showArrows = useRef(true);
  const playerHandRef = useRef(null);
  const group2Ref = useRef(null);
  const group1Ref = useRef(null);
  const dealerHandRef = useRef(null);
  const splitHandRef = useRef(null);
  const [endGameData, setEndGameData] = useState({});
  const [hotkeysEnabled, setHotkeysEnabled] = useState(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  // const searchParams = useSearchParams();
  const [ShowAnimation, setShowAnimation] = useState(true);
  const [playFast, setplayFast] = useState(false);
  const [showInBigScreen, setshowInBigScreen] = useState(false);
   const [isFavorite, setisFavorite] = useState(user?.favorites?.some(id => String(id) == String(gameData?.slug)));
  const [winner2, setwinner2] = useState();
  const [winner1, setwinner1] = useState();
  const [selectedHand, setselectedHand] = useState(1);
  const [gameMaxBet, setGameMaxBet] = useState(5000);
  const [gameWinChanges, setGameWinChanges] = useState([]);
  const [handOneWin, sethandOneWin] = useState(false);
  const [handTwoWin, sethandTwoWin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusedPerfectPair, setIsFocusedPerfectPair] = useState(false);
  const [isFocusedPlus21, setIsFocusedPlus21] = useState(false);
  const [gifResult, setGifResult] = useState("chip-14");
  const [currentGif, setCurrentGif] = useState(gifResult);
  const [gifVisible, setGifVisible] = useState(true);
  // const MAX_BET = 1000000;
  const [checked, setChecked] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false)
  const [tableId, setTableId] = useState(0);
  const [showFairness, setShowFairness] = useState(false);
  const DEFAULT_STATS = {
    profit: 0,
    betAmount: 0,
    wins: 0,
    losses: 0
  };

  const [plus21Amount, setPlus21Amount] = useState("0.00");
  const [pefectPairAmount, setPefectPairAmount] = useState("0.00");
  const [perfectPairWin, setPerfectPairWin] = useState(false);
  const [plus21Win, setPlus21Win] = useState(false);
  const [perfectPairResult, setPerfectPairResult] = useState({
    win: false,
    type: "",
    multiplier: 0,
    payout: 0
  });

  const [plus21Result, setPlus21Result] = useState({
    win: false,
    type: "",
    multiplier: 0,
    payout: 0
  });
  const [stats, setStats] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_STATS;

    const saved = localStorage.getItem("gameStats");
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });


  const [MAX_BET, setMAX_BET] = useState(5000);
  const [ShowMAxBetBTN, setShowMAxBetBTN] = useState(true);

  function enqueueEvent(eventType, data) {
    eventQueue.push({ type: eventType, data });
    processNextEvent();
  }

  async function processNextEvent() {
    if (processing || eventQueue.length === 0) return;

    processing = true;
    const { type, data } = eventQueue.shift();

    try {
      switch (type) {
        case "GAME_START":
          await handleGameStart(data);
          break;
        case "CARD_RECEVIED":
          await handleCardReceived(data);
          break;
        case "SPLIT":
          await handleSplitEvent(data);
          break;
        case "END_HAND":
          await handleEndHand(data);
          break;
        case "ACCEPT_INSURANCE":
          await handleAcceptInsurance(data);
          break;
        case "ASK_INSURANCE":
          await handleAskInsurance(data);
          break;
        case "REJECT_INSURANCE":
          await handleRejectInsurance(data);
          break;
        case "plus21to3":
          await handle21Plus3Win(data);
          break;
        case "perfectPairWin":
          await handlePerfectWin(data);
          break;
        default:
          console.log("Unknown event:", type, data);
      }
    } catch (e) {
      console.error(e);
    }

    processing = false;
    processNextEvent();
  }

  const handle21Plus3Win = (data) => {
    const tableResult = data?.table || {};
    if (tableResult?.inputAmount) {
      setPlus21Amount(tableResult?.inputAmount);
      setPlus21Win(true);
      setPlus21Result({
        win: true,
        type: formatWinType(tableResult.result || ""),
        multiplier: tableResult.multiplier || 0,
        payout: tableResult.payoutAmount || 0
      });
    }
  }
  const formatWinType = (str = "") => {
    return str
      .replace(/_/g, " ")                 // _ → space
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
  };
  const handlePerfectWin = (data) => {
    const tableResult = data?.table || {};
    if (tableResult?.inputAmount) {
      setPefectPairAmount(tableResult?.inputAmount);
      setPerfectPairWin(true);
      setPerfectPairResult({
        win: true,
        type: formatWinType(tableResult.result || ""),
        multiplier: tableResult.multiplier || 0,
        payout: tableResult.payoutAmount || 0
      });
    }
  }
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
  // useEffect(() => {
  //   // console.log('called useEffect searchParams', searchParams)
  //   const encoded = searchParams.get("data");

  //   if (encoded) {
  //     try {
  //       let gameData = JSON.parse(decodeURIComponent(encoded));
  //       setSlug(gameData?.id);
  //       getGameInfo(gameData?.id);
  //     } catch (e) {
  //       console.error("Failed to parse data", e);
  //     }
  //   }

  //   // console.log("Received game data:", gameData);
  // }, [searchParams])

  //   console.log("Received game data:", gameData);
  //   console.log("img URL:", `[${gameData?.image}]`);

  const slug = window.location.pathname.split("/").pop();
  console.log('slug', slug)
  useEffect(() => {
    if (slug) {
      console.log("Slug:", slug); // 👉 "dice"
      setSlug(slug);
      getGameInfo(slug);
    }
  }, [slug]);

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
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     action: "balance",
      //     player_id: playerId,
      //     currency: currency
      //   })
      // });

      // if (!res.ok) {
      //   throw new Error("Failed to fetch: " + res.status);
      // }

      // const data = await res.json();
      // const data = {
      //   "success": true,
      //   "statusCode": 200,
      //   "path": "/api/mtoriginals/event",
      //   "data": {
      //     "balance": 5595.04
      //   },
      //   "timestamp": "2026-03-19T06:24:25.147Z"
      // }
      // console.log("Response:", data);
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
  // App.tsx
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
  // ...existing code...
  let game
  // const content = useMemo(() => {
  //   if (game?.restricted) {
  //     return (
  //       <>
  //         <div className="absolute top-0 left-0 h-full w-full bg-[#000000E6]"></div>
  //         <div className="absolute top-0 left-0 flex flex-col items-center gap-4 justify-center w-full h-full">
  //           <img
  //             src={"/svgs/country-restriction.svg"}
  //             alt="Restricted"
  //             width={50}
  //             height={50}
  //           />
  //           <span className="text-white text-center font-semibold text-md max-w-[300px] lg:max-w-[400px]">
  //             {t("gamePage.notAvailableInYourRegion")}
  //           </span>
  //         </div>
  //       </>
  //     );
  //   }

  //   return (
  //     <>
  //       {/* {!user?._id && (
  //         <div className="absolute top-0 left-0 h-full w-full bg-[#000000E6]"></div>
  //       )} */}
  //       {!user?._id && (
  //         <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
  //           <button
  //             className="bg-royalGreen-50 text-royalPurple-50 py-2 px-6 rounded-lg font-bold text-[18px]"
  //             onClick={() => {
  //               if (user?._id) {
  //                 setHasLoaded(true)
  //                 return
  //               }

  //               state.loadLoginPage = true
  //             }}
  //           >
  //             {t("gamePage.register")}
  //           </button>
  //         </div>
  //       )}
  //     </>
  //   );
  // }, [user?._id, game?.restricted, t,]);

  useEffect(() => {
    preloadSounds();
    getPlayerBalance(user?._id, "EUR");

    cardImageMap = {};
    cardImageCache = {};


    const allCards = [
      { key: "h-A", src: HA },
      { key: "h-2", src: H2 },
      { key: "h-3", src: H3 },
      { key: "h-4", src: H4 },
      { key: "h-5", src: H5 },
      { key: "h-6", src: H6 },
      { key: "h-7", src: H7 },
      { key: "h-8", src: H8 },
      { key: "h-9", src: H9 },
      { key: "h-T", src: HT },
      { key: "h-J", src: HJ },
      { key: "h-Q", src: HQ },
      { key: "h-K", src: HK },

      { key: "d-A", src: DA },
      { key: "d-2", src: D2 },
      { key: "d-3", src: D3 },
      { key: "d-4", src: D4 },
      { key: "d-5", src: D5 },
      { key: "d-6", src: D6 },
      { key: "d-7", src: D7 },
      { key: "d-8", src: D8 },
      { key: "d-9", src: D9 },
      { key: "d-T", src: DT },
      { key: "d-J", src: DJ },
      { key: "d-Q", src: DQ },
      { key: "d-K", src: DK },

      { key: "c-A", src: CA },
      { key: "c-2", src: C2 },
      { key: "c-3", src: C3 },
      { key: "c-4", src: C4 },
      { key: "c-5", src: C5 },
      { key: "c-6", src: C6 },
      { key: "c-7", src: C7 },
      { key: "c-8", src: C8 },
      { key: "c-9", src: C9 },
      { key: "c-T", src: CT },
      { key: "c-J", src: CJ },
      { key: "c-Q", src: CQ },
      { key: "c-K", src: CK },

      { key: "s-A", src: SA },
      { key: "s-2", src: S2 },
      { key: "s-3", src: S3 },
      { key: "s-4", src: S4 },
      { key: "s-5", src: S5 },
      { key: "s-6", src: S6 },
      { key: "s-7", src: S7 },
      { key: "s-8", src: S8 },
      { key: "s-9", src: S9 },
      { key: "s-T", src: ST },
      { key: "s-J", src: SJ },
      { key: "s-Q", src: SQ },
      { key: "s-K", src: SK },
    ];
    allCards.forEach(({ key, src }) => {
      const img = new Image();
      img.src = typeof src === "string" ? src : src.src;
      cardImageMap[key] = typeof src === "string" ? src : src.src;
      cardImageCache[key] = img; // ✅ stored with "suit-rank" key (e.g. h-5, d-K)
    });
    // Preload chips & UI buttons
    const chipImages = [
      chipReset, chip1, chip5, chip25, chip100, chip200,
      centerLogo, deckStack, deckStack1, cardbackside, HitImg, StandImg, SplitImg, DealingImg, DoubleImg, dollerSighn, chipsign, waitingGif, winGif, loseGif, dimondsign

    ];

    chipImages.forEach((src, idx) => {
      const img = new Image();
      img.src = typeof src === "string" ? src : (src).src; // Next.js image import gives {src, height, width}
      cardImageCache[`chip-${idx}`] = img;
    });
  }, []);


  function mapHandToImages(hand) {
    return (hand || []).map((card) => {
      if (card?.suit === "hidden") {
        return cardbackside;
      }
      return cardImageMap[`${card?.suit}-${card?.rank}`];
    });
  }

  // Function to deal initial cards with animation, updating score after each card
  const dealInitialCards = async (table, handCardNumber, playerFirstDisplayPoint, playerSecondDisplayPoint, dealersDisplayPoint, alreadyGameEnded) => {

    console.log("🚀 Starting dealInitialCards with refs:", handCardNumber, {
      deckRef: deckRef.current,
      playerHandRef: playerHandRef.current,
      dealerHandRef: dealerHandRef.current
    });

    setDealingStep(0);
    setAllAnimationsComplete(false);

    // Clear existing cards
    if (!handCardNumber) {
      setPlayerCards([]);
      setDealerCards([]);
      setSplitCards([]);
    }

    // Prepare initial cards from backend
    const playerHand = table?.seats[2]?.hand || [];
    const dealerHand = table?.seats[1]?.hand || [];
    let initialCards = [];

    if (handCardNumber === 0) {
      initialCards = [
        { target: "player", card: mapHandToImages([playerHand[0]])[0], score: table?.seats[2]?.points || 0, handIndex: 0 },
        { target: "dealer", card: mapHandToImages([dealerHand[0]])[0], score: table?.seats[1]?.points || 0, handIndex: 0 },
      ];
    } else if (handCardNumber === 1) {
      initialCards = [
        { target: "player", card: mapHandToImages([playerHand[1]])[0], score: table?.seats[2]?.points || 0, handIndex: 1 },
        { target: "dealer", card: mapHandToImages([dealerHand[1]])[0], score: table?.seats[1]?.points || 0, handIndex: 1 },
      ];
      await new Promise(resolve => setTimeout(resolve, ShowAnimation ? playFast ? 140 : 300 : 20));
    }

    // Base timings
    const baseSlideDuration = 150; // ms
    const baseFlipDelay = 100;     // ms between slide end and flip start
    const baseFlipSoundDelay = 150;
    const baseScoreDelay = 300;
    const baseBetweenCards = 800;

    // Timeouts = 0 when: !ShowAnimation OR playFast
    // Timeouts = normal when: ShowAnimation && !playFast
    const shouldAnimate = ShowAnimation;
    const slideDuration = !ShowAnimation
      ? 0
      : playFast
        ? baseSlideDuration / 2
        : baseSlideDuration;

    const flipDelay = shouldAnimate ? baseFlipDelay : 0;
    const flipSoundDelay = shouldAnimate ? baseFlipSoundDelay : 0;
    const scoreDelay = shouldAnimate ? baseScoreDelay : 0;
    const betweenCardsDelay = !ShowAnimation
      ? 0
      : playFast
        ? baseBetweenCards / 2
        : baseBetweenCards;


    // Sounds only play when ShowAnimation && !playFast
    const shouldPlaySound = ShowAnimation;

    // Animate each card
    for (let i = 0; i < initialCards.length; i++) {
      const { target, card, handIndex } = initialCards[i];

      if (target === "player") {
        // Get the correct ref for player cards
        const targetRef = playerHandRef;
        const { startX, startY } = getCardOffsets(deckRef, targetRef, handIndex, leftSpacing, topSpacing);

        setPlayerCards(prev => {
          // if (prev.some(c => c.src === card)) return prev;
          if (prev[handIndex] && prev[handIndex].src === card) return prev;

          if (shouldPlaySound) {
            playCardSlideSound();
          }
          const newCard = {
            src: card,
            slideIn: ShowAnimation,           // only slide when animation is enabled
            flipFront: !ShowAnimation,        // if no animation, show front immediately
            startX,
            startY
          };
          const newHand = [...prev, newCard];
          const currentHand = playerHand.slice(0, newHand.length);
          if (calcHandScore(currentHand) >= 21) clickedOn.current = 'stand';
          const newCardIndex = newHand.length - 1;

          if (!shouldAnimate) {
            // Instantly show card and score with no slide/flip animation
            setplayerDisplayPoints(formatPoints(playerFirstDisplayPoint));
            setPlayerCardsScore(calcHandScore(currentHand));
            return newHand;
          }

          // First: slide animation from deck to final position
          // Use requestAnimationFrame to ensure card is painted before animation starts
          requestAnimationFrame(() => {
            setTimeout(() => {
              setPlayerCards(prev =>
                prev.map((c, idx) =>
                  idx === newCardIndex ? { ...c, slideIn: false } : c
                )
              );

              // Then: flip the card after slide completes
              setTimeout(() => {
                setPlayerCards(prev =>
                  prev.map((c, idx) =>
                    idx === newCardIndex ? { ...c, flipFront: true } : c
                  )
                );
                if (shouldPlaySound) {
                  setTimeout(() => {
                    playCardFlipSound();
                  }, flipSoundDelay);
                }

                // Update score after flip
                setTimeout(() => {
                  setplayerDisplayPoints(formatPoints(playerFirstDisplayPoint));
                  setPlayerCardsScore(calcHandScore(currentHand));
                }, scoreDelay);
              }, flipDelay);
            }, 0); // slide duration (handled by CSS)
          });

          return newHand;
        });
      } else if (target === "dealer") {
        // Get the correct ref for dealer cards
        const targetRef = dealerHandRef;
        const { startX, startY } = getCardOffsets(deckRef, targetRef, handIndex, leftSpacing, topSpacing);

        setDealerCards(prev => {
          // if (prev.some(c => c.src === card)) return prev;
          if (prev[handIndex] && prev[handIndex].src === card) return prev;

          if (shouldPlaySound) {
            playCardSlideSound();
          }
          const newCard = {
            src: card,
            slideIn: ShowAnimation,
            flipFront: !ShowAnimation, // if no animation, show face instantly
            startX,
            startY
          };
          const newHand = [...prev, newCard];
          const currentHand = dealerHand.slice(0, newHand.length);
          if (calcHandScore(currentHand) >= 21) clickedOn.current = 'stand';
          const newCardIndex = newHand.length - 1;

          if (!shouldAnimate) {
            // Instantly show card & score, respect hidden second card if needed
            setDealerCards(prev =>
              prev.map((c, idx) =>
                idx === newCardIndex
                  ? {
                    ...c,
                    slideIn: false,
                    flipFront: (newHand.length !== 2 || alreadyGameEnded) ? true : false
                  }
                  : c
              )
            );

            setdealerDisplayPoints(formatPoints(dealersDisplayPoint));
            setDealerCardsScore(calcHandScore(currentHand));
            return newHand;
          }

          // First: slide animation from deck to final position
          // Use requestAnimationFrame to ensure card is painted before animation starts
          requestAnimationFrame(() => {
            setTimeout(() => {
              setDealerCards(prev =>
                prev.map((c, idx) =>
                  idx === newCardIndex ? { ...c, slideIn: false } : c
                )
              );

              // Then: flip the card after slide completes (except for second card in initial deal)
              setTimeout(() => {
                setDealerCards(prev =>
                  prev.map((c, idx) =>
                    idx === newCardIndex ? { ...c, flipFront: (newHand.length !== 2 || alreadyGameEnded) ? true : false } : c
                  )
                );
                if (newHand.length !== 2 && shouldPlaySound) {
                  setTimeout(() => {
                    playCardFlipSound();
                  }, flipSoundDelay);
                }

                // Update score after flip
                setTimeout(() => {
                  setdealerDisplayPoints(formatPoints(dealersDisplayPoint));
                  // const currentHand = dealerHand slice(0, newHand.length);
                  setDealerCardsScore(calcHandScore(currentHand));
                }, scoreDelay);
              }, flipDelay);
            }, 0); // slide duration (handled by CSS)
          });

          return newHand;
        });
      }

      setDealingStep(i + 1);
      // Wait between cards
      if (i < initialCards.length - 1 && betweenCardsDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, betweenCardsDelay));
      }
    }
    if (handCardNumber === 1) {
      setTimeout(() => {
        setInitialDealing(false);
      }, 200);
    }
    setGameStarted(true);
    setAllAnimationsComplete(true);
  };
  // Show existing table state instantly (no animations)
  const showExistingTable = async (table) => {
    // console.log("🟢 Showing existing table instantly:", table);
    const playerFirstDisplayPoint = table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = table?.seats[1]?.displayPoint || '';
    // Clear first
    setPlayerCards([]);
    setDealerCards([]);
    setSplitCards([]);
    setselectedHand(table?.seats[2]?.selectedHand || 1)

    if (table?.seats[2]?.isSplit) {
      setSplitClick(table?.seats[2]?.isSplit)
      // console.log('is in spilite')
      const playerHand = table?.seats[2]?.hand || [];
      const playerSplitHand = table?.seats[2]?.hand2 || [];
      const dealerHand = table?.seats[1]?.hand || [];

      // Main hand
      setPlayerCards(
        playerHand.map((card) => ({
          src: mapHandToImages([card])[0],
          slideIn: false,
          flipFront: true,
          startX: 0,
          startY: 0
        }))
      );

      // Split hand
      setSplitCards(
        playerSplitHand.map((card) => ({
          src: mapHandToImages([card])[0],
          slideIn: false,
          flipFront: true,
          startX: 0,
          startY: 0
        }))
      );

      // Dealer hand
      setDealerCards(
        dealerHand.map((card, idx) => ({
          src: mapHandToImages([card])[0],
          slideIn: false,
          // keep first face up, second hidden (if only 2 cards)
          flipFront: (idx === 1 && dealerHand.length === 2) ? false : true,
          startX: 0,
          startY: 0
        }))
      );

      // Scores
      setPlayerCardsScore(calcHandScore(playerHand));
      setSplitScores(calcHandScore(playerSplitHand));
      setDealerCardsScore(calcHandScore([dealerHand[0]]));
      setplayerDisplayPoints(formatPoints(playerFirstDisplayPoint));
      setplayerDisplayPoints2(formatPoints(playerSecondDisplayPoint));
      setdealerDisplayPoints(formatPoints(dealerDisplayPoint));
    } else {
      const playerHand = table?.seats[2]?.hand || [];
      const dealerHand = table?.seats[1]?.hand || [];

      setPlayerCards(
        playerHand.map((card) => ({
          src: mapHandToImages([card])[0],
          slideIn: false,
          flipFront: true,
          startX: 0,
          startY: 0
        }))
      );
      setDealerCards(
        dealerHand.map((card, idx) => ({
          src: mapHandToImages([card])[0],
          slideIn: false,
          flipFront: (idx === 1 && dealerHand.length === 2) ? false : true,
          startX: 0,
          startY: 0
        }))
      );
      setPlayerCardsScore(calcHandScore(playerHand));
      setDealerCardsScore(calcHandScore([dealerHand[0]]));
      setplayerDisplayPoints(formatPoints(playerFirstDisplayPoint));
      setdealerDisplayPoints(formatPoints(dealerDisplayPoint));
    }

    // Common state updates
    setInitialDealing(false);
    setGameStarted(true);
    setAllAnimationsComplete(true);
  };


  // Helper to calculate score from backend hand array
  function calcHandScore(hand) {
    // If backend provides points, you can use that, but for animation step-by-step, calculate manually:
    let score = 0;
    let aces = 0;
    for (const card of hand) {
      if (card.suit === "hidden") continue;
      if (card.rank === "A") {
        aces += 1;
        score += 11;
      } else if (["K", "Q", "J", "T"].includes(card.rank)) {
        score += 10;
      } else {
        score += parseInt(card.rank, 10);
      }
    }
    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  }
  function getCardValue(rank) {
    if (!rank) return 0;
    const r = rank.toString().toUpperCase();
    if (['T', 'J', 'Q', 'K'].includes(r)) return 10;
    return parseInt(r) || 0;
  }
  const actions = [

    {
      label: "Hit",
      icon: HitImg,
      btnHoverShadowColor: "#c844fd",
      disabled:
        !gameStarted || btnClickRef ||
        isAnimating ||
        !gameObject.current ||
        !gameObject.current?.seats ||
        gameObject.current?.seats.length < 1 || // make sure seat[2] exists
        (gameObject.current?.seats[2]?.standUp && !gameObject.current?.seats[2]?.isSplit) || (gameObject.current?.seats[2]?.standUp && gameObject.current?.seats[2]?.standUp2) ||
        gameObject.current?.handOver ||
        gameObject.current?.seats[1]?.hand?.length < 2,
      takeaction: () => hit()
    },
    {
      label: "Stand",
      icon: StandImg,
      btnHoverShadowColor: "#eeb721",
      disabled:
        !gameObject.current || btnClickRef ||
        !gameObject.current?.seats ||
        gameObject.current?.seats.length < 1 ||
        (gameObject.current?.seats[2]?.standUp && !gameObject.current?.seats[2]?.isSplit) || (gameObject.current?.seats[2]?.standUp && gameObject.current?.seats[2]?.standUp2) ||
        gameObject.current?.handOver ||
        isAnimating ||
        gameObject.current?.seats[1]?.hand?.length < 2,
      takeaction: () => stand()
    },
    {
      label: "Split",
      icon: SplitImg,
      btnHoverShadowColor: "#d9d9d9",
      disabled:
        !gameObject.current || btnClickRef ||
        !gameObject.current?.seats ||
        gameObject.current?.seats.length < 1 ||
        gameObject.current?.seats[2]?.isSplit ||
        gameObject.current?.handOver ||
        isAnimating ||
        (function () {
          const hand = gameObject.current?.seats[2]?.hand || [];
          if (hand.length < 2 || hand.length !== 2) return true; // cannot split if less than 2 cards
          const getCardValue = (rank) => {
            if (!rank) return 0;
            const r = rank.toString().toUpperCase();
            if (['T', 'J', 'Q', 'K'].includes(r)) return 10;
            return parseInt(r) || 0;
          };
          const firstValue = getCardValue(hand[0]?.rank);
          return hand.some(card => getCardValue(card?.rank) !== firstValue);
        })(),
      takeaction: () => split()
    },
    {
      label: "Double",
      btnHoverShadowColor: "#d9d9d9",
      icon: DoubleImg,
      disabled:
        !gameObject.current || btnClickRef ||
        !gameObject.current?.seats ||
        gameObject.current?.seats.length < 1 ||
        (gameObject.current?.seats[2]?.standUp && !gameObject.current?.seats[2]?.isSplit) || (gameObject.current?.seats[2]?.standUp && gameObject.current?.seats[2]?.standUp2) ||
        gameObject.current?.handOver ||
        isAnimating ||
        (gameObject.current?.seats[2]?.hand?.length > 2 && !gameObject.current?.seats[2]?.isSplit || ((gameObject.current?.seats[2]?.isSplit && gameObject.current?.seats[2]?.hand?.length > 2 && gameObject.current?.seats[2]?.selectedHand == 1) || gameObject.current?.seats[2]?.isSplit && gameObject.current?.seats[2]?.hand2?.length > 2 && gameObject.current?.seats[2]?.selectedHand == 2)),
      takeaction: () => double()
    },

  ];


  const chips = [
    { src: chipReset, alt: "Reset", value: '0.00' },
    { src: chip1, alt: "Chip 1", value: "1.00" },
    { src: chip5, alt: "Chip 5", value: "5.00" },
    { src: chip25, alt: "Chip 25", value: "25.00" },
    { src: chip100, alt: "Chip 100", value: "100.00" },
    { src: chip200, alt: "Chip 200", value: "200.00" },
  ];
  const formatPoints = (value) => {
    if (!value) return "";
    let newVaue = value
      .split(",")          // Split by comma
      .map(x => x.trim())  // Trim spaces
      .filter(x => !isNaN(x) && x !== "") // Remove NaN and empty
      .join(", ");
    // console.log('formatted points', newVaue)
    return newVaue     // Join back
  };

  const handleGameStart = async (data) => {
    console.log("GAME_START received:", data);
    setGameStarted(true);
    setbtnClickRef(true);
    setGameFinished(false);

    const playerFirstDisplayPoint = data?.table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = data?.table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = data?.table?.seats[1]?.displayPoint || '';

    gameObject.current = data?.table;
    setTableId(data?.table?.id);
    // Update state with backend table data
    setPlayerCards([]);
    setSplitCards([]);
    setSplitScores(0);
    setPlayerCardsScore(0)
    setDealerCardsScore(0)
    setdealerDisplayPoints('');
    setplayerDisplayPoints('');
    setplayerDisplayPoints2('');
    setDealerCards([]);
    await dealInitialCards(data?.table, 0, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
    setBetAmount(data?.table?.betAmount)
  }
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    socket.on("GAME_START", (data) => {
      enqueueEvent("GAME_START", data);
      console.log("GAME_START event enqueued:", data);

    });
    socket.on("ALERT", (data) => {
      // console.log(ALERT, data);
      toast.error(data?.message, {
        position: "top-right",
        autoClose: 2000
      });
      setbtnClickRef(false);
      clickedOn.current = '';
    });

    //enroll user

    // socket.on(RECEIVE_LOBBY_INFO, ({ tables, players, socketId }) => {
    //   // console.log(RECEIVE_LOBBY_INFO, tables, players, socketId);
    // });
    // socket.on(DEALER_CARD_RECEIVED, (data) => {
    //   // console.log(DEALER_CARD_RECEIVED, data);
    // });
    // socket.on(PLAYER_CARD_RECEIVED, (data) => {
    //   console.log(PLAYER_CARD_RECEIVED, data);
    //   // handleHit(data?.table)
    // });

    // socket.on(PLAYERS_UPDATED, (players) => {
    //   // console.log(PLAYERS_UPDATED, players);
    // });

    socket.on("TABLE_UPDATED", (data) => {
      // console.log(TABLE_UPDATED, data);
      gameObject.current = data?.table;
      setTableId(data?.table?.id);
    });


    socket.on("STAY", (data) => {
      // console.log(STAY, data);
      // setGameObject(data?.table);
      gameObject.current = data?.table;
    });

    // cleanup on unmount
    return () => {
      socket.off("GAME_START");
      // off other events here too
    };
  }, [socket, user?._id, ShowAnimation, playFast]);


  const handleSplitEvent = async (data) => {
    // console.log(SPLIT, data);

    // clear old timer if event comes again
    // if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    // setbtnClickRef(false);
    setBetAmount(data?.table?.betAmount)
    // wait 1 second before processing
    // cardReceivedTimeout = setTimeout(() => {
    // console.log("Processing LAST SPLIT after 1s:", data);

    const playerFirstDisplayPoint = data?.table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = data?.table?.seats[2]?.displayPoint2 || '';
    const selectedHandPlayer = data?.table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = data?.table?.seats[1]?.displayPoint || '';
    // setGameObject(data?.table);
    gameObject.current = data?.table;
    setTableId(data?.table?.id);
    // console.log(clickedOn.current)
    if (clickedOn.current === 'double') {
      await handleDouble(data?.table);
    } else if (clickedOn.current === 'split') {
      setPlayerCards([]);
      setSplitCards([]);
      await handleSplit(data?.table);
    } else if (clickedOn.current === 'stand') {
      await handleDealerPlay(data?.table);
    } else if (clickedOn.current === 'hit') {
      await handleHit(data?.table);
    } else if (!clickedOn.current) {
      await dealInitialCards(data?.table, 1, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
    }
    setbtnClickRef(false);
  }
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("SPLIT", (data) => {
      enqueueEvent("SPLIT", data);
      console.log("SPLIT event enqueued:", data);
    });

    // cleanup
    return () => {
      socket.off("SPLIT");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [ShowAnimation, playFast]);

  const handleCardReceived = async (data) => {
    console.log("CARD_RECEVIED", data);
    // clear old timer if event comes again
    // if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    setBetAmount(data?.table?.betAmount)
    // wait 1 second before processing
    // cardReceivedTimeout = setTimeout(() => {
    // console.log("Processing LAST CARD_RECEVIED after 1s:", data);
    const playerFirstDisplayPoint = data?.table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = data?.table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = data?.table?.seats[1]?.displayPoint || '';
    let winner2 = data?.table?.seats[2]?.lastAction === "WINNER";
    let winner1 = data?.table?.seats[1]?.lastAction === "WINNER";
    // setGameObject(data?.table);
    gameObject.current = data?.table;
    setTableId(data?.table?.id);
    setwinner1(winner1)
    setselectedHand(data?.table?.seats[2]?.selectedHand || 1)
    setwinner2(winner2)
    // console.log(clickedOn.current)
    if (splitClick && data?.table?.seats[2]?.selectedHand == 1) {
      setActiveHand('main')
    } else if (splitClick && data?.table?.seats[2]?.selectedHand == 2) {
      setActiveHand('split')
    }
    if (clickedOn.current === 'double') {
      await handleDouble(data?.table);
      setbtnClickRef(false);
    } else if (clickedOn.current === 'stand') {
      await handleDealerPlay(data?.table);
      setbtnClickRef(false);
    } else if (clickedOn.current === 'hit') {
      await handleHit(data?.table);
      setbtnClickRef(false);
    } else if (!clickedOn.current) {
      // setTimeout(() => {
      await dealInitialCards(data?.table, 1, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
      // setTimeout(() => {
      setbtnClickRef(false);
      // }, 1000);
    }
  }
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("CARD_RECEVIED", async (data) => {
      enqueueEvent("CARD_RECEVIED", data);
    });

    // cleanup
    return () => {
      socket.off("CARD_RECEVIED");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, user?._id, ShowAnimation, playFast]);

  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("perfectPairWin", async (data) => {
      enqueueEvent("perfectPairWin", data);
    });

    // cleanup
    return () => {
      socket.off("perfectPairWin");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, user?._id,]);

  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("plus21to3", async (data) => {
      enqueueEvent("plus21to3", data);
    });

    // cleanup
    return () => {
      socket.off("plus21to3");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, user?._id,]);

  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("EXISTING_TABLE", async (data) => {
      // console.log("Existing table:", data);
      gameObject.current = data?.table;
      setTableId(data?.table?.id);
      setBetAmount(data?.table?.betAmount)


      // Instead of dealInitialCards
      await showExistingTable(data?.table);
    });

    // cleanup
    return () => {
      socket.off("EXISTING_TABLE");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, socket?.id, user?._id, ShowAnimation, playFast]);
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("Game_Error", async (data) => {
      console.log("Game_Error:", data);

      // Format error message to be user-friendly
      const formatErrorMsg = (msg) => {
        if (!msg) return "Something went wrong";
        if (msg.includes("INSUFFICIENT_FUNDS") || msg.toLowerCase().includes("insufficient")) {
          return "Insufficient balance";
        }
        return msg;
      };

      if (data?.code === 400) {
        setbtnClickRef(false);
        setInitialDealing(false)
        toast.error(await formatErrorMsg(data?.msg))
        console.log('400 error', data?.msg)
      } else if (data?.code === 409) {
        setbtnClickRef(false);
        setInitialDealing(false)
        setAlreadyActivated(true)
        toast.error(await formatErrorMsg(data?.msg))
      }
      sethandTwoWin(false)
      sethandOneWin(false)

    });

    // cleanup
    return () => {
      socket.off("Game_Error");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, user?._id, ShowAnimation, playFast]);

  // useEffect(() => {
  //   console.log("activeHand changed:", activeHand);
  // }, [activeHand]);


  const handleEndHand = async (data) => {
    // console.log(END_HAND, data);
    setbtnClickRef(true);
    getPlayerBalance(user?._id, "EUR");
    // clear old timer if event comes again
    // if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);

    // wait 1 second before processing
    // console.log("Processing LAST END_HAND after 1s:", data);
    setEndGameData(data);

    // setGameObject(data?.table);
    gameObject.current = data?.table;
    setTableId(data?.table?.id);
    // console.log(clickedOn.current)
    setBetAmount(data?.table?.betAmount)
    sethandOneWin(data?.table?.seats[2]?.handWin1)
    sethandTwoWin(data?.table?.seats[2]?.handWin2)
    const playerFirstDisplayPoint = data?.table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = data?.table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = data?.table?.seats[1]?.displayPoint || '';

    if (clickedOn.current === 'double') {
      await handleDouble(data?.table);
      await handleDealerPlay(data?.table);
      setTimeout(() => {
        setbtnClickRef(false);
        setGameFinished(true)
      }, 60);
    } else if (clickedOn.current === 'stand' || data?.table?.seats[1]?.points == 21) {
      // console.log("console", data?.table?.seats[1]?.points == 21)
      // console.log(data?.table?.seats[1]?.hand)
      await new Promise((resolve) => setTimeout(resolve, data?.table?.seats[1]?.points == 21 ? ShowAnimation ? playFast ? 300 : 600 : 50 : 10));
      // console.log('in end game', activeHand)
      if (splitClick && data?.table?.seats[2]?.selectedHand == 1) {
        setActiveHand('main')
      } else if (splitClick && data?.table?.seats[2]?.selectedHand == 2) {
        setActiveHand('split')
      }
      setTimeout(async () => {
        await handleDealerPlay(data?.table);
        // console.log('in end game', activeHand)
        setTimeout(() => {
          setbtnClickRef(false);
          setGameFinished(true)
        }, 60);
      }, data?.table?.seats[2]?.points == 21 && data?.table?.seats[2]?.hand.length === 2 && !data?.table?.seats[2]?.isSplit ? ShowAnimation ? playFast ? 400 : 900 : 20 : 0);
    } else if (clickedOn.current === 'hit') {
      await handleHit(data?.table);
      await handleDealerPlay(data?.table);
      setTimeout(() => {
        setbtnClickRef(false);
        setGameFinished(true)
      }, 60);
    } else if (!clickedOn.current) {
      let gameEnded = true;
      setTimeout(async () => {
        await dealInitialCards(data?.table, 1, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint, gameEnded);
        setTimeout(() => {
          setbtnClickRef(false);
          setGameFinished(true)
        }, 60);
      }, ShowAnimation ? playFast ? 50 : 100 : 10);
    }
  }
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("END_HAND", async (data) => {
      enqueueEvent("END_HAND", data);
    });

    // cleanup
    return () => {
      socket.off("END_HAND");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, ShowAnimation, playFast]);

  const handleAcceptInsurance = async (data) => {
    // console.log(ACCEPT_INSURANCE, data);
    // setbtnClickRef(false);
    // clear old timer if event comes again
    // if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);

    // wait 1 second before processing
    // console.log("Processing LAST ACCEPT_INSURANCE after 1s:", data);

    // setGameObject(data?.table);
    gameObject.current = data?.table;
    setTableId(data?.table?.id);
    // console.log(clickedOn.current)

    if (clickedOn.current === 'double') {
      await handleDouble(data?.table);
    } else if (clickedOn.current === 'stand') {
      setTimeout(() => {
        handleDealerPlay(data?.table);
      }, ShowAnimation ? playFast ? 230 : 500 : 50);
    } else if (clickedOn.current === 'hit') {
      await handleHit(data?.table);
    } else if (!clickedOn.current) {
      // dealInitialCards(data?.table, 1, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
    }
    setbtnClickRef(false);
  }
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("ACCEPT_INSURANCE", (data) => {

      enqueueEvent("ACCEPT_INSURANCE", data);

    });

    // cleanup
    return () => {
      socket.off("ACCEPT_INSURANCE");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, ShowAnimation, playFast]);

  const handleAskInsurance = async (data) => {
    // console.log(ASK_INSURANCE, data);
    // setbtnClickRef(false);
    // clear old timer if event comes again
    // if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);

    // wait 1 second before processing
    gameObject.current = data?.table;
    // console.log(clickedOn.current)

    const playerFirstDisplayPoint = data?.table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = data?.table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = data?.table?.seats[1]?.displayPoint || '';
    if (clickedOn.current === 'double') {
      await handleDouble(data?.table);
      setbtnClickRef(false);
    } else if (clickedOn.current === 'stand') {
      await handleDealerPlay(data?.table);
      setbtnClickRef(false);
    } else if (clickedOn.current === 'hit') {
      await handleHit(data?.table);
      setbtnClickRef(false);
    } else if (!clickedOn.current) {
      await dealInitialCards(data?.table, 1, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
      setTimeout(() => {
        setbtnClickRef(false);
      }, ShowAnimation ? playFast ? 500 : 1000 : 50);
    }

  }
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("ASK_INSURANCE", async (data) => {
      enqueueEvent("ASK_INSURANCE", data);
    });

    // cleanup
    return () => {
      socket.off("ASK_INSURANCE");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, ShowAnimation, playFast]);

  const handleRejectInsurance = async (data) => {
    // console.log(REJECT_INSURANCE, data);
    // setbtnClickRef(false);
    // clear old timer if event comes again
    // if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);



    // wait 1 second before processing
    // console.log("Processing LAST REJECT_INSURANCE after 1s:", data);

    gameObject.current = data?.table;
    setTableId(data?.table?.id);
    // console.log(clickedOn.current)
    if (clickedOn.current === 'double') {
      await handleDouble(data?.table);
    } else if (clickedOn.current === 'stand') {
      setTimeout(() => {
        handleDealerPlay(data?.table);
      }, ShowAnimation ? playFast ? 230 : 500 : 30);
    } else if (clickedOn.current === 'hit') {
      await handleHit(data?.table);
    } else if (!clickedOn.current) {
      // dealInitialCards(data?.table, 1, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
    }
    setbtnClickRef(false);

  }
  useEffect(() => {
    if (!socket) return;

    // console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("REJECT_INSURANCE", (data) => {
      enqueueEvent("REJECT_INSURANCE", data);
    });

    // cleanup
    return () => {
      socket.off("REJECT_INSURANCE");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [socket, ShowAnimation, playFast]);

  const fadeOut = () => {
    return new Promise((resolve) => {
      setIsFadingOut(true); // tells Card to start fade animation
      if (ShowAnimation) {
        cardSetRemovingFn();
      }
      setTimeout(() => {
        setIsFadingOut(false); // reset after fade
        resolve();
      }, ShowAnimation ? playFast ? 200 : 500 : 10); // match CSS animation time
    });
  };
  // Handler for placing a bet
  const onBet = async () => {
    if (!socket) return;

    const mainBetErr = getBetError(betAmount, pefectPairAmount, plus21Amount);
    const perfectPairErr = Number(pefectPairAmount) !== 0
      ? getBetError(pefectPairAmount, betAmount, plus21Amount)
      : "";
    const plus21Err = Number(plus21Amount) !== 0
      ? getBetError(plus21Amount, betAmount, pefectPairAmount)
      : "";

    setBetError(mainBetErr);
    seterrorMsgParfectPair(perfectPairErr);
    seterrorMsgPlus21(plus21Err);

    const firstErr = mainBetErr || perfectPairErr || plus21Err;
    if (firstErr) {
      toast.error(firstErr);
      return;
    }

    setbtnClickRef(true);
    if (playerCards.length > 0) {
      await fadeOut()
    } else {
      await buttonClickSoundFn();
    }
    // console.log("call to start game on click of place bet");
    setPlayerCards([]);
    setDealerCards([]);
    setSplitCards([]);
    setPlayerCardsScore(0);
    sethandTwoWin(false)
    sethandOneWin(false)
    setEndGameData({})

    setDealerCardsScore(0);
    setSplitScores(0);
    setplayerDisplayPoints('');
    setplayerDisplayPoints2('');
    setdealerDisplayPoints('');
    setActiveHand('');
    setSplitClick(false);
    setGameFinished(false);
    setTableId(0);
    clickedOn.current = '';
    setPerfectPairWin(false)
    setPlus21Win(false)
    setPerfectPairResult({})
    setPlus21Result({})
    socket.emit("SIT_DOWN", { amount: betAmount, plus21Amount, pefectPairAmount });
    setInitialDealing(true);

  };
  const acceptInsurance = async () => {
    if (!socket) return;
    await buttonClickSoundFn();
    setbtnClickRef(true);

    socket.emit("ACCEPT_INSURANCE", tableId);


  };
  const rejectInsurance = async () => {
    if (!socket) return;
    await buttonClickSoundFn();
    setbtnClickRef(true);

    socket.emit("REJECT_INSURANCE", tableId);


  };
  // Handler for Split action
  const split = async () => {
    if (!socket) return;
    await buttonClickSoundFn();
    setbtnClickRef(true);
    clickedOn.current = 'split'
    socket.emit("SPLIT", tableId);

  };


  const hit = async () => {
    if (!socket) return;

    await buttonClickSoundFn();
    setbtnClickRef(true);
    clickedOn.current = 'hit'
    socket.emit("HIT", tableId);

  };
  const stand = async () => {
    if (!socket) return;
    await buttonClickSoundFn();
    setbtnClickRef(true);

    clickedOn.current = 'stand'
    socket.emit("STAY", tableId);

  };
  const double = async () => {
    if (!socket) return;
    await buttonClickSoundFn();

    setbtnClickRef(true);
    clickedOn.current = 'double'
    socket.emit("DOUBLE", tableId);

  };

  const animateCardAdd = (target, card, score, handIndex, handFromBackend, playerFirstDisplayPoint, playerSecondDisplayPoint, dealersDisplayPoint) => {
    return new Promise((resolve) => {
      // Timeouts = 0 when: !ShowAnimation OR playFast
      // Sounds only play when: ShowAnimation && !playFast
      const shouldAnimate = ShowAnimation;
      const shouldPlaySound = ShowAnimation;
      const speedFactor = !ShowAnimation ? 0 : playFast ? 0.5 : 1;

      const flipDelay = 100;
      const scoreDelay = 500 * speedFactor;
      const flipSoundDelay = shouldAnimate ? 200 : 0;
      const slideDelay = shouldAnimate ? 120 : 0;

      if (target === "playerSplit") {
        setSplitCards(prev => {
          if (prev[handIndex] && prev[handIndex].src === card) {
            resolve();
            return prev;
          }

          if (shouldPlaySound) {
            playCardSlideSound();
          }

          // Get the correct ref for split cards
          const targetRef = splitHandRef;
          const { startX, startY } = getCardOffsets(deckRef, targetRef, handIndex, leftSpacing, topSpacing);
          const newCard = {
            src: card,
            slideIn: ShowAnimation,
            flipFront: !ShowAnimation,
            startX,
            startY
          };
          const newHand = [...prev, newCard];

          const newCardIndex = newHand.length - 1;

          // If animations are off or fast mode, instantly reveal and update score with no sounds
          if (!shouldAnimate) {
            const currentHand = handFromBackend.slice(0, newHand.length);
            const scoreVal = calcHandScore(currentHand);
            setSplitScores(scoreVal);
            setplayerDisplayPoints2(formatPoints(playerSecondDisplayPoint));
            if (scoreVal >= 21) {
              clickedOn.current = 'stand';
              showArrows.current = false;
            }
            resolve();
            return newHand;
          }

          setTimeout(() => {
            setSplitCards(prev =>
              prev.map((c, idx) =>
                idx === newCardIndex
                  ? { ...c, slideIn: false }   // ✅ ONLY stop slide
                  : c
              )
            );

            // 2️⃣ flip AFTER slide finished
            setTimeout(() => {
              setSplitCards(prev =>
                prev.map((c, idx) =>
                  idx === newCardIndex
                    ? { ...c, flipFront: true } // ✅ flip separately
                    : c
                )
              );

              setTimeout(() => {
                playCardFlipSound();
              }, flipSoundDelay);

              // 3️⃣ score update after flip
              setTimeout(() => {
                const currentHand = handFromBackend.slice(0, newHand.length);
                const scoreVal = calcHandScore(currentHand);
                setSplitScores(scoreVal);
                setplayerDisplayPoints2(formatPoints(playerSecondDisplayPoint));

                if (scoreVal >= 21) {
                  clickedOn.current = 'stand';
                  showArrows.current = false;
                }

                resolve();
              }, scoreDelay);

            }, flipDelay);

          }, 0);


          return newHand;
        });
      } else if (target === "player") {
        setPlayerCards(prev => {

          if (prev[handIndex] && prev[handIndex].src === card) {
            resolve();
            return prev;
          }
          if (shouldPlaySound) {
            playCardSlideSound();
          }

          // Get the correct ref for player cards
          const targetRef = playerHandRef;
          const { startX, startY } = getCardOffsets(deckRef, targetRef, handIndex, leftSpacing, topSpacing);
          const newCard = {
            src: card,
            slideIn: ShowAnimation,
            flipFront: !ShowAnimation,
            startX,
            startY
          };
          const newHand = [...prev, newCard];

          const newCardIndex = newHand.length - 1;

          // If animations are off or fast mode, instantly reveal and update score with no sounds
          if (!shouldAnimate) {
            const currentHand = handFromBackend.slice(0, newHand.length);
            setPlayerCardsScore(calcHandScore(currentHand));
            setplayerDisplayPoints(formatPoints(playerFirstDisplayPoint));
            resolve();
            return newHand;
          }

          // 1️⃣ STOP SLIDE
          setTimeout(() => {
            setPlayerCards(prev =>
              prev.map((c, idx) =>
                idx === newCardIndex
                  ? { ...c, slideIn: false }   // ✅ ONLY slide stop
                  : c
              )
            );

            // 2️⃣ FLIP AFTER SLIDE
            setTimeout(() => {
              setPlayerCards(prev =>
                prev.map((c, idx) =>
                  idx === newCardIndex
                    ? { ...c, flipFront: true } // ✅ flip separately
                    : c
                )
              );

              setTimeout(() => {
                playCardFlipSound();
              }, flipSoundDelay);

              // 3️⃣ SCORE UPDATE
              setTimeout(() => {
                const currentHand = handFromBackend.slice(0, newHand.length);
                setPlayerCardsScore(calcHandScore(currentHand));
                setplayerDisplayPoints(formatPoints(playerFirstDisplayPoint));
                resolve();
              }, scoreDelay);

            }, flipDelay);

          }, 0);

          return newHand;
        });
      } else {
        // console.log(target, card)
        setDealerCards(prev => {

          if (prev[handIndex] && prev[handIndex].src === card) {
            resolve();
            return prev;
          }
          if (shouldPlaySound) {
            playCardSlideSound();
          }

          // Get the correct ref for dealer cards
          const targetRef = dealerHandRef;
          const { startX, startY } = getCardOffsets(deckRef, targetRef, handIndex, leftSpacing, topSpacing);
          const newCard = {
            src: card,
            slideIn: ShowAnimation,
            flipFront: !ShowAnimation,
            startX,
            startY
          };
          const newHand = [...prev, newCard];

          const newCardIndex = newHand.length - 1;

          // If animations are off or fast mode, instantly reveal and update score with no sounds
          if (!shouldAnimate) {
            const currentHand = handFromBackend.slice(0, newHand.length);
            setDealerCardsScore(calcHandScore(currentHand));
            setdealerDisplayPoints(formatPoints(dealersDisplayPoint));
            resolve();
            return newHand;
          }

          // 1️⃣ STOP SLIDE FIRST
          setTimeout(() => {
            setDealerCards(prev =>
              prev.map((c, idx) =>
                idx === newCardIndex
                  ? { ...c, slideIn: false }   // ✅ only stop slide
                  : c
              )
            );

            // 2️⃣ FLIP AFTER SLIDE COMPLETES
            setTimeout(() => {
              setDealerCards(prev =>
                prev.map((c, idx) =>
                  idx === newCardIndex
                    ? { ...c, flipFront: true } // ✅ flip separately
                    : c
                )
              );

              setTimeout(() => {
                playCardFlipSound();
              }, flipSoundDelay);

              // 3️⃣ UPDATE SCORE AFTER FLIP
              setTimeout(() => {
                const currentHand = handFromBackend.slice(0, newHand.length);
                setDealerCardsScore(calcHandScore(currentHand));
                setdealerDisplayPoints(formatPoints(dealersDisplayPoint));
                resolve();
              }, scoreDelay);

            }, flipDelay);

          }, 20);


          return newHand;
        });
      }

    });
  };


  const handleDouble = async (table) => {
    if (isAnimating || initialDealing) return;
    setIsAnimating(true);
    setAllAnimationsComplete(false);
    clickedOn.current = 'stand';

    let playerHand = table?.seats[2]?.hand || [];
    let newCardObj = playerHand[playerHand.length - 1];
    let cardToAdd = mapHandToImages([newCardObj])[0];
    const playerFirstDisplayPoint = table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = table?.seats[1]?.displayPoint || '';
    // console.log('newBetAmount', betAmount)
    const newBetAmount = Number(betAmount) * 2;
    // console.log('newBetAmount', newBetAmount)
    // setBetAmount(newBetAmount)




    if (table?.seats[2]?.isSplit) {
      let playerHand = table?.seats[2]?.hand2 || [];
      let newCardObj = playerHand[playerHand.length - 1];
      let cardToAdd = mapHandToImages([newCardObj])[0];
      await animateCardAdd("playerSplit", cardToAdd, table?.seats[2]?.points2, playerHand.length - 1, playerHand, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
    }

    await animateCardAdd("player", cardToAdd, table?.seats[2]?.points, playerHand.length - 1, playerHand, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
    await new Promise(resolve => setTimeout(resolve, ShowAnimation ? playFast ? 230 : 500 : 20));

    // 3️⃣ Now run dealer play sequence
    // await handleDealerPlay(table);

    setIsAnimating(false);
    setAllAnimationsComplete(true);
  };

  const handleDealerPlay = async (table) => {
    if (isAnimating || initialDealing) return;
    // console.log("handleDealerPlay called");
    setIsAnimating(true);
    setAllAnimationsComplete(false);

    const dealerHand = table?.seats[1]?.hand || [];
    const dealersDisplayPoint = table?.seats[1]?.displayPoint || 0;
    const playerBusted = table?.seats[2]?.isBusted || false;
    const userSplited = table?.seats[2]?.isSplit || false;
    const userStandUpMain = table?.seats[2]?.standUp || false;
    const userStandUpSplit = table?.seats[2]?.standUp2 || false;
    const isPlayerWiner = table?.seats[2]?.lastAction == "WINNER" || false;
    const isDealerWiner = table?.seats[1]?.lastAction == "WINNER" || false;
    // 1️⃣ Only reveal dealer's second card if player is NOT busted
    // if (!playerBusted) {
    const realSecondCard = mapHandToImages([dealerHand[1]])[0];
    // console.log("realSecondCard", realSecondCard);
    if ((!userSplited || (userSplited && ((userStandUpMain) && (userStandUpSplit))) || playerBusted || isPlayerWiner || isDealerWiner)) {
      setDealerCards(prev => {
        if (prev.length >= 2 && !prev[1].flipFront) {
          const updated = prev.map((c, idx) =>
            idx === 1
              ? { ...c, src: realSecondCard, slideIn: false, flipFront: true }
              : c
          );

          const shouldAnimate = ShowAnimation;
          const shouldPlaySound = ShowAnimation;

          if (!shouldAnimate) {
            // Instantly reveal and update score with no sound
            setDealerCardsScore(calcHandScore(dealerHand.slice(0, updated.length)));
            setdealerDisplayPoints(formatPoints(dealersDisplayPoint));
            return updated;
          }

          if (shouldPlaySound) {
            setTimeout(() => {
              playCardFlipSound();
            }, 100);
          }
          setTimeout(() => {
            setDealerCardsScore(calcHandScore(dealerHand.slice(0, updated.length)));
            setdealerDisplayPoints(formatPoints(dealersDisplayPoint));
          }, shouldAnimate ? 200 : 0);
          return updated;
        }
        return prev;
      });
      // await new Promise(resolve => setTimeout(resolve, 100));
    }


    const playerFirstDisplayPoint = table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = table?.seats[1]?.displayPoint || '';
    // 2️⃣ Add extra dealer cards (only if player not busted)
    if (dealerHand.length > 2) {
      // console.log("Dealer needs to draw cards:", dealerHand.length);
      for (let i = 0; i < dealerHand.length; i++) {
        const cardObj = dealerHand[i];
        const cardToAdd = mapHandToImages([cardObj])[0];

        // ✅ Check if this card already exists in dealerCards
        const alreadyExists = dealerCards.some(c => c.src === cardToAdd);
        if (alreadyExists) {
          // console.log("Skipping dealer card (already exists):", cardToAdd);
          continue; // skip animation for this card
        }

        // animate only if it's a new card
        await animateCardAdd("dealer", cardToAdd, table?.seats[1]?.points, i, dealerHand, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
      }
    }

    setIsAnimating(false);
    setAllAnimationsComplete(true);
  };

  const handleSplit = (table) => {
    if (!table?.seats[2]) return;

    setSplitClick(true);

    const splitHand = table.seats[2].hand2 || [];
    const mainHand = table.seats[2].hand || [];
    const newBetAmount = Number(betAmount) * 2;
    // console.log(newBetAmount)
    // setBetAmount(newBetAmount)
    // ✅ Update Split hand
    setSplitCards((prev) => {
      const updated = splitHand.map((card, idx) => {
        const src = mapHandToImages([card])[0];
        const old = prev[idx];

        if (old && old.src === src) {
          // Same card → keep state
          return old;
        }
        // New/replaced card
        return {
          src,
          slideIn: false,
          flipFront: idx < splitHand.length - 1 ? true : false, // last card face-down initially
        };
      });

      return updated;
    });

    // ✅ Update Main hand
    // ✅ Update Main hand
    setPlayerCards((prev) => {
      const updated = mainHand.map((card, idx) => {
        const src = mapHandToImages([card])[0];
        const old = prev[idx];

        if (old && old.src === src) {
          // Same card → keep state
          return old;
        }

        // New/replaced card → start BACKSIDE first
        return {
          src,
          slideIn: mainHand.length - 1 == idx ? false : false,
          flipFront: mainHand.length - 1 == idx ? false : true, // always backside first
        };
      });

      return updated;
    });

    // ✅ Flip newest Main card only
    if (mainHand.length > 0) {
      const playerFirstDisplayPoint = table?.seats[2]?.displayPoint || '';
      const shouldAnimate = ShowAnimation;
      const shouldPlaySound = ShowAnimation;
      const speedFactor = !ShowAnimation ? 0 : playFast ? 0.5 : 1;

      const flipDelay = 100;
      const scoreDelay = 500 * speedFactor;


      setTimeout(() => {
        const score = calcHandScore(mainHand);

        setPlayerCards((prev) =>
          prev.map((c, idx) =>
            idx === prev.length - 1 ? { ...c, flipFront: true } : c
          )
        );
        if (shouldPlaySound) {
          setTimeout(() => {
            playCardFlipSound();
          }, scoreDelay);
        }
        setTimeout(() => {
          setPlayerCardsScore(score);
          setplayerDisplayPoints(formatPoints(playerFirstDisplayPoint));
        }, scoreDelay);

        if (score === 21) clickedOn.current = "stand";
      }, flipDelay); // give time to render backside first
    }


    // ✅ Flip newest Split card only
    if (splitHand.length > 0) {
      const playerSecondDisplayPoint = table?.seats[2]?.displayPoint2 || '';
      const shouldAnimate = ShowAnimation;
      const shouldPlaySound = ShowAnimation;
      const speedFactor = !ShowAnimation ? 0 : playFast ? 0.5 : 1;

      const flipDelay = 100;
      const scoreDelay = 500 * speedFactor;


      setTimeout(() => {
        const score = calcHandScore(splitHand);

        setSplitCards((prev) =>
          prev.map((c, idx) =>
            idx === prev.length - 1 ? { ...c, flipFront: true } : c
          )
        );
        if (shouldPlaySound) {
          setTimeout(() => {
            playCardFlipSound();
          }, scoreDelay);
        }
        setTimeout(() => {
          setSplitScores(score);
          setplayerDisplayPoints2(formatPoints(playerSecondDisplayPoint));
        }, scoreDelay);

        if (score === 21) clickedOn.current = "stand";
      }, flipDelay);
    }

  };


  const handleHit = async (table) => {
    if (isAnimating || initialDealing) return;

    setIsAnimating(true);
    setAllAnimationsComplete(false);
    clickedOn.current = 'stand';
    let playerHand = table?.seats[2]?.hand || [];
    let newCardObj = playerHand[playerHand.length - 1];
    let cardToAdd = mapHandToImages([newCardObj])[0];




    const playerFirstDisplayPoint = table?.seats[2]?.displayPoint || '';
    const playerSecondDisplayPoint = table?.seats[2]?.displayPoint2 || '';
    const dealerDisplayPoint = table?.seats[1]?.displayPoint || '';

    if (table?.seats[2]?.isSplit) {

      setActiveHand('split');
      let playerHand = table?.seats[2]?.hand2 || [];
      let newCardObj = playerHand[playerHand.length - 1];
      let cardToAdd = mapHandToImages([newCardObj])[0];
      await animateCardAdd("playerSplit", cardToAdd, table?.seats[2]?.points2, playerHand.length - 1, playerHand, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);
    }

    await animateCardAdd("player", cardToAdd, table?.seats[2]?.points, playerHand.length - 1, playerHand, playerFirstDisplayPoint, playerSecondDisplayPoint, dealerDisplayPoint);

    setIsAnimating(false);
    setAllAnimationsComplete(true);
  };
  // Get deck position for card animation - memoized to prevent performance issues
  const getDeckPosition = useCallback(() => {
    if (!deckRef.current) return { x: 0, y: 0 };
    const deckRect = deckRef.current.getBoundingClientRect();
    return {
      x: deckRect.left + deckRect.width / 2,
      y: deckRect.top + deckRect.height / 2
    };
  }, []);

  const getCardOffsets = (deckRef, targetRef, cardIndex, leftSpacing, topSpacing) => {
    if (!deckRef.current || !targetRef.current) return { startX: 0, startY: 0 };

    const deckRect = deckRef.current.getBoundingClientRect();
    const targetRect = targetRef.current.getBoundingClientRect();

    // Calculate deck center position
    const deckCenterX = deckRect.left + deckRect.width / 2;
    const deckCenterY = deckRect.top + deckRect.height / 2;

    // Calculate final card position in the hand
    const cardFinalX = targetRect.left + targetRect.width / 2 + (cardIndex * leftSpacing * 16);
    const cardFinalY = targetRect.top + targetRect.height / 2 + (cardIndex * topSpacing * 16);

    // Calculate the difference in rem units (1rem = 16px)
    const diffX = (deckCenterX - cardFinalX) / 16;
    const diffY = (deckCenterY - cardFinalY) / 16;

    return { startX: diffX, startY: diffY };
  };


  const getCardSpacing = () => {
    let leftSpacing = 2.18484; // default (mobile) — 2.4276 × 0.9
    let topSpacing = 0.77112;  // 0.8568 × 0.9
    if (window.innerWidth >= 1024) { // lg
      leftSpacing = 2.44188;   // 2.7132 × 0.9
      topSpacing = 0.89964;    // 0.9996 × 0.9
    } else if (window.innerWidth >= 768) { // md
      leftSpacing = 2.44188;   // 2.7132 × 0.9
      topSpacing = 0.83538;    // 0.9282 × 0.9
    }
    return { leftSpacing, topSpacing };
  };

  // Responsive card spacing state
  const [cardSpacing, setCardSpacing] = useState(getCardSpacing());
  useEffect(() => {
    if (Number(betAmount) > 0) {
      if (checked) {
        setChecked(false)
      }
    }
  }, [betAmount])
  // Update spacing on window resize
  useEffect(() => {
    const handleResize = () => setCardSpacing(getCardSpacing());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    // const webSocket = socket || connect();
    if (!socket) return;
    // webSocket && webSocket.emit(FETCH_LOBBY_INFO, "testuser");
    socket.emit("FETCH_LOBBY_INFO", "testuser");

    // return () => cleanUp();
    // eslint-disable-next-line
  }, [user?._id, socket?.id, ShowAnimation, playFast]);



  useEffect(() => {
    if (!hotkeysEnabled) return
    const handleKeyDown = (e) => {
      console.log('eeee', e)
      if (e?.code === "Space") {
        e.preventDefault(); // Stop page scroll
        if (AlreadyActivated ||
          (Number(betAmount) < 0) ||
          (gameObject.current && !gameObject.current?.handOver) ||
          btnClickRef) {
          // console.log('true')
          return
        }
        onBet();
      } else if (e?.key === 's') {
        if ((gameObject.current && !gameObject.current?.handOver || btnClickRef)) {
          return;
        }
        buttonClickSoundFn();
        setBetAmount((prev) =>
          Math.min(MAX_BET, parseFloat(prev || "0") * 2)
        )
      } else if (e?.key === 'a') {
        if ((gameObject.current && !gameObject.current?.handOver || btnClickRef)) {
          return;
        }
        buttonClickSoundFn();
        setBetAmount((prev) => {
          let newVal = parseFloat(prev || "0") / 2;
          if (newVal < 0.01) {
            newVal = 0;
          }
          return newVal.toFixed(2); // always show 2 decimals
        });
      } else if (e?.key === "d") {
        if ((gameObject.current && !gameObject.current?.handOver) || btnClickRef) return;
        setBetAmount('0.00')
      } else if (e?.key === "q") {
        if (!gameStarted || btnClickRef ||
          isAnimating ||
          !gameObject.current ||
          !gameObject.current?.seats ||
          gameObject.current?.seats.length < 1 || // make sure seat[2] exists
          (gameObject.current?.seats[2]?.standUp && !gameObject.current?.seats[2]?.isSplit) || (gameObject.current?.seats[2]?.standUp && gameObject.current?.seats[2]?.standUp2) ||
          gameObject.current?.handOver ||
          gameObject.current?.seats[1]?.hand?.length < 2) return;

        hit()
      } else if (e?.key === "w") {
        if (!gameObject.current || btnClickRef ||
          !gameObject.current?.seats ||
          gameObject.current?.seats.length < 1 ||
          (gameObject.current?.seats[2]?.standUp && !gameObject.current?.seats[2]?.isSplit) || (gameObject.current?.seats[2]?.standUp && gameObject.current?.seats[2]?.standUp2) ||
          gameObject.current?.handOver ||
          isAnimating ||
          gameObject.current?.seats[1]?.hand?.length < 2) return;

        stand()
      } else if (e?.key === 'e') {
        if (!gameObject.current || btnClickRef ||
          !gameObject.current?.seats ||
          gameObject.current?.seats.length < 1 ||
          gameObject.current?.seats[2]?.isSplit ||
          gameObject.current?.handOver ||
          isAnimating ||
          gameObject.current?.seats[2]?.hand?.length !== 2 ||
          gameObject.current?.seats[2]?.hand?.filter(
            (card) =>
              card?.rank?.toString() ===
              gameObject.current?.seats[2]?.hand?.[0]?.rank?.toString()
          ).length !== 2) return;

        split()
      } else if (e?.key === "r") {
        if (!gameObject.current || btnClickRef ||
          !gameObject.current?.seats ||
          gameObject.current?.seats.length < 1 ||
          (gameObject.current?.seats[2]?.standUp && !gameObject.current?.seats[2]?.isSplit) || (gameObject.current?.seats[2]?.standUp && gameObject.current?.seats[2]?.standUp2) ||
          gameObject.current?.handOver ||
          isAnimating ||
          (gameObject.current?.seats[2]?.hand?.length > 2 && !gameObject.current?.seats[2]?.isSplit || ((gameObject.current?.seats[2]?.isSplit && gameObject.current?.seats[2]?.hand?.length > 2 && gameObject.current?.seats[2]?.selectedHand == 1) || gameObject.current?.seats[2]?.isSplit && gameObject.current?.seats[2]?.hand2?.length > 2 && gameObject.current?.seats[2]?.selectedHand == 2))) return;

        double()
      } else if (e?.key === "t") {
        if (btnClickRef) return;

        acceptInsurance()
      } else if (e?.key === "y") {
        if (btnClickRef) return;

        rejectInsurance()
      } else if (e?.key === 'z') {
        setBetAmount(0)
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeysEnabled, btnClickRef, gameObject, isAnimating, AlreadyActivated, checked, betAmount, ShowAnimation, playFast]);



  // Use these for both dealer and player cards
  const { leftSpacing, topSpacing } = cardSpacing;
  useEffect(() => {
    let winner2 = gameObject.current?.seats[2]?.lastAction === "WINNER";
    let winner1 = gameObject.current?.seats[1]?.lastAction === "WINNER";
    let selectedHand = gameObject.current?.seats[2]?.selectedHand;
    setwinner1(winner1);
    setwinner2(winner2);
    setselectedHand(selectedHand)
  }, [gameObject, gameObject.current, activeHand, ShowAnimation, playFast])
  const getBetError = (current, other1, other2) => {
    let minBet = Number(convertAmount(0.01, displayCurrency));

    let maxAllowed = Number(gameMaxBet) - Number(other1) - Number(other2);
    let maxBalance = Number(MAX_BET) - Number(other1) - Number(other2);

    if (Number(current) > maxAllowed) {
      return `Maximum bet is ${maxAllowed.toFixed(2)}`;
    }

    if (Number(current) < minBet && Number(current) !== 0) {
      return `Minimum bet is ${minBet.toFixed(2)}`;
    }

    if (Number(current) > maxBalance) {
      return "Insufficient balance";
    }

    return "";
  };

  useEffect(() => {
    if((gameObject.current && !gameObject.current?.handOver) ) return;
    if (Number(pefectPairAmount) !== 0) {
      const error = getBetError(pefectPairAmount, betAmount, plus21Amount);
      seterrorMsgParfectPair(error);
    } else {
      seterrorMsgParfectPair("");
    }
  }, [pefectPairAmount, betAmount, plus21Amount, gameMaxBet]);
  useEffect(() => {
    if((gameObject.current && !gameObject.current?.handOver) ) return;
    if (Number(plus21Amount) !== 0) {
      const error = getBetError(plus21Amount, betAmount, pefectPairAmount);
      seterrorMsgPlus21(error);
    } else {
      seterrorMsgPlus21("");
    }
  }, [plus21Amount, betAmount, pefectPairAmount, gameMaxBet]);

  useEffect(() => {
    if((gameObject.current && !gameObject.current?.handOver) ) return;
    if (Number(betAmount) !== 0) {
      const error = getBetError(betAmount, pefectPairAmount, plus21Amount);
      setBetError(error);
    } else {
      setBetError("");
    }
  }, [betAmount, pefectPairAmount, plus21Amount, gameMaxBet]);//  const handleMaxBetButtonClick = () =>{
  //   if(MAX_BET == 0){
  //     setBetError("Insufficient balance");
  //     return;
  //   }
  //  };
  useEffect(() => {
    let gifResults = splitClick ? (handOneWin || handTwoWin) && gameFinished ? 'chip-15' : gameFinished ? "chip-16" : "chip-14" : winner2 && gameFinished ? "chip-15" : !winner2 && gameFinished ? "chip-16" : "chip-14";
    setGifResult(gifResults)
  }, [winner2, gameFinished, winner1, splitClick, handOneWin, handTwoWin])
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
    if (!endGameData || !gameFinished) return;

    const multiplier =
      parseFloat(endGameData?.table?.multiplier?.multiplier) || 0;

    const bet =
      parseFloat(endGameData?.table?.betAmount) || 0;

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

        wins: winner2 ? prev.wins + 1 : prev.wins,
        losses: winner1 ? prev.losses + 1 : prev.losses
      };

      // 🔥 Persist immediately
      localStorage.setItem("gameStats", JSON.stringify(updated));

      return updated;
    });
  }, [gameFinished]);


  return (
    <>
      {
        user?._id && !loadingGame && !gameLoadError ?
          (
            <main className="flex h-full w-full flex-col  gap-5 select-none ">

              <div
                id="slot"
                className="w-full "
              >

                <div className="max-w-full bg-[#090C1D] p-2 lg:p-4 rounded-xl mt-1 lg:flex lg:flex-col lg:justify-center lg:items-center  md:flex md:flex-col md:justify-center md:items-center  ">
                  <div className=' p-0 lg:p-4 bg-[#19183A] w-full rounded-xl'>
                    <div className=" text-white bg-[#090C1D] p-0 lg:p-4 rounded-xl font-sans flex flex-col lg:flex-row lg:justify-center md:w-full  lg:w-[100%] xl:w-[100%] ">
                      {/* Left sidebar */}
                      <div className="order-2 lg:order-1 rounded-xl  lg:overflow-y-auto scrollbar-hide xl:w-[30%] lg:w-[30%] bg-[#19183A] lg:rounded-l-xl p-3 sm:p-4 md:p-5 lg:px-5 lg:py-3 ">
                        <div className="flex flex-col lg:flex-col-reverse gap-2  ">
                          {/* Place Bet Button - show when game hasn't started */}
                          <button
                            onClick={onBet}

                            disabled={
                              AlreadyActivated || isAnimating ||
                              (Number(betAmount) < 0) ||
                              (gameObject.current && !gameObject.current?.handOver) ||
                              btnClickRef || Number(betAmount) > MAX_BET || (Number(betAmount) > 0 && Number(betAmount) < convertAmount(0.01, displayCurrency).toFixed(2)) ||
                              Number(betAmount) > gameMaxBet || errorMsg
                            }
                            className={`mb-2 w-full text-white font-semibold py-2 rounded-lg
    bg-[linear-gradient(180deg,#4ab0fc_0%,#c839f1_100%)]
    disabled:bg-[linear-gradient(180deg,#19183A_0%,#19183A_100%)]
    disabled:ring-2  disabled:ring-[#000000]
    transition-all duration-200
    disabled:cursor-not-allowed
    flex items-center justify-center
    ${isAnyModalOpen ? "hidden" : ""}
  `}
                          >
                            {initialDealing ? (
                              <img
                                src={DealingImg}
                                alt="Dealing..."
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain animate-shake-zoom"
                              />
                            ) : (

                              (!betAmount || betAmount == 0) || betAmount == "0.00" ? "Place Bet" : "Place Bet"

                            )}
                          </button>
                          {/* Action buttons */}
                          <div className="grid grid-cols-2 lg:grid-cols-2  sm:grid-cols-4 gap-2 w-full md:w-full sm:w-full  ">
                            {!gameObject.current?.askingInsurance ?
                              actions.map(({ label, icon, disabled, takeaction, btnHoverShadowColor }) => (
                                <button
                                  key={label}
                                  disabled={disabled}
                                  aria-disabled={disabled}
                                  onClick={takeaction}
                                  className={[
                                    // sizing & layout
                                    "w-full h-12 sm:h-12 rounded-lg  font-semibold",
                                    "items-center justify-center flex gap-1.5 sm:gap-2",
                                    "flex-row sm:flex-row text-sm sm:text-sm",
                                    // colors / states
                                    disabled
                                      ? "bg-[#19183A] border-[2px] border-[#000000]  cursor-not-allowed"
                                      : "bg-[#2C2852] hover:bg-[linear-gradient(180deg,#4ab0fc_0%,#c839f1_100%)] border-[2px] border-[#000000] active:scale-[0.99] transition-all duration-200",
                                  ].join(" ")}
                                  title={label}
                                >
                                  <span className="">{label}</span>
                                  {/* Icon */}
                                  {icon ? (
                                    <img
                                      loading="lazy"
                                      draggable={false}
                                      src={icon}
                                      alt={label}
                                      aria-hidden="true"
                                      width={16}
                                      height={16}
                                      className={`h-4 w-4 lg:h-4 lg:w-4 sm:h-3 sm:w-3 object-contain shrink-0
                        ${disabled
                                          ? "opacity-40"
                                          : ""} `}
                                    />
                                  ) : (
                                    // Optional fallback if icon missing
                                    <span aria-hidden="true" className="text-base sm:text-sm">🎴</span>
                                  )}


                                </button>
                              ))
                              :
                              (<>
                                {/* ✅ Accept Insurance */}
                                <button
                                  onClick={() => acceptInsurance()}
                                  disabled={btnClickRef || isAnimating}
                                  className={[
                                    "w-full h-12 sm:h-12 rounded-lg  font-medium",
                                    "items-center justify-center flex gap-1.5 sm:gap-2",
                                    "flex-row sm:flex-row text-xs sm:text-sm",
                                    "bg-[#2C2852] border-[2px] border-[#000000]  text-[#F4FFFB] hover:bg-[linear-gradient(180deg,#4ab0fc_0%,#c839f1_100%)] active:scale-[0.99] transition",
                                  ].join(" ")}
                                >
                                  <span>Accept Insurance</span>
                                </button>

                                {/* ❌ Reject Insurance */}
                                <button
                                  onClick={() => rejectInsurance()}
                                  disabled={btnClickRef || isAnimating}
                                  className={[
                                    "w-full h-12 sm:h-12 rounded-lg  font-medium",
                                    "items-center justify-center flex gap-1.5 sm:gap-2",
                                    "flex-row sm:flex-row text-xs sm:text-sm",
                                    "bg-[#2C2852] border-[2px] border-[#000000]   text-[#F4FFFB] hover:bg-[linear-gradient(180deg,#4ab0fc_0%,#c839f1_100%)] active:scale-[0.99] transition",
                                  ].join(" ")}
                                >
                                  <span>Reject Insurance</span>
                                </button>
                              </>
                              )
                            }
                          </div>

                          <div className="flex flex-col  w-full md:w-full sm:w-full   items-center justify-between ">
                            {/* Chips row */}
                            {/* <div className="chips-container flex flex-row mt-3 justify-between pr-1 w-full md:w-full sm:w-full lg:w-1/2 xl:w-1/2">
                            {chips.map((chip, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  if ((gameObject.current && !gameObject.current?.handOver) || btnClickRef) return;

                                  buttonClickSoundFn();

                                  const raw = chip.value;
                                  if (/^\d*(\.\d{0,8})?$/.test(raw) || raw === "") {
                                    if (timerRef.current) clearTimeout(timerRef.current);

                                    if (raw !== "" && !isNaN(Number(raw))) {
                                      const current = Number(betAmount) || 0;
                                      const added = Number(raw);

                                      let newBet = index === 0 ? 0 : current + added;

                                      setBetAmount(newBet.toFixed(2));
                                    }
                                  }
                                }}


                                className={`chip  ${(gameObject.current && !gameObject.current?.handOver || btnClickRef) ? 'cursor-not-allowed' : 'cursor-pointer'} cursor-pointer transition-all duration-300 ease-in-out ${index === 0 ? "mr-5 sm:ml-2" : ""
                                  }`}
                              >
                                <div className="relative group">
                                  <img
                                    loading="lazy"
                                    draggable={false}
                                    src={chip.src}
                                    alt={chip.alt}
                                    width={40}
                                    height={40}
                                    className={` rounded-full h-10 w-10 xs:h-12 xs:w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-9 lg:w-9 xl:h-10 xl:w-10 2xl:h-13 2xl:w-13 shadow-lg shadow-black/60 object-contain transition-transform duration-300 ease-in-out ${(gameObject.current && !gameObject.current?.handOver || btnClickRef) ? 'cursor-not-allowed' : 'cursor-pointer active:scale-125'}  transform  `}
                                  />
                                </div>
                              </div>
                            ))}
                          </div> */}
                            {/* Bet Amount */}
                            <div className="mt-3 w-full md:w-full sm:w-full ">
                              <div className="flex px-1 mb-1 items-center font-medium justify-between text-gray-300 text-sm">
                                <span>Bet Amount</span>
                                <span className="text-xs text-white flex ">
                                  {/* <span className='flex align-middle items-center'>

                                  {
                                    displayCurrency == 'USD'
                                      ?
                                      (
                                        <img
                                          src={cardImageCache[playCurrency == "chips" ? "dolerSighn" : 'dimondsign']?.src ?? "/dollar.png"}
                                          alt="dollar"
                                          width={18}
                                          height={18}
                                          className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-100"
                                            }`}
                                        />
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
                                <span> {displayCurrency == 'USD' ? betAmount : ' '}</span> */}
                                </span>                                                    </div>
                              <div className="relative rounded-xl">
                                <span
                                  className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocused ? "opacity-100" : "opacity-50"
                                    }`}
                                >
                                  {/* {
                                  displayCurrency == 'USD'
                                    ?
                                    (
                                      <span
                                        className={`w-[1em] text-white h-[1em] inline-flex items-center justify-center text-[1em] ${isFocused ? "opacity-100" : "opacity-50"
                                          }`}
                                      >
                                        {currencySymbols[displayCurrency] || displayCurrency}
                                      </span>
                                    )
                                    :
                                    (
                                      <span
                                        className={`w-[1em] text-white h-[1em] inline-flex items-center justify-center text-[1em] ${isFocused ? "opacity-100" : "opacity-50"
                                          }`}
                                      >
                                        {currencySymbols[displayCurrency] || displayCurrency}
                                      </span>

                                    )
                                } */}
                                  <img src={playCurrency == "chips" ? chipsign : dimondsign} alt="chipsign" srcset="" className='w-[18px] h-[18px]' />
                                </span>
                                <input
                                  id="betAmountInput"
                                  data-tooltip-id="betError"
                                  data-tooltip-place="top"
                                  data-tooltip-offset={10}
                                  data-tooltip-hidden={!errorMsg}
                                  data-tooltip-float={false}
                                  inputMode="decimal"
                                  type="text"
                                  readOnly={isDemoMode}
                                  value={isDemoMode ? "0" : (betAmount ?? "0").toString()}
                                  onFocus={(e) => {
                                    if (isDemoMode) return;
                                    setIsFocused(true)
                                    e.target.select()
                                  }}
                                  onBlur={() => {
                                    if (isDemoMode) return;
                                    let val = betAmount;
                                    setIsFocused(false)
                                    // If empty or invalid → set to 0.00
                                    if (!val || isNaN(parseFloat(val))) {
                                      setBetAmount("0.00");
                                      return;
                                    }

                                    // Convert to number with 2 decimal places
                                    let formatted = parseFloat(val).toFixed(2);

                                    setBetAmount(formatted);
                                  }}
                                  onChange={(e) => {
                                    if (isDemoMode) return;
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

                                    // Minimum allowed value 0.05
                                    // if (parseFloat(numeric) > 0 && parseFloat(numeric) < 0.05) {
                                    //   numeric = "0.05";
                                    // }

                                    setBetAmount(numeric);
                                  }}
                                  disabled={isDemoMode || (gameObject.current && !gameObject.current?.handOver) || btnClickRef}
                                  className={`w-full  text-[#94a59e] focus:text-white bg-[#090C1D]  rounded-lg pl-8 pr-32 py-2 outline-none
       
      ${errorMsg
                                      ? "   ring-2 ring-red-500"
                                      : " focus:ring-2 focus:ring-[#31ABE8]  "
                                    }
    `}
                                  placeholder="0.00"
                                />

                                <Tooltip
                                  id="betError"
                                  isOpen={Boolean(errorMsg)}
                                  clickable={false}
                                  place="top"
                                  className="!bg-black  !text-white
                                    !px-3 !py-2 !rounded-md 
                                    !backdrop-blur-sm !text-xs !font-medium
                                    !z-[9999]"
                                >
                                  {errorMsg}
                                </Tooltip>

                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-[2px]">
                                  <button
                                    onClick={() => {
                                      buttonClickSoundFn();
                                      setBetAmount((prev) => {
                                        let newVal = parseFloat(prev || "0") / 2;

                                        // if less than 0.01, force 0
                                        if (newVal < 0.01) {
                                          newVal = 0;
                                        }

                                        return newVal.toFixed(2); // always show 2 decimals
                                      });
                                    }}
                                    disabled={
                                      isDemoMode ||
                                      (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                    }
                                    className="px-2 py-1 text-xs bg-[#19183a]  rounded-l-md text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed"
                                  >
                                    1/2
                                  </button>
                                  <button
                                    onClick={() => {
                                      buttonClickSoundFn();
                                      setBetAmount((prev) =>
                                        Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                      )
                                    }
                                    }
                                    disabled={
                                      isDemoMode ||
                                      (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                    }
                                    className={`px-2 py-1 text-xs bg-[#19183a]  ${ShowMAxBetBTN ? "" : "rounded-r-md"}  text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed`}
                                  >
                                    2X
                                  </button>
                                  {
                                    ShowMAxBetBTN &&
                                    <button
                                      onClick={() => {
                                        buttonClickSoundFn();
                                        // setBetAmount(MAX_BET.toFixed(2))
                                        // handleMaxBetButtonClick();
                                        // compute formatted value synchronously so we can show errors immediately
                                        const numericMax = (Number(MAX_BET) - Number(pefectPairAmount)) - Number(plus21Amount);
                                        const formatted = Number.isFinite(numericMax) ? numericMax.toFixed(2) : String(MAX_BET);
                                        setBetAmount(formatted);

                                        if (!Number.isFinite(numericMax) || numericMax <= 0) {
                                          setBetError("Insufficient balance");
                                        } else {
                                          setBetError("");
                                        }
                                      }}
                                      disabled={
                                        (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                      }
                                      className="px-2 py-1 text-xs bg-[#19183a]  rounded-r-md text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed"
                                    >
                                      Max
                                    </button>
                                  }
                                </div>
                              </div>
                            </div>
                            {/* Perfect Pair Bets */}
                            <div className="relative mt-3 w-full md:w-full sm:w-full  ">
                              <div className="flex px-1 mb-1 items-center font-medium justify-between text-gray-300 text-sm">
                                <span>Perfect Pair Bets</span>
                                <span className="text-xs text-white flex ">
                                  {
                                    perfectPairWin && perfectPairResult &&
                                    <div >{perfectPairResult?.type} ({perfectPairResult?.multiplier}X) </div>
                                  }
                                </span>
                              </div>
                              <div className="relative rounded-xl">
                                <span
                                  className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocusedPerfectPair ? "opacity-100" : "opacity-50"
                                    }`}
                                >
                                  {/* {
                                  displayCurrency == 'USD'
                                    ?
                                    (
                                      <span
                                        className={`w-[1em] text-white h-[1em] inline-flex items-center justify-center text-[1em] ${isFocused ? "opacity-100" : "opacity-50"
                                          }`}
                                      >
                                        {currencySymbols[displayCurrency] || displayCurrency}
                                      </span>
                                    )
                                    :
                                    (
                                      <span
                                        className={`w-[1em] text-white h-[1em] inline-flex items-center justify-center text-[1em] ${isFocused ? "opacity-100" : "opacity-50"
                                          }`}
                                      >
                                        {currencySymbols[displayCurrency] || displayCurrency}
                                      </span>

                                    )
                                } */}
                                  <img src={playCurrency == "chips" ? chipsign : dimondsign} alt="chipsign" srcset="" className='w-[18px] h-[18px]' />
                                </span>
                                <input
                                  id="perfectPairInput"
                                  data-tooltip-id="perfectPairError"
                                  data-tooltip-place="top"
                                  data-tooltip-offset={10}
                                  data-tooltip-hidden={!errorMsgParfectPair}
                                  data-tooltip-float={false}
                                  inputMode="decimal"
                                  type="text"
                                  value={(pefectPairAmount ?? "0").toString()}
                                  onFocus={(e) => {
                                    setIsFocusedPerfectPair(true)
                                    e.target.select()
                                  }}
                                  onBlur={() => {
                                    let val = pefectPairAmount;
                                    setIsFocusedPerfectPair(false)
                                    // If empty or invalid → set to 0.00
                                    if (!val || isNaN(parseFloat(val))) {
                                      setPefectPairAmount("0.00");
                                      return;
                                    }

                                    // Convert to number with 2 decimal places
                                    let formatted = parseFloat(val).toFixed(2);

                                    setPefectPairAmount(formatted);
                                  }}
                                  onChange={(e) => {
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

                                    // Minimum allowed value 0.05
                                    // if (parseFloat(numeric) > 0 && parseFloat(numeric) < 0.05) {
                                    //   numeric = "0.05";
                                    // }

                                    setPefectPairAmount(numeric);
                                  }}
                                  disabled={(gameObject.current && !gameObject.current?.handOver) || btnClickRef}
                                  className={`w-full  text-[#94a59e] focus:text-white bg-[#090C1D]  rounded-lg pl-8 pr-32 py-2 outline-none
       
      ${errorMsgParfectPair
                                      ? "   ring-2 ring-red-500"
                                      : " focus:ring-2 focus:ring-[#31ABE8] "

                                    }
                                  ${perfectPairWin && perfectPairResult ? 'ring-2 ring-[#0bf191] ' : ''}
    `}
                                  placeholder="0.00"
                                />

                                <Tooltip
                                  id="perfectPairError"
                                  isOpen={Boolean(errorMsgParfectPair)}
                                  clickable={false}
                                  place="top"
                                  className="!bg-black  !text-white
                                    !px-3 !py-2 !rounded-md 
                                    !backdrop-blur-sm !text-xs !font-medium
                                    !z-[9999]"
                                >
                                  {errorMsgParfectPair}
                                </Tooltip>

                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-[2px]">
                                  <button
                                    onClick={() => {
                                      buttonClickSoundFn();
                                      setPefectPairAmount((prev) => {
                                        let newVal = parseFloat(prev || "0") / 2;

                                        // if less than 0.01, force 0
                                        if (newVal < 0.01) {
                                          newVal = 0;
                                        }

                                        return newVal.toFixed(2); // always show 2 decimals
                                      });
                                    }}
                                    disabled={
                                      isDemoMode ||
                                      (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                    }
                                    className="px-2 py-1 text-xs bg-[#19183a]  rounded-l-md text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed"
                                  >
                                    1/2
                                  </button>
                                  <button
                                    onClick={() => {
                                      buttonClickSoundFn();
                                      setPefectPairAmount((prev) =>
                                        Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                      )
                                    }
                                    }
                                    disabled={
                                      isDemoMode ||
                                      (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                    }
                                    className={`px-2 py-1 text-xs bg-[#19183a]  ${ShowMAxBetBTN ? "" : "rounded-r-md"}  text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed`}
                                  >
                                    2X
                                  </button>
                                  {
                                    ShowMAxBetBTN &&
                                    <button
                                      onClick={() => {
                                        buttonClickSoundFn();
                                        // setPefectPairAmount(MAX_BET.toFixed(2))
                                        // handleMaxBetButtonClick();
                                        // compute formatted value synchronously so we can show errors immediately
                                        const numericMax = (Number(MAX_BET) - Number(betAmount)) - Number(plus21Amount); // if we want to consider main bet when maxing perfect pair
                                        const formatted = Number.isFinite(numericMax) ? numericMax.toFixed(2) : String(MAX_BET);
                                        setPefectPairAmount(formatted);

                                        if (!Number.isFinite(numericMax) || numericMax <= 0) {
                                          seterrorMsgParfectPair("Insufficient balance");
                                        } else {
                                          seterrorMsgParfectPair("");
                                        }
                                      }}
                                      disabled={
                                        (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                      }
                                      className="px-2 py-1 text-xs bg-[#19183a]  rounded-r-md text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed"
                                    >
                                      Max
                                    </button>
                                  }
                                </div>
                              </div>
                            </div>
                            {/* 21+3 Bet */}
                            <div className="relative mt-3 w-full md:w-full sm:w-full  ">
                              <div className="flex px-1 mb-1 items-center font-medium justify-between text-gray-300 text-sm">
                                <span>21+3 Bet</span>
                                <span className="text-xs text-white flex ">
                                  {
                                    plus21Win && plus21Result &&
                                    <div >{plus21Result?.type} ({plus21Result?.multiplier}X) </div>
                                  }
                                </span>
                              </div>
                              <div className="relative rounded-xl">
                                <span
                                  className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocusedPlus21 ? "opacity-100" : "opacity-50"
                                    }`}
                                >
                                  {/* {
                                  displayCurrency == 'USD'
                                    ?
                                    (
                                      <span
                                        className={`w-[1em] text-white h-[1em] inline-flex items-center justify-center text-[1em] ${isFocusedPlus21 ? "opacity-100" : "opacity-50"
                                          }`}
                                      >
                                        {currencySymbols[displayCurrency] || displayCurrency}
                                      </span>
                                    )
                                    :
                                    (
                                      <span
                                        className={`w-[1em] text-white h-[1em] inline-flex items-center justify-center text-[1em] ${isFocused ? "opacity-100" : "opacity-50"
                                          }`}
                                      >
                                        {currencySymbols[displayCurrency] || displayCurrency}
                                      </span>

                                    )
                                } */}
                                  <img src={playCurrency == "chips" ? chipsign : dimondsign} alt="chipsign" srcset="" className='w-[18px] h-[18px]' />
                                </span>
                                <input
                                  id="plus21Input"
                                  data-tooltip-id="plus21Error"
                                  data-tooltip-place="top"
                                  data-tooltip-offset={10}
                                  data-tooltip-hidden={!errorMsgPlus21}
                                  data-tooltip-float={false}
                                  inputMode="decimal"
                                  type="text"
                                  value={(plus21Amount ?? "0").toString()}
                                  onFocus={(e) => {
                                    setIsFocusedPlus21(true)
                                    e.target.select()
                                  }}
                                  onBlur={() => {
                                    let val = plus21Amount;
                                    setIsFocusedPlus21(false)
                                    // If empty or invalid → set to 0.00
                                    if (!val || isNaN(parseFloat(val))) {
                                      setPlus21Amount("0.00");
                                      return;
                                    }

                                    // Convert to number with 2 decimal places
                                    let formatted = parseFloat(val).toFixed(2);

                                    setPlus21Amount(formatted);
                                  }}
                                  onChange={(e) => {
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

                                    // Minimum allowed value 0.05
                                    // if (parseFloat(numeric) > 0 && parseFloat(numeric) < 0.05) {
                                    //   numeric = "0.05";
                                    // }

                                    setPlus21Amount(numeric);
                                  }}
                                  disabled={(gameObject.current && !gameObject.current?.handOver) || btnClickRef}
                                  className={`w-full  text-[#94a59e] focus:text-white bg-[#090C1D]  rounded-lg pl-8 pr-32 py-2 outline-none
       
      ${errorMsgPlus21
                                      ? "   ring-2 ring-red-500"
                                      : " focus:ring-2 focus:ring-[#31ABE8]"
                                    }
                                  ${plus21Win && plus21Result ? 'ring-2 ring-[#0bf191] ' : ''}
    `}
                                  placeholder="0.00"
                                />

                                <Tooltip
                                  id="plus21Error"
                                  isOpen={Boolean(errorMsgPlus21)}
                                  clickable={false}
                                  place="top"
                                  className="!bg-black  !text-white
                                    !px-3 !py-2 !rounded-md 
                                    !backdrop-blur-sm !text-xs !font-medium
                                    !z-[9999]"
                                >
                                  {errorMsgPlus21}
                                </Tooltip>

                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-[2px]">
                                  <button
                                    onClick={() => {
                                      buttonClickSoundFn();
                                      setPlus21Amount((prev) => {
                                        let newVal = parseFloat(prev || "0") / 2;

                                        // if less than 0.01, force 0
                                        if (newVal < 0.01) {
                                          newVal = 0;
                                        }

                                        return newVal.toFixed(2); // always show 2 decimals
                                      });
                                    }}
                                    disabled={
                                      isDemoMode ||
                                      (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                    }
                                    className="px-2 py-1 text-xs bg-[#19183a]  rounded-l-md text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed"
                                  >
                                    1/2
                                  </button>
                                  <button
                                    onClick={() => {
                                      buttonClickSoundFn();
                                      setPlus21Amount((prev) =>
                                        Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                      )
                                    }
                                    }
                                    disabled={
                                      isDemoMode ||
                                      (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                    }
                                    className={`px-2 py-1 text-xs bg-[#19183a]  ${ShowMAxBetBTN ? "" : "rounded-r-md"}  text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed`}
                                  >
                                    2X
                                  </button>
                                  {
                                    ShowMAxBetBTN &&
                                    <button
                                      onClick={() => {
                                        buttonClickSoundFn();
                                        // setPlus21Amount(MAX_BET.toFixed(2))
                                        // handleMaxBetButtonClick();
                                        // compute formatted value synchronously so we can show errors immediately
                                        const numericMax = Number(MAX_BET);
                                        const formatted = Number.isFinite(numericMax) ? numericMax.toFixed(2) : String(MAX_BET);
                                        setPlus21Amount(formatted);

                                        if (!Number.isFinite(numericMax) || numericMax <= 0) {
                                          seterrorMsgPlus21("Insufficient balance");
                                        } else {
                                          seterrorMsgPlus21("");
                                        }
                                      }}
                                      disabled={
                                        (gameObject.current && !gameObject.current?.handOver || btnClickRef)
                                      }
                                      className="px-2 py-1 text-xs bg-[#19183a]  rounded-r-md text-gray-200 hover:bg-[#2c2852] disabled:cursor-not-allowed"
                                    >
                                      Max
                                    </button>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* <div className="order-1 hidden sm:hidden md:hidden lg:flex flex-row justify-between  items-center bg-gradient-to-br from-[#3c3a55] via-[#4a4967] to-[#8f8da6] rounded-t-xl ">
                      <div className="w-full  text-white lg:rounded-t-xl lg:flex flex-row justify-between  items-center p-1 bg-gradient-to-r from-[#FFFFFF4D] to-[#FFFFFF33] ">
                        <div direction="row" spacing={2} >
                          <Button
                            style={{
                              fontWeight: "500",
                              fontSize: "16px",
                              color: "white",
                              textTransform: "none"

                            }}
                          >
                            <img src={BlackjackImg} alt="Blackjack" className="w-[16px] h-[18px] mr-1" />
                            Blackjack
                          </Button>
                        </div>

                        <div>
                          <Button
                            onClick={() => setShowFairness(true)}
                            style={{
                              // background: "#0BF191",
                              fontWeight: "500",
                              fontSize: "16px",
                              color: "white",
                              textTransform: "none"

                            }}
                          >
                            <img src={FairplayImg} alt="Blackjack" className="w-[14px] h-[18px] mr-1" />
                            Fairness
                          </Button>
                          
                           <FairnessModal userId={user?._id} socket={socket} showFairness={showFairness} setShowFairness={setShowFairness} />
                        </div>
                      </div>
                    </div> */}

                      {/* Right content: Blackjack Table (responsive, matches design exactly) */}
                      <div className="order-1 lg:order-2 lg:w-[70%]    bg-[#090C1D] lg:rounded-r-xl relative overflow-hidden h-[450px] lg:h-[530px] sm:h-[500px] md:h-[530px] xl:h-[550px] 2xl:h-[600px]">

                        {/* Deck stack top-right */}
                        <div
                          ref={deckRef}
                          className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-[2px] lg:right-[1px] z-10"
                        >
                          <picture>
                            <source media="(min-width: 1024px)" srcSet={deckStack} />
                            <img
                              loading="lazy"
                              draggable={false}
                              src={deckStack}
                              alt="deck"
                              width={65}
                              height={103}
                              className="h-[6.426rem] w-[4.1769rem] xs:h-[4.4982rem] xs:w-[2.5704rem] sm:h-[6.426rem] sm:w-[3.8556rem]  md:h-[7.7112rem] md:w-[5.1408rem] lg:h-[7.0686rem] lg:w-[5.1408rem] object-contain"
                            />
                          </picture>
                        </div>

                        {/* Main table container with flex layout */}
                        <div className="w-full h-full flex flex-col items-center justify-center relative p-2 sm:p-3 md:p-4">
                          {/* Elliptical table outline - proper oval shape */}
                          {/* <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 md:p-4">
                          <div
                            className="w-[55%] h-[75%] sm:w-[40%] sm:h-[70%] md:w-[60%] md:h-[75%] lg:w-[85%] lg:h-[60%] lg:min-h-[320px]"
                            style={{
                              borderRadius: '999px',
                              border: '3px solid #DDEFF866',
                              // opacity: 0.8,
                              background: 'transparent'

                            }}
                          />
                        </div> */}

                          {/* Dealer's area (top) */}
                          <div className="absolute top-1 sm:top-2 md:top-4 lg:top-[80px] flex flex-col items-center z-20" >
                            {/* Dealer's score */}

                            <div style={{
                              // opacity: isFadingOut ? 0 : 1,
                              transition: "opacity 0.2s ease"

                            }} className={`px-2 py-1 mb-1 rounded  ${allAnimationsComplete
                              ?
                              (winner2 && gameFinished)
                                ? "bg-[#333333B2]"
                                : (playerCardsScore === dealerCardsScore && gameFinished)
                                  ? "bg-[#F4C50A]" // 🟡 yellow border
                                  : (winner1 && gameFinished)
                                    ? "bg-[#3BB97499] border-[#3BB974BF] border-[1.8px] "
                                    : "bg-[#2C2C45] border-[#6D6585] border-[1.8px] "
                              : "bg-[#2C2C45] border-[#6D6585] border-[1.8px]" // default while sliding
                              } text-[#F4FFFB]  text-sm sm:text-base font-semibold shadow-md mt-[15px] lg:-mt-[20px] ${dealerCardsScore > 0 && !isFadingOut ? ' opacity-100 ' : "opacity-0"}`}>
                              {dealerDisplayPoints && !gameFinished ? dealerDisplayPoints : dealerCardsScore}
                            </div>

                            {/* Dealer's cards - dynamically centered stepped layout */}
                            <div
                              ref={dealerHandRef}
                              className="relative flex items-center justify-center w-full top-[15px] sm:top-[15px] md:top-[10px] lg:top-[2px]"
                              style={{ height: '141px' }}
                            >
                              <div
                                className="relative"
                                style={{
                                  width: `${(leftSpacing * (dealerCards.length - 1) + 3.8556)}rem`,
                                  height: '100%',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  position: 'absolute'
                                }}
                              >
                                {dealerCards.map((card, i) => {
                                  const { src, slideIn, flipFront, animating } = card;
                                  const deckPos = getDeckPosition();
                                  const fadeStyle = {
                                    opacity: isFadingOut ? 0 : 1,
                                    transition: `opacity 0.15s ease ${i * 0.08}s`, // ⏱ stagger delay per card
                                  };
                                  // Calculate the final position for this specific card relative to viewport
                                  const cardContainer = dealerHandRef.current;
                                  let finalLeft = 0, finalTop = 0;
                                  if (cardContainer) {
                                    const containerRect = cardContainer.getBoundingClientRect();
                                    const cardLeft = i * leftSpacing * 16; // Convert rem to px
                                    const cardTop = i * topSpacing * 16;
                                    finalLeft = containerRect.left + cardLeft;
                                    finalTop = containerRect.top + cardTop;
                                  }
                                  const offsetX = deckPos.x - finalLeft;
                                  const offsetY = deckPos.y - finalTop;
                                  const effectiveSlideIn = ShowAnimation && slideIn;
                                  const slideDuration = ShowAnimation
                                    ? (playFast ? 0.05 : 0.15)
                                    : 0;
                                  const flipDuration = ShowAnimation
                                    ? (playFast ? 0.18 : 0.4)
                                    : 0;
                                  const animationStyle = effectiveSlideIn ? {
                                    transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(20deg)`,
                                    opacity: 0.8,
                                    filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
                                    transition: `all ${slideDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                                  } : {};
                                  return (
                                    <div
                                      key={i}
                                      className="absolute"
                                      style={{
                                        left: `${i * leftSpacing}rem`,
                                        top: `${i * topSpacing}rem`,
                                        zIndex: i,
                                        width: "4.4982rem",   // 4.998rem × 0.9
                                        height: "6.426rem",   // 7.14rem × 0.9
                                        perspective: "1000px", // needed for 3D flip
                                        transition: !effectiveSlideIn ? "all 0.15s ease-in-out" : "none",
                                        transform: !effectiveSlideIn ? "translateX(0) translateY(0) scale(1) rotate(0deg)" : "none",
                                        borderRadius: '4px',
                                        ...animationStyle,
                                        ...(isFadingOut ? fadeStyle : {})
                                      }}
                                    >
                                      {/* inner flip container */}
                                      <div
                                        className="relative w-full h-full"
                                        style={{
                                          transform: (ShowAnimation ? flipFront : true) ? "rotateY(180deg)" : "rotateY(0deg)",
                                          transformStyle: "preserve-3d",
                                          transition: ShowAnimation ? `transform ${flipDuration}s ease-in-out` : "none"
                                        }}
                                      >
                                        {/* Back side */}
                                        <div
                                          className="absolute w-full h-full"
                                          style={{
                                            backfaceVisibility: "hidden"
                                          }}
                                        >
                                          <img
                                            loading="lazy"
                                            width={16}
                                            height={16} alt="back"
                                            draggable={false} src={cardbackside} alt="back" className="h-full w-full object-contain" />
                                        </div>
                                        {/* Front side */}
                                        <div
                                          className="absolute w-full h-full"
                                          style={{
                                            transform: "rotateY(180deg)",
                                            backfaceVisibility: "hidden"
                                          }}
                                        >
                                          <img
                                            width={16}
                                            height={16}
                                            loading="lazy" alt="front"
                                            draggable={false} src={src} alt="front" style={{
                                              boxShadow: '0 0 4px rgba(0, 0, 0, 0.45)',
                                              borderRadius: '4px'
                                            }} className="h-full w-full object-contain" />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}

                              </div>

                            </div>


                          </div>

                          {/* Center logo and rules */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-2 sm:px-3 md:px-4">

                            <div className="relative flex flex-col items-center text-center w-full">

                              {/* ⭐ TEXT BLOCKS ⭐ */}
                              <div className="relative  z-20 flex flex-col items-center justify-center gap-1">
                                <img src={centerLogo} alt="centerLogo" className='w-[50vw] max-w-[420px] md:w-[42vw] lg:w-[30vw] h-auto object-contain' />
                                {/* <div className="  z-50 ">
                                <img
                                  key={currentGif}
                                  src={cardImageCache[currentGif]?.src}
                                  alt="Gift animation"
                                  width={80}
                                  height={80}
                                  className={`  lg:hidden block  
      ${winner2 && gameFinished
                                      ? "w-[7rem]"
                                      : !winner2 && gameFinished
                                        ? "w-[7rem]"
                                        : "w-[7rem]"}
      object-contain transition-opacity duration-200 ease-in-out
      ${gifVisible ? "opacity-100" : "opacity-0"}
    `}
                                // unoptimized
                                />
                              </div> */}
                                {/* <div className="
        px-[clamp(12px,3vw,28px)]
        py-[clamp(4px,1vw,10px)]
        bg-[#0e302c] text-[#94a59e]
        text-[clamp(10px,2vw,14px)]      
        tracking-wide mx-auto
        ">
                               
                                BLACKJACK PAYS 3 TO 2
                              </div> */}

                                {/* <div className="
        px-[clamp(12px,3vw,28px)]
        py-[clamp(4px,1vw,10px)]
        text-[#94A59E]
        text-[clamp(10px,2vw,14px)]     
        tracking-wide mx-auto
      ">
                                INSURANCE PAYS 2 TO 1
                              </div> */}

                              </div>
                            </div>

                          </div>




                          {/* Player's area (bottom) */}
                          {!splitClick && (
                            <div className="absolute bottom-2 sm:bottom-2 md:bottom-[10%] lg:bottom-[8%] flex flex-col items-center z-20 w-full">
                              {/* Player's score */}
                              {playerCardsScore > 0 && (
                                <div
                                  className={`  text-[#F4FFFB]    flex justify-start  items-center rounded  text-sm sm:text-base font-semibold shadow-md mb-2
      ${allAnimationsComplete
                                      ?
                                      (winner1 && gameFinished)
                                        ? "bg-[#333333B2] border-[#333333] border-[1.8px]"
                                        : (playerCardsScore === dealerCardsScore && gameFinished)
                                          ? "bg-[#A18204] border-[#F4C50A] border-[1.8px]" // 🟡 yellow border
                                          : (winner2 && gameFinished)
                                            ? "bg-[#3BB97499] border-[#3BB974BF] border-[1.8px] "
                                            : "bg-[#2C2C45] border-[#6D6585] border-[1.8px] "
                                      : "bg-[#2C2C45] border-[#6D6585] border-[1.8px]" // default while sliding
                                    }`}
                                  style={{
                                    opacity: isFadingOut ? 0 : 1,
                                    transition: "opacity 0.2s ease"
                                  }}
                                >
                                  <span className={`px-2 py-1 rounded ${(winner1 && gameFinished)
                                    ? "bg-[#333333B2] "
                                    : (playerCardsScore === dealerCardsScore && gameFinished)
                                      ? "bg-[#F4C50A]" // 🟡 yellow border
                                      : (winner2 && gameFinished)
                                        ? "bg-[#3BB97499]  "
                                        : "bg-[#2C2C45] border-[#6D6585] "}`}>{playerDisplayPoints && (playerCardsScore !== 21) ? playerDisplayPoints : playerCardsScore}</span>
                                  {/* Show "Win" button only when winner2 */}
                                  <span
                                    className={`mx-4 text-[#FFFFFF] text-sm font-semibold cursor-none ${!(
                                      winner2 && gameFinished ||
                                      winner1 && gameFinished ||
                                      (playerCardsScore === dealerCardsScore && gameFinished)
                                    )
                                      ? "hidden"
                                      : ""
                                      }`}
                                  >
                                    {winner2 && gameFinished
                                      ? (playerCards?.length === 2 && playerCardsScore === 21
                                        ? "Blackjack"
                                        : "Win")
                                      : winner1 && gameFinished
                                        ? "Lost"
                                        : playerCardsScore === dealerCardsScore && gameFinished
                                          ? "Tie"
                                          : null}
                                  </span>
                                </div>
                              )}

                              {/* Player's cards - using flexbox for responsive layout */}
                              <div className="flex items-center justify-center w-full">
                                <div
                                  ref={playerHandRef}
                                  className="relative flex items-center justify-center "
                                  style={{ height: '141px' }}
                                >
                                  <div
                                    id="middlePlayer"
                                    className="relative"
                                    style={{
                                      width: `${(leftSpacing * (playerCards.length - 1) + 3.8556)}rem`,
                                      height: '100%',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      position: 'absolute'
                                    }}
                                  // ref={playerHandRef}
                                  >
                                    {playerCards.map((card, i) => {
                                      const { src, slideIn, flipFront, animating } = card;
                                      const deckPos = getDeckPosition();
                                      const fadeStyle = {
                                        opacity: isFadingOut ? 0 : 1,
                                        transition: `opacity 0.15s ease ${i * 0.08}s`, // ⏱ stagger delay per card
                                      };
                                      // Calculate the final position for this specific card relative to viewport
                                      const cardContainer = playerHandRef.current;
                                      let finalLeft = 0, finalTop = 0;
                                      if (cardContainer) {
                                        const containerRect = cardContainer.getBoundingClientRect();
                                        const cardLeft = i * leftSpacing * 16; // Convert rem to px
                                        const cardTop = i * topSpacing * 16;
                                        finalLeft = containerRect.left + cardLeft;
                                        finalTop = containerRect.top + cardTop;
                                      }
                                      const offsetX = deckPos.x - finalLeft;
                                      const offsetY = deckPos.y - finalTop;
                                      const effectiveSlideIn = ShowAnimation && slideIn;
                                      const slideDuration = ShowAnimation
                                        ? (playFast ? 0.1 : 0.2)
                                        : 0;
                                      const flipDuration = ShowAnimation
                                        ? (playFast ? 0.2 : 0.5)
                                        : 0;
                                      const animationStyle = effectiveSlideIn ? {
                                        transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(20deg)`,
                                        opacity: 0.8,
                                        filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
                                        transition: `all ${slideDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                                      } : {};
                                      return (
                                        <div
                                          key={i}
                                          className="absolute"
                                          style={{
                                            left: `${i * leftSpacing}rem`,
                                            top: `${i * topSpacing}rem`,
                                            zIndex: i,
                                            width: "4.4982rem",   // 4.998rem × 0.9
                                            height: "6.426rem",   // 7.14rem × 0.9
                                            perspective: "1000px", // :white_check_mark: needed for 3D flip
                                            transition: !effectiveSlideIn ? "all 0.2s ease-in-out" : "none",
                                            transform: !effectiveSlideIn ? "translateX(0) translateY(0) scale(1) rotate(0deg)" : "none", borderRadius: '4px',
                                            ...animationStyle,
                                            ...(isFadingOut ? fadeStyle : {})
                                          }}
                                        >
                                          {/* inner flip container */}
                                          <div
                                            className="relative w-full h-full"
                                            style={{
                                              transform: (ShowAnimation ? flipFront : true) ? "rotateY(180deg)" : "rotateY(0deg)",
                                              transformStyle: "preserve-3d",
                                              transition: ShowAnimation ? `transform ${flipDuration}s ease-in-out` : "none"
                                            }}
                                          >
                                            {/* Back side */}
                                            <div
                                              className="absolute w-full h-full"
                                              style={{
                                                backfaceVisibility: "hidden"
                                              }}
                                            >
                                              <img
                                                loading="lazy"
                                                draggable={false}
                                                width={16}
                                                height={16}
                                                src={cardbackside}
                                                alt="card back"
                                                className="h-full w-full rounded-sm shadow-lg object-contain"
                                              />
                                            </div>
                                            {/* Front side */}
                                            <div
                                              className="absolute w-full h-full"
                                              style={{
                                                transform: "rotateY(180deg)",
                                                backfaceVisibility: "hidden"
                                              }}
                                            >
                                              <img
                                                loading="lazy"
                                                width={16}
                                                height={16} alt="card front"
                                                draggable={false}
                                                src={src}
                                                style={{
                                                  // boxShadow: allAnimationsComplete
                                                  //   ? (playerCardsScore === dealerCardsScore && gameFinished)
                                                  //     ? "0 0 10px 2px rgba(255, 215, 0, 0.9)" // 🟡 yellow glow
                                                  //     : (winner2 && gameFinished)
                                                  //       ? '0 0 10px 2px rgba(0, 233, 0, 0.8)'
                                                  //       : (winner1 && gameFinished)
                                                  //         ? '0 0 10px 2px rgba(227, 56, 39, 1)'
                                                  //         : '0 0 4px rgba(0, 0, 0, 0.45)'
                                                  //   : '0 0 4px rgba(0, 0, 0, 0.45)',
                                                  border: allAnimationsComplete
                                                    ? (playerCardsScore === dealerCardsScore && gameFinished)
                                                      ? "2px solid #F4C50A" // 🟡 yellow border
                                                      : (winner2 && gameFinished)
                                                        ? '2px solid #3BB974BF' // 🟢 green border
                                                        : (winner1 && gameFinished)
                                                          ? '2px solid #333333' //   black border
                                                          : 'none'
                                                    : 'none', borderRadius: '4px', boxShadow: '0 0 4px rgba(0, 0, 0, 0.45)'
                                                }}
                                                alt="card front"
                                                className="h-full w-full rounded-sm shadow-lg object-cover"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}


                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {splitClick && (
                            <div>
                              {/* Split Group 2 */}
                              <div className="absolute bottom-2 sm:bottom-2  left-20 sm:left-[24]  md:bottom-[10%] md:left-[24%] lg:bottom-[8%] lg:left-[18%] flex flex-col items-center z-20">
                                {/* Player's score */}

                                {splitScores > 0 && (
                                  <div
                                    className={`
    flex  justify-start items-center rounded text-sm sm:text-base font-semibold shadow-md mb-2
    
                                      text-[#F4FFFB] 
    ${allAnimationsComplete
                                        ?
                                        (splitScores > 21 || !handTwoWin && splitScores < dealerCardsScore) && gameFinished
                                          ? "bg-[#333333B2] border-[#333333] border-[1.8px]" // 🔴 Lose/Bust
                                          : splitScores === dealerCardsScore && gameFinished
                                            ? "bg-[#A18204] border-[#F4C50A] border-[1.8px]"   // 🟡 Tie
                                            : winner2 && handTwoWin && gameFinished
                                              ? "bg-[#3BB97499] border-[#3BB974BF] border-[1.8px]" // 🟢 Win 
                                              : "bg-[#2C2C45] border-[#6D6585] border-[1.8px] "
                                        : "bg-[#2C2C45] border-[#6D6585] border-[1.8px]" // default while sliding
                                      }
  `}
                                    style={{
                                      opacity: isFadingOut ? 0 : 1,
                                      transition: "opacity 0.2s ease"
                                    }}
                                  >
                                    <span className={`px-2 py-1 rounded ${(splitScores > 21 || !handTwoWin && splitScores < dealerCardsScore) && gameFinished
                                      ? "bg-[#333333B2] "
                                      : (splitScores === dealerCardsScore && gameFinished)
                                        ? "bg-[#F4C50A]" // 🟡 yellow border
                                        : (winner2 && handTwoWin && gameFinished)
                                          ? "bg-[#3BB97499]  "
                                          : "bg-[#2C2C45] "}`}>
                                      {playerDisplayPoints2 && (splitScores !== 21) ? playerDisplayPoints2 : splitScores}</span>

                                    {/* ✅ Show "Blackjack" or "Win" */}
                                    {/* {winner2 && handTwoWin && gameFinished && ( */}
                                    <span className={`mx-4 text-[#FFFFFF] text-sm font-semibold cursor-none ${!(
                                      winner2 && handTwoWin && gameFinished ||
                                      splitCards?.length === 2 && splitScores === 21 ||
                                      ((splitScores > 21 || !handTwoWin && splitScores < dealerCardsScore) && gameFinished) ||
                                      splitScores === dealerCardsScore && gameFinished
                                    )
                                      ? "hidden"
                                      : ""
                                      }`}>

                                      {splitScores === dealerCardsScore && gameFinished
                                        ? "Tie"
                                        : (splitScores > 21 || !handTwoWin && splitScores < dealerCardsScore) && gameFinished
                                          ? "Lost"
                                          : winner2 && handTwoWin && gameFinished
                                            ? (splitCards?.length === 2 && splitScores === 21 ? "Win" : "Win")
                                            : null}
                                    </span>
                                    {/* )} */}
                                  </div>

                                )}


                                {/* Player's cards - using flexbox for responsive layout */}
                                <div className="flex items-center justify-center w-full">
                                  <div
                                    ref={splitHandRef}
                                    className="relative flex items-center justify-center w-full"
                                    style={{ height: '141px' }}
                                  >
                                    {/* Cards */}
                                    <div className="relative flex items-center justify-center w-full" style={{ height: '141px' }}>
                                      <div
                                        className="relative"
                                        style={{
                                          width: `${(leftSpacing * (splitCards.length - 1) + 3.8556)}rem`,
                                          height: '100%',
                                          left: '50%',
                                          transform: 'translateX(-50%)',
                                          position: 'absolute'
                                        }}
                                        ref={group2Ref}
                                      >


                                        {splitCards.map((card, i) => {
                                          const { src, slideIn, flipFront, animating } = card;
                                          const deckPos = getDeckPosition();
                                          const fadeStyle = {
                                            opacity: isFadingOut ? 0 : 1,
                                            transition: `opacity 0.15s ease ${i * 0.08}s`, // ⏱ stagger delay per card
                                          };

                                          // Calculate the final position for this specific card relative to viewport
                                          const cardContainer = splitHandRef.current;
                                          let finalLeft = 0, finalTop = 0;
                                          if (cardContainer) {
                                            const containerRect = cardContainer.getBoundingClientRect();
                                            const cardLeft = i * leftSpacing * 16; // Convert rem to px
                                            const cardTop = i * topSpacing * 16;
                                            finalLeft = containerRect.left + cardLeft;
                                            finalTop = containerRect.top + cardTop;
                                          }
                                          const offsetX = deckPos.x - finalLeft;
                                          const offsetY = deckPos.y - finalTop;
                                          const effectiveSlideIn = ShowAnimation && slideIn;
                                          const slideDuration = ShowAnimation
                                            ? (playFast ? 0.1 : 0.2)
                                            : 0;
                                          const flipDuration = ShowAnimation
                                            ? (playFast ? 0.2 : 0.5)
                                            : 0;
                                          const animationStyle = effectiveSlideIn ? {
                                            transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(20deg)`,
                                            opacity: 0.8,
                                            filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
                                            transition: `all ${slideDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                                          } : {};
                                          return (
                                            <div
                                              key={i}
                                              className="absolute"
                                              style={{
                                                left: `${i * leftSpacing}rem`,
                                                top: `${i * topSpacing}rem`,
                                                zIndex: i,
                                                width: "4.4982rem",   // 4.998rem × 0.9
                                                height: "6.426rem",   // 7.14rem × 0.9
                                                perspective: "1000px", // needed for 3D flip
                                                transition: !effectiveSlideIn ? "all 0.2s ease-in-out" : "none",
                                                transform: !effectiveSlideIn ? "translateX(0) translateY(0) scale(1) rotate(0deg)" : "none",
                                                borderRadius: '4px',
                                                ...animationStyle,
                                                ...(isFadingOut ? fadeStyle : {})
                                              }}
                                            >
                                              {/* inner flip container */}
                                              <div
                                                className="relative w-full h-full"
                                                style={{
                                                  transform: (ShowAnimation ? flipFront : true) ? "rotateY(180deg)" : "rotateY(0deg)",
                                                  transformStyle: "preserve-3d",
                                                  transition: ShowAnimation ? `transform ${flipDuration}s ease-in-out` : "none"
                                                }}
                                              >
                                                {/* Back side */}
                                                <div
                                                  className="absolute w-full h-full"
                                                  style={{
                                                    backfaceVisibility: "hidden"
                                                  }}
                                                >
                                                  <img
                                                    width={16}
                                                    height={16}
                                                    loading="lazy"
                                                    draggable={false}
                                                    src={cardbackside}
                                                    alt="card back"
                                                    className="h-full w-full rounded-sm shadow-lg object-cover"
                                                  />
                                                </div>
                                                {/* Front side */}
                                                <div
                                                  className="absolute w-full h-full"
                                                  style={{
                                                    transform: "rotateY(180deg)",
                                                    backfaceVisibility: "hidden"
                                                  }}
                                                >
                                                  <img
                                                    loading="lazy"
                                                    draggable={false}
                                                    src={src} alt="card front"
                                                    width={16}
                                                    height={16}
                                                    style={{
                                                      // boxShadow:
                                                      //   slideIn
                                                      //     ? ""
                                                      //     : allAnimationsComplete && gameFinished
                                                      //       ?
                                                      //       (!handTwoWin && splitScores < dealerCardsScore || splitScores > 21)
                                                      //         ? "0 0 10px 2px rgba(227, 56, 39, 1)" // 🔴 Lose/Bust
                                                      //         : splitScores === dealerCardsScore
                                                      //           ? "0 0 10px 2px rgba(255, 215, 0, 0.9)" // 🟡 Tie
                                                      //           : winner2 && handTwoWin
                                                      //             ? "0 0 10px 2px rgba(0, 233, 0, 0.8)" // 🟢 Win
                                                      //             : selectedHand === 2
                                                      //               ? "0 0 10px 2px rgba(107, 190, 252, 0.8)" // 🔵 Active hand
                                                      //               : "0 0 4px rgba(0, 0, 0, 0.45)"      // ⚫ Default after finish
                                                      //       : selectedHand === 2
                                                      //         ? "0 0 10px 2px rgba(107, 190, 252, 0.8)"
                                                      //         : "0 0 4px rgba(0, 0, 0, 0.45)",

                                                      border:
                                                        slideIn
                                                          ? ""
                                                          : allAnimationsComplete && gameFinished
                                                            ?
                                                            (!handTwoWin && splitScores < dealerCardsScore || splitScores > 21)
                                                              ? '2px solid #333333' //   black border
                                                              : splitScores === dealerCardsScore
                                                                ? "2px solid #F4C50A" // 🟡 yellow border
                                                                : winner2 && handTwoWin
                                                                  ? '2px solid #3BB974BF' // 🟢 green border
                                                                  : selectedHand === 2
                                                                    ? "2px solid rgba(107, 190, 252, 0.8)" // 🔵 Active hand
                                                                    : "none"
                                                            : selectedHand === 2
                                                              ? "2px solid rgba(107, 190, 252, 0.8)"
                                                              : "none",

                                                      borderRadius: "4px"
                                                    }}

                                                    alt="card front"
                                                    className="h-full w-full rounded-sm shadow-lg object-cover"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}


                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* {selectedHand === 2 && (!winner1 && !winner2) && !gameFinished && (<div className="h-[2px] w-[40px] -mt-[10px]  lg:-mt-[20px] bg-[rgba(107,190,252,0.8)] shadow-[0_0_8px_rgba(107,190,252,0.8)]">
                                </div>)} */}
                              </div>
                              {/* Split Group 1 */}

                              <div className="absolute bottom-2 sm:bottom-2 right-20 sm:right-[24] md:bottom-[10%] md:right-[24%] lg:bottom-[8%] lg:right-[18%] flex flex-col items-center z-20 border-b-red">
                                {/* Player's score */}

                                {playerCardsScore > 0 && (
                                  <div
                                    className={`
    flex justify-start items-center rounded text-sm sm:text-base font-semibold mb-2 text-[#F4FFFB]
    ${allAnimationsComplete
                                        ?
                                        (playerCardsScore > 21 || !handOneWin && playerCardsScore < dealerCardsScore) && gameFinished
                                          ? "bg-[#333333B2] border-[#333333] border-[1.8px]" // 🔴 Lose/Bust
                                          : playerCardsScore === dealerCardsScore && gameFinished
                                            ? "bg-[#A18204] border-[#F4C50A] border-[1.8px]"  // 🟡 Tie
                                            : winner2 && handOneWin && gameFinished
                                              ? "bg-[#3BB97499] border-[#3BB974BF] border-[1.8px]" // 🟢 Win
                                              : "bg-[#2C2C45] border-[#6D6585] border-[1.8px] "
                                        : "bg-[#2C2C45] border-[#6D6585] border-[1.8px]" // default while sliding
                                      }`}
                                    style={{
                                      opacity: isFadingOut ? 0 : 1,
                                      transition: "opacity 0.2s ease"
                                    }}
                                  >
                                    <span className={`px-2 py-1 rounded ${(playerCardsScore > 21 || !handOneWin && playerCardsScore < dealerCardsScore) && gameFinished
                                      ? "bg-[#333333B2] "
                                      : (playerCardsScore === dealerCardsScore && gameFinished)
                                        ? "bg-[#F4C50A]" // 🟡 yellow border
                                        : (winner2 && handOneWin && gameFinished)
                                          ? "bg-[#3BB97499] "
                                          : "bg-[#2C2C45] "}`}>{playerDisplayPoints && (playerCardsScore !== 21) ? playerDisplayPoints : playerCardsScore}</span>

                                    {/* ✅ Show "Blackjack" or "Win" */}
                                    {/* {winner2 && handOneWin && gameFinished && ( */}
                                    <span className={`mx-2 text-[#FFFFFF] text-sm font-semibold cursor-none ${!(
                                      (playerCardsScore > 21 || !handOneWin && playerCardsScore < dealerCardsScore) && gameFinished ||
                                      (playerCardsScore === dealerCardsScore && gameFinished) ||
                                      (playerCardsScore === dealerCardsScore && gameFinished) ||
                                      (winner2 && handOneWin && gameFinished)
                                    )
                                      ? "hidden"
                                      : ""
                                      }`}>
                                      {(playerCardsScore === dealerCardsScore && gameFinished)
                                        ? "Tie"
                                        : (playerCardsScore > 21 || !handOneWin && playerCardsScore < dealerCardsScore) && gameFinished
                                          ? "Lost"
                                          : (winner2 && handOneWin && gameFinished)
                                            ? (playerCards?.length === 2 && playerCardsScore === 21 ? "Win" : "Win")
                                            : null}
                                    </span>
                                    {/* )} */}
                                  </div>

                                )}
                                {/* Player's cards - using flexbox for responsive layout */}
                                <div className="flex items-center justify-center w-full ">
                                  <div
                                    ref={playerHandRef}
                                    className="relative flex items-center justify-center w-full"
                                    style={{ height: '141px' }}
                                  >
                                    <div
                                      className="relative"
                                      style={{
                                        width: `${(leftSpacing * (playerCards.length - 1) + 3.8556)}rem`,
                                        height: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        position: 'absolute'
                                      }}
                                      ref={group1Ref}
                                    >


                                      {playerCards.map((card, i) => {
                                        const { src, slideIn, flipFront, animating } = card;
                                        const deckPos = getDeckPosition();
                                        const fadeStyle = {
                                          opacity: isFadingOut ? 0 : 1,
                                          transition: `opacity 0.15s ease ${i * 0.08}s`, // ⏱ stagger delay per card
                                        };

                                        // Calculate the final position for this specific card relative to viewport
                                        const cardContainer = playerHandRef.current;
                                        let finalLeft = 0, finalTop = 0;
                                        if (cardContainer) {
                                          const containerRect = cardContainer.getBoundingClientRect();
                                          const cardLeft = i * leftSpacing * 16; // Convert rem to px
                                          const cardTop = i * topSpacing * 16;
                                          finalLeft = containerRect.left + cardLeft;
                                          finalTop = containerRect.top + cardTop;
                                        }
                                        const offsetX = deckPos.x - finalLeft;
                                        const offsetY = deckPos.y - finalTop;
                                        const slideDuration = ShowAnimation
                                          ? (playFast ? 0.1 : 0.2)
                                          : 0;
                                        const flipDuration = ShowAnimation
                                          ? (playFast ? 0.2 : 0.5)
                                          : 0;
                                        const animationStyle = slideIn && ShowAnimation ? {
                                          transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(20deg)`,
                                          opacity: 0.8,
                                          filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
                                          transition: `all ${slideDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                                        } : {};
                                        return (
                                          <div
                                            key={i}
                                            className="absolute"
                                            style={{
                                              left: `${i * leftSpacing}rem`,
                                              top: `${i * topSpacing}rem`,
                                              zIndex: i,
                                              width: "4.4982rem",   // 4.998rem × 0.9
                                              height: "6.426rem",   // 7.14rem × 0.9
                                              perspective: "1000px",
                                              transition: !slideIn ? "all 0.2s ease-in-out" : "none",
                                              transform: !slideIn ? "translateX(0) translateY(0) scale(1) rotate(0deg)" : "none",
                                              borderRadius: '4px',
                                              ...animationStyle,
                                              ...(isFadingOut ? fadeStyle : {})
                                            }}
                                          >
                                            {/* inner flip container */}
                                            <div
                                              className="relative w-full h-full"
                                              style={{
                                                transform: flipFront ? "rotateY(180deg)" : "rotateY(0deg)",
                                                transformStyle: "preserve-3d",
                                                transition: `transform ${flipDuration}s ease-in-out`
                                              }}
                                            >
                                              {/* Back side */}
                                              <div
                                                className="absolute w-full h-full"
                                                style={{ backfaceVisibility: "hidden" }}
                                              >
                                                <img
                                                  width={16}
                                                  height={16}
                                                  loading="lazy"
                                                  draggable={false}
                                                  src={cardbackside}
                                                  alt="card back"
                                                  className="h-full w-full rounded-sm shadow-lg object-cover"
                                                />
                                              </div>

                                              {/* Front side */}
                                              <div
                                                className="absolute w-full h-full"
                                                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                                              >

                                                <img
                                                  width={16}
                                                  height={16}
                                                  loading="lazy"
                                                  draggable={false}
                                                  src={src} alt="card front"
                                                  style={{
                                                    // boxShadow:
                                                    //   slideIn
                                                    //     ? ""
                                                    //     : gameFinished
                                                    //       ? (!handOneWin && playerCardsScore < dealerCardsScore || playerCardsScore > 21)
                                                    //         ? "0 0 10px 2px rgba(227, 56, 39, 1)" // 🔴 Lose/Bust
                                                    //         :
                                                    //         playerCardsScore === dealerCardsScore
                                                    //           ? "0 0 10px 2px rgba(255, 215, 0, 0.9)" // 🟡 Tie
                                                    //           : winner2 && handOneWin
                                                    //             ? "0 0 10px 2px rgba(0, 233, 0, 0.8)" // 🟢 Win
                                                    //             : selectedHand === 1
                                                    //               ? "0 0 10px 2px rgba(107, 190, 252, 0.8)" // 🔵 Active hand highlight
                                                    //               : "0 0 4px rgba(0, 0, 0, 0.45)"      // ⚫ Default shadow
                                                    //       : selectedHand === 1
                                                    //         ? "0 0 10px 2px rgba(107, 190, 252, 0.8)"
                                                    //         : "0 0 4px rgba(107, 190, 252, 0.8)",

                                                    border:
                                                      slideIn
                                                        ? ""
                                                        : gameFinished
                                                          ?
                                                          (!handOneWin && playerCardsScore < dealerCardsScore || playerCardsScore > 21)
                                                            ? '2px solid #333333' //   black border
                                                            : playerCardsScore === dealerCardsScore
                                                              ? "2px solid #F4C50A" // 🟡 yellow border
                                                              :
                                                              winner2 && handOneWin
                                                                ? '2px solid #3BB974BF' // 🟢 green border
                                                                : selectedHand === 1
                                                                  ? "2px solid rgba(107, 190, 252, 0.8)" // 🔵 Active hand
                                                                  : "none"
                                                          : selectedHand === 1
                                                            ? "2px solid rgba(107, 190, 252, 0.8)"
                                                            : "none",

                                                    borderRadius: "4px"
                                                  }}

                                                  alt="card front"
                                                  className="h-full w-full rounded-sm shadow-lg object-cover"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}


                                    </div>
                                  </div>
                                </div>
                                {/* {selectedHand === 1 && (!winner1 && !winner2) && !gameFinished && (<div className="h-[2px] w-[40px] -mt-[10px]  lg:-mt-[20px] bg-[rgba(107,190,252,0.8)] shadow-[0_0_8px_rgba(107,190,252,0.8)]">
                                </div>)} */}
                              </div>

                            </div>
                          )}
                        </div> {/* End of Blackjack Table */}
                      </div> {/* End of lg:flex-row container */}
                    </div> {/* End of bg-[#0C1110] wrapper */}
                  </div>

                  <Footer setisFavorite={setisFavorite} isFavorite={isFavorite} stats={stats} setStats={setStats} gameData={gameData} gameHotKeys={HOtKeys} showInBigScreen={showInBigScreen} setshowInBigScreen={setshowInBigScreen} setplayFast={setplayFast} playFast={playFast} setShowAnimation={setShowAnimation} ShowAnimation={ShowAnimation} ShowMAxBetBTN={ShowMAxBetBTN} setShowMAxBetBTN={setShowMAxBetBTN} setHotkeysEnabled={setHotkeysEnabled} hotkeysEnabled={hotkeysEnabled} endGameData={endGameData} socket={socket} isAnyModalOpen={isAnyModalOpen} setIsAnyModalOpen={setIsAnyModalOpen} />
                  {/* <Description gameData={gameData} setisFavorite={setisFavorite} isFavorite={isFavorite} /> */}
                  {/* <BetDashboard /> */}
                  {/* <div className="mt-[10px]">
                    <LatestBetTable />
                  </div> */}
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
                <main key={displayCurrency} className="flex h-full w-full flex-col select-none  gap-5 md:min-h-[80vh]">


                  {/* Main layout */}
                  <div className="flex flex-col md:flex-row items-center h-full min-w-full min-h-[400px]">
                    {/* Sidebar */}
                    <div
                      className="gamification_widget h-auto md:h-full max-h-[600px] md:max-h-none absolute right-[16px] left-[16px] md:static gamanzaSidebar z-[2]"
                      data-type="sidebar"
                      id="sidebar"
                    ></div>

                    {/* Game content */}
                    {false ? (<div className="flex flex-col items-center w-full h-full  min-h-[300px] md:min-h-[400px] pt-4 md:px-4 px-2 ">
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
                                .trim()})`
                            }}
                          ></div>

                          {content}
                        </div>

                        {/* Game footer */}
                        <div className="w-full rounded-b-2xl flex flex-col p-4 md:p-8" style={{ backgroundColor: '#005950' }}>
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
                    Bet Dashboard
                    {/* <BetDashboard playerId={user?._id} socket={socket} Slug={Slug} gameName={gameData?.name} compactBetsSectionOnly /> */}
                  </div>
                </main> </>)

          )

      }



      <style>
        {`

        .card-flip-back {
  transform-style: preserve-3d;
  transition: transform 0.3s ease-in-out;
}

.card-flip-front {
  transform-style: preserve-3d;
  transition: transform 0.3s ease-in-out;
  transform: rotateY(180deg);
}
          
          @keyframes cardFlip {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(180deg); }
          }
          
          .animate-shake {
            animation: shake 0.5s ease-in-out infinite;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0) translateY(-50%); }
            25% { transform: translateX(-2px) translateY(-50%); }
            75% { transform: translateX(2px) translateY(-50%); }
          }
        `}
      </style>

    </>
  );
};
