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

// Function for managing GET requests
// Function for getting the id's of the popular games on IGDB to be displayed on the front page
// Uses the file /Popularity to get the game info and this fetches the images - the id of the game
// When the images are fetched, a URL is returned
// The URL is formatted and t_thumb is replaced with t_cover_big to ensure the large cover image is used for better image quality
// The URL of the image is returned
export async function GET() {

    const token = await fetchToken();

    if (!token) {
        return NextResponse.json({ error: "Failed to fetch IGDB token" });
    }

    try{
        const popGameResponse = await fetch("http://localhost:3000/api/Popularity/", {
            method:'GET',
        });

        const gameData = await popGameResponse.json();

        console.log(gameData);

        const gameIDs: string[] = gameData.map((game: { game_id: string }) => game.game_id);
        console.log("GameIDs: ", gameIDs);

        
        const imgURL : String[] = []

        for(const gameID of gameIDs){
            const response = await fetch("https://api.igdb.com/v4/games", {
                method: "POST", 
                headers: {
                    'Accept': 'application/json', 
                    'Client-ID': process.env.CLIENT_ID!, 
                    'Authorization': 'Bearer ' + token,
                },
                body: `fields: cover.url; where: id = ${gameID};`,
                
            });

            const url = await response.json();
            console.log(url);

            if(url[0].cover){

                const returnedURL = `https:${url[0].cover.url}`;
                const finalURL = returnedURL.replace("t_thumb", "t_cover_big");
                imgURL.push(finalURL);

            }


        }

        console.log(imgURL);

        return NextResponse.json({imgURL});
    }

    catch(error){
        console.error("Error: ", error);
        return NextResponse.json({ error: "Server error" });
    }
};