'use client';

import Link from "next/link";
import { useState } from "react";

const gameRecommendations = [
    {name:'Game 1', info:'Info', imgURL:'https://images.igdb.com/igdb/image/upload/t_cover_big/co8ok7.jpg'},
    {name: 'Game 2', info:'Info', imgURL:'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg'},
    {name: 'Game 3', info:'Info', imgURL:'https://images.igdb.com/igdb/image/upload/t_cover_big/co8fu7.jpg'},
]

const Recommendations = () => {

    const [gameData, setGameData] = useState(gameRecommendations);
    const [index, setIndex] = useState(0);

    const buttonPressBack = () => {
        if(index == 0){
            setIndex(gameRecommendations.length - 1);
        }
        else{
            setIndex(index - 1);
        }
        
    };

    const buttonPressForward = () => {
        if(index == gameRecommendations.length - 1){
            setIndex(0);
        }
        else{
            setIndex(index + 1);
        }
        
    };

    return(
        <div className="bg-gray-700 h-screen w-full pt-5 ">
            <div className="navbar bg-white rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-black">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal text-black">
                        <li>
                            <Link href="/Recommendations/">Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/Social/">Social</Link>
                        </li>

                        <li>
                            <details>
                                <summary>Username</summary>
                                <ul className="bg-base-100 rounded-t-none p-2">
                                    <li><Link href="/Profile/">Profile</Link></li>
                                    <li><Link href="/Logout/">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>

            <h2 className="mx-28 text-3xl text-gray-100 font-bold py-5">Your Recommendations</h2>

            <div className="flex flex-col justify-self-center">

                <div className="card lg:card-side bg-base-100 shadow-xl w-[50rem] mt-5 hover:scale-[1.025] transition-transform">
                    <figure>
                        <img
                        src={gameData[index].imgURL}
                        alt="Album" />
                    </figure>
                    <div className="card-body">
                        <h2 className="card-title">{gameData[index].name}</h2>
                        <p>{gameData[index].info}</p>

                        <div>
                            <p className="flex flex-row justify-end">{index + 1}</p>
                        </div>
                    </div>

                    
                </div>

                <div className="join ml-[20rem] pt-5">
                    <button className="join-item btn hover:scale-[1.025] transition-transform" onClick={buttonPressBack}>«</button>
                    <button className="join-item btn" style={{pointerEvents:'none'}}>Game {index + 1}</button>
                    <button className="join-item btn hover:scale-[1.025] transition-transform" onClick={buttonPressForward}>»</button>
                </div>
            </div>
        </div>
    );
    
};

export default Recommendations;