// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/DiceGame.jsx. Original types/imports preserved; adapted for rlk-frontend.
import React, { useState, useEffect, useRef, useMemo,useLayoutEffect } from 'react';
import { getOriginalsGame, getPlayerBalanceApi } from "@/services/originals";
import { Button, IconButton } from "@mui/material";
const BlackjackImg = "/assets/img/dicesIcon.png";
const FairplayImg = "/assets/img/Fairplay.png";
const per_icon = "/assets/icons/per.png";
const Ex_icon = "/assets/icons/ex.png";
const Refresh_icon = "/assets/icons/refresh.png";
const Slider_Icon = "/assets/icons/slider_icon.png";
const dollerSighn = "/assets/img/$.png";
const chipsign = "/assets/img/chipsign.png";
const dimondsign = "/assets/img/walletDimondIcon.png";
import FairnessModal from "./partials/FairnessModal";
const curruentProfNextPro = "/assets/img/curruentProfNextPro.png";
// import Happy from "@/public/assets/common/happy01.gif";
// import Waiting from "@/public/assets/common/waiting01.gif";
// import Sad from "@/public/assets/common/sad.gif";
const Hexgon = "/assets/icons/hexgon.png";
const Hexgonred = "/assets/icons/hexgon-red.png";
const Hexgonnormal = "/assets/icons/hexgon-normal.png";
// Footer file is named `footer.jsx` — use matching case to avoid module resolution failures on case-sensitive filesystems
import Footer from "./partials/Footer";

import Description from "./partials/Description";
import LatestBetTable from "./partials/LatestBetTable";
const watermarkImg = "/assets/img/centerLogo.png";
import BetDashboard from "./partials/BetDashboard";
// import useUser from '@/shared/query/user.query';
// import { useApiClient } from '@/shared/apiClient'
import { initSocket } from "@/lib/originalsSocket";
// import { useTranslations } from "next-intl"
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import toast from "react-hot-toast";
// import LoaderContent from '@/src/loader.mdx'
import { buttonClickSoundFn, diceSliderSound, diceWinSound, preloadSoundsDice, playDiceHexSlideLoop, stopDiceHexSlideLoop } from "@/lib/originalsSound";
const SplitImg = "/assets/img/split.png";
// import state from '../../../../../../proxy/proxy'
import { Tooltip } from 'react-tooltip';
import { useAuth } from '@/lib/originalsAuthBridge';
// `useParams` from react-router-dom is unused in this port — rlk-frontend
// uses Next.js. Removed to drop the hard dep on react-router.
// import { useParams } from 'react-router-dom';
// import { useCurrency } from "../../../../../contexts/CurrencyContext";


