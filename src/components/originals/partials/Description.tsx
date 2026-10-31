// @ts-nocheck
// Ported from Win-Win-user/src/pages/Originals/components/Description.jsx. Original types/imports preserved; adapted for rlk-frontend.
import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { FaRegStar, FaStar } from "react-icons/fa";

import { useAuth } from "@/lib/originalsAuthBridge";
import { toggleFavoriteService } from "@/services/originalsFavorites";
import DOMPurify from "dompurify";
// import "react-quill/dist/quill.snow.css";

function Description({ gameData, setisFavorite, isFavorite }) {
    console.log('gameData in description', gameData)
    const { user, fetchUser } = useAuth();

    // const [isFavorite, setisFavorite] = useState(user?.favorites?.some(id => String(id) == String(gameData?.slug)));

    // Toggle favorite
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



    return (

//         <div className="flex flex-col md:flex-row gap-2 w-full bg-[#161534] p-4 rounded-lg mt-4">
// {/* Image section */}
//             <div className="flex flex-col gap-2 md:flex-[0_0_25%] lg:flex-[0_0_25%]">

//                 {/* Game Image */}
//                 <img
//                     src={gameData?.image}
//                     alt="current-game"
//                     className="h-[210px] w-[180px]  rounded-md object-cover"
//                 />

//                 <div className="flex  justify-between w-full border-t border-[#31ABE8] pt-1">

//                     {/* Provider */}
//                     <div className="flex items-center gap-2">

//                         <img
//                             src="https://d2ieeeq1rrpn3v.cloudfront.net/win-win-logo.gif"
//                             alt="app-icon"
//                             className="w-[35px]  object-contain"
//                         />

//                         <span className="text-sm text-white font-medium">
//                             {gameData?.provider || "Win Win Originals"}
//                         </span>

//                     </div>
//                     {/* Favorite */}
//                     <div className="flex items-center" >

//                         <IconButton
//                             onClick={() => toggleFav(gameData?.slug)}
//                             size="small"

//                             sx={{
//                                 padding: 0,
//                                 color: isFavorite ? "#FFD700" : "#94a59e",

//                                 "&:hover": {
//                                     color: isFavorite ? "#FFA500" : "#ffffff",
//                                 },
//                             }}
//                         >
//                             {isFavorite ? (
//                                 <FaStar className="text-[20px]" />
//                             ) : (
//                                 <FaRegStar className="text-[20px]" />
//                             )}
//                         </IconButton>

//                     </div>

//                 </div>
//                 {/* <div className="text-lg font-medium  text-white">{gameData?.name}</div> */}
//             </div>
//             {/* discription */}
//             <div>
//                 <h3 className="text-white">{gameData?.title}</h3>
//                 <div
//                     className="text-justify leading-7 text-[#94a59e] mt-2 text-sm ql-editor"
//                     dangerouslySetInnerHTML={{
//                         __html: DOMPurify.sanitize(gameData?.description),
//                     }}
//                 />
//             </div>

//         </div>
<div className="w-full bg-[#161534] p-4 rounded-lg mt-4 overflow-hidden">
    <div className="float-left mr-4 mb-2 md:flex-[0_0_25%] lg:flex-[0_0_25%]">
        <img
            src={gameData?.image}
            alt="current-game"
            className="h-[250px] w-[180px] rounded-md object-cover"
        />
        <div className="flex justify-between w-full border-t border-[#31ABE8] pt-1 mt-2">
            {/* Provider and favorite buttons remain the same */}
            <div className="flex items-center gap-2">
                <img
                    src="https://d2ieeeq1rrpn3v.cloudfront.net/win-win-logo.gif"
                    alt="app-icon"
                    className="w-[35px] object-contain"
                />
                <span className="text-sm text-white font-medium">
                    {gameData?.provider || "Win Win Originals"}
                </span>
            </div>
            <div className="flex items-center ml-2">
                <IconButton
                    onClick={() => toggleFav(gameData?.slug)}
                    size="small"
                    sx={{
                        padding: 0,
                        color: isFavorite ? "#FFD700" : "#94a59e",
                        "&:hover": {
                            color: isFavorite ? "#FFA500" : "#ffffff",
                        },
                    }}
                >
                    {isFavorite ? (
                        <FaStar className="text-[20px]" />
                    ) : (
                        <FaRegStar className="text-[20px]" />
                    )}
                </IconButton>
            </div>
        </div>
    </div>
    
    <h3 className="text-white">{gameData?.title}</h3>
    <div
        className="prose prose-invert max-w-none"
        // className="text-justify leading-7 text-[#94a59e] text-sm ql-editor"
        dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(gameData?.description),
        }}
    />
</div>
    );
}

export default Description;