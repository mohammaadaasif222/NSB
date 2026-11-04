// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/fairnessVerifiedGames/DiceVerified.jsx. Original types/imports preserved; adapted for rlk-frontend.
// "use client";

// import Image from "next/image";
const Hexgonnormal = "/assets/icons/hexgon-normal.png";
const Slider_Icon = "/assets/icons/slider_icon.png";

 function DiceVerified({ diceVerifiedData = 0 }) {
    const valueText = typeof diceVerifiedData === 'number' ? diceVerifiedData.toFixed(2) : diceVerifiedData;

    return (
        <div className="relative xl:top-[10px] w-full flex-grow flex flex-col justify-center items-center">

            {/* Scale numbers (top ticks) */}
            {/* <div className="w-[92%] px-4 flex justify-center rounded-sm">
                <div className="flex w-[97%] text-white text-xs mt-[-25px] relative">
                    {[0, 25, 50, 75, 100].map((n) => (
                        <div
                            key={n}
                            className="absolute bg-[#005950] w-[1px] h-[16px] rounded-sm"
                            style={{ left: `${n}%`, transform: "translateX(-50%)" }}
                        />
                    ))}
                </div>
            </div> */}

            {/* Track */}
            <div className="w-[92%] flex justify-center bg-[#FFFFFF1A]  shadow-[0_0_15px_rgba(255,255,255,0.25)] rounded-full py-4 px-4">
                {/* <div className="w-full flex justify-center bg-[#0e302c] rounded-full py-3"> */}
                    <div className="relative w-[97%] h-2 rounded-full bg-[#0BF191]">

                        {/* HEXAGON (UNCHANGED UI, STATIC POSITION) */}
                        <div
                            className="absolute top-[-45px] -translate-y-1/2 -translate-x-1/2"
                            style={{
                                left: `${diceVerifiedData}%`,
                                opacity: 1,
                                transform: "translateY(-50%) translateX(-50%) scale(1)",
                            }}
                        >
                            <img
                                width={100}
                                height={100}
                                src={Hexgonnormal}
                                alt="Hexagon"
                                className="block w-12 sm:w-12 md:w-14 lg:w-18 !max-w-none !min-w-full"
                            />

                            <div className="absolute inset-0 flex items-center justify-center text-black font-bold">
                                <h4 className="text-sm sm:text-base md:text-md lg:text-md">{valueText}</h4>
                            </div>
                        </div>

                        {/* SLIDER HANDLE (UNCHANGED UI, STATIC POSITION) */}
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20" style={{ left: `0%` }}>
                            <img
                                src={Slider_Icon}
                                alt="Slider handle"
                                className="w-8 h-5"
                                width={100}
                                height={100}
                                draggable={false}
                            />

                            {/* Tooltip */}
                            <div className="absolute left-1/2 top-[150%] -translate-x-1/2 bg-[#281F4D] text-white text-[11px] font-semibold px-2 py-[3px] rounded-md shadow-md border border-[#7468b2]">
                                0.00
                            </div>

                            {/* Arrow */}
                            <div className="absolute left-1/2 top-[118%] -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#281F4D]" />
                        </div>

                    </div>
                {/* </div> */}
            </div>

            {/* Bottom scale numbers */}
            <div className="w-[92%] px-4 flex justify-center rounded-sm ">
                <div className="flex w-[97%] text-white text-xs relative">
                    {[0, 25, 50, 75, 100].map((n) => (
                        <div
                            key={n}
                            className="absolute flex flex-col items-center"
                            style={{ left: `${n}%`, top: "-1px", transform: "translateX(-50%)" }}
                        >
                            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#32378BE0]" />
                            <span className="text-[12px] mt-1">{n}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
export default  DiceVerified;