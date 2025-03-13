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

    const userToken = request.headers.get("Authorization");

    const token = await fetchToken();

    try{
        const gameRecommendations = await fetch("http://127.0.0.1:8000/api/recommendations/", {
            method:'GET',
            headers:{
                Authorization: `${userToken}`,
            }

        });

        const recommendations = await gameRecommendations.json();

        
        console.log(recommendations);

        const imgURL : String[] = []
        const gameName : String[] = []
        const gameDescription : String[] = []

        for(let i = 0; i<recommendations.length; i++){
            console.log(recommendations[i]);
        

            const response = await fetch("https://api.igdb.com/v4/games", {
                method: "POST", 
                headers: {
                    'Accept': 'application/json', 
                    'Client-ID': process.env.CLIENT_ID!, 
                    'Authorization': 'Bearer ' + token,
                },
                body: `fields: cover.url, name, summary; where: id = ${recommendations[i]};`,
                
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

        }
        console.log(imgURL)
        console.log(gameName)
        console.log(gameDescription)

        console.log({imgURL, gameName, gameDescription})

        return NextResponse.json({imgURL, gameName, gameDescription});
        
    }

    catch(error){
        console.error("Error: ", error);

        // TEMP
        return NextResponse.json({ error: "Internal server error" });
    }
};