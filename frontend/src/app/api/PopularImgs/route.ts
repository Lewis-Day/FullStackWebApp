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
        const popGameResponse = await fetch("http://localhost:3000/api/Popularity/", {
            method:'GET',
        });

        // TEMP 
        if (!popGameResponse.ok) {
            throw new Error("Failed to fetch popularity score");
        }
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

        // TEMP
        return NextResponse.json({ error: "Internal server error" });
    }
};