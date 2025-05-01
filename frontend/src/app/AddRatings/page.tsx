'use client';


import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";


// Interfaces for managing formats of data returned from backend and server side
interface gameSearch{
    id: number,
    name: string, 
    url: string,
    releaseDate : string,
    platforms : string[]
}

interface gameForReview{
    id : number,
    imgURL : string,
    name : string,
    releaseDate : number,
    description : string,
}

interface newReview{
    gameID:number, 
    rating:number,
}

const AddRatings = () => {

    // State variables used for holding data for this page
    const [gameName, setGameName] = useState('');
    const [gameData, setGameData] = useState<gameSearch[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [reviewGame, setReviewGame] = useState<gameForReview | null>();
    const [gameReview, setGameReview] = useState<newReview[]>([]);

    // Get user token in cookies and redirect to Login if no token - this is a protected page
    const token = Cookies.get('access_token');

    if(!token){
        redirect('/Login/');
    }

    // Function for fetching games based on what the user searched
    // Utilises the server side to get all of the data
    // If the server side created a response, it is iterated through and the date is formatted and then the rest of the data is formatted and pushed to a list
    // List is stored in a state variable to be used in the page below
    const fetchGames = async () => {

        if(!gameName){
            alert("Enter a game to search for");
            return;
        }

        try{
            const response = await fetch(`../api/FetchGames/?name=${encodeURIComponent(gameName)}`, {
                method:'GET',
            });
            
            const responseData = await response.json();
            // console.log(responseData);
            let editedData : Array<gameSearch>= []

            console.log(responseData);

            if (responseData && responseData.responseDataArray && Array.isArray(responseData.responseDataArray)) {

                for(let i : number = 0; i < responseData.responseDataArray.length; i++){

                    let releaseYearStr : string = "";

                    console.log("returned from FetchGames");
                    console.log(responseData.responseDataArray[i]);

                    if("releaseDate" in responseData.responseDataArray[i]){
                        const date = new Date(responseData.responseDataArray[i].releaseDate * 1000)
                        let releaseYear = date.getFullYear();
                        releaseYearStr = releaseYear.toString();
                    }
                    else{
                        releaseYearStr = "N/A";
                    }

                    let data = {
                        id: responseData.responseDataArray[i].id,
                        url: responseData.responseDataArray[i].url,
                        name: responseData.responseDataArray[i].name,
                        releaseDate: releaseYearStr,
                        platforms: responseData.responseDataArray[i].platforms,
                    }

                    console.log(data);

                    editedData.push(data);


                }
                setGameData(editedData);

            }

            
            setShowSearchResults(true);
        }

        catch(error){
            console.error("Error: ", error);
        }
    };

    // Function for fetching information about the selected game from the server side
    // The response data is formatted correctly and stored in a state variable
    // The unix date returned is changed into a format which is just the year
    const fetchSelectedGame = async (gameid : number) => {

        try{
            const response = await fetch(`../api/FetchImages/?id=${encodeURIComponent(gameid)}`, {
                method:'GET',
            });
            
            const responseData = await response.json();
            console.log(responseData);
            const date = new Date(responseData.game[0].first_release_date * 1000)
            const releaseYear = date.getFullYear();
            console.log(releaseYear);
            setReviewGame({
                id: responseData.game[0].id,
                imgURL: responseData.game[0].cover.url,
                name: responseData.game[0].name,
                releaseDate: releaseYear,
                description: responseData.game[0].summary,
            });
            console.log(reviewGame);
            setShowReview(true);
        }

        catch(error){
            console.error("Error: ", error);
        }
    };

    // Function for the user rating being sent to the backend
    // Format the data with the user appended
    // Send to the backend as a POST request
    const sendRatings = async () => {

        console.log(gameReview);

        const user = localStorage.getItem('user');

        const data = {
            user : user,
            ratings : gameReview,
        }

        const submit = await fetch('http://localhost:8000/api/addRatings/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),

        });

        // const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            setGameName('');
        }
        else{
            console.log(submit);
        }
    };

    // Function for converting the value of the star input into an integer to be sent to the backend
    // Format the data, with the id of the game and the rating parsed as an integer in base 10
    // Change it so search results are no longer displayed and call function above
    function saveRating(id: number): void {
        
        const rating = document.querySelector<HTMLInputElement>('input[name="rating-1"]:checked');

            if(rating){
                const newRating : newReview = {
                    gameID : id, 
                    rating : parseInt(rating.value, 10), 
                }

                setGameReview((prevReviews) => [...prevReviews, newRating]);
                setShowReview(false);
                setShowSearchResults(false);
                sendRatings();
            }
           
    };



    // HTML page 
    return(
        <div className="bg-black min-h-screen py-5 ">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100 hover:bg-gray-500 hover:text-cyan-400">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal text-gray-100">
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
                                <ul className="bg-base-100 rounded-t-none p-2 bg-gray-800">
                                    <li><Link href="/Profile/" className="hover:bg-gray-500 hover:text-cyan-400">Profile</Link></li>
                                    <li><Link href="/Logout/" className="hover:bg-gray-500 hover:text-cyan-400">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col justify-self-center items-start flex-wrap w-full max-w-screen-xl mx-auto">

            <h2 className="text-3xl text-gray-100 font-bold py-5">Add Game Ratings</h2>

            <div className="mockup-window p-4 mt-5 bg-gray-900 text-gray-100 bg-opacity-75 backdrop-blur-md w-full max-w-screen-xl mx-auto">
                <p className="pl-5">Add extra games here to your recommendation profile.</p>
                <p className="pl-5">The games you rate will improve and personalise your recommendations.</p>
                <p className="pl-5">For each game you search for, you will need to give it a 1-5 star rating.</p>
            </div>

            <div className="mt-5 w-full max-w-screen-xl mx-auto">
                <fieldset className="fieldset w-xs bg-gray-900 bg-opacity-75 backdrop-blur-md p-4 rounded-box">
                    <h3 className="text-xl font-bold pb-2 text-gray-100">Search for a game</h3>
                    <div className="join">
                        <input type="text" className="input join-item w-[25rem]" placeholder="Game Name" value={gameName} onChange={(e)=>setGameName(e.target.value)}/>
                        <button className="btn join-item hover:scale-[1.01] bg-cyan-400 text-gray-100" onClick={fetchGames}>Search</button>
                    </div>
                </fieldset>
            </div>

            {showSearchResults && (<ul className="list bg-gray-900 bg-opacity-75 backdrop-blur-md shadow-md rounded-box mt-5 w-full max-w-screen-xl mx-auto">
  
                <li className="p-4 pb-2 text-md opacity-60 tracking-wide text-gray-100">Search Results</li>

                {gameData.map((games, index) => (
                
                    <li key={games.id} className="list-row flex items-center px-4 py-3 border-t border-black">
                        <div className="w-10 text-4xl font-thin opacity-30 tabular-nums text-white">{index+1}</div>
                        <div><img className="size-10 rounded-box" src={games.url}/></div>
                        <div className="flex-1 px-4">
                            <div className="text-gray-100">{games.name}</div>
                            <div className="text-xs uppercase font-semibold opacity-60 text-gray-100">{games.releaseDate}</div>
                            {games.platforms && games.platforms.length > 0 && (
                                <div className="text-xs opacity-70 text-gray-100">Platforms: {games.platforms.join(', ')}</div>
                            )}
                        </div>
                        <button className="btn btn-square btn-ghost hover:scale-[1.01] text-cyan-400" onClick={() => fetchSelectedGame(games.id)}>Select</button>
                    </li>
                ))}
            </ul>)}

            {showReview && (<div className="flex flex-row justify-center w-full max-w-screen-xl mx-auto">
                <div className="card lg:card-side bg-gray-900 bg-opacity-75 backdrop-blur-md shadow-xl transition-transform mt-5 mb-5">

                    
                    <figure className="w-[16rem] h-[22rem] flex-shrink-0">
                        <img src={reviewGame?.imgURL} alt="Img" className="object-cover w-full h-full"/>
                    </figure>
                    <div className="card-body">
                        <h2 className="card-title text-gray-100">{reviewGame?.name}</h2>
                        <p className="text-gray-300">Release Date: {reviewGame?.releaseDate}</p>
                        <p className="text-gray-300">{reviewGame?.description}</p>

                        <div className="rating">
                            <input type="radio" name="rating-1" value="1" className="mask mask-star bg-white" aria-label="1 star" />
                            <input type="radio" name="rating-1" value="2" className="mask mask-star bg-white" aria-label="2 star"  />
                            <input type="radio" name="rating-1" value="3" className="mask mask-star bg-white" aria-label="3 star" />
                            <input type="radio" name="rating-1" value="4" className="mask mask-star bg-white" aria-label="4 star" />
                            <input type="radio" name="rating-1" value="5" className="mask mask-star bg-white" aria-label="5 star" />
                        </div>

                        <div className="card-actions justify-end mt-4">
                            <button className="btn bg-cyan-400 hover:scale-[1.05] border-none text-black" onClick={() => reviewGame?.id && saveRating(reviewGame.id)}>Submit Rating</button>
                        </div>
                    </div>
                </div>
            </div>)}
            </div>
        </div>
    );
};

export default AddRatings;