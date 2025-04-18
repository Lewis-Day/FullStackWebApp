import { NextResponse } from "next/server";



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

