import { NextApiRequest, NextApiResponse } from "next";
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

export async function GET() {

    const token = await fetchToken();

    // TEMP
    if (!token) {
        return NextResponse.json({ error: "Failed to fetch access token" });
    }

    try{
        const response = await fetch("https://api.igdb.com/v4/popularity_primitives", {
            method: "POST", 
            headers: {
                'Accept': 'application/json', 
                'Client-ID': process.env.CLIENT_ID!, 
                'Authorization': 'Bearer ' + token,
            },
            body:'fields game_id,value,popularity_type; sort value desc; limit 20; where popularity_type = 3;',
        });

        // TEMP 
        if (!response.ok) {
            throw new Error("Failed to fetch popularity score");
        }
        const data = await response.json();
        return NextResponse.json(data);
    }

    catch(error){
        console.error("Error: ", error);

        // TEMP
        return NextResponse.json({ error: "Internal server error" });
    }
};