const HOtKeys = [
  {
    name: "Make a bet",
    value: 'space'
  },
  {
    name: "Stop auto bet",
    value: 'o'
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
    name: "Toggle condition to win ",
    value: 'q'
  },
  {
    name: "Lower the target",
    value: 'w'
  },
  {
    name: "Higher the target",
    value: 'e'
  },
]
let cardImageCache = {};
let cardImageMap = {};
let LasthexagonPos = '';
const DiceGame = () => {
  // const apiClient = useApiClient()
  // const {
  //     isOpen
  // } = useProfileDrawer()
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
  const { user, playCurrency } = useAuth();
  console.log('user info', playCurrency)

  let socket = initSocket(user?._id);
  // console.log('user info', user)
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [gameState, setGameState] = useState('idle'); // 'idle', 'betting', 'completed'
  const [betData, setBetData] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loadingGame, setLoadingGame] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [gameWinChanges, setGameWinChanges] = useState([]);

  const [Slug, setSlug] = useState(null);
  const [gameLoadError, setgameLoadError] = useState(false);
  const [gameValues, setGameValues] = useState({
    sliderValue: 50,
    multiplier: 2.0,
    rollOver: 50.00,
    winChance: 50.0000
  });
  const [newSliderValueSound, setNewSliderValueSound] = useState(0);
  // Editable live inputs for multiplier and win chance
  const [multiplierInput, setMultiplierInput] = useState(gameValues.multiplier.toFixed(4));
  const [winChanceInput, setWinChanceInput] = useState(gameValues.winChance.toFixed(4));
  const isUserTyping = useRef(false);

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

  const [mode, setMode] = useState("manual");
  const [betAmount, setBetAmount] = useState("0.00");
  const [profitOnWin, setProfitOnWin] = useState("0.00");
  const [onWinIncrease, setOnWinIncrease] = useState(0);
  const [onLossIncrease, setOnLossIncrease] = useState(0);
  const [numberOfBets, setNumberOfBets] = useState('Infinite');
  const [stopOnProfit, setStopOnProfit] = useState("0.00");
  const [stopOnLoss, setStopOnLoss] = useState("0.00");
  const [totalProfit, setTotalProfit] = useState(0);
  const [lastGameProfit, setLastGameProfit] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [isRollUnder, setIsRollUnder] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hexagonResult, setHexagonResult] = useState(null);
  const [hexagonPos, setHexagonPos] = useState(gameValues.sliderValue);
  const [showHexagon, setShowHexagon] = useState(false);
  const prevHexagonPosRef = useRef(hexagonPos);
  const [isFavorite, setisFavorite] = useState(user?.favorites?.some(id => String(id) == String(gameData?.slug)));
  // const [LasthexagonPos, setLastHexagonPos] = useState('');
  const [BetLoading, setBetLoading] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const [CashOutLoading, setCashOutLoading] = useState(null);
  const [IsBtnClick, setIsBtnClick] = useState(false);
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [betHistory, setBetHistory] = useState([]);
  const sliderTrackRef = useRef(null);
  const animationRef = useRef(null);
  const autoBetTimeoutRef = useRef(null);
  const isAutoBettingRef = useRef(false); // ✅ live tracker for autobet state
  const DEFAULT_STATS = {
    profit: 0,
    betAmount: 0,
    wins: 0,
    losses: 0
  };
  const [endGameData, setEndGameData] = useState({});

  const [stats, setStats] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_STATS;

    const saved = localStorage.getItem("gameStats");
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });
  const isDragging = useRef(false);
  const hexagonRef = useRef(null);
  // const searchParams = useSearchParams();
  const [MAX_BET, setMAX_BET] = useState(5000);
  let debounceTimeout = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [ShowAnimation, setShowAnimation] = useState(true);
  const [playFast, setplayFast] = useState(false);
  const [ShowMAxBetBTN, setShowMAxBetBTN] = useState(true);
  const [hotkeysEnabled, setHotkeysEnabled] = useState(false);
  const [multiplierError, setMultiplierError] = useState("");
  const [winChanceError, setWinChanceError] = useState("");
  const [gameMaxBet, setGameMaxBet] = useState(5000);
  const [showFairness, setShowFairness] = useState(false);

  // ✅ keep ref synced with state
  useEffect(() => {
    isAutoBettingRef.current = isAutoBetting;
  }, [isAutoBetting]);

  // Update profit on win when bet amount or multiplier changes
  useEffect(() => {
    const amount = parseFloat(betAmount) || 0;
    const profit = amount * (gameValues.multiplier - 1);
    setProfitOnWin(profit.toFixed(4));
  }, [betAmount, gameValues.multiplier]);

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
  // Force-start left transition when hexagonPos changes (no per-step sound here)
  useEffect(() => {
    const el = hexagonRef.current;
    const prev = prevHexagonPosRef.current;

    // if nothing changed, do nothing
    if (prev === hexagonPos) return;

    if (el) {
      try {
        // Immediately set element to previous position without transition
        el.style.transition = 'none';
        el.style.left = `${prev}%`;

        // Force reflow so the browser registers the immediate state
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;

        if (ShowAnimation) {
          // Full animated behaviour (tilt + soft pop)
          el.style.transition =
            'left 600ms cubic-bezier(0.23, 1, 0.32, 1), transform 600ms cubic-bezier(0.23,1,0.32,1), opacity 400ms ease';
          el.style.transform = 'translateY(-50%) translateX(-50%) scale(1.2) rotate(15deg)';
          requestAnimationFrame(() => {
            el.style.left = `${hexagonPos}%`;
            el.style.transform = 'translateY(-50%) translateX(-50%) scale(1) rotate(0deg)';
          });
          requestAnimationFrame(() => {
            el.style.left = `${hexagonPos}%`;
          });
        } else {
          if (playFast) {
            // Simple slide (no rotation) used when animations are disabled
            el.style.transition = 'left 300ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease';
            el.style.transform = 'translateY(-50%) translateX(-50%) scale(1) rotate(0deg)';
            requestAnimationFrame(() => {
              el.style.left = `${hexagonPos}%`;
            });
          } else {
            // Simple slide (no rotation) used when animations are disabled
            el.style.transition = 'left 600ms cubic-bezier(.2,.8,.2,1), opacity 400ms ease';
            el.style.transform = 'translateY(-50%) translateX(-50%) scale(1) rotate(0deg)';
            requestAnimationFrame(() => {
              el.style.left = `${hexagonPos}%`;
            });
          }
        }
      } catch (e) {
        // ignore DOM errors
      }
    }

    // update previous position
    prevHexagonPosRef.current = hexagonPos;
  }, [hexagonPos, ShowAnimation]);

  // Stop loop if we leave betting state (e.g., animation finished or user canceled)
  useEffect(() => {
    if (gameState !== 'betting') {
      try { stopDiceHexSlideLoop(); } catch (e) { }
    }
  }, [gameState]);

  // Cleanup on unmount: ensure no loop remains
  useEffect(() => {
    return () => {
      try { stopDiceHexSlideLoop(); } catch (e) { }
    };
  }, []);

  useEffect(() => {
    if (isUserTyping.current) return;
    setMultiplierInput(gameValues.multiplier.toFixed(4));
  }, [gameValues.multiplier]);

  useEffect(() => {
    if (isUserTyping.current) return;
    setWinChanceInput(gameValues.winChance.toFixed(4));
  }, [gameValues.winChance]);

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
  }, [betAmount, MAX_BET, gameMaxBet]);
  // const handleMaxBetButtonClick = () => {
  //     const numericMax = Number(MAX_BET);
  //     if (!Number.isFinite(numericMax) || numericMax <= 0) {
  //         setErrorMsg("Insufficient balance");
  //         return;
  //     }
  //     // clear any previous error when there's a valid max
  //     setErrorMsg("");
  // }

  /**
 * Compute winChance and payout multiplier for a dice game
 * 
 * @param {number} threshold - the number shown in UI (e.g. 2, 20, 50.50, 98)
 * @param {'over'|'under'} mode - 'over' or 'under'
 * @param {number} houseEdgePercent - e.g. 1 for 1%
 * @returns {object} { winChance, multiplier, rollOver, rollUnder, clampedThreshold }
 */
  function computeDice(threshold, mode = 'under', houseEdgePercent = 1) {
    // Clamp threshold between 2 and 98
    const clampedThreshold = Math.max(0.01, Math.min(99.99, threshold));

    let winChance, rollOver, rollUnder;

    if (mode === 'over') {
      winChance = 100 - clampedThreshold;
      rollOver = clampedThreshold;
      rollUnder = 100 - clampedThreshold;
    } else {
      winChance = clampedThreshold;
      rollUnder = clampedThreshold;
      rollOver = 100 - clampedThreshold;
    }

    // multiplier = (100 - houseEdge) / winChance
    const numerator = 100 - houseEdgePercent;
    const multiplier = winChance > 0 ? numerator / winChance : 0;

    return { winChance, multiplier, rollOver, rollUnder, clampedThreshold };
  }

  // ---- Updated Handlers ----
  const handleSliderChange = (sliderValue) => {
    if (isAutoBetting) return;
    setShowHexagon(false); // ✅ hide immediately when slider moves
    // 🟢 Round slider to nearest integer step
    const roundedValue = Math.round(sliderValue);

    // ✅ Clamp to safe limits (same as RainBet)
    const clampedThreshold = Math.max(2, Math.min(98, roundedValue));

    // Calculate win chance & multiplier
    const { winChance, multiplier, rollOver, rollUnder } =
      computeDice(clampedThreshold, isRollUnder ? 'under' : 'over', 1);

    // Play slider sound except edge
    if (clampedThreshold > 2 && clampedThreshold < 98) {
      setNewSliderValueSound(clampedThreshold);
      // diceSliderSound();
    }

    // Update values in state
    setGameValues({
      sliderValue: clampedThreshold,
      multiplier: parseFloat(multiplier.toFixed(4)),
      rollOver: isRollUnder
        ? parseFloat(rollUnder.toFixed(2))
        : parseFloat(rollOver.toFixed(2)),
      winChance: parseFloat(winChance.toFixed(4))
    });

    // Debounce socket update (RainBet-style optimization)
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      updateDiceValues('threshold', clampedThreshold);
    }, 300);
  };

  useEffect(() => {
    if (newSliderValueSound !== 0) {
      diceSliderSound()
    }
  }, [newSliderValueSound])

  const handleMultiplierInput = (value) => {
    setMultiplierInput(value);
    isUserTyping.current = true;

    const num = parseFloat(value);

    if (isNaN(num)) {
      setMultiplierError("Enter a number");
      return;
    }

    // live validation
    if (num < 1.0102) {
      setMultiplierError("Minimum is 1.0102x");
      return;
    }
    if (num > 9900) {
      setMultiplierError("Maximum is 9900x");
      return;
    }

    // valid → clear tooltip
    setMultiplierError("");

    // update win chance + slider
    const winChance = (100 - 1) / num;
    const sliderValue = 100 - winChance;

    setWinChanceInput(winChance.toFixed(4));

    setGameValues({
      sliderValue,
      multiplier: num,
      rollOver: sliderValue,
      winChance
    });

    updateDiceValues("winChance", winChance);
  };
  const handleMultiplierBlur = () => {
    isUserTyping.current = false;

    let num = parseFloat(multiplierInput);

    if (isNaN(num)) {
      setMultiplierInput("1.0102");
      setMultiplierError("");
      return;
    }

    if (num < 1.0102) num = 1.0102;
    if (num > 9900) num = 9900;

    setMultiplierInput(num.toFixed(4));
    setMultiplierError("");

    // recompute values
    const winChance = (100 - 1) / num;
    const sliderValue = 100 - winChance;

    setWinChanceInput(winChance.toFixed(4));

    setGameValues({
      sliderValue,
      multiplier: num,
      rollOver: sliderValue,
      winChance
    });

    updateDiceValues("winChance", winChance);
  };

  const handleWinChanceInput = (value) => {
    setWinChanceInput(value);
    isUserTyping.current = true;

    const num = parseFloat(value);

    if (isNaN(num)) {
      setWinChanceError("Enter a number");
      return;
    }

    if (num < 0.01) {
      setWinChanceError("Minimum is 0.01%");
      return;
    }
    if (num > 98.0) {
      setWinChanceError("Maximum is 98%");
      return;
    }

    setWinChanceError("");

    const numerator = 100 - 1;
    const multiplier = numerator / num;

    const sliderValue = 100 - num;

    setMultiplierInput(multiplier.toFixed(4));

    setGameValues({
      sliderValue,
      multiplier,
      rollOver: sliderValue,
      winChance: num
    });

    updateDiceValues("winChance", num);
  };
  const handleWinChanceBlur = () => {
    isUserTyping.current = false;

    let num = parseFloat(winChanceInput);

    if (isNaN(num)) {
      setWinChanceInput("0.01");
      setWinChanceError("");
      return;
    }

    if (num < 0.01) num = 0.01;
    if (num > 98.0) num = 98.0;

    setWinChanceInput(num.toFixed(4));
    setWinChanceError("");

    const multiplier = (100 - 1) / num;
    const sliderValue = 100 - num;

    setMultiplierInput(multiplier.toFixed(4));

    setGameValues({
      sliderValue,
      multiplier,
      rollOver: sliderValue,
      winChance: num
    });

    updateDiceValues("winChance", num);
  };

  const handleRollOverChange = (value) => {
    const val = parseFloat(value);
    if (isNaN(val)) return;

    // Prevent too small / too large
    if (val < 0.01) {
      toast.error("Minimum value is 0.01");
      return;
    }
    if (val > 98.99) {
      toast.error("Maximum value is 98.99");
      return;
    }

    const { winChance, multiplier, clampedThreshold, rollOver, rollUnder } =
      computeDice(val, isRollUnder ? 'under' : 'over', 1);

    setGameValues({
      sliderValue: clampedThreshold,
      multiplier: parseFloat(multiplier.toFixed(3)),
      rollOver: isRollUnder
        ? parseFloat(rollUnder.toFixed(2))
        : parseFloat(rollOver.toFixed(2)),
      winChance: parseFloat(winChance.toFixed(4))
    });
  };




  // Handle bet placement
  const handleBetPlaced = () => {
    if (gameValues.winChance < 0.01) return;
    if (gameValues.winChance > 99.99) return;
    if (gameValues.multiplier < 1) return;
    if (gameValues.multiplier > 9900.00) return;
    setIsBtnClick(true);
    buttonClickSoundFn()
    setBetLoading(true);
    const betInfo = {
      amount: betAmount,
      multiplier: gameValues.multiplier,
      rollOver: gameValues.rollOver,
      winChance: gameValues.winChance
    };

    setGameState('idle');
    setBetData(betInfo);


    if (!socket) return;
    socket.emit("DICE_PLACE_BET", {betAmount: betAmount
    });
  };
  const handleBetPlacedAuto = () => {
    if (gameValues.winChance < 0.01) return;
    if (gameValues.winChance > 99.99) return;
    if (gameValues.multiplier < 1) return;
    if (gameValues.multiplier > 9900.00) return;
    setIsBtnClick(true);
    setBetLoading(true);
    buttonClickSoundFn();

    const betInfo = {
      amount: betAmount,
      multiplier: gameValues.multiplier,
      rollOver: gameValues.rollOver,
      winChance: gameValues.winChance
    };

    setGameState('idle');
    setBetData(betInfo);

    if (!socket) return;

    const payload = {betAmount: Number(betAmount) || 0,
      numberOfBets: numberOfBets == "Infinite" ? 0 : Number(numberOfBets) || 0,
      onWinIncrease: Number(onWinIncrease) || 0,
      onLoseIncrease: Number(onLossIncrease) || 0,
      stopOnProfit: Number(stopOnProfit) || 0,
      stopOnLose: Number(stopOnLoss) || 0
    };

    if (isAutoBetting) {
      setIsBtnClick(false);

      // 🧠 Cancel next round if already scheduled
      if (autoBetTimeoutRef.current) {
        clearTimeout(autoBetTimeoutRef.current);
        autoBetTimeoutRef.current = null;
      }

      try { stopDiceHexSlideLoop(); } catch (e) { }

      setIsAutoBetting(false);
      isAutoBettingRef.current = false; // ✅ make sure ref also false
      socket.emit("DICE_CANCEL_AUTO_BET");
      // toast.success("Auto Betting Stopped");
      return;
    } else {
      console.log('DICE_AUTO_BET payload', payload);
      socket.emit("DICE_AUTO_BET", payload);
      // toast.success("Auto Betting Started");
      setIsAutoBetting(true);
      isAutoBettingRef.current = true; // ✅ mark autobet active
    }
  };


  // Handle game completion
  const handleGameComplete = (result, duration) => {
    console.log('Game complete data', result, 'with animation duration', duration);
    setGameState('completed');

    setTimeout(() => {
      // ✅ Update history AFTER animation completes
      if (result?.historyData && Array.isArray(result.historyData)) {
        // setBetHistory(prev => {
        //   const updated = result.historyData.map(h => ({
        //     ...h,
        //     number: Number(h?.number || 0).toFixed(2),
        //   }));
        //   return updated;
        // });

        setBetHistory(prev => {
          const newItems = result.historyData.map(h => ({
            ...h,
            number: Number(h?.number || 0).toFixed(2)
          }));

          return [...prev, ...newItems]; // :white_check_mark: add on top
        });

        // ✅ Sync hexagon value with latest history entry
        const latest = result.historyData[result.historyData.length - 1];
        if (latest?.number) {
          const fixedValue = parseFloat(Number(latest.number).toFixed(2));
          setHexagonPos(fixedValue);
          LasthexagonPos = fixedValue;
        }
      }

      setGameState('idle');
      setIsBtnClick(false);
      setBetLoading(false);
    }, duration + 100);
  };



  // Smooth slider functionality
  const getValueFromMouseX = (clientX) => {
    if (!sliderTrackRef.current) return 0;

    const rect = sliderTrackRef.current.getBoundingClientRect();
    let value = ((clientX - rect.left) / rect.width) * 100;
    value = Math.max(2, Math.min(98, value));

    console.log('value', value);
    return value;
  };


  const handleMouseDown = (e) => {
    if (isAutoBetting) return;
    if (gameState !== 'idle') return;

    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    const value = getValueFromMouseX(e.clientX);
    handleSliderChange(value);
  };

  const handleTouchStart = (e) => {
    if (isAutoBetting) return;
    if (gameState !== 'idle') return;

    isDragging.current = true;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    const value = getValueFromMouseX(e.touches[0].clientX);
    handleSliderChange(value);
  };

  const handleMouseMove = (e) => {
    if (isAutoBetting) return;
    if (!isDragging.current) return;
    const value = getValueFromMouseX(e.clientX);
    handleSliderChange(value);
  };

  const handleTouchMove = (e) => {
    if (isAutoBetting) return;
    if (!isDragging.current) return;
    const value = getValueFromMouseX(e.touches[0].clientX);
    handleSliderChange(value);
  };

  const handleMouseUp = () => {
    if (isAutoBetting) return;
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    if (isAutoBetting) return;
    isDragging.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  // Animation for the game
  const startAnimation = (target, result, historyData = []) => {
    if (isAnimating) return;

    console.log('🎬 Animation start');

    setShowHexagon(true);
    setHexagonResult(null);
    setGameState('betting');

    // 🔹 STEP 1: LOOP SOUND START (background compatible)
    try {
      playDiceHexSlideLoop();
    } catch (error) {
      console.error('Loop start error:', error);
    }

    // ❌ No animation mode
    if (!ShowAnimation) {
      const parsed = parseFloat(Number(target).toFixed(2));
      setHexagonResult(null);
      setIsAnimating(true);
      setHexagonPos(parsed);

      const slideDuration = playFast ? 125 : 250;

      setTimeout(() => {
        LasthexagonPos = parsed;
        setHexagonResult(result ? "win" : "loss");
        updateStats({ multiplier: gameValues?.multiplier, isWin: result ? true : false });
        setIsAnimating(false);

        if (hexagonRef.current) {
          hexagonRef.current.style.transform = "translateY(-50%) translateX(-50%) rotate(0deg) scale(1)";
        }

        try { stopDiceHexSlideLoop(); } catch (e) { }
        if (result) diceWinSound();

        handleGameComplete(
          {
            hexagonPosition: parsed,
            userPosition: gameValues.sliderValue,
            result: result ? "win" : "loss",
            historyData
          },
          slideDuration
        );
      }, slideDuration);

      return;
    }

    // ✅ Animation enabled (normal or fast)
    setIsAnimating(true);
    let difference = LasthexagonPos ? Math.abs(LasthexagonPos - target) : target;
    let duration = 0;

    if (difference <= 20) duration = 250;
    else if (difference <= 40) duration = 350;
    else if (difference <= 60) duration = 450;
    else if (difference <= 80) duration = 550;
    else if (difference <= 100) duration = 650;
    else duration = 650;

    // Fast mode
    if (playFast) {
      if (difference <= 20) duration = 75;
      else if (difference <= 40) duration = 125;
      else if (difference <= 60) duration = 175;
      else if (difference <= 80) duration = 225;
      else if (difference <= 100) duration = 275;
      else duration = 325;
    }

    const startTime = Date.now();
    const start = (LasthexagonPos !== '' && LasthexagonPos !== undefined && LasthexagonPos !== null)
      ? Number(LasthexagonPos)
      : Number(hexagonPos || 0);

    // 🔹 Smart animation chooser: requestAnimationFrame for foreground, setTimeout for background
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease curve (easeInOutCubic)
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentPos = start + (target - start) * ease;
      setHexagonPos(currentPos);

      const distance = target - start;
      const direction = distance >= 0 ? 1 : -1;

      // Calculate rotation only at start and end
      let rotation = 0;
      const maxTilt = 45;

      if (progress < 0.25) {
        rotation = direction * maxTilt * (progress / 0.25);
      } else if (progress < 0.75) {
        rotation = direction * maxTilt * (1 - (progress - 0.25) / 0.5) * 0.2;
      } else {
        rotation = -direction * maxTilt * ((progress - 0.75) / 0.25);
      }

      // Gentle scale pop (breathing)
      const scale = 1 + 0.08 * Math.sin(progress * Math.PI);

      if (hexagonRef.current) {
        hexagonRef.current.style.transform = `
                translateY(-50%) translateX(-50%)
                rotate(${rotation}deg)
                scale(${scale})
            `;
      }

      if (progress < 1) {
        // 🔹 SMART CHOICE: Use requestAnimationFrame if page is visible, else setTimeout
        if (!document.hidden) {
          // Foreground: use requestAnimationFrame for smooth animation
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Background: use setTimeout (requestAnimationFrame pauses in background)
          animationRef.current = setTimeout(animate, 16); // ~60fps
        }
      } else {
        // 🔹 ANIMATION COMPLETE
        const parsed = parseFloat(Number(target).toFixed(2));
        setHexagonPos(parsed);
        LasthexagonPos = parsed;

        setHexagonResult(result ? "win" : "loss");
        updateStats({ multiplier: gameValues?.multiplier, isWin: result ? true : false });
        setIsAnimating(false);

        if (hexagonRef.current) {
          hexagonRef.current.style.transform =
            "translateY(-50%) translateX(-50%) rotate(0deg) scale(1)";
        }

        try { stopDiceHexSlideLoop(); } catch (e) { }
        if (result) diceWinSound();

        handleGameComplete(
          {
            hexagonPosition: parsed,
            userPosition: gameValues.sliderValue,
            result: result ? "win" : "loss",
            historyData
          },
          duration
        );
      }
    };

    // Start animation with right method based on visibility
    if (!document.hidden) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      animationRef.current = setTimeout(animate, 0);
    }
  };


  // DiceGame component additions
  let audioCtx;
  useEffect(() => {
    // Page visibility change handle karo
    const handleVisibilityChange = () => {
      // Jab tab visible ho, audio context resume karo
      if (!document.hidden && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup on unmount
      try {
        stopDiceHexSlideLoop();
      } catch (e) {
        console.debug('Component cleanup error:', e);
      }

      if (animationRef.current) {
        if (typeof animationRef.current === 'number') {
          // It's a setTimeout ID
          clearTimeout(animationRef.current);
        } else {
          // It's a requestAnimationFrame ID
          cancelAnimationFrame(animationRef.current);
        }
        animationRef.current = null;
      }

      if (autoBetTimeoutRef.current) {
        clearTimeout(autoBetTimeoutRef.current);
        autoBetTimeoutRef.current = null;
      }
    };
  }, []);

  // Also update the animationRef initialization
  // const animationRef = useRef(null);
  // Add this helper function
  const cancelAnimation = () => {
    if (animationRef.current) {
      if (typeof animationRef.current === 'number') {
        // It's a setTimeout ID
        clearTimeout(animationRef.current);
      } else {
        // It's a requestAnimationFrame ID
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
    }
  };

  // Game state change pe animation stop karo
  useEffect(() => {
    if (gameState !== 'betting') {
      cancelAnimation();
      setIsAnimating(false);

      // Also stop sound loop
      try {
        stopDiceHexSlideLoop();
      } catch (e) {
        console.debug('Game state loop stop:', e);
      }
    }
  }, [gameState]);


 const historyRef = useRef(null);

    useEffect(() => {
        if (historyRef.current) {
            // Always scroll to the rightmost (latest) item
            historyRef.current.scrollLeft = historyRef.current.scrollWidth;
        }
    }, [betHistory]);
  useEffect(() => {
    // if (gameState === "betting") startAnimation();
    if (gameState === "idle") {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
      setHexagonResult(null);
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState]);

  const getTrackBackground = () =>
    isRollUnder
      ? `linear-gradient(to right, #00d084 0%, #00d084 ${gameValues.sliderValue}%, #E33827 ${gameValues.sliderValue}%, #E33827 100%)`
      : `linear-gradient(to right, #E33827 0%, #E33827 ${gameValues.sliderValue}%, #00d084 ${gameValues.sliderValue}%, #00d084 100%)`;

  const colorClass =
    hexagonResult === "win"
      ? "text-[#00d084]"
      : hexagonResult === "loss"
        ? "text-[#e33827]"
        : "text-white";
  const slug = window.location.pathname.split("/").pop();
  console.log('slug', slug)
  useEffect(() => {
    if (slug) {
      console.log("Slug:", slug); // 👉 "dice"
      setSlug(slug);
      getGameInfo(slug);
    }
  }, [slug]);
  // useEffect(() => {
  //   console.log('called useEffect searchParams', searchParams)
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

  //   console.log("Received game data:", gameData);
  // }, [searchParams])
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
      //     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/mtoriginals/event`, {
      //         method: "POST",
      //         headers: {
      //             "Content-Type": "application/json"
      //         },
      //         body: JSON.stringify({
      //             action: "balance",
      //             player_id: playerId,
      //             currency: currency
      //         })
      //     });

      //     if (!res.ok) {
      //         throw new Error("Failed to fetch: " + res.status);
      //     }

      //     const data = await res.json();
      //     console.log("Response:", data);
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
    preloadSoundsDice();
    getPlayerBalance(user?._id, "EUR");
    const chipImages = [
      SplitImg, Slider_Icon, Hexgon, chipsign, Hexgonnormal, Hexgonred, dimondsign
    ];

    chipImages.forEach((src, idx) => {
      const img = new Image();
      img.src = typeof src === "string" ? src : (src).src;
      if (idx === 0) {
        cardImageMap[`${idx === 0 ? 'animation' : 'bomb'}`] = typeof src === "string" ? src : src.src;
        // Next.js img import gives {src, height, width}
        cardImageCache[`${idx === 0 ? 'animation' : 'bomb'}`] = img;
      } else if (idx === 1) {
        cardImageMap['slider'] = typeof src === "string" ? src : src.src;
        cardImageCache['slider'] = img;
      } else if (idx === 2) {
        cardImageMap['hexagon'] = typeof src === "string" ? src : src.src;
        cardImageCache['hexagon'] = img;
      } else if (idx === 3) {
        cardImageMap['chip-13'] = typeof src === "string" ? src : src.src;
        cardImageCache['chip-13'] = img;

      } else if (idx == 4) {
        cardImageMap['Hexgonnormal'] = typeof src === "string" ? src : src.src;
        cardImageCache['Hexgonnormal-'] = img;
      } else if (idx == 5) {
        cardImageMap['Hexgonred'] = typeof src === "string" ? src : src.src;
        cardImageCache['Hexgonred-'] = img;
      } else if (idx == 6) {
        cardImageMap['dimondsign'] = typeof src === "string" ? src : src.src;
        cardImageCache['dimondsign'] = img;
      } else if (idx == 7) {
        cardImageMap['Waiting'] = typeof src === "string" ? src : src.src;
        cardImageCache['Waiting-'] = img;
      } else if (idx == 8) {
        cardImageMap['Sad'] = typeof src === "string" ? src : src.src;
        cardImageCache['Sad-'] = img;
      }
    });
  }, [user?._id]);

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
  //       {!user?._id && (
  //         <div className="absolute top-0 left-0 h-full w-full bg-[#000000E6]"></div>
  //       )}
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
  // }, [user?._id, game?.restricted]);
  useEffect(() => {
    console.log('socket useeffect', socket);
    if (!socket?.id) return;

    console.log("Registering socket emit callbacks on DICE_INIT");
    // rtp intentionally omitted: server pulls it from the admin panel.
    socket.emit('DICE_INIT', {});
  }, [user?._id, socket?.id]);
  // useEffect(() => {
  //   if (!socket) return;

  //   socket.on("connect", () => {
  //     console.log("✅ connected:", socket.id);

  //     socket.emit("DICE_INIT", {
  ////     });
  //   });

  //   return () => {
  //     socket.off("connect");
  //   };
  // }, [socket, user?._id]);
  useEffect(() => {
    if (!socket) return;

    console.log("Registering socket callbacks");

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
        toast.error(formatErrorMsg(data?.msg))
      } else if (data?.code === 409) {
        toast.error(formatErrorMsg(data?.msg))
      }
      setIsBtnClick(false);
      setBetLoading(false);
      setIsAutoBetting(false);
    });

    // cleanup
    return () => {
      socket.off("Game_Error");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [user?._id, socket?.id]);
  const callNextBet = () => {
    if (!socket) return;
    socket.emit("DICE_PLAY_NEXT_ROUND", {});
  }
  useEffect(() => {
    if (!socket) return;

    console.log("Registering socket callbacks");

    socket.on("DICE_BET_RESULT", async (data) => {
      console.log("🎯 DICE_BET_RESULT:", data);

      const { status, number, history, isAutoPlaying, profit, balanceChange, lastGameProfit, totalProfit, totalLost } = data;
      setLastGameProfit(parseFloat(lastGameProfit || 0));
      setTotalProfit(parseFloat(totalProfit || 0));
      setTotalLoss(parseFloat(totalLost || 0));
      // 🧠 Keep autobet alive if flagged
      if (isAutoPlaying) {
        setIsAutoBetting(true);
        setBetLoading(false);
        if (data?.betAmount) {
          setBetAmount(Number(data?.betAmount).toFixed(2))
        }
      }
      let rounds = data?.remainingRounds === "∞" ? 'Infinite' : data?.remainingRounds;
      setNumberOfBets(rounds);
      // 🟩 Run animation
      startAnimation(number, status, history);

      // --- 🧩 Profit / Loss Handling ---
      const currentProfit = parseFloat(profit || 0);
      const currentLoss = currentProfit < 0 ? Math.abs(currentProfit) : 0;

      // Keep running total of profit/loss
      setStopOnProfit((prev) => prev || 0);
      setStopOnLoss((prev) => prev || 0);

      let nextBet = parseFloat(betAmount || 0);

      if (status === true && parseFloat(onWinIncrease) > 0) {
        // ✅ Win: increase bet by %
        nextBet = nextBet + (nextBet * parseFloat(onWinIncrease) / 100);
      } else if (status === false && parseFloat(onLossIncrease) > 0) {
        // ❌ Lose: increase bet by %
        nextBet = nextBet + (nextBet * parseFloat(onLossIncrease) / 100);
      }

      // Format to 2 decimals
      nextBet = Math.min(MAX_BET, parseFloat(nextBet.toFixed(2)));


      let shouldStop = false;

      if (stopOnProfit > 0 && totalProfit >= parseFloat(stopOnProfit)) {
        toast.success("Auto bet stopped: profit target reached.");
        shouldStop = true;
      } else if (stopOnLoss > 0 && totalLost >= parseFloat(stopOnLoss)) {
        toast.error("Auto bet stopped: loss limit reached.");
        shouldStop = true;
      }

      // If reached stop condition → cancel
      if (shouldStop) {
        try { stopDiceHexSlideLoop(); } catch (e) { }
        socket.emit("DICE_CANCEL_AUTO_BET");
        setIsAutoBetting(false);
        setBetLoading(false);
        setIsBtnClick(false);
        getPlayerBalance(user?._id, "EUR");
        return;
      }

      // If autobet still running → schedule next round
      if (isAutoPlaying && isAutoBettingRef.current) {
        const difference = LasthexagonPos ? Math.abs(LasthexagonPos - number) : number;
        let duration =
          difference <= 20 ? 450 :
            difference <= 40 ? 550 :
              difference <= 60 ? 650 :
                difference <= 80 ? 750 :
                  difference <= 100 ? 850 : 850;

        if (playFast) {
          console.log('fast mode active for next bet scheduling');
          duration = (duration + 100) / 2;
        } else {
          duration = duration + 100; // small buffer after animation
        }
        if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current);
        autoBetTimeoutRef.current = setTimeout(() => {
          if (isAutoBettingRef.current) {
            // setBetAmount(nextBet.toFixed(2)); // ✅ Apply new amount before next bet
            callNextBet();
          }
        }, duration);
      }

      // Stop if last round — natural end (numberOfBets consumed or server flipped flag).
      if ((Number(data?.remainingRounds) === 0 || !isAutoPlaying) && mode !== "manual") {
        toast.success("Auto bet completed.");
        setIsAutoBetting(false);
        setBetLoading(false);
        setIsBtnClick(false);
        getPlayerBalance(user?._id, "EUR");
      }
    });

    return () => {
      socket.off("DICE_BET_RESULT");
      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current);
    };
  }, [user?._id, mode, socket?.id, ShowAnimation, playFast, stopOnProfit , stopOnLoss]);


  useEffect(() => {
    if (!socket) return;

    console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("DICE_GAME_INFO", async (data) => {
      console.log("DICE_GAME_INFO:", data);

      if (data?.code === 400) {
        toast.error(data?.msg)
      } else if (data?.code === 409) {
        toast.error(data?.msg)
      }
      setGameValues(prev => ({
        ...prev,
        multiplier: data?.multiplier ?? prev.multiplier,
        rollOver: data?.threshold ?? prev.rollOver,
        sliderValue: data?.threshold ?? prev.sliderValue,
        winChance: data?.winChance ?? prev.winChance
      }));
      if (data?.mode === 'under') {
        setIsRollUnder(true);
      } else {
        setIsRollUnder(false);
      }
    });

    // cleanup
    return () => {
      socket.off("DICE_GAME_INFO");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [user?._id, socket?.id]);
  useEffect(() => {
    if (!socket) return;

    console.log("Registering socket callbacks");

    let cardReceivedTimeout = null; // store timeout id

    socket.on("DICE_CANCEL_AUTO_BET", async (data) => {
      console.log("DICE_CANCEL_AUTO_BET:", data);
      if (data?.status === true) {
        // ensure loop is stopped when server confirms cancel
        try { stopDiceHexSlideLoop(); } catch (e) { }
        setIsAutoBetting(false);
        // toast.success("Auto Betting Stopped");
        setBetLoading(false);
        setIsBtnClick(false);
        getPlayerBalance(user?._id, "EUR");
      }
    });

    // cleanup
    return () => {
      socket.off("DICE_CANCEL_AUTO_BET");
      if (cardReceivedTimeout) clearTimeout(cardReceivedTimeout);
    };
  }, [user?._id, socket?.id]);

  const updateDiceValues = (updatedField, value) => {
    if (!socket) return;
    console.log('updateDiceValues called', { updatedField, value });
    socket.emit("DICE_UPDATE", {newValue: value,
      updatedField
    });
    setIsBtnClick(false);
  }
  useEffect(() => {
    return () => {
      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hotkeysEnabled) return
    const handleKeyDown = (e) => {
      // console.log('eeee', e)
      if (e?.code === "Space") {
        e.preventDefault(); // Stop page scroll
        console.log(mode)
        if (mode == 'auto') {
          if (gameValues.winChance < 0.01 || gameValues.winChance > 99.99
            || gameValues.multiplier < 1 || gameValues.multiplier > 9900.00 || errorMsg) return;
          handleBetPlacedAuto()
        } else {
          if (IsBtnClick || gameValues.winChance < 0.01 || gameValues.winChance > 99.99
            || gameValues.multiplier < 1 || gameValues.multiplier > 9900.00 || isAutoBetting || errorMsg) return;
          handleBetPlaced()
        }
      } else if (e?.key === 's') {
        if (IsBtnClick || isAutoBetting) return;
        buttonClickSoundFn()
        setBetAmount((prev) =>
          Math.min(parseFloat(prev || "0") * 2).toFixed(2)
        )
      } else if (e?.key === 'a') {
        if (IsBtnClick || isAutoBetting) return;
        buttonClickSoundFn()
        setBetAmount((prev) => {
          let newVal = parseFloat(prev || "0") / 2;

          if (isNaN(newVal) || newVal < 0.01) newVal = 0;

          return newVal.toFixed(2);
        });
      } else if (e?.key === "d") {
        if (IsBtnClick || isAutoBetting) return;
        setBetAmount('0.00')
      } else if (e?.key === "q") {
        if (isAutoBetting) return;
        if (IsBtnClick) return;
        buttonClickSoundFn();
        const isRollUnderUpdated = !isRollUnder;
        setIsRollUnder(isRollUnderUpdated)
        const { winChance, multiplier, clampedThreshold, rollOver, rollUnder } =
          computeDice(gameValues?.sliderValue, isRollUnderUpdated ? 'under' : 'over', 1);
        if (isRollUnderUpdated) {
          setGameValues({
            sliderValue: clampedThreshold,
            multiplier: parseFloat(multiplier.toFixed(3)),
            rollOver: parseFloat(winChance.toFixed(4)),
            winChance: isRollUnderUpdated
              ? parseFloat(rollUnder.toFixed(2))
              : parseFloat(rollOver.toFixed(2))
          });
          updateDiceValues('mode', 'under');
        } else if (!isRollUnderUpdated) {
          updateDiceValues('mode', 'over');
          setGameValues({
            sliderValue: clampedThreshold,
            multiplier: parseFloat(multiplier.toFixed(3)),
            rollOver: parseFloat(rollOver.toFixed(2)),
            winChance: isRollUnderUpdated
              ? parseFloat(rollUnder.toFixed(2))
              : parseFloat(winChance.toFixed(4))
          });
        }
      } else if (e?.key === "w") {
        console.log('gameData?.sliderValue', gameValues?.sliderValue)
        handleSliderChange(gameValues?.sliderValue - 1)
      } else if (e?.key === "e") {
        handleSliderChange(gameValues?.sliderValue + 1)

      } else if (e?.key === "o") {
        if (gameValues.winChance < 0.01 || gameValues.winChance > 99.99
          || gameValues.multiplier < 1 || gameValues.multiplier > 9900.00 || errorMsg) return;
        if (isAutoBetting) {
          handleBetPlacedAuto()
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeysEnabled, user?._id, mode, isRollUnder, gameData, IsBtnClick, isAutoBetting, gameValues, errorMsg,]);


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
        losses: !data?.isWin ? prev.losses + 1 : prev.losses
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
            <main className="flex h-full w-full flex-col  gap-1 ">



              <div
                id="slot"
                className="w-full bg-[#090C1D]  p-2  lg:p-4 rounded-xl mt-1"
              >


                <div className="lg:flex lg:flex-col lg:justify-center lg:items-center md:flex md:flex-col md:justify-center md:items-center rounded-xl">
                  {/* <div className=" flex flex-row justify-between  items-center bg-gradient-to-br from-[#3c3a55] via-[#4a4967] to-[#8f8da6] rounded-t-xl w-full "> */}
                  {/* <div className="lg:w-[70%] xl:w-[65%] w-full  text-white rounded-t-xl lg:rounded-tr-none flex flex-row justify-between  items-center px-1 py-[3px] bg-gradient-to-r from-[#FFFFFF4D] to-[#FFFFFF33] ">
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
                          Dices
                        </Button>
                      </div>

                      <div>
                        <Button
                          onClick={() => setShowFairness(true)}
                          style={{
                            // background: "#31ABE8",
                            fontWeight: "500",
                            fontSize: "16px",
                            color: "white",
                            textTransform: "none"

                          }}
                        >
                          <img src={FairplayImg} alt="Blackjack" className="w-[14px] h-[18px] mr-1" />
                          Fairness
                        </Button> */}
                  {/* Fairness Modal */}
                  {/* <FairnessModal userId={user?._id} socket={socket} showFairness={showFairness} setShowFairness={setShowFairness} />
                      </div>
                    </div> */}

                  {/* </div> */}
                  <div className="bg-[#19183A]  lg:p-4 rounded-xl w-full">
                    <div className="text-white font-sans  lg:p-4 flex flex-col lg:flex-row rounded-xl lg:justify-center w-full lg:w-[100%] xl:w-[100%] bg-[#090C1D]">
                      {/* Left sidebar — tabs sit OUTSIDE the scroll area so
                          scrolled content can never pass behind them. Only
                          the panel below scrolls. */}
                      <div className="order-2 lg:order-1 rounded-xl flex flex-col xl:w-[35%] lg:w-[30%] xl:h-[420px] lg:h-[420px]">
                        {/* Tabs — recessed groove with raised / pressed segmented buttons */}
                        <div className="pl-3d-input mt-2 lg:mt-0 flex w-full gap-[2px] rounded-lg px-[4px] py-[4px] bg-[#090C1D] mb-2 flex-shrink-0">
                          {[
                            { key: "manual", label: "Manual" },
                            { key: "auto", label: "Auto" },
                          ].map((t, index) => {
                            const isActive = mode === t.key;
                            return (
                              <button
                                key={t.key}
                                onClick={() => {
                                  buttonClickSoundFn()
                                  if (isAutoBetting) return;
                                  if (IsBtnClick) return;
                                  setMode(t.key)
                                }}
                                className={`flex-1 text-center py-2 font-semibold ${index == 0 ? 'rounded-bl-lg rounded-tl-lg' : "rounded-br-lg rounded-tr-lg"} transition-all duration-150 text-sm focus:outline-none
                                ${isActive ? 'pl-3d-pressed bg-[#2c2852] text-white' : 'pl-3d-mini-btn text-gray-200 hover:bg-[#2c2852] hover:text-white bg-[#19183a]'}`}
                              >
                                {t.label}
                              </button>
                            );
                          })}
                        </div>
                        {/* <div className=' flex flex-col-reverse gap-2 lg:flex-col rounded-lg bg-[#19183A]  '> */}

                        <div className={`pl-3d-panel flex flex-col-reverse rounded-lg lg:overflow-y-auto scrollbar-hide lg:min-h-[370px] lg:flex-1 bg-gradient-to-b from-[#1f1d44] to-[#16142f] pt-1 ${checked ? "pb-3 md:pb-3 sm:pb-3" : " lg:pb-3 md:pb-3 pb-3 sm:pb-3"} gap-2 lg:flex-col px-3 sm:pt-1 sm:px-4 md:pt-1 md:px-5 `}>

                          {/* Bet Amount */}
                          <div className="mt-2 lg:block hidden">
                            <div className="flex items-center font-medium justify-between text-gray-300 text-sm px-1">
                              <span className="pl-3d-label">Bet Amount</span>
                              <span className="text-xs text-white flex ">
                                <span className='flex align-middle items-center'>

                                  {
                                    displayCurrency == 'USD'
                                      ?
                                      (
                                        <img
                                          src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                          alt="dollar"
                                          width={18}
                                          height={18}
                                          className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-100"
                                            }`}
                                        />
                                      )
                                      :
                                      null
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
                              </span>
                            </div>
                            <div className="relative mt-1">
                              <span
                                className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocused ? "opacity-100" : "opacity-50"
                                  }`}
                              >
                                {
                                  displayCurrency == 'USD'
                                    ?
                                    (
                                      <img
                                        src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                        alt="dollar"
                                        width={18}
                                        height={18}
                                        className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-50"
                                          }`}
                                      />
                                    )
                                    :
                                    (
                                      <span
                                        className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-50"}`}
                                      >
                                        {currencySymbols[displayCurrency] || displayCurrency}
                                      </span>
                                    )
                                }
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
                                disabled={IsBtnClick || isAutoBetting}
                                value={(betAmount ?? "0").toString()}
                                onFocus={(e) => {
                                  setIsFocused(true);
                                  if (["0", "0.0", "0.00", "0.000"].includes(e.target.value)) {
                                    setBetAmount(""); // clear when it's zero
                                  } else {
                                    e.target.select(); // select all if non-zero
                                  }

                                }}
                                onBlur={() => {
                                  let val = betAmount;
                                  if (!val || isNaN(parseFloat(val))) {
                                    setBetAmount("0.00");
                                    return;
                                  }
                                  setIsFocused(false)
                                }}
                                onChange={(e) => {
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
                                  // No negative allowed (we already strip '-' via regex)
                                  // Allow empty string so user can clear input
                                  setBetAmount(numeric === "" ? "" : numeric);
                                }}
                                placeholder="0.00"
                                className={`pl-3d-input w-full bg-[#090C1D] rounded-lg pl-8 pr-32 py-2 outline-none text-[#FAFAFA] focus:text-white`}
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
                                    if (isAutoBetting || IsBtnClick) return;
                                    buttonClickSoundFn();
                                    setBetAmount((prev) => {
                                      let newVal = parseFloat(prev || "0") / 2;

                                      if (isNaN(newVal) || newVal < 0.01) newVal = 0;

                                      return newVal.toFixed(2);
                                    });
                                  }}
                                  className="pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] rounded-l-md text-gray-200"
                                >
                                  1/2
                                </button>
                                <button
                                  onClick={() => {
                                    if (isAutoBetting || IsBtnClick) return;
                                    buttonClickSoundFn();
                                    setBetAmount((prev) =>
                                      Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                    )
                                  }}
                                  className={`pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] ${!ShowMAxBetBTN ? "rounded-r-md" : ""} text-gray-200`}
                                >
                                  2X
                                </button>
                                {ShowMAxBetBTN && <button
                                  onClick={() => {
                                    if (isAutoBetting || IsBtnClick) return;
                                    buttonClickSoundFn();

                                    // compute formatted value synchronously so we can show errors immediately
                                    const numericMax = Number(MAX_BET);
                                    const formatted = Number.isFinite(numericMax) ? numericMax.toFixed(2) : String(MAX_BET);
                                    setBetAmount(formatted);

                                    if (!Number.isFinite(numericMax) || numericMax <= 0) {
                                      setErrorMsg("Insufficient balance");
                                    } else {
                                      setErrorMsg("");
                                    }
                                    //  setBetAmount(MAX_BET ? MAX_BET.toFixed(2) : String(MAX_BET))
                                    //         handleMaxBetButtonClick();

                                  }
                                  }
                                  className="pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] rounded-r-md text-gray-200"
                                >
                                  Max
                                </button>}
                              </div>
                            </div>
                          </div>


                          {mode === "manual" ? (
                            <>
                              {/* Profit on Win */}
                              <div className="mt-2">
                                <div className="flex items-center font-medium justify-between text-gray-300 text-sm px-1">
                                  <span className="pl-3d-label">Profit on win</span>

                                </div>
                                <div className="relative mt-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFAFA] select-none">

                                    {
                                      displayCurrency == 'USD'
                                        ?
                                        (
                                          <img
                                            src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                            alt="dollar"
                                            width={18}
                                            height={18}
                                            className="w-[1em] h-[1em] object-contain opacity-80"
                                          />
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
                                    disabled={true}
                                    value={profitOnWin}
                                    className="pl-3d-input w-full bg-[#090C1D] rounded-lg pl-9 pr-3 py-2 text-gray-100"
                                  />
                                </div>

                              </div>
                              {/* Bet Amount */}
                              <div className="mt-2 block lg:hidden">
                                <div className="flex items-center font-medium justify-between text-gray-300 text-sm px-1">
                                  <span className="pl-3d-label">Bet Amount</span>
                                  <span className="text-xs text-white flex ">
                                    <span className='flex align-middle items-center'>

                                      {
                                        displayCurrency == 'USD'
                                          ?
                                          (
                                            <img
                                              src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                              alt="dollar"
                                              width={18}
                                              height={18}
                                              className={`w-[1em] h-[1em] object-contain opacity-80`}
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
                                    <span> {displayCurrency == 'USD' ? betAmount : ' '}</span>
                                  </span>
                                </div>
                                <div className="relative mt-1">
                                  <span
                                    className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocused ? "opacity-100" : "opacity-50"
                                      }`}
                                  >

                                    {
                                      displayCurrency == 'USD'
                                        ?
                                        (
                                          <img
                                            src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                            alt="dollar"
                                            width={18}
                                            height={18}
                                            className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-50"
                                              }`}
                                          />
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
                                    disabled={IsBtnClick || isAutoBetting}
                                    value={(betAmount ?? "0").toString()}
                                    onFocus={(e) => {
                                      setIsFocused(true);
                                      if (["0", "0.0", "0.00", "0.000"].includes(e.target.value)) {
                                        setBetAmount(""); // clear when it's zero
                                      } else {
                                        e.target.select(); // select all if non-zero
                                      }

                                    }}
                                    onBlur={() => {
                                      let val = betAmount;
                                      if (!val || isNaN(parseFloat(val))) {
                                        setBetAmount("0.00");
                                        return;
                                      }
                                      setIsFocused(false)
                                    }}
                                    onChange={(e) => {
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
                                      // No negative allowed (we already strip '-' via regex)
                                      // Allow empty string so user can clear input
                                      setBetAmount(numeric === "" ? "" : numeric);
                                    }}
                                    placeholder="0.00"
                                    className={`pl-3d-input w-full bg-[#090C1D]  ${errorMsg
                                      ? "ring-2 ring-red-500"
                                      : ""
                                      } rounded-lg pl-8 pr-32 py-2 outline-none text-[#FAFAFA]  focus:text-white`}
                                  />
                                  <Tooltip
                                    id="betError1"
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
                                        if (isAutoBetting) return;
                                        buttonClickSoundFn();
                                        setBetAmount((prev) => {
                                          let newVal = parseFloat(prev || "0") / 2;

                                          if (isNaN(newVal) || newVal < 0.01) newVal = 0;

                                          return newVal.toFixed(2);
                                        });
                                      }}
                                      className="pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] rounded-l-md text-gray-200"
                                    >
                                      1/2
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (isAutoBetting) return;
                                        buttonClickSoundFn();
                                        setBetAmount((prev) =>
                                          Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                        )
                                      }}
                                      className={`pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] ${!ShowMAxBetBTN ? "rounded-r-md" : ""} text-gray-200`}
                                    >
                                      2X
                                    </button>
                                    {ShowMAxBetBTN && <button
                                      onClick={() => {
                                        if (isAutoBetting) return;
                                        buttonClickSoundFn();
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
                                      className="pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] rounded-r-md text-gray-200"
                                    >
                                      Max
                                    </button>}
                                  </div>
                                </div>
                              </div>

                              {/* Bet Button */}
                              <button
                                disabled={IsBtnClick || gameValues.winChance < 0.01 || gameValues.winChance > 99.99
                                  || gameValues.multiplier < 1 || gameValues.multiplier > 9900.00 || isAutoBetting || errorMsg
                                }
                                onClick={handleBetPlaced}
                                className="pl-3d-place-btn w-full flex mt-2 mb-2 items-center justify-center font-semibold py-3 rounded-lg text-base tracking-wide"
                              >
                                {BetLoading ? (

                                  betAmount == 0 || betAmount == "0.00" ? "Play Demo" : "Place Bet"
                                ) : (
                                  betAmount == 0 || betAmount == "0.00" ? "Play Demo" : "Place Bet"
                                )}

                              </button>

                            </>
                          ) : (
                            <>
                              <div className={` flex  gap-1 flex-col  `}>

                                <button
                                  onClick={handleBetPlacedAuto}
                                  disabled={gameValues.winChance < 0.01 || gameValues.winChance > 99.99 || BetLoading
                                    || gameValues.multiplier < 1 || gameValues.multiplier > 9900.00 || errorMsg
                                  }
                                  className="pl-3d-place-btn w-full lg:hidden flex items-center justify-center font-semibold mt-2 lg:mb-3 sm:mb-1 mb-0 py-3 rounded-lg text-base tracking-wide"
                                >
                                  {/* Logic for button text and loading state */}
                                  {(() => {
                                    if ((betAmount == 0 || betAmount == "0.00") && !isAutoBetting) {
                                      return (
                                        <span className="flex font-medium items-center gap-2">
                                          {BetLoading ? (" Loading..."
                                          ) : (
                                            "Play Demo"
                                          )}
                                        </span>
                                      );
                                    } else if (isAutoBetting) {
                                      return (
                                        <span className="flex font-medium items-center gap-2">
                                          {BetLoading ? (" Loading..."

                                          ) : (
                                            "Stop Auto Bet"
                                          )}
                                        </span>
                                      );
                                    } else {
                                      return (
                                        <span className="flex font-medium items-center gap-2   disabled:text-gray-400 disabled:cursor-not-allowed">
                                          {BetLoading ? (" Loading..."

                                          ) : (
                                            "Start Auto Bet"
                                          )}
                                        </span>
                                      );
                                    }
                                  })()}
                                </button>

                                {/* Bet Amount */}
                                <div className="mt-2 block lg:hidden">
                                  <div className="flex items-center font-medium justify-between text-gray-300 text-sm px-1">
                                    <span className="pl-3d-label">Bet Amount</span>
                                    <span className="text-xs text-white flex ">
                                      <span className='flex align-middle items-center'>

                                        {
                                          displayCurrency == 'USD'
                                            ?
                                            (
                                              <img
                                                src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
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
                                      <span> {displayCurrency == 'USD' ? betAmount : ' '}</span>
                                    </span>
                                  </div>
                                  <div className="relative mt-1">
                                    <span
                                      className={`absolute left-3 top-1/2 -translate-y-1/2 select-none flex items-center text-[1rem] leading-none transition-opacity duration-200 ${isFocused ? "opacity-100" : "opacity-50"
                                        }`}
                                    >

                                      {
                                        displayCurrency == 'USD'
                                          ?
                                          (
                                            <img
                                              src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                              alt="dollar"
                                              width={18}
                                              height={18}
                                              className={`w-[1em] h-[1em] object-contain ${isFocused ? "opacity-100" : "opacity-50"
                                                }`}
                                            />
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
                                      disabled={IsBtnClick || isAutoBetting}
                                      value={(betAmount ?? "0").toString()}
                                      onFocus={(e) => {
                                        setIsFocused(true);
                                        if (["0", "0.0", "0.00", "0.000"].includes(e.target.value)) {
                                          setBetAmount(""); // clear when it's zero
                                        } else {
                                          e.target.select(); // select all if non-zero
                                        }

                                      }}
                                      onBlur={() => {
                                        let val = betAmount;
                                        if (!val || isNaN(parseFloat(val))) {
                                          setBetAmount("0.00");
                                          return;
                                        }
                                        setIsFocused(false)
                                      }}
                                      onChange={(e) => {
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
                                        // No negative allowed (we already strip '-' via regex)
                                        // Allow empty string so user can clear input
                                        setBetAmount(numeric === "" ? "" : numeric);
                                      }}
                                      placeholder="0.00"
                                      className={`pl-3d-input w-full bg-[#090C1D]  ${errorMsg
                                        ? "ring-2 ring-red-500"
                                        : ""
                                        } rounded-lg pl-8 pr-32 py-2 outline-none text-[#FAFAFA]  focus:text-white`}
                                    />
                                    <Tooltip
                                      id="betError2"
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
                                          if (isAutoBetting) return;
                                          buttonClickSoundFn();
                                          setBetAmount((prev) => {
                                            let newVal = parseFloat(prev || "0") / 2;

                                            if (isNaN(newVal) || newVal < 0.01) newVal = 0;

                                            return newVal.toFixed(2);
                                          });
                                        }}
                                        className="pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] rounded-l-md text-gray-200"
                                      >
                                        1/2
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (isAutoBetting) return;
                                          buttonClickSoundFn();
                                          setBetAmount((prev) =>
                                            Math.min(parseFloat(prev || "0") * 2).toFixed(2)
                                          )
                                        }}
                                        className={`pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] ${!ShowMAxBetBTN ? "rounded-r-md" : ""} text-gray-200`}
                                      >
                                        2X
                                      </button>
                                      {ShowMAxBetBTN && <button
                                        onClick={() => {
                                          if (isAutoBetting) return;
                                          buttonClickSoundFn();
                                          setBetAmount(MAX_BET ? MAX_BET.toFixed(2) : String(MAX_BET))
                                          // handleMaxBetButtonClick();
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
                                        className="pl-3d-mini-btn px-2 py-1 text-xs font-semibold bg-[#19183a] hover:bg-[#2c2852] rounded-r-md text-gray-200"
                                      >
                                        Max
                                      </button>}
                                    </div>
                                  </div>
                                </div>
                                {/* Number of bets */}
                                <div className="mt-2">
                                  <div className="pl-3d-label text-gray-300 text-sm font-medium mb-1 px-1">Number of bets</div>
                                  <div className="relative">
                                    <input
                                      disabled={isAutoBetting}
                                      type="text"
                                      inputMode="numeric"
                                      onWheel={(e) => e.currentTarget.blur()} // prevent scroll increment
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
                                        const val = e.target.value;
                                        const num = val.replace(/[^0-9]/g, "");
                                        setNumberOfBets(num === "" ? "" : parseInt(num));
                                      }}
                                      className={`pl-3d-input w-full bg-[#090C1D] outline-none rounded-lg px-3 py-2 text-gray-200 ${numberOfBets === "Infinite" ? "cursor-text text-gray-400" : ""}`}
                                      readOnly={false} // ✅ always editable (RainBet behavior)
                                    />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        // toggle infinite mode manually via ∞ button
                                        if (numberOfBets === "Infinite") {
                                          setNumberOfBets("1"); // back to normal input mode
                                        } else {
                                          setNumberOfBets("Infinite");
                                        }
                                      }}
                                      className={`absolute text-[20px] sm:text-[20px] md:text-[24px] lg:text-[20px] xl:text-[20px] right-3 top-[42.2%] -translate-y-1/2 transition-colors ${numberOfBets === "Infinite"
                                        ? "text-white"
                                        : "text-gray-400 hover:text-gray-200"
                                        }`}
                                    >
                                      ∞
                                    </button>
                                  </div>
                                </div>

                                <div className="flex mt-2  px-1 justify-between items-center text-gray-300 text-sm">
                                  <span className='pl-3d-label font-medium'>Advanced</span>
                                  <button
                                    type="button"
                                    onClick={() => setChecked(!checked)}
                                    className={`pl-3d-toggle-track relative inline-flex h-5 w-12 border-[1px] border-[#3B413E] items-center rounded-full transition-colors duration-200 ${checked ? "bg-[#1f86b7]" : "bg-[#0c0e22]"}`}
                                  >
                                    <span className={`pl-3d-toggle-knob inline-block h-4 w-5 transform rounded-full transition-transform duration-200 ${checked ? "translate-x-6 bg-gradient-to-b from-[#5dc5ef] to-[#249EDB]" : "translate-x-1 bg-gradient-to-b from-[#6a7180] to-[#3B413E]"}`} />
                                  </button>
                                </div>

                                {checked && (
                                  <div>
                                    {/* On Win */}
                                    <div className="mt-2">
                                      <div className="pl-3d-label text-gray-300 font-medium text-sm mb-1 px-1">On Win</div>
                                      <div className="pl-3d-input flex items-center justify-between bg-[#090C1D] p-1 rounded-lg outline-none">
                                        <div className="flex items-center">
                                          {/* ✅ Reset button fades when value <= 0 */}
                                          <button
                                            disabled={parseFloat(onWinIncrease || "0") <= 0}
                                            onClick={() => {
                                              if (isAutoBetting) return;
                                              buttonClickSoundFn();
                                              setOnWinIncrease("0.00");
                                            }}
                                            className={`pl-3d-mini-btn px-3 font-semibold py-[7px] rounded-md text-sm text-[#F4FFFB] transition
          ${parseFloat(onWinIncrease || "0") > 0
                                                ? "bg-[#2C2852] hover:opacity-80 cursor-pointer"
                                                : "bg-[#2C2852] cursor-not-allowed opacity-60"
                                              }`}
                                          >
                                            Reset
                                          </button>

                                          <button className="px-2 py-[8px] ml-2 font-medium rounded-md text-[#FFFFFFB2] text-sm ">
                                            Increase by:
                                          </button>

                                          <input
                                            disabled={isAutoBetting}
                                            type="text"
                                            step="0.01"
                                            min="0"
                                            value={onWinIncrease}
                                            placeholder="0.00"
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
                                              setOnWinIncrease(numeric === "" ? "" : numeric);
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setOnWinIncrease("");
                                              else e.target.select();
                                            }}
                                            className="w-1/3 bg-transparent font-medium outline-none rounded-lg px-2 py-2 text-gray-200"
                                          />
                                        </div>

                                        <span className="px-2 py-2 font-medium rounded-md text-gray-200">%</span>
                                      </div>
                                    </div>

                                    {/* On Loss */}
                                    <div className="mt-2">
                                      <div className="pl-3d-label text-gray-300 text-sm font-medium mb-1 px-1">On Loss</div>
                                      <div className="pl-3d-input flex items-center justify-between p-1 rounded-lg outline-none bg-[#090C1D]">
                                        <div className="flex items-center">
                                          {/* ✅ Reset button fades when value <= 0 */}
                                          <button
                                            disabled={parseFloat(onLossIncrease || "0") <= 0}
                                            onClick={() => {
                                              if (isAutoBetting) return;
                                              buttonClickSoundFn();
                                              setOnLossIncrease("0.00");
                                            }}
                                            className={`pl-3d-mini-btn px-3 font-semibold py-[7px] rounded-md text-sm text-[#F4FFFB] transition
                                                                                        ${parseFloat(onLossIncrease || "0") > 0
                                                ? "bg-[#2C2852] hover:opacity-80 cursor-pointer"
                                                : "bg-[#2C2852] cursor-not-allowed opacity-60"
                                              }`}
                                          >
                                            Reset
                                          </button>

                                          <button className="px-2 py-[8px] ml-2 font-medium rounded-md text-[#FFFFFFB2] text-sm ">
                                            Increase by:
                                          </button>

                                          <input
                                            disabled={isAutoBetting}
                                            type="text"
                                            step="0.01"
                                            min="0"
                                            value={onLossIncrease}
                                            placeholder="0.00"
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
                                              setOnLossIncrease(numeric === "" ? "" : numeric);
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setOnLossIncrease("");
                                              else e.target.select();
                                            }}
                                            className="w-1/3 font-medium bg-transparent outline-none rounded-lg px-2 py-2 text-gray-200"
                                          />
                                        </div>

                                        <span className="px-2 py-2 font-medium rounded-md text-gray-200">%</span>
                                      </div>
                                    </div>


                                    {/* Stop on Profit */}
                                    <div className="flex justify-between gap-3">
                                      <div className="mt-2">
                                        <div className="flex items-center justify-between text-gray-300 text-sm px-1">
                                          <span className='pl-3d-label font-medium'>Stop on Profit</span>
                                        </div>
                                        <div className="relative mt-1">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFAFA] select-none">
                                            {/* <img
                                              src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                              alt="dollar"
                                              width={18}
                                              height={18}
                                              className="w-[1em] h-[1em] object-contain opacity-80"
                                            /> */}
                                            {
                                              displayCurrency == 'USD'
                                                ?
                                                (
                                                  <img
                                                    src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                                    alt="dollar"
                                                    width={18}
                                                    height={18}
                                                    className="w-[1em] h-[1em] object-contain opacity-80"
                                                  />
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
                                            disabled={isAutoBetting}
                                            value={stopOnProfit}
                                            placeholder='0.00'
                                            inputMode="text"
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
                                              setStopOnProfit(numeric === "" ? "" : numeric);
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setStopOnProfit("");
                                              else e.target.select();
                                            }}

                                            className="pl-3d-input w-full bg-[#090C1D] outline-none rounded-lg pl-10 pr-8 py-2 text-gray-200"
                                          />
                                        </div>
                                      </div>

                                      {/* Stop on Loss */}
                                      <div className="mt-2">
                                        <div className="flex items-center justify-between text-gray-300 text-sm px-1">
                                          <span className='pl-3d-label font-medium'>Stop on Loss</span>
                                        </div>
                                        <div className="relative mt-1">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFAFA] select-none">

                                            {
                                              displayCurrency == 'USD'
                                                ?
                                                (
                                                  <img
                                                    src={cardImageCache[playCurrency == "chips" ? "chip-13" : 'dimondsign']?.src ?? "/dollar.png"}
                                                    alt="dollar"
                                                    width={18}
                                                    height={18}
                                                    className="w-[1em] h-[1em] object-contain opacity-80"
                                                  />
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
                                            disabled={isAutoBetting}
                                            placeholder='0.00'
                                            inputMode="text"
                                            value={stopOnLoss}
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
                                              setStopOnLoss(numeric === "" ? "" : numeric);
                                            }}
                                            onFocus={(e) => {
                                              if (["0", "0.0", "0.00"].includes(e.target.value)) setStopOnLoss("");
                                              else e.target.select();
                                            }}

                                            className="pl-3d-input w-full bg-[#090C1D] outline-none rounded-lg pl-10 pr-8 py-2 text-gray-200"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                  </div>)
                                }
                                {/* Current and last game profit */}
                                {isAutoBetting &&
                                  <div className="mt-2  rounded-lg  p-2 bg-[#090C1D] w-full transition-all duration-500 ease-in-out
                                                                            opacity-100 translate-y-0
                                                                ">
                                    <div className="flex items-center justify-between text-sm p-3 text-white">

                                      {/* Current Profit */}
                                      <div className="flex flex-col items-center justify-between w-1/2">
                                        <span className="text-white">Current Profit</span>
                                        <span className="text-[#31ABE8] flex items-center justify-center gap-1 mt-1">
                                          <img
                                            src={playCurrency === "chips" ? chipsign : dimondsign}
                                            alt={playCurrency === "chips" ? "chips" : "diamond"}
                                            className="w-[1em] h-[1em] object-contain"
                                          />
                                          <span className="font-medium font-rubik">{(totalProfit ?? 0).toFixed(2)}</span>
                                        </span>
                                      </div>

                                      {/* Center Divider */}
                                      <div className="flex flex-col items-center h-[40px] justify-center ">
                                        <div className="h-full border border-[#2C2852] border-r-[0.5px]">
                                        </div></div>

                                      {/* Next */}
                                      <div className="flex flex-col items-center justify-between w-1/2">
                                        <span className="text-white">Last Game Profit</span>
                                        <span className="text-[#31ABE8] flex items-center justify-center gap-1 mt-1">
                                          <img
                                            src={playCurrency === "chips" ? chipsign : dimondsign}
                                            alt={playCurrency === "chips" ? "chips" : "diamond"}
                                            className="w-[1em] h-[1em] object-contain"
                                          />
                                          <span className="font-medium font-rubik">{(lastGameProfit ?? 0).toFixed(2)}</span>
                                        </span>
                                      </div>
                                    </div>
                                    {/* <div className="h-10 rounded-lg w-full  bg-[#3E3564] flex items-center justify-around">
                                                                            <div className="flex flex-col items-center justify-between w-1/2">

                                                                                <span className="text-[#31ABE8] text-[14px] font-medium font-rubik ">{3}x</span>
                                                                            </div>
                                                                            <div className="h-full border border-[#090C1D] border-r-[0.5px]">
                                                                            </div>
                                                                            <div className="flex flex-col items-center justify-between w-1/2">

                                                                                <span className="text-[#31ABE8] font-medium font-rubik   text-[14px] text-center">{0}x</span>
                                                                            </div>

                                                                        </div> */}
                                  </div>

                                }
                                {/* <div className="sticky bottom-0 bg-[#19183A] py-1  mt-1 z-20 lg:block hidden"> */}
                                  <button
                                    onClick={handleBetPlacedAuto}
                                    disabled={gameValues.winChance < 0.01 || gameValues.winChance > 99.99 || BetLoading
                                      || gameValues.multiplier < 1 || gameValues.multiplier > 9900.00 || errorMsg
                                    }
                                    className="pl-3d-place-btn w-full lg:flex hidden items-center justify-center font-semibold mt-2 lg:mb-3 sm:mb-1 mb-0 py-3 rounded-lg text-base tracking-wide"
                                  >
                                    {/* Logic for button text and loading state */}
                                    {(() => {
                                      if ((betAmount == 0 || betAmount == "0.00") && !isAutoBetting) {
                                        return (
                                          <span className="flex font-medium items-center gap-2">
                                            {BetLoading ? (" Loading..."
                                            ) : (
                                              "Play Demo"
                                            )}
                                          </span>
                                        );
                                      } else if (isAutoBetting) {
                                        return (
                                          <span className="flex font-medium items-center gap-2">
                                            {BetLoading ? (" Loading..."

                                            ) : (
                                              "Stop Auto Bet"
                                            )}
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="flex font-medium items-center gap-2   disabled:text-gray-400 disabled:cursor-not-allowed">
                                            {BetLoading ? (" Stoping Auto Bet..."

                                            ) : (
                                              "Start Auto Bet"
                                            )}
                                          </span>
                                        );
                                      }
                                    })()}
                                  </button>
                                {/* </div> */}
                              </div>

                            </>
                          )}
                        </div>



                      </div>

                      {/* Right content: Game Area */}
                      <div className="order-1 lg:order-2 flex flex-col xl:w-[65%] lg:w-[70%] xl:h-[420px] lg:h-[420px] sm:h-[380px] h-[380px] md:h-[530px]">
                        <div className=" relative lg:rounded-l-xl shadow-lg overflow-hidden h-full flex flex-col">
                          {/* Balance */}
                          <div
                            ref={historyRef}
                            // `justify-end` was removed — combined with overflow-x:auto it
                            // clipped the leftmost items in Chrome instead of allowing
                            // horizontal scroll. With items packed from the start, the
                            // effect at [historyRef] auto-scrolls scrollLeft to scrollWidth
                            // when betHistory updates so the newest chip stays visible on
                            // the right and older ones are reachable by scrolling left.
                            className={`absolute top-4 right-4 left-4 flex gap-2 z-[10] overflow-x-auto no-scrollbar`}
                            style={{ direction: "ltr" }}
                          >
                            {betHistory &&
                              betHistory.length > 0 &&
                              betHistory.map((H, index) => {
                                const value = Number(H?.number || 0);
                                const rounded = Number(value).toFixed(2);

                                return (
                                  <div
                                    key={index}
                                    className={`pl-3d-pill rounded-lg text-sm font-semibold flex-shrink-0 bg-gradient-to-b from-[#2c2852] to-[#19183A] ${H?.status
                                      ? "text-[#15E267]"
                                      : "text-[#DD000C]"
                                      }`}

                                  >
                                    <div className='h-full w-full py-1 px-3 flex items-center justify-center'>

                                      {rounded}
                                    </div>
                                  </div>
                                );
                              })}

                          </div>
                          {/* Slider and Game Display */}
                          <div className="relative top-[40px] xl:top-[35px] w-full flex-grow flex flex-col justify-center items-center">
                            {/* Scale numbers */}
                            {/* <div className='w-[92%]  px-4 flex justify-center rounded-sm  '>
                            <div className="flex w-[97%] text-white text-xs mt-[-25px] relative">
                              {[0, 25, 50, 75, 100].map((n) => (
                                <div
                                  key={n}
                                  className="absolute transform -translate-x-1/2 bg-[#FFFFFF1A] w-[1px] h-[16px]  text-[#3E3564] rounded-sm"
                                  style={{ left: `${n}%` }}
                                >

                                </div>
                              ))}
                            </div>
                          </div> */}
                            {/* Track */}
                            <div className='pl-3d-input w-[92%] flex justify-center bg-[#19183A] rounded-full py-4 px-2'>
                              <div
                                ref={sliderTrackRef}
                                className="relative w-[97%] h-2 rounded-full cursor-pointer"
                                style={{
                                  background: getTrackBackground(),
                                  boxShadow:
                                    'inset 0 1px 2px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.18), 0 0 8px rgba(0, 208, 132, 0.15), 0 0 8px rgba(227, 56, 39, 0.15)'
                                }}
                                onClick={(e) => gameState === "idle" && handleSliderChange(getValueFromMouseX(e.clientX))}
                              >
                                {/* Hexagon now lives inside the same relative parent as the slider's handle. Always mounted so left changes animate immediately. */}
                                {showHexagon && (
                                  <div
                                    className="absolute top-[-45px] -translate-y-1/2 -translate-x-1/2"
                                    ref={hexagonRef}
                                    style={{
                                      left: `${hexagonPos}%`,
                                      // Disable CSS left-transition during JS animation or when animations are turned off
                                      transition: ShowAnimation && !isAnimating
                                        ? 'left 250ms cubic-bezier(.2,.8,.2,1)'
                                        : 'none',
                                      willChange: 'left, transform',
                                      opacity: 1,
                                      transform: 'translateY(-50%) translateX(-50%) scale(1)',
                                      transformOrigin: 'center center'
                                    }}
                                  >
                                    <img
                                      width={100}
                                      height={100}
                                      src={cardImageMap[hexagonResult === "loss" ? "Hexgonred" : hexagonResult === "win" ? "hexagon" : "Hexgonnormal"]}
                                      alt="Hexagon"
                                      style={{
                                        filter:
                                          hexagonResult === "win"
                                            ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.6)) drop-shadow(0 9px 14px rgba(0,0,0,0.45)) drop-shadow(0 0 12px rgba(11,241,145,0.65))'
                                            : hexagonResult === "loss"
                                              ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.6)) drop-shadow(0 9px 14px rgba(0,0,0,0.45)) drop-shadow(0 0 12px rgba(239,68,68,0.65))'
                                              : 'drop-shadow(0 4px 6px rgba(0,0,0,0.6)) drop-shadow(0 9px 14px rgba(0,0,0,0.45)) drop-shadow(0 0 8px rgba(116,104,178,0.45))',
                                        transition: 'filter 200ms ease'
                                      }}
                                      className={`block w-12 sm:w-12 md:w-14 lg:w-18 !max-w-none !min-w-full ${isAnimating ? "pulse-glow" : ""
                                        }`}
                                    />


                                    <div
                                      className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${hexagonResult === "win"
                                        ? "animate-pulse text-[#FFFFFF]"
                                        : hexagonResult === "loss"
                                          ? "animate-pulse text-[#FFFFFF]"
                                          : "text-[#000000]"
                                        }`}
                                    >
                                      <h4 className="text-sm sm:text-base md:text-md lg:text-md">
                                        {hexagonPos.toFixed(2)}
                                      </h4>
                                    </div>

                                  </div>
                                )}




                                <div
                                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group  ${isAnyModalOpen
                                    ? "pointer-events-none opacity-0 z-0"
                                    : "z-[2]"
                                    } -mr-[8px]`}
                                  style={{
                                    left: `${gameValues.sliderValue}%`, transition: 'left 120ms cubic-bezier(0.23, 1, 0.32, 1)',
                                    willChange: 'left, transform'
                                  }}
                                  onMouseDown={handleMouseDown}
                                  onTouchStart={handleTouchStart}
                                >
                                  {/* Slider handle */}
                                  <img
                                    src={cardImageMap['slider']}
                                    alt="Slider handle"
                                    className="w-7 h-7 transition-transform duration-150 group-hover:scale-110 z-[1000]"
                                    width={100}
                                    height={100}
                                    draggable="false"
                                  />

                                  {/* Tooltip */}
                                  <div
                                    className="pl-3d-pill absolute left-1/2 top-[125%] -translate-x-1/2 bg-gradient-to-b from-[#2c2852] to-[#1f1c3d]
        text-[#FFFFFF] text-[12px] font-semibold z-[900] px-2 py-[3px]
        rounded-md opacity-1 group-hover:opacity-100
        transition-opacity duration-150"
                                  >
                                    {(Number(gameValues?.sliderValue ?? 0)).toFixed(2)}
                                  </div>

                                  {/* 3D tooltip pointer — gradient + drop shadow */}
                                  <div
                                    className="absolute left-1/2 top-[100%] -translate-x-1/2 w-[10px] h-[9px] z-[900]"
                                    style={{
                                      background:
                                        'linear-gradient(180deg, #8c80c8 0%, #7468b2 55%, #4d4380 100%)',
                                      clipPath:
                                        'polygon(50% 100%, 0% 0%, 100% 0%)',
                                      filter:
                                        'drop-shadow(0 1px 1px rgba(0,0,0,0.55)) drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
                                    }}
                                  />
                                </div>



                              </div>
                              {/* </div> */}
                              {/* </div> */}
                            </div>
                            <div className='w-[92%] px-4 flex justify-center rounded-sm mt-[41px] sm:mt-[41px] lg:mt-[37px]'>
                              <div className="flex w-[97%] text-white text-xs relative">

                                {[0, 25, 50, 75, 100].map((n) => (
                                  <div
                                    key={n}
                                    className="absolute flex flex-col items-center top-[-39px] md:top-[-38px]  lg:top-[-36px] xl:top-[-36px]"
                                    style={{ left: `${n}%`, transform: "translateX(-50%)" }}
                                  >
                                    {/* 3D downward tick arrow — gradient + drop shadow */}
                                    <div
                                      className="w-[10px] h-[9px]"
                                      style={{
                                        background:
                                          'linear-gradient(180deg, #3a3566 0%, #19183A 55%, #0a0a1d 100%)',
                                        clipPath:
                                          'polygon(50% 100%, 0% 0%, 100% 0%)',
                                        filter:
                                          'drop-shadow(0 1px 1px rgba(0,0,0,0.7)) drop-shadow(0 2px 3px rgba(0,0,0,0.45))'
                                      }}
                                    />

                                    {/* Number ABOVE */}
                                    <span className="pl-3d-label text-[12px] mb-[4px] font-semibold">
                                      {n}
                                    </span>


                                  </div>
                                ))}

                              </div>
                            </div>
                          </div>
                          {/* Betting interface */}
                          <div className=" grid grid-cols-3 gap-4 w-[100%] lg:w-[98%] rounded-lg bg-[#19183A]  p-4 lg:ml-2 ">
                            {/* Multiplier */}
                            <div className="flex flex-col w-full">
                              <label className="pl-3d-label text-sm text-[#FAFAFA] font-medium mb-1">Multiplier</label>
                              <div className="flex items-center pl-3d-input bg-[#090C1D] rounded-lg px-2 ">
                                <input
                                  type="number"
                                  step="1"
                                  onFocus={(e) => e.target.select()}

                                  value={multiplierInput}
                                  onChange={(e) => handleMultiplierInput(e.target.value)}
                                  onBlur={handleMultiplierBlur}
                                  data-tooltip-id="multiError"
                                  data-tooltip-hidden={!multiplierError}
                                  data-tooltip-place="top"
                                  className="flex-1 font-medium min-w-0 bg-transparent text-white text-sm py-2 px-1 outline-none"
                                />
                                <Tooltip
                                  id="multiError"
                                  isOpen={!!multiplierError}
                                  className="!bg-red-600 !text-white !px-3 !py-2 !rounded-md"
                                >
                                  {multiplierError}
                                </Tooltip>
                                <button className="ml-2 shrink-0">
                                  <img width={24}
                                    height={24} src={Ex_icon} alt="refresh" className="w-3 h-3 opacity-70" />
                                </button>
                              </div>
                            </div>
                            {/* Roll Over */}
                            <div className="flex flex-col w-full">
                              <label className="pl-3d-label text-sm  text-[#FAFAFA] font-medium mb-1">Roll {isRollUnder ? "Under" : 'Over'}</label>
                              <div onClick={() => {
                                if (isAutoBetting) return;
                                if (IsBtnClick) return;
                                buttonClickSoundFn();
                                const isRollUnderUpdated = !isRollUnder;
                                setIsRollUnder(isRollUnderUpdated)
                                const { winChance, multiplier, clampedThreshold, rollOver, rollUnder } =
                                  computeDice(gameValues?.sliderValue, isRollUnderUpdated ? 'under' : 'over', 1);
                                if (isRollUnderUpdated) {
                                  setGameValues({
                                    sliderValue: clampedThreshold,
                                    multiplier: parseFloat(multiplier.toFixed(3)),
                                    rollOver: parseFloat(winChance.toFixed(4)),
                                    winChance: isRollUnderUpdated
                                      ? parseFloat(rollUnder.toFixed(2))
                                      : parseFloat(rollOver.toFixed(2))
                                  });
                                  updateDiceValues('mode', 'under');
                                } else if (!isRollUnderUpdated) {
                                  updateDiceValues('mode', 'over');
                                  setGameValues({
                                    sliderValue: clampedThreshold,
                                    multiplier: parseFloat(multiplier.toFixed(3)),
                                    rollOver: parseFloat(rollOver.toFixed(2)),
                                    winChance: isRollUnderUpdated
                                      ? parseFloat(rollUnder.toFixed(2))
                                      : parseFloat(winChance.toFixed(4))
                                  });
                                }

                              }} className="flex items-center pl-3d-input bg-[#090C1D] rounded-lg px-2  cursor-pointer">
                                <input
                                  disabled={true}
                                  type="number"
                                  value={gameValues.rollOver > 0 ? gameValues.rollOver.toFixed(2) : gameValues.rollOver}
                                  step="0.01"
                                  onChange={(e) => handleRollOverChange(e.target.value)}
                                  className="flex-1 min-w-0 bg-transparent text-white text-sm py-2 px-1 outline-none"
                                />
                                <button className="ml-2 shrink-0">
                                  <img width={24}
                                    height={24} src={Refresh_icon} alt="refresh" className="w-3 h-3 opacity-70" />
                                </button>
                              </div>
                            </div>
                            {/* Win Chance */}
                            <div className="flex flex-col w-full">
                              <label className="pl-3d-label text-sm text-[#FAFAFA] font-medium mb-1">Win Chance</label>
                              <div className="flex items-center pl-3d-input bg-[#090C1D] rounded-lg px-2 ">
                                <input
                                  type="number"
                                  step="1"
                                  onFocus={(e) => e.target.select()}

                                  value={winChanceInput}
                                  onChange={(e) => handleWinChanceInput(e.target.value)}
                                  onBlur={handleWinChanceBlur}
                                  data-tooltip-id="winError"
                                  data-tooltip-hidden={!winChanceError}
                                  data-tooltip-place="top"
                                  className="flex-1 min-w-0 bg-transparent text-white text-sm py-2 px-1 outline-none"
                                />
                                <Tooltip
                                  id="winError"
                                  isOpen={!!winChanceError}
                                  className="!bg-red-600 !text-white !px-3 !py-2 !rounded-md"
                                >
                                  {winChanceError}
                                </Tooltip>
                                <img
                                  width={24}
                                  height={24}
                                  src={per_icon}
                                  alt="%"
                                  className="w-4 h-4 opacity-70 ml-2 shrink-0"
                                />
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>

                  {/* <div className="px-2 lg:px-0 pb-2 lg:pb-0"> */}
                    <Footer setisFavorite={setisFavorite} isFavorite={isFavorite} setStats={setStats} stats={stats} gameData={gameData} setplayFast={setplayFast} setIsAnyModalOpen={setIsAnyModalOpen} isAnyModalOpen={isAnyModalOpen} playFast={playFast} setShowAnimation={setShowAnimation} ShowAnimation={ShowAnimation} ShowMAxBetBTN={ShowMAxBetBTN} setShowMAxBetBTN={setShowMAxBetBTN} setHotkeysEnabled={setHotkeysEnabled} hotkeysEnabled={hotkeysEnabled} socket={socket} gameHotKeys={HOtKeys} />
                  {/* </div> */}
                  <Description gameData={gameData} setisFavorite={setisFavorite} isFavorite={isFavorite} />
                  {/* <BetDashboard /> */}
                  <div className="mt-[10px]">
                    <LatestBetTable />
                  </div>

                </div>


              </div >

            </main >
          )
          :
          (
            (loadingGame) ? (
              <div className="flex flex-col justify-centergap-6 items-center p-4 h-full">
                {/* <LoaderContent /> ✅ custom loader */}
                Loading...
              </div>
            )
              :
              gameLoadError ? (
                <div className="flex flex-col justify-center  gap-6 items-center p-4 h-full">
                  <span className="text-red-500">Something Wrong !</span></div>
              ) : (<>
                <main key={displayCurrency} className="flex h-full w-full flex-col my-5 gap-5 md:min-h-[80vh]">
                  {/* Back button */}
                  {/* <div className="flex flex-row gap-2 text-base sm:text-xl lg:text-[22px] font-bold">
                                        <Link href="#" onClick={() => window.history.back()} shallow={true}>
                                            <h2>
                                                {"<"} {t("gamePage.back")}
                                            </h2>
                                        </Link>
                                    </div> */}

                  {/* Main layout */}
                  <div className="flex flex-col md:flex-row items-center h-full min-w-full min-h-[400px]">
                    {/* Sidebar */}
                    <div
                      className="gamification_widget h-auto md:h-full max-h-[600px] md:max-h-none absolute right-[16px] left-[16px] md:static gamanzaSidebar z-[2]"
                      data-type="sidebar"
                      id="sidebar"
                    ></div>

                    {/* Game content */}
                    {false ? (<div className="flex flex-col items-center w-full h-full  min-h-[300px] md:min-h-[400px] px-2 md:px-4">
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
                                (gameData?.img || "/assets/games/default-game-bg.jpg")
                              )
                                .replace("/refs/heads", "") // remove invalid GitHub segment
                                .replace("%2520", "%20")    // fix double encoding
                                .trim()})`
                            }}
                          ></div>
                          {/* {content} */}
                        </div>

                        {/* Game footer */}
                        <div className="w-full rounded-b-2xl flex flex-col p-4 md:px-4" style={{ backgroundColor: '#3E3564' }}>
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
                                fill="#FAFAFA"
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
                  {/* <div className="w-full px-3 md:px-4">
                    <BetDashboard socket={socket} playerId={user?._id} Slug={Slug} gameName={gameData?.name} compactBetsSectionOnly />
                  </div> */}
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
            
            @keyframes bubble {
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
             @keyframes pulseGlow {
  0%,100% { filter: drop-shadow(0 0 0px rgba(11,241,145,0)); }
  50% { filter: drop-shadow(0 0 12px rgba(11,241,145,0.6)); }
}
.pulse-glow { animation: pulseGlow 1.2s ease-in-out infinite; }


            
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

            /* ─── Shared 3D-look utility classes (mirrored from PlinkoGame).
               Keep in sync with src/pages/Originals/PlinkoGame.jsx so every
               original game renders the same buttons/inputs/labels. ─── */
            .pl-3d-input {
              background-image: linear-gradient(180deg, #04060f 0%, #0b0e22 60%, #0e1228 100%);
              border-top: 1px solid #02030a;
              box-shadow:
                inset 0 3px 6px rgba(0, 0, 0, 0.8),
                inset 0 1px 2px rgba(0, 0, 0, 0.7),
                inset 0 -1px 0 rgba(255, 255, 255, 0.07),
                0 1px 0 rgba(255, 255, 255, 0.06);
            }
            .pl-3d-label {
              text-shadow:
                0 -1px 0 rgba(0, 0, 0, 0.9),
                0 1px 1px rgba(255, 255, 255, 0.14),
                0 2px 3px rgba(0, 0, 0, 0.6),
                0 3px 6px rgba(0, 0, 0, 0.35);
              letter-spacing: 0.3px;
            }
            .pl-3d-toggle-track {
              box-shadow:
                inset 0 2px 3px rgba(0, 0, 0, 0.6),
                inset 0 -1px 0 rgba(255, 255, 255, 0.08);
            }
            .pl-3d-toggle-knob {
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.45),
                inset 0 -2px 3px rgba(0, 0, 0, 0.35),
                0 2px 3px rgba(0, 0, 0, 0.55);
            }
            .pl-3d-mini-btn {
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.18),
                inset 0 -2px 3px rgba(0, 0, 0, 0.45),
                0 2px 0 #0a0b1f,
                0 3px 6px rgba(0, 0, 0, 0.55);
              transition: transform 120ms ease, box-shadow 120ms ease;
            }
            .pl-3d-mini-btn:hover:not(:disabled) { transform: translateY(-1px); }
            .pl-3d-mini-btn:active:not(:disabled) {
              transform: translateY(2px);
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.12),
                inset 0 -1px 2px rgba(0, 0, 0, 0.45),
                0 0 0 #0a0b1f,
                0 1px 2px rgba(0, 0, 0, 0.45);
            }
            .pl-3d-mini-btn:disabled { box-shadow: none; transform: none; }
            .pl-3d-pill {
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.55),
                inset 0 -2px 3px rgba(0, 0, 0, 0.4),
                0 2px 4px rgba(0, 0, 0, 0.55);
            }
            .pl-3d-tab-active {
              background: linear-gradient(180deg, #2c2852 0%, #1f1c3d 100%);
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.18),
                inset 0 -2px 3px rgba(0, 0, 0, 0.35),
                0 3px 0 #0a0b1f,
                0 4px 8px rgba(0, 0, 0, 0.55);
            }
            .pl-3d-pressed {
              box-shadow:
                inset 0 2px 4px rgba(0, 0, 0, 0.65),
                inset 0 -1px 0 rgba(255, 255, 255, 0.06);
            }
            .pl-3d-panel {
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.07),
                inset 0 -1px 0 rgba(0, 0, 0, 0.5),
                0 4px 12px rgba(0, 0, 0, 0.55);
            }
            .pl-3d-place-btn {
              background: linear-gradient(180deg, #31ABE8 0%, #249EDB 100%);
              border: 2px solid #31ABE8;
              color: #ffffff;
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.55),
                inset 0 -4px 6px rgba(0, 0, 0, 0.35),
                0 4px 0 #1a78ad,
                0 7px 14px rgba(0, 0, 0, 0.5);
              transition: all 150ms ease;
            }
            .pl-3d-place-btn:hover:not(:disabled) {
              background: linear-gradient(180deg, #29A3E0 0%, #29A3E0 100%);
              transform: translateY(-1px);
            }
            .pl-3d-place-btn:active:not(:disabled) {
              transform: translateY(2px);
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -2px 4px rgba(0, 0, 0, 0.35),
                0 1px 0 #1a78ad,
                0 2px 4px rgba(0, 0, 0, 0.45);
            }
            .pl-3d-place-btn:disabled {
              background: linear-gradient(180deg, #2a2d4a 0%, #1c1e36 100%);
              border-color: #1f223d;
              color: #6f7591;
              cursor: not-allowed;
              transform: none;
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.06),
                inset 0 -2px 4px rgba(0, 0, 0, 0.4),
                0 2px 0 #0b0c1d,
                0 4px 8px rgba(0, 0, 0, 0.45);
            }
          `}</style>

      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </>
  );
};

export default DiceGame;