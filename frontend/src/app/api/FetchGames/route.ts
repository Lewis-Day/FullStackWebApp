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

export async function GET(request : Request) {

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
            body: `fields id, name; search "${gameName}"; limit 5;`,
            
        });

        const games = await response.json();
        console.log(games);

        return NextResponse.json({games});
    }

    catch(error){
        console.error("Error: ", error);
    }
}

