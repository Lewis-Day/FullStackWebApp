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


// Function for managing GET requests
// Function fetches the ID of the wildcard game from the backend 
// Uses lists to hold the data returned from IGDB API, which is called to fetch all the game data
// The URL that is returned for the images is built and modified to change t_thumb to t_cover_big so the correct image is fetched
// The release date is modified from UNIX time to just the year
// Platforms are fetched using the function above
// All required data is sent to the front end as JSON
export async function GET(request : Request) {


    const userToken = request.headers.get("Authorization");

    const token = await fetchToken();

    try{
        const wildcardRecommendation = await fetch("http://127.0.0.1:8000/api/wildcardRecommendation/", {
            method:'GET',
            headers:{
                Authorization: `${userToken}`,
            }

        });

        const wildcardValue = await wildcardRecommendation.json();

        console.log(wildcardValue);

        const wildcardID = wildcardValue.wildcard;

        const ids : String[] = []
        const imgURL : String[] = []
        const gameName : String[] = []
        const gameDescription : String[] = []
        const releaseDate : String[] = []
        // const platforms : string[] = []

        const response = await fetch("https://api.igdb.com/v4/games", {
            method: "POST", 
            headers: {
                'Accept': 'application/json', 
                'Client-ID': process.env.CLIENT_ID!, 
                'Authorization': 'Bearer ' + token,
            },
            body: `fields: id, cover.url, name, first_release_date, platforms, summary; where: id = ${wildcardID};`,
            
        });

        const url = await response.json();
        console.log(url);

        if(url[0].cover){

            const returnedURL = `https:${url[0].cover.url}`;
            const finalURL = returnedURL.replace("t_thumb", "t_cover_big");
            imgURL.push(finalURL);

        }
        gameName.push(url[0].name);
        gameDescription.push(url[0].summary);
        ids.push(url[0].id);


        let releaseYearStr : string = "";

        if("first_release_date" in url[0]){
            const date = new Date(url[0].first_release_date * 1000)
            let releaseYear = date.getFullYear();
            releaseYearStr = releaseYear.toString();
        }
        else{
            releaseYearStr = "N/A";
        }

        releaseDate.push(releaseYearStr);

        let platformsRet = await fetchPlatformNames(url[0].platforms);

        console.log(imgURL)
        console.log(gameName)
        console.log(gameDescription)
        console.log(platformsRet);

        console.log({imgURL, gameName, gameDescription, releaseDate})

        return NextResponse.json({ids, imgURL, gameName, gameDescription, releaseDate, platformsRet});
        
    }

    catch(error){
        console.error("Error: ", error);

        // TEMP
        return NextResponse.json({ error: "Internal server error" });
    }
};


