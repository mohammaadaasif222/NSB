// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/fairnessVerifiedGames/BlackJackVerified.jsx. Original types/imports preserved; adapted for rlk-frontend.
// "use client";


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


// import Image from "next/image";
// import { UpperCase } from '@/shared/dataHandle';

// spacing values from original game
const leftSpacing = 1.6; // rem
const topSpacing = 0.30; // rem

const CARD_WIDTH = "3.5rem"; // w-14
const CARD_HEIGHT = "5rem";  // h-20
const CARD_IMAGE_MAP = {
    h: { A: HA, 2: H2, 3: H3, 4: H4, 5: H5, 6: H6, 7: H7, 8: H8, 9: H9, T: HT, J: HJ, Q: HQ, K: HK },
    d: { A: DA, 2: D2, 3: D3, 4: D4, 5: D5, 6: D6, 7: D7, 8: D8, 9: D9, T: DT, J: DJ, Q: DQ, K: DK },
    c: { A: CA, 2: C2, 3: C3, 4: C4, 5: C5, 6: C6, 7: C7, 8: C8, 9: C9, T: CT, J: CJ, Q: CQ, K: CK },
    s: { A: SA, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, T: ST, J: SJ, Q: SQ, K: SK },
};

function BlackJackVerified({ blackJackVerifiedData }) {
    if (!blackJackVerifiedData) return null;

    const {
        dealerScore = blackJackVerifiedData.dealerScore || 0,
        playerScore = blackJackVerifiedData.playerScore || 0,
        dealerCards = blackJackVerifiedData.dealerCard || [],
        playerCards = blackJackVerifiedData.playerCard || [],
        bottomCards = blackJackVerifiedData.cards || [],
    } = blackJackVerifiedData;

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-full max-w-[420px] aspect-square p-6">

                {/* ================= TABLE OVAL (UNCHANGED) ================= */}
                <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 md:p-4">
                    <div
                        className="
            w-[55%] h-[75%]
            sm:w-[40%] sm:h-[70%]
            md:w-[60%] md:h-[75%]
            lg:w-[100%] lg:h-[60%]
            lg:min-h-[250px]
          "
                        style={{
                            borderRadius: "999px",
                            border: "3px solid #DDEFF866",
                            background: "transparent",
                        }}
                    />
                </div>

                {/* ================= DEALER ================= */}
                <div className="absolute top-1 sm:top-2 md:top-4 lg:top-[20px] left-1/2 -translate-x-1/2 flex flex-col items-center z-20">

                    {/* Dealer Score */}
                    <div className="px-4 py-1 mb-2 rounded bg-[#2C2C45] text-[#F4FFFB] text-sm sm:text-base font-semibold shadow-md">
                        {dealerScore}
                    </div>

                    {/* Dealer Cards (STEPPED, SAME AS ORIGINAL) */}
                    <div className="relative flex items-center justify-center h-[110px]">
                        <div
                            className="relative"
                            style={{
                                width: `${leftSpacing * (dealerCards.length - 1) + 3}rem`,
                                height: "110px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                position: "absolute",
                            }}
                        >
                            {dealerCards.map((card, i) => {
                                const img = CARD_IMAGE_MAP?.[card.suit]?.[card.rank];
                                if (!img) return null;

                                return (
                                    <div
                                        key={i}
                                        className="absolute"
                                        style={{
                                            left: `${i * leftSpacing}rem`,
                                            top: `${i * topSpacing}rem`,
                                            zIndex: i,
                                            width: CARD_WIDTH,
                                            height: CARD_HEIGHT,
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt="dealer card"
                                            width={56}
                                            height={80}
                                            draggable={false}
                                            className="w-full h-full object-contain"
                                            style={{
                                                boxShadow: "0 0 4px rgba(0,0,0,0.45)",
                                                borderRadius: "4px",
                                            }}
                                        />
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </div>

                {/* ================= CENTER TEXT (UNCHANGED COLORS) ================= */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    {/* <div className="bg-[#0e302c] text-[#94a59e] px-6 py-2 text-sm tracking-wide">
                    BLACKJACK PAYS 3 TO 2
                </div>
                <div className="text-[#94A59E] text-sm mt-2">
                    INSURANCE PAYS 2 TO 1
                </div> */}
                    <div className="
        px-[clamp(12px,3vw,28px)]
        py-[clamp(4px,1vw,10px)]
         text-[#94a59e]
        text-[clamp(10px,2vw,14px)]      /* responsive font */
        tracking-wide mx-auto
        ">
                        {/* rounded-tr-[20px] rounded-bl-[20px] */}
                        BLACKJACK PAYS 3 TO 2
                    </div>

                    <div className="
        px-[clamp(12px,3vw,28px)]
        py-[clamp(4px,1vw,10px)]
        text-[#94A59E]
        text-[clamp(10px,2vw,14px)]      /* responsive font */
        tracking-wide mx-auto
      ">
                        INSURANCE PAYS 2 TO 1
                    </div>
                </div>

                {/* ================= PLAYER ================= */}
                <div className="absolute bottom-[-4%] sm:bottom-[-2%] md:bottom-[2%] lg:bottom-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center z-20">

                    {/* Player Score */}
                    <div className="px-4 py-1 mb-2 rounded bg-[#2C2C45] text-[#F4FFFB] text-sm sm:text-base font-semibold shadow-md">
                        {playerScore}
                    </div>

                    {/* Player Cards (STEPPED, SAME AS ORIGINAL) */}
                    <div className="relative flex items-center justify-center h-[110px]">
                        <div
                            className="relative"
                            style={{
                                width: `${leftSpacing * (playerCards.length - 1) + 3}rem`,
                                height: "110px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                position: "absolute",
                            }}
                        >
                            {playerCards.map((card, i) => {
                                const img = CARD_IMAGE_MAP?.[card.suit]?.[card.rank];
                                if (!img) return null;

                                return (
                                    <div
                                        key={i}
                                        className="absolute"
                                        style={{
                                            left: `${i * leftSpacing}rem`,
                                            top: `${i * topSpacing}rem`,
                                            zIndex: i,
                                            width: CARD_WIDTH,
                                            height: CARD_HEIGHT,
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt="player card"
                                            width={56}
                                            height={80}
                                            draggable={false}
                                            className="w-full h-full object-contain"
                                            style={{
                                                boxShadow: "0 0 4px rgba(0,0,0,0.45)",
                                                borderRadius: "4px",
                                            }}
                                        />
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </div>



            </div>
            {/* ============= Bottom line cards =========================== */}
            <div className=" w-full max-w-[420px] flex items-center bottom-0 justify-around mb-4 ">
                {bottomCards.map((card, i) => {
                    const img = CARD_IMAGE_MAP?.[card.suit]?.[card.rank];

                    if (!img) return null;

                    return (
                        <div
                            key={i}
                            style={{
                                width: CARD_WIDTH,
                                height: CARD_HEIGHT,
                                borderRadius: "4px",
                            }}
                        >
                            <img
                                src={img}
                                alt={`${card.rank}${card.suit}`}
                                width={56}
                                height={80}
                                draggable={false}
                                className="w-full h-full object-contain"
                                style={{
                                    boxShadow: "0 0 4px rgba(0,0,0,0.45)",
                                    borderRadius: "4px",
                                }}
                            />
                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default BlackJackVerified;
