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
// Function for fetching the top 20 games of popularity type 3 from IGDB API - games for the front page
// Fetches the id of the games which are popular
// Returns the JSON data
export async function GET() {

    const token = await fetchToken();

    if (!token) {
        return NextResponse.json({ error: "Failed to fetch IGDB token" });
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
        const data = await response.json();
        return NextResponse.json(data);
    }

    catch(error){
        console.error("Error: ", error);
        return NextResponse.json({ error: "Server error" });
    }
};