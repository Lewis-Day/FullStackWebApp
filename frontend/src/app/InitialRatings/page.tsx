'use client';


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface gameSearch{
    id: number,
    name: string, 
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

const InitialRatings = () => {

    const pageRouter = useRouter();
        

    const [gameName, setGameName] = useState('');
    const [gameData, setGameData] = useState<gameSearch[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [reviewGame, setReviewGame] = useState<gameForReview | null>();
    const [gameReview, setGameReview] = useState<newReview[]>([]);

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
            console.log(responseData.games);
            setGameData(responseData.games);

            console.log(gameData);
            setShowSearchResults(true);
        }

        catch(error){
            console.error("Error: ", error);
        }
    };

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

    const sendRatings = async () => {

        console.log(gameReview);

        const user = localStorage.getItem('user');

        const data = {
            user : user,
            ratings : gameReview,
        }

        const submit = await fetch('http://localhost:8000/api/initialRatings/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(data),

        });

        // const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            pageRouter.push('/Login/');
        }
        else{
            console.log(submit);
        }
    };

    function saveRating(id: number): void {

        if(gameReview.length == 5){
            sendRatings();
        }
        
        const rating = document.querySelector<HTMLInputElement>('input[name="rating-1"]:checked');

            const newRating : newReview = {
                gameID : id, 
                rating : parseInt(rating.value, 10), 
            }

            setGameReview((prevReviews) => [...prevReviews, newRating]);
            setShowReview(false);
            setShowSearchResults(false);
            setGameName('');
    }

    return(
        <div className="bg-gray-700 min-h-screen w-full py-5 ">
            <div className="navbar bg-white rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-black">VGR</Link>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 text-black">
                        <li>
                            <Link href="/Login">Login</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <h2 className="mx-[7.5rem] text-3xl text-gray-100 font-bold py-5">Initial Ratings</h2>

            <div className="mockup-window border-base-300 border mx-[7.5rem] max-w-screen-xl p-4 mt-5 bg-white text-black">
                <p className="text-xl font-bold pl-5">Welcome to VGR!</p>
                <p className="pl-5">Now that you have created your account, you need to rate some games!</p>
                <p className="pl-5">The games you rate will create your game recommedations.</p>
                <p className="pl-5">You will need to rate 5 games and for each game you search for, you will need to give it a 1-5 star rating.</p>
            </div>

            <div className="mx-[7.5rem] mt-5">
                <fieldset className="fieldset w-xs bg-white border border-base-300 p-4 rounded-box">
                    <h3 className="text-xl font-bold pb-2">Search for a game</h3>
                    <div className="join">
                        <input type="text" className="input join-item w-[25rem] border border-gray-300" placeholder="Game Name" value={gameName} onChange={(e)=>setGameName(e.target.value)}/>
                        <button className="btn join-item hover:scale-[1.01]" onClick={fetchGames}>Search</button>
                    </div>
                </fieldset>
            </div>

            {showSearchResults && (<ul className="list bg-white rounded-box shadow-md mx-[7.5rem] mt-5">
  
                <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Search Results</li>

                {gameData.map((games, index) => (
                
                    <li key={games.id} className="list-row flex items-center px-4 py-3 border-t border-base-200">
                        <div className="w-10 text-4xl font-thin opacity-30 tabular-nums">0{index+1}</div>
                        <div className="flex-1 px-4">
                            <div>{games.name}</div>
                        </div>
                        <button className="btn btn-square btn-ghost hover:scale-[1.01]" onClick={() => fetchSelectedGame(games.id)}>Select</button>
                    </li>
                ))}
            </ul>)}

            {showReview && (<div className="flex flex-row justify-center">
                <div className="card lg:card-side bg-white shadow-xl w-[50rem] transition-transform mt-5 mb-5">

                    
                    <figure className="w-[16rem] h-[22rem] flex-shrink-0">
                        <img src={reviewGame?.imgURL} alt="Img" className="object-cover w-full h-full"/>
                    </figure>
                    <div className="card-body">
                        <h2 className="card-title">{reviewGame?.name}</h2>
                        <p className="text-gray-600">Release Date: {reviewGame?.releaseDate}</p>
                        <p className="text-gray-600">{reviewGame?.description}</p>

                        <div className="rating">
                            <input type="radio" name="rating-1" value="1" className="mask mask-star" aria-label="1 star" />
                            <input type="radio" name="rating-1" value="2" className="mask mask-star" aria-label="2 star" />
                            <input type="radio" name="rating-1" value="3" className="mask mask-star" aria-label="3 star" />
                            <input type="radio" name="rating-1" value="4" className="mask mask-star" aria-label="4 star" />
                            <input type="radio" name="rating-1" value="5" className="mask mask-star" aria-label="5 star" />
                        </div>

                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-primary hover:scale-[1.01]" onClick={() => saveRating(reviewGame?.id)}>Submit Rating</button>
                        </div>
                    </div>
                </div>
            </div>)}
        </div>
    );
};

export default InitialRatings;