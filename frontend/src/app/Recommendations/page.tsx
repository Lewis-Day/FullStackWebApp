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
    const [wildcardData, setWildcardData] = useState<gameRecommendations[]>([]);
    const [wildCardStatus, setWildCardStatus] = useState(false);
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

    const fetchWildCard = async () => {
        
        try{
            const response = await fetch("../api/Wildcard/", {
                method:'GET',
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            });

            if(response.status == 401){
                redirect('/Login/')
            }
            const data = await response.json();

            const wildcardSet: gameRecommendations[] = [];
            for(let i = 0; i<data.gameName.length; i++){
                console.log(data.imgURL[i])
                wildcardSet.push({
                    name: data.gameName[i],
                    description: data.gameDescription[i],
                    imgURL: data.imgURL[i],

                });
            }
            setWildcardData(wildcardSet);
            setWildCardStatus(true);
        }

        catch(error){
            console.error("Error: ", error);
        }
        
    }; 

    useEffect(() => {
    
        const fetchRecommendationInfo = async () => {

            try{
                const response = await fetch("../api/GameName/", {
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

                const retrain = data.retrain;

                if(retrain){
                    alert('Please wait for admin to retrain model to get your new recommendations.');
                }

                const recommendationSet: gameRecommendations[] = [];
                for(let i = 0; i<data.gameName.length; i++){
                    console.log(data.imgURL[i])
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
        <div className="bg-black min-h-screen w-full pt-5 ">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100 hover:bg-gray-500 hover:text-cyan-400">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal px-1 text-gray-100">
                        <li>
                            <Link href="/Recommendations/" className="hover:bg-gray-500 hover:text-cyan-400">Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/Social/" className="hover:bg-gray-500 hover:text-cyan-400">Social</Link>
                        </li>

                        <li>
                            <Link href="/AddRatings/" className="hover:bg-gray-500 hover:text-cyan-400">Add Ratings</Link>
                        </li>

                        <li>
                            <details>
                                <summary>{localStorage.getItem('user')}</summary>
                                <ul className="bg-gray-800 rounded-t-none p-2">
                                    <li><Link href="/Profile/" className="hover:bg-gray-500 hover:text-cyan-400">Profile</Link></li>
                                    <li><Link href="/Logout/" className="hover:bg-gray-500 hover:text-cyan-400">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>

            

            <div className="flex flex-col justify-self-center items-start flex-wrap">

                <h2 className=" text-3xl text-gray-100 font-bold py-5">Your Recommendations</h2>

                <div className="card lg:card-side bg-gray-800 bg-opacity-75 backdrop-blur-md shadow-xl w-[50rem] mt-5 hover:scale-[1.025] transition-transform">

                    {gameData.length > 0 ? (
                        <>
                            <figure className="relative w-[16.5rem] h-[22rem] overflow-hidden flex-shrink-0">
                                <img
                                src={gameData[index].imgURL}
                                alt="Img" className="object-cover w-full h-full"/>
                            </figure>
                            <div className="card-body flex-grow">
                                <h2 className="card-title text-gray-100">{gameData[index].name}</h2>
                                <p className="text-gray-100">{gameData[index].description}</p>

                                <div>
                                    <p className="flex flex-row justify-end text-cyan-400">{index + 1}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="skeleton h-[22rem] w-[16.5rem]"></div>
                    )}
                </div>

                <div className="join ml-[20rem] pt-5">
                    <button className="join-item btn hover:scale-[1.025] transition-transform bg-gray-800 text-cyan-400 bg-opacity-75 backdrop-blur-md" onClick={buttonPressBack}>«</button>
                    <button className="join-item btn  bg-gray-800 text-cyan-400 bg-opacity-75 backdrop-blur-md" style={{pointerEvents:'none'}}>Game {index + 1}</button>
                    <button className="join-item btn hover:scale-[1.025] transition-transform bg-gray-800 text-cyan-400 bg-opacity-75 backdrop-blur-md" onClick={buttonPressForward}>»</button>
                </div>

                <div className="mt-10 w-full flex justify-center">
                    <button
                            className={"btn bg-cyan-400 text-gray-900 hover:bg-cyan-500 hover:text-gray-100 transition-colors"}
                            onClick={fetchWildCard}>
                            Generate Wildcard Recommendation
                    </button>
                </div>

                {wildCardStatus && (

                    <div className="card lg:card-side bg-gray-800 bg-opacity-75 backdrop-blur-md shadow-xl w-[50rem] mt-5 hover:scale-[1.025] transition-transform">

                        {wildcardData.length > 0 ? (
                            <>
                                <figure className="relative w-[16.5rem] h-[22rem] overflow-hidden flex-shrink-0">
                                    <img
                                    src={wildcardData[index].imgURL}
                                    alt="Img" className="object-cover w-full h-full"/>
                                </figure>
                                <div className="card-body flex-grow">
                                    <h2 className="card-title text-gray-100">{wildcardData[index].name}</h2>
                                    <p className="text-gray-100">{wildcardData[index].description}</p>
                                {/* 
                                    <div>
                                        <p className="flex flex-row justify-end text-cyan-400">{index + 1}</p>
                                    </div> */}
                                </div>
                            </>
                        ) : (
                            <div className="skeleton h-[22rem] w-[16.5rem]"></div>
                        )}
                    </div>
                )}
            </div>

            
        </div>
    );
    
};

export default Recommendations;