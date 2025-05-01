import { NextResponse } from "next/server";

// Function to get token to allow access to the IGDB API
// Uses the client ID and secret from the .env file
const fetchToken = async () : Promise<string | null> => {

    try{
        const reponse = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers:{
                "Content-Type": "application/x-www-form-urlencoded" 
            },
            body: new URLSearchParams({
                'client_id' : process.env.CLIENT_ID!,
                'client_secret': process.env.SECRET!,
                'grant_type' : 'client_credentials',
            }),
        });

        const data = await reponse.json();
        return data.access_token;

    }
    catch(error){
        console.error("Error: ", error);
        return null;
    }

};

// Function to get the saved recommendations for the user from the backend
// For each game returned, the image is fetched using the ID of the game as this is not stored in the model
// The game data is prepared for the frontend in the interface format and pushed into an array, ready to be returned
export async function GET(request : Request) {

    interface SavedRecos {
        id : string,
        name: string,
        imgURL: string,
        releaseDate: string,
        platforms: string,
    }

    const userToken = request.headers.get("Authorization");

    const token = await fetchToken();

    try{
        const response = await fetch("http://localhost:8000/api/getSavedRecommendation/", {
            method:'GET',
            headers:{
                Authorization: `${userToken}`,
            }
        });

        const responseData = await response.json();
        console.log(responseData);

        let holdingArray : SavedRecos[] = [];

        for(let i = 0; i < responseData.length; i++){

            const responseImg = await fetch("https://api.igdb.com/v4/games", {
                method: "POST", 
                headers: {
                    'Accept': 'application/json', 
                    'Client-ID': process.env.CLIENT_ID!, 
                    'Authorization': 'Bearer ' + token,
                },
                body: `fields: cover.url; where: id = ${Number(responseData[i].id)};`,
                
            });
    
            const gameImg = await responseImg.json();

            console.log(gameImg);

            if(gameImg[0].cover){

                const returnedURL = `https:${gameImg[0].cover.url}`;
                const finalURL = returnedURL.replace("t_thumb", "t_cover_big");
                gameImg[0].cover.url = finalURL;
    
            }

            let data = {
                id : responseData[i].id, 
                name : responseData[i].name, 
                imgURL : gameImg[0].cover.url,
                releaseDate : responseData[i].release,
                platforms : responseData[i].platforms, 
            }

            holdingArray.push(data);
            

        }

        console.log(holdingArray);

        return NextResponse.json({holdingArray});
    }
    catch (error){
        console.error("Error fetching the saved recommendations ", error);
    }
}

