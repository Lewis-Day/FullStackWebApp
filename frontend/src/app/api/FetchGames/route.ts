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

// Function to get the platform names from IGDB through API call
// The platforms provided as a list and the platform names are fetched individually
// The platforms have to be cast to a number to be able to be put into the API call
//  If no platform was returned, N/A is used instead
// List is returned back
const fetchPlatformNames = async (platforms : string[]) : Promise<string[] | null> => {
    
   
    const token = await fetchToken();

    let platNames : string[] = []

    try{

        for(let i = 0; i < platforms.length; i++){

            let intPlat : number = +platforms[i]

            const response = await fetch("https://api.igdb.com/v4/platforms", {
                method: "POST", 
                headers: {
                    'Accept': 'application/json', 
                    'Client-ID': process.env.CLIENT_ID!, 
                    'Authorization': 'Bearer ' + token,
                },
                body: `fields name; where id = ${intPlat};`,
                
            });

            const platforms_res = await response.json();
            console.log(platforms_res);

            for (let platform of platforms_res) {
                if (platform && platform.name) {
                    platNames.push(platform.name);
                }
                else{
                    platNames.push("N/A");
                }
            }
        }
    }

    catch(error){
        console.error("Error: ", error);
    }

    console.log(platNames);

    return platNames;
};


// Function for managing the get request
// Interface is used for prepping returned data ready for the front end
// Calls IGDB API to fetch game data using token got earlier and based on the name of the game
// Responses per game is prepped using the interface and pushed to a list, which is returned
export async function GET(request : Request) {

    interface gameSearch{
        id: number,
        name: string, 
        url: string,
        releaseDate : string,
        platforms : string[]
    }

    let responseDataArray : gameSearch[] = [];


    const token = await fetchToken();

    try{
        const { searchParams } = new URL(request.url);
        const gameName = searchParams.get("name");

        console.log(gameName)

        const response = await fetch("https://api.igdb.com/v4/games", {
            method: "POST", 
            headers: {
                'Accept': 'application/json', 
                'Client-ID': process.env.CLIENT_ID!, 
                'Authorization': 'Bearer ' + token,
            },
            body: `fields id, cover.url, name, first_release_date, platforms; search "${gameName}"; limit 10;`,
            
        });

        const games = await response.json();

        console.log(games);

        for(let i : number = 0; i < games.length; i++){
            let platforms = await fetchPlatformNames(games[i].platforms);

            let data = {
                id: games[i].id,
                url: games[i].cover.url,
                name: games[i].name,
                releaseDate: games[i].first_release_date,
                platforms: platforms || ["N/A"],
            }

            responseDataArray.push(data);
        }

        return NextResponse.json({responseDataArray});
    }

    catch(error){
        console.error("Error: ", error);
    }
}

