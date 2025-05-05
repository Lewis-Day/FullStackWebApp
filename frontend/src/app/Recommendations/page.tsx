'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";

// Uses modified components from DaisyUI
// DaisyUI, “Components — Tailwind CSS Components,” daisyui.com. https://daisyui.com/components/ (accessed Feb. 18, 2025).


// Interfaces for formatting returned data
interface gameRecommendations{
    id : string,
    name: string,
    description: string, 
    imgURL: string,
    releaseDate: string,
    platforms: String[][],
}

interface wildCardGameRecommendations{
    id: string,
    name: string,
    description: string, 
    imgURL: string,
    releaseDate: string,
    platforms: string[],
}

const Recommendations = () => {


    // Token for user authentication
    const token = Cookies.get('access_token');

    if(!token){
        redirect('/Login/');
    }

    // State variables used
    const [gameData, setGameData] = useState<gameRecommendations[]>([]);
    const [wildcardData, setWildcardData] = useState<wildCardGameRecommendations[]>([]);
    const [wildCardStatus, setWildCardStatus] = useState(false);
    const [index, setIndex] = useState(0);

    // Function for changing the index of fetching the game for the carosel of game recommendations
    // Used for the back button
    const buttonPressBack = () => {
        if(index == 0){
            setIndex(gameData.length - 1);
        }
        else{
            setIndex(index - 1);
        }
        
    };

    // Function for changing the index of fetching the game for the carosel of game recommendations
    // Used for the forward button
    const buttonPressForward = () => {
        if(index == gameData.length - 1){
            setIndex(0);
        }
        else{
            setIndex(index + 1);
        }
        
    };


    // Function for fetching the wildcard recommendation
    // Data is fetched from the server side through GET request
    // When data is returned through response
    // Required data is formatted in interface format and pushed to a list
    // List is saved to state variable also boolean variable is changed for displaying the wildcard recommendation
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

            console.log(data);

            const wildcardSet: wildCardGameRecommendations[] = [];
            for(let i = 0; i<data.gameName.length; i++){
                console.log(data.imgURL[i])

                wildcardSet.push({
                    id: data.ids[i],
                    name: data.gameName[i],
                    description: data.gameDescription[i],
                    imgURL: data.imgURL[i],
                    releaseDate: data.releaseDate[i],
                    platforms : data.platformsRet,

                });             
            }
            console.log(wildcardSet);
            setWildcardData(wildcardSet);
            setWildCardStatus(true);
        }

        catch(error){
            console.error("Error: ", error);
        }
        
    }; 


    // Function for saving a recommendation
    // The game recommendation is sent to the backend through a POST request
    // User is alerted when their recommendation gets saved
    const saveRecommendation = async (index : number) => {
        
        try{
            const response = await fetch("http://localhost:8000/api/saveRecommendation/", {
                method:'POST',
                headers:{
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    gameid: gameData[index].id,
                    name : gameData[index].name,
                    release : gameData[index].releaseDate,
                    platforms : gameData[index].platforms.join(', '),
                }),
            });


            if(response.ok){
                alert("Saved Recommendation");
            }
            else{
                alert("Error saving recommendation");
            }
        }


    

        catch(error){
            console.error("Error: ", error);
            alert("An error happened...")
        }
        
    }; 

    // Function for saving a wildcard recommendation
    // The game recommendation is sent to the backend through a POST request
    // User is alerted when their recommendation gets saved
    const saveRecommendationWild = async () => {
        
        try{
            const response = await fetch("http://localhost:8000/api/saveRecommendation/", {
                method:'POST',
                headers:{
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    gameid: wildcardData[0].id,
                    name : wildcardData[0].name,
                    release : wildcardData[0].releaseDate,
                    platforms : wildcardData[0].platforms.join(', '),
                }),
            });


            if(response.ok){
                alert("Saved Recommendation");
            }
            else{
                alert("Error saving recommendation");
            }
        }


    

        catch(error){
            console.error("Error: ", error);
            alert("An error happened...")
        }
        
    }; 

    // Uses useEffect so recommendations are fetched on page load
    useEffect(() => {
    
        // Function for fetching the recommendations
        // Data is fetched from the server side through GET request
        // When data is returned through response
        // Required data is formatted in interface format and pushed to a list
        // List is saved to state variable 
        // If collaborative model needs retraining, user is notified
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
                        id : data.ids[i],
                        name: data.gameName[i],
                        description: data.gameDescription[i],
                        imgURL: data.imgURL[i],
                        releaseDate: data.releaseDate[i],
                        platforms: data.platforms[i],

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

    // HTML page
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
                            <Link href="/SavedRecommendations/" className="hover:bg-gray-500 hover:text-cyan-400">Saved Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/Social/" className="hover:bg-gray-500 hover:text-cyan-400">Social</Link>
                        </li>

                        <li>
                            <Link href="/Friends/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Friends</Link>
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
                                <div className="text-xs uppercase font-semibold opacity-60 text-gray-100">{gameData[index].releaseDate}</div>
                                {gameData[index].platforms && gameData[index].platforms.length > 0 && (
                                        <div className="text-xs opacity-70 text-gray-100">Platforms: {gameData[index].platforms.join(', ')}</div>
                                    )}
                                <p className="text-gray-100">{gameData[index].description}</p>

                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-cyan-400">{index + 1}</p>
                                    <button
                                        className="btn bg-cyan-400 text-white hover:bg-cyan-500 transition-colors"
                                        onClick={() => saveRecommendation(index)}
                                    >Save this Recommendation</button>
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

                    <div className="card lg:card-side bg-gray-800 bg-opacity-75 backdrop-blur-md shadow-xl w-[50rem] mt-5 hover:scale-[1.025] transition-transform mb-5">

                        {wildcardData.length > 0 ? (
                            <>
                                <figure className="relative w-[16.5rem] h-[22rem] overflow-hidden flex-shrink-0">
                                    <img
                                    src={wildcardData[0].imgURL}
                                    alt="Img" className="object-cover w-full h-full"/>
                                </figure>
                                <div className="card-body flex-grow">
                                    <h2 className="card-title text-gray-100">{wildcardData[0].name}</h2>
                                    <div className="text-xs uppercase font-semibold opacity-60 text-gray-100">{wildcardData[0].releaseDate}</div>
                                    {wildcardData[0].platforms && wildcardData[0].platforms.length > 0 && (
                                        <div className="text-xs opacity-70 text-gray-100">Platforms: {wildcardData[0].platforms.join(', ')}</div>
                                    )}
                                    <p className="text-gray-100">{wildcardData[0].description}</p>

                                    <div className="flex justify-between items-center mt-4">
                                        <button
                                            className="btn bg-cyan-400 text-white hover:bg-cyan-500 transition-colors"
                                            onClick={() => saveRecommendationWild()}
                                        >Save this Recommendation</button>
                                    </div>
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