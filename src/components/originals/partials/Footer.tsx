// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/components/footer.jsx. Original types/imports preserved; adapted for rlk-frontend.
import { Settings } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { GoGraph } from "react-icons/go";
import { FaRegStar, FaStar } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flame, Keyboard, Volume2, VolumeX, Volume1, Eclipse, Rabbit, Maximize, Minimize } from "lucide-react";
import { Info, X } from "lucide-react";
// import DraggableModal from "./DraggableModel"
import FairnessModal from "./FairnessModal"
import HotkeyModal from "./HotKeyModel"
const FairplayImg = "/assets/img/Fairplay.png";
// import watermarkImg from "../../../../../../public/assets/img/centerLogo.png";
import { BiRectangle } from "react-icons/bi";

// import { usePathname, useSearchParams } from "next/navigation";
import { getGlobalVolume, isSoundMuted, muteSound, setGlobalVolume, unmuteSound } from "@/lib/originalsSound";
import { toggleFavoriteService } from "@/services/originalsFavorites";
import { useAuth } from "@/lib/originalsAuthBridge";


// ✅ Popup Component
function ShowSettingPopup({ ShowMAxBetBTN, setShowMAxBetBTN, setVolume, volume, soundOn, setSoundOn, audioRef, hotkeysEnabled, setHotkeysEnabled, setShowAnimation, ShowAnimation, playFast, setplayFast, gameHotKeys, isAnyModalOpen, setIsAnyModalOpen }) {
  const [showGameInfo, setshowGameInfo] = useState(false);
  const [showHotkeyModal, setShowHotkeyModal] = useState(false);
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setGlobalVolume(newVolume)
  };

  // Game sound on/off, saved on this device (on unless the player turns it off).
  const toggleSound = () => {
    if (soundOn) muteSound();
    else unmuteSound();
    setSoundOn(!soundOn);
  };

  let VolumeIcon;
  if (!soundOn || volume === 0) VolumeIcon = VolumeX;      // muted
  else if (volume <= 0.6) VolumeIcon = Volume1; // low
  else if (volume <= 0.7) VolumeIcon = Volume2; // medium
  else VolumeIcon = Volume2;

  return (
    <div className={`absolute left-0 mt-4 w-48 sm:w-56 md:w-64 lg:w-72 rounded-2xl rl-liquid-glow bg-[#18181A]  shadow-2xl p-4 sm:p-5 text-gray-300 space-y-4 z-20 text-sm sm:text-base`}>
      {/* Arrow */}
      {/* <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-800 rotate-45"></div> */}

      {/* Sound on/off */}
      <div
        role="switch"
        aria-checked={soundOn}
        onClick={toggleSound}
        className={`flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors ${soundOn ? 'text-[#F9D028]' : ''}`}
      >
        <VolumeIcon size={18} className="" />
        <span className="">Sound</span>
      </div>

      {/* Volume Control */}
      <div className={`flex items-center space-x-3 p-2 rounded-full transition-colors ${soundOn ? 'cursor-pointer' : 'opacity-40'}`}>
        <Volume1 size={18} className="text-[#F9D028]" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          disabled={!soundOn}
          aria-label="Volume"
          className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer slider disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #F9D028 0%, #F9D028 ${volume * 100}%, #333333 ${volume * 100}%, #333333 100%)`
          }}
        />
      </div>

      {/* Instant Bet */}
      {/* <div className="flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors">
        <Zap size={18} className="text-white" />
        <span className="text-white">Instant Bet</span>
      </div> */}

      {/* Animations (Highlighted) */}
      {/* <div
        onClick={() => setAnimationsEnabled(!animationsEnabled)}
        className={`flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors ${animationsEnabled ? 'text-green-400' : ''
          }`}
      >
        <div className="flex space-x-1">
          <Circle size={12} className={`${animationsEnabled ? 'text-green-400' : 'text-gray-400'}`} />
          <Circle size={12} className={`${animationsEnabled ? 'text-green-400' : 'text-gray-400'}`} style={{ marginLeft: '-4px' }} />
          <Circle size={12} className={`${animationsEnabled ? 'text-green-400' : 'text-gray-400'}`} style={{ marginLeft: '-4px' }} />
        </div>
        <span className={`${animationsEnabled ? 'text-green-400' : 'text-white'}`}>Animations</span>
      </div> */}

      {/* Max Bet */}
      <div
        onClick={() => setShowMAxBetBTN(!ShowMAxBetBTN)}
        className={`flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors ${ShowMAxBetBTN ? 'text-[#F9D028]' : ''
          }`}
      >
        <Flame size={18} className="" />
        <span className="">Max Bet</span>
      </div>
      <div
        onClick={() => setShowAnimation(!ShowAnimation)}
        className={`flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors ${ShowAnimation ? 'text-[#F9D028]' : ''
          }`}
      >
        <Eclipse size={18} className="" />
        <span className="">Animation</span>
      </div>
      <div
        onClick={() => setplayFast(!playFast)}
        className={`flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors ${playFast ? 'text-[#F9D028]' : ''
          }`}
      >
        <Rabbit size={18} className="" />
        <span className="">Fast</span>
      </div>

      {/* Game Info */}
      {/* <div
        onClick={() => {
          setshowGameInfo(!showGameInfo)
          setIsAnyModalOpen(!isAnyModalOpen)
        }}
        className={`flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors ${showGameInfo ? "text-[#F9D028]" : ''}`}
      >
        <Info size={18} className="" />
        <span className="">Game Info</span>
        {showGameInfo && <GameInfo isAnyModalOpen={isAnyModalOpen} setIsAnyModalOpen={setIsAnyModalOpen} showGameInfo={showGameInfo} setshowGameInfo={setshowGameInfo} />}
      </div> */}

      {/* Hotkeys */}
      <div className={`flex items-center space-x-3  p-2 rounded-full cursor-pointer transition-colors ${showHotkeyModal || hotkeysEnabled ? "text-[#F9D028]" : ''}`} onClick={() => {
        {
          setShowHotkeyModal(true)
          setIsAnyModalOpen(!isAnyModalOpen)
        }
      }}>
        <Keyboard size={18} className="" />
        <span className="">Hotkeys</span>
      </div>
      {showHotkeyModal && <HotkeyModal isAnyModalOpen={isAnyModalOpen} setIsAnyModalOpen={setIsAnyModalOpen} setHotkeysEnabled={setHotkeysEnabled} hotkeysEnabled={hotkeysEnabled} showHotkeyModal={showHotkeyModal} setShowHotkeyModal={setShowHotkeyModal} HOtKeys={gameHotKeys} />}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 15px;
          width: 30px;
          border-radius: 5px;
          background: #F9D028;
          cursor: pointer;
          border: 1px solid #ffffff;
         box-shadow: 0 0 12px 3px rgba(249, 208, 40, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 15px;
          width: 30px;
          border-radius: 10px;
          background: #F9D028;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 3px 2px 4px rgba(249, 208, 40, 0.6);
        }
      `}</style>
    </div>
  );
}

function Footer({ stats, setStats, gameData, setShowMAxBetBTN, ShowMAxBetBTN, hotkeysEnabled, setHotkeysEnabled, endGameData, socket, setShowAnimation, ShowAnimation, playFast, setplayFast, showInBigScreen, setshowInBigScreen, gameHotKeys, isAnyModalOpen, setIsAnyModalOpen, setisFavorite, isFavorite }) {
  const [showSetting, setShowSetting] = useState(false);
  const [showGraph, setshowGraph] = useState(false);
  const [showFairness, setShowFairness] = useState(false);
  const { user, fetchUser, playCurrency } = useAuth();
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
  const [pendingSlug, setPendingSlug] = useState(null); // ⭐ track which card is loading
  const [clickedFavorites, setClickedFavorites] = useState(new Set()); // ⭐ track clicked favorite buttons
  // const [isFavorite, setisFavorite] = useState(user?.favorites?.some(id => String(id) == String(gameData?.slug)));

  // Update isFavorite when user favorites or gameData changes
  useEffect(() => {
    setisFavorite(user?.favorites?.some(id => String(id) == String(gameData?.slug)) ?? false);
  }, [gameData?.slug]);

  const userId = user?._id ?? ''
  // const { data: favoriteGames } = useFavorites(userId)
  // const toggleFavorite = useToggleFavorite(userId)

  // useEffect(() => {
  //   const isFavoritess = favoriteGames?.some((fav) => fav.gameSlug === gameData?.slug) ?? false
  //   setisFavorite(isFavoritess)
  // }, [favoriteGames, gameData])
  const toggleFav = async (gameId) => {
    try {
      const newFavState = !isFavorite;

      const data = await toggleFavoriteService(gameId, newFavState);
      console.log('toggle favorite response', data)
      if (data?.favorites) {
        setisFavorite(data?.favorites.some(id => String(id) === String(gameId)));
      }
      fetchUser();
    } catch (err) {
      throw err;
    }
  }
  // const onToggleClick = (e) => {
  //   console.log('game data', gameData)
  //   const payload = { gameSlug: gameData?.slug, slug: gameData?.gameId };
  //   const isCurrentlyFavorite = isFavorite;

  //   if (!user) {
  //     const key = "pendingFavorites";
  //     const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  //     const list = raw ? JSON.parse(raw) : [];

  //     if (!list.some((it) => it.gameSlug === gameData.slug)) {
  //       list.push(payload);
  //       localStorage.setItem(key, JSON.stringify(list));
  //     }

  //     setClickedFavorites((prev) => {
  //       const newSet = new Set(prev);
  //       newSet.add(gameData.slug);
  //       return newSet;
  //     });

  //     state.loadLoginPage = true;
  //     return;
  //   }

  //   setPendingSlug(gameData.slug);

  //   toggleFavorite.mutate(payload, {
  //     onSettled: () => {
  //       setPendingSlug(null);

  //       if (isCurrentlyFavorite) {
  //         setClickedFavorites((prev) => {
  //           const newSet = new Set(prev);
  //           newSet.delete(gameData.slug);
  //           return newSet;
  //         });
  //       } else {
  //         setClickedFavorites((prev) => {
  //           const newSet = new Set(prev);
  //           newSet.add(gameData.slug);
  //           return newSet;
  //         });
  //       }
  //     },
  //   });
  // };


  const [isFullscreen, setIsFullscreen] = useState(false);
  const footerRef = useRef(null);

  const getGameContainer = () => footerRef.current?.closest('main') ?? footerRef.current;

  const toggleFullscreen = () => {
    const gameContainer = getGameContainer();
    if (!document.fullscreenElement) {
      gameContainer?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      const gameContainer = getGameContainer();
      if (!gameContainer) return;
      if (inFullscreen) {
        gameContainer.style.height = '100vh';
        gameContainer.style.maxHeight = '100vh';
        gameContainer.style.overflowY = 'auto';
        gameContainer.style.overflowX = 'hidden';
        gameContainer.style.boxSizing = 'border-box';
        gameContainer.style.padding = '12px';
        gameContainer.style.backgroundColor = '#0f0e2a';
      } else {
        gameContainer.style.height = '';
        gameContainer.style.maxHeight = '';
        gameContainer.style.overflowY = '';
        gameContainer.style.overflowX = '';
        gameContainer.style.boxSizing = '';
        gameContainer.style.padding = '';
        gameContainer.style.backgroundColor = '';
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const popupRef = useRef(null);
  const [volume, setVolume] = useState(1); // 1 = 100%
  const [soundOn, setSoundOn] = useState(true);
  // The saved choice, read after mount so the server and first client render agree.
  useEffect(() => {
    setVolume(getGlobalVolume());
    setSoundOn(!isSoundMuted());
  }, []);
  const audioRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setShowSetting(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div ref={footerRef} className="w-full  lg:w-full xl:w-full  mt-4 rounded-full p-1 rl-liquid-glow bg-[#18181A] ">
      <div className=" text-white flex flex-row justify-between  mt-1  items-center  ">
        <div direction="col" spacing={2} className="flex items-center space-x-1">
          <div className="relative">

            <IconButton
              sx={{
                color: showSetting ? "#ffffff" : "#ffffff", // cream color (default)
                "&:hover": {
                  color: "#ffffff", // pure white on hover
                },
              }}
              onClick={() => setShowSetting(!showSetting)}
              aria-label="Settings"
              color="inherit"
            >
              <Settings />
            </IconButton>
            {showSetting && (
              <span ref={popupRef}>
                <ShowSettingPopup setplayFast={setplayFast} playFast={playFast} setHotkeysEnabled={setHotkeysEnabled} hotkeysEnabled={hotkeysEnabled} ShowMAxBetBTN={ShowMAxBetBTN} setShowMAxBetBTN={setShowMAxBetBTN} setShowAnimation={setShowAnimation} ShowAnimation={ShowAnimation} audioRef={audioRef} setVolume={setVolume} volume={volume} soundOn={soundOn} setSoundOn={setSoundOn} gameHotKeys={gameHotKeys} isAnyModalOpen={isAnyModalOpen} setIsAnyModalOpen={setIsAnyModalOpen} />
              </span>
            )}
          </div>
          <IconButton onClick={() => toggleFav(gameData?.slug)} sx={{
            color: isFavorite ? "#FFD700" : "#94a59e", // gold when favorite, gray when not
            "&:hover": {
              color: isFavorite ? "#FFA500" : "#ffffff", // orange-gold on hover
            },
          }} aria-label="FaRegStar" color="inherit">
            {isFavorite ? <FaStar /> : <FaRegStar />}
          </IconButton>
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              color: isFullscreen ? "#F9D028" : "#94a59e",
              "&:hover": {
                color: "#ffffff",
              },
            }}
            aria-label="Fullscreen"
            color="inherit"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </IconButton>
        </div>

        <div>
          <Button
            disableRipple
            disableFocusRipple
            disableTouchRipple
            onClick={() => setShowFairness(true)}
            sx={{
              fontWeight: 500,
              fontSize: "16px",
              color: "white",
              textTransform: "none",
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: "transparent" },
              "&:focus": { backgroundColor: "transparent" },
              "&:active": { backgroundColor: "transparent" },
            }}
          >
            <img src={FairplayImg} alt="Blackjack" className="w-[14px] h-[18px] mr-1" />
            Fairness
          </Button>

          <FairnessModal userId={user?._id} socket={socket} showFairness={showFairness} setShowFairness={setShowFairness} />
        </div>
      </div>
    </div>
  );
}

export default Footer;
