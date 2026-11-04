// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/components/FairnessModal.jsx. Original types/imports preserved; adapted for rlk-frontend.
// "use client";

import { use, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Scale, Copy, ChevronDown, ChevronUp, ChevronDown as ChevronDownIcon } from "lucide-react";
const CopyIcon = "/assets/img/copyIcon.png";
// import Image from "next/image";
import BlackJackVerified from "../fairnessVerifiedGames/BlackJackVerified";
import MinesVerified from "../fairnessVerifiedGames/MinesVerified";
import DiceVerified from "../fairnessVerifiedGames/DiceVerified";
import PlinkoVerified from "../fairnessVerifiedGames/PlinkoVerified";
function FairnessModal({ showFairness, setShowFairness, socket, userId }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const [clientSeed, setClientSeed] = useState("40906f9ef6f186a3");
    const [serverSeed, setServerSeed] = useState("dSc27d74c6b341f17ecdc89d4c24ded4d2a6713e1242a448...");
    const [ActiveclientSeed, setActiveClientSeed] = useState("40906f9ef6f186a3");
    const [ActiveserverSeed, setActiveServerSeed] = useState("dSc27d74c6b341f17ecdc89d4c24ded4d2a6713e1242a448...");
    const [totalBets, setTotalBets] = useState(165);
    const [newClientSeed, setNewClientSeed] = useState("BS0uG-JRzJ");
    const [nonce, setNonce] = useState(0);
    const [Activenonce, setActiveNonce] = useState(0);
    const [selectedGame, setSelectedGame] = useState("Select Game");
    const [blackJackVerifiedData, setBlackJackVerifiedData] = useState({});
    const [minesVerifiedData, setMinesVerifiedData] = useState([]);
    const [diceVerifiedData, setDiceVerifiedData] = useState(0);
    const [plinkoVerifiedData, setPlinkoVerifiedData] = useState(0);
    // const [unfinishedGames, setUnfinishedGames] = useState(["Blackjack"]);
    const [loading, setloading] = useState(true);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const incrementNonce = () => setNonce(prev => prev + 1);
    const decrementNonce = () => setNonce(prev => Math.max(0, prev - 1));


    useEffect(() => {
        if (socket) {
            socket.on("server_seeds", (data) => {
                setloading(false);
                setActiveNonce(data?.nonce);
                setActiveServerSeed(data?.serverSeedHash);
                setActiveClientSeed(data?.clientSeed);
                setTotalBets(data?.nonce);
                // setUnfinishedGames(data?.unfinishedGames);
                setNewClientSeed(data?.nextClientSeed)
            });

            socket.on('game_round_verified', (data) => {
                console.log("Received game_round_verified:", data);
                setMinesVerifiedData(data?.board || []);
                setDiceVerifiedData(data?.number || 0);
                setPlinkoVerifiedData(data?.finalBin?.multiplier || 0);
                setBlackJackVerifiedData(data);
                setloading(false);
                // Handle the verified game round data as needed
            });

            return () => {
                socket.off("server_seeds");
                socket.off("game_round_verified");
            };
        }
    }, [socket, userId]);

    useEffect(() => {
        if (socket) {
            setloading(true);
            // playerId intentionally omitted: server derives it from JWT.
            socket.emit("get_server");
        }
    }, [socket, userId, showFairness]);
    const changeSeed = () => {
        if (socket) {
            setloading(true);
            // playerId intentionally omitted: server derives it from JWT.
            socket.emit("update_client_seed", { newClientSeed });
        }
    }
    if (!showFairness) return null;

    const handleVerify = () => {
        if (!socket) return;
        if (!clientSeed || !serverSeed || nonce < 0) return;
        setloading(true);
        // playerId intentionally omitted: server derives it from JWT.
        const requestData = {
            gameName: selectedGame,
            clientSeed: clientSeed,
            serverSeed: serverSeed,
            nonce: nonce,
        };
        socket.emit("verify_game_round", requestData);
    }
    return createPortal(
        <div className="fixed inset-0 bg-black/60 flex h-full items-center justify-center z-[1000] isolate px-4">
            <div
                className="rl-liquid-glow bg-[#18181A]/95 rounded-2xl w-full max-w-2xl no-scrollbar relative overflow-y-auto max-h-[50vh] lg:max-h-[70vh]"
                style={{
                    boxShadow:
                        '0 20px 40px rgba(0,0,0,0.55), 0 10px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)',
                }}
            >
                {/* Header */}
                <div
                    className="flex bg-[#18181A] items-center sticky top-0 z-50 py-4 px-4 justify-between mb-6 border-b border-white/[0.06]"
                                    >
                    <div className="flex items-center space-x-3">
                        <Scale className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">Fairness</h2>
                    </div>
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowFairness(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Tabs — flat pill segmented control (Mines/Dice match) */}
                <div className="px-5">
                    <div className="flex items-center gap-1 bg-[#18181A] rounded-full p-1 border border-white/[0.06] mb-6">
                        {["Overview", "Seeds", "Verify"].map((tab, index) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    aria-pressed={isActive}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors focus:outline-none cursor-pointer
                                        ${isActive
                                            ? 'bg-[#333333] text-white border border-white/[0.08]'
                                            : 'bg-transparent text-gray-400 hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content based on active tab */}
                {activeTab === "Overview" && (
                    <div className="space-y-6 pb-6 px-4 sm:px-6 md:px-8">
                        {/* Active Client Seed */}
                        <div className="text-[#f4fffb] mt-2">
                            <p className="text-base sm:text-lg md:text-xl font-semibold">
                                Solving the Trust Issue with Online Games
                            </p>
                        </div>

                        <div className="text-[#94a59e] space-y-4">
                            <p className="text-sm sm:text-base leading-relaxed text-justify">
                                The underlying concept of provable fairness is that players have the ability
                                to prove and verify that their results are fair and unmanipulated. This is
                                achieved through the use of a commitment scheme along with cryptographic hashing.
                            </p>

                            <p className="text-sm sm:text-base leading-relaxed text-justify">
                                The commitment scheme is used to ensure that the player has an influence on all
                                results generated. Cryptographic hashing is used to ensure that the casino also
                                remains honest to this commitment scheme. Both concepts combined create a trust-less
                                environment when Game  online.
                            </p>
                        </div>
                    </div>
                )}


                {activeTab === "Seeds" && (
                    <div className="space-y-6 pb-4 px-5">
                        {/* Active Client Seed */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white mb-2">Active Client Seed</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={ActiveclientSeed}
                                    readOnly
                                                                        className="w-full bg-[#18181A] rounded-full px-4 py-3 pr-10 text-white text-sm outline-none focus:ring-2 focus:ring-[#F9D028]"
                                    placeholder="Enter client seed"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCopy(ActiveclientSeed)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {/* <Copy className="w-4 h-4 text-[#94A59E]" strokeWidth={1} fill="currentColor" /> */}
                                    <img src={CopyIcon} height={5} width={5} alt="Watermark" className="h-5 w-5 "
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Section title */}
                        <div className="text-center  text-white ">Rotate Seed Pair</div>

                        {/* New Client Seed + Change (moved above server seed) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">New Client Seed</label>
                            <div
                                className="flex gap-2 rounded-full p-1 bg-[#18181A] transition-colors"
                                                            >
                                <input
                                    type="text"
                                    value={newClientSeed}
                                    onChange={(e) => setNewClientSeed(e.target.value)}
                                    placeholder="Enter new client seed"
                                    className="flex-1 bg-transparent px-4 py-2 text-white text-sm border-none outline-none focus:outline-none focus:ring-0"
                                />

                                <button
                                    type="button"
                                    onClick={() => changeSeed()}
                                    className="px-4 py-2 rounded-full text-black text-sm font-semibold bg-[#F9D028] hover:brightness-110 transition"
                                >
                                    Change
                                </button>
                            </div>

                        </div>

                        {/* Active Server Seed (Hashed) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Active Server Seed (Hashed)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={ActiveserverSeed}
                                    readOnly
                                                                        className="w-full bg-[#18181A] rounded-full px-4 py-3 pr-10 text-white text-sm outline-none focus:ring-2 focus:ring-[#F9D028]"
                                    placeholder="Active server seed (hashed)"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCopy(ActiveserverSeed)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <img src={CopyIcon} height={5} width={5} alt="Watermark" className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Total Bets made with pair */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Total Bets made with pair</label>
                            <input
                                type="number"
                                value={totalBets}
                                readOnly
                                                                className="w-full bg-[#18181A] rounded-full px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#F9D028]"
                                placeholder="0"
                            />
                        </div>


                        {/* Rotate Seed Pair info notice */}
                        <div className="text-xs sm:text-sm text-gray-400">
                            You need to finish the following game(s) before you can rotate your seed pair
                        </div>
                    </div>
                )}

                {activeTab === "Verify" && (
                    <div className="space-y-6 pb-4 px-5">
                        {/* Results Area */}
                        <div className="relative min-h-[200px] flex items-center justify-center">
                            {/* Dashed Border */}
                            <svg
                                className="absolute inset-0 w-full h-full"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    x="1"
                                    y="1"
                                    width="calc(100% - 2px)"
                                    height="calc(100% - 2px)"
                                    rx="12"
                                    ry="12"
                                    fill="none"
                                    stroke="#F9D028"
                                    strokeWidth="2"
                                    strokeDasharray="18 12"
                                />
                            </svg>

                            {/* Content */}
                            {/* Grid Content */}

                            {loading ? (
                                <div
                                    className="relative bg-[#18181A] rounded-full p-6 text-center border border-black/30"
                                                                    >
                                    <p className="text-gray-400">Loading...</p>
                                </div>
                            ) : (selectedGame === "Blackjack" && blackJackVerifiedData ? (
                                <BlackJackVerified blackJackVerifiedData={blackJackVerifiedData} />
                            ) :
                                selectedGame === "Mines" && minesVerifiedData.length > 0 ? (
                                    <MinesVerified minesVerifiedData={minesVerifiedData} />
                                ) : selectedGame === "Dice" && diceVerifiedData ? (
                                    <DiceVerified diceVerifiedData={diceVerifiedData} />
                                ) : selectedGame === "Plinko" && plinkoVerifiedData ? (
                                    <PlinkoVerified plinkoVerifiedData={plinkoVerifiedData} />
                                ) : (
                                    <div
                                        className="relative bg-[#18181A] rounded-full p-4 text-center border border-black/30"
                                                                            >
                                        <p className="text-white">More inputs are required to verify result</p>
                                    </div>
                                )
                            )}
                        </div>



                        {/* Verification Form */}
                        <div className=" rounded-full ">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white mb-2">Game</label>
                                <div className="relative">
                                    <select
                                        value={selectedGame}
                                        onChange={(e) => setSelectedGame(e.target.value)}
                                                                                className="w-full bg-[#18181A] rounded-full px-4 py-3 text-white text-sm appearance-none outline-none focus:ring-2 focus:ring-[#F9D028]"
                                    >
                                        <option value="Select Game" disabled>Select Game</option>
                                        <option value="Blackjack">Blackjack</option>
                                        <option value="CoinFlip">CoinFlip</option>
                                        <option value="Plinko">Plinko</option>
                                        <option value="Dice">Dice</option>
                                        <option value="Mines">Mines</option>
                                        <option value="Crash">Crash</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                            </div>

                            {/* Client Seed */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white mb-2">Client Seed</label>
                                <input
                                    type="text"
                                    value={clientSeed}
                                    onChange={(e) => setClientSeed(e.target.value)}
                                                                        className="w-full bg-[#18181A] rounded-full px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#F9D028]"
                                    placeholder="Enter client seed"
                                />
                            </div>

                            {/* Server Seed */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white mb-2">Server Seed</label>
                                <input
                                    type="text"
                                    value={serverSeed}
                                    onChange={(e) => setServerSeed(e.target.value)}
                                                                        className="w-full bg-[#18181A] rounded-full px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#F9D028]"
                                    placeholder="Enter server seed"
                                />
                            </div>

                            {/* Nonce */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-white mb-2">Nonce</label>
                                <div
                                    className="flex items-center space-x-2 p-1 rounded-full bg-[#18181A] transition-colors border border-black/30"
                                                                    >
                                    <input
                                        type="number"
                                        value={nonce}
                                        onChange={(e) => setNonce(parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="flex-1 bg-transparent px-4 py-2 text-white text-sm outline-none border-none focus:outline-none focus:ring-0"
                                    />

                                    <div className="flex flex-row space-x-1">
                                        <button
                                            onClick={incrementNonce}
                                            className="p-2 text-gray-300 rounded-full bg-[#262628] hover:bg-[#333333] hover:text-white transition"
                                            type="button"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={decrementNonce}
                                            className="p-2 text-gray-300 rounded-full bg-[#262628] hover:bg-[#333333] hover:text-white transition"
                                            type="button"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <button
                                onClick={handleVerify}
                                className="w-full text-black py-3 rounded-full font-semibold bg-[#F9D028] hover:brightness-110 transition"
                            >
                                Verify Result
                            </button>
                        </div>


                    </div>
                )}
            </div>
        </div >,
        document.body
    );
}

export default FairnessModal;
