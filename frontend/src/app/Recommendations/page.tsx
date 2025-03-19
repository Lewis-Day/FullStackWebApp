'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";


interface gameRecommendations{
    name: string,
    description: string, 
    imgURL: string,
}

const Recommendations = () => {

    const token = Cookies.get('access_token');

    if(!token){
        redirect('/Login/');
    }

    const [gameData, setGameData] = useState<gameRecommendations[]>([]);
    const [index, setIndex] = useState(0);

    const buttonPressBack = () => {
        if(index == 0){
            setIndex(gameData.length - 1);
        }
        else{
            setIndex(index - 1);
        }
        
    };

    const buttonPressForward = () => {
        if(index == gameData.length - 1){
            setIndex(0);
        }
        else{
            setIndex(index + 1);
        }
        
    };

    useEffect(() => {
    
        const fetchRecommendationInfo = async () => {

            try{
                const response = await fetch("/api/GameName", {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });

                if(response.status == 401){
                    redirect('/Login/')
                }
                const data = await response.json();
                console.log(data);

                const recommendationSet: gameRecommendations[] = [];
                for(let i = 0; i<data.gameName.length; i++){
                    recommendationSet.push({
                        name: data.gameName[i],
                        description: data.gameDescription[i],
                        imgURL: data.imgURL[i],

                    });
                }
                setGameData(recommendationSet);
            }

            catch(error){
                console.error("Error: ", error);
            }
        };

        fetchRecommendationInfo();
    
            
        }, []);

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
                            <Link href="/AddRatings/">Add Ratings</Link>
                        </li>

                        <li>
                            <details>
                                <summary>{localStorage.getItem('user')}</summary>
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

                    {gameData.length > 0 ? (
                        <>
                            <figure className="relative w-full h-[22rem] overflow-hidden">
                                <img
                                src={gameData[index].imgURL}
                                alt="Img" className="object-contain w-full h-[22rem]"/>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">{gameData[index].name}</h2>
                                <p>{gameData[index].description}</p>

                                <div>
                                    <p className="flex flex-row justify-end">{index + 1}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="skeleton h-[22rem] w-[16.5rem]"></div>
                    )}
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