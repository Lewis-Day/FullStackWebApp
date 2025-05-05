'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";

// Uses modified components from DaisyUI
// DaisyUI, “Components — Tailwind CSS Components,” daisyui.com. https://daisyui.com/components/ (accessed Feb. 18, 2025).


// Interfaces for managing and formatting returned data
interface userInfo{
    username: string,
    email: string, 
    firstName: string,
    lastName: string, 
    dob: string,
}

interface gameSearch{
    id: number,
    name: string, 
    url: string,
    releaseDate : string,
    platforms : string[]
}

var currentUsername:string;

const Profile = () => {

    // Used for user authentication
    const token = Cookies.get('access_token');
    let loggedInUser = localStorage.getItem('user');

    // State variables used
    const [gameName, setGameName] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [gameData, setGameData] = useState<gameSearch[]>([]);
    const [status, setStatus] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [user, setUser] = useState<userInfo>({
        username: '',
        email: '', 
        firstName: '',
        lastName: '', 
        dob: '',
    });


    if(!token){
        redirect('/Login/');
    }

    // useEffect is used so these functions are run on page load
    useEffect(() => {

        if (!loggedInUser) {
            redirect('/Login/'); 
        }
        

        // Function for fetching all of the user's information
        // Data is fetched from the backend through a GET request
        // Data returned is formatted and stored in a state variable
        const fetchUserInfo = async (searchUser:string) => {


            try{
                const userinforesponse = await fetch(`http://127.0.0.1:8000/api/user/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });

                if(userinforesponse.status == 401){
                    redirect('/Login/');
                }
        
                const data = await userinforesponse.json();        
                console.log(data);

                currentUsername = data.username;

                const userSet = {
                    username: data.username,
                    email: data.email,
                    firstName : data.first_name,
                    lastName : data.last_name, 
                    dob : data.dob,
                };


                setUser(userSet);
            }

            catch(error){
                console.error("Error: ", error);
            }
        };

        fetchUserInfo(loggedInUser);


        // Fucntion to manage the fetching of the user's game playing status
        // The status is fetched from the backend through a GET request
        // Status from response is stored in state variable
        const fetchStatus = async (searchUser:string) => {


            try{
                const userinforesponse = await fetch(`http://127.0.0.1:8000/api/getStatus/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });

                if(userinforesponse.status == 401){
                    redirect('/Login/');
                }
        
                const data = await userinforesponse.json();        
                console.log(data);

                setStatus(data.status);
            }

            catch(error){
                console.error("Error: ", error);
            }
        };

        fetchStatus(loggedInUser);


                
    }, []);

    // Function for managing the updating of values when the user changes their information
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Function for managing the user changing their information
    // Data is sent to the backend as a POST request
    const formSubmit = async (e : React.FormEvent) => {

        e.preventDefault();

        const sendData = {
            oldUname: currentUsername, 
            newdata : user,
        };

        const submit = await fetch('http://localhost:8000/api/updateUser/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            },


            body: JSON.stringify(sendData),

        });

        localStorage.setItem('user', user.username);
        loggedInUser = localStorage.getItem('user');

        if(submit.status == 401){
            redirect('/Login/');
        }

        // const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

        
    };

    // Function for managing the user changing their own password
    // Password is sent to the backend through a POST request
    const formChangePassword = async (e : React.FormEvent) => {

        e.preventDefault();

        const sendData = {
            username : currentUsername, 
            password : newPassword,
        };

        const submit = await fetch('http://localhost:8000/api/changePassword/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            },


            body: JSON.stringify(sendData),

        });


        if(submit.status == 401){
            redirect('/Login/');
        }

        // const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

        
    };


    // Function for fetching games based on what the user searched
    // Utilises the server side to get all of the data
    // If the server side created a response, it is iterated through and the date is formatted and then the rest of the data is formatted and pushed to a list
    // List is stored in a state variable to be used in the page below
    const fetchGames = async () => {

        if(!gameName){
            alert("Enter a game to search for");
            return;
        }

        try{
            const response = await fetch(`../api/FetchGames/?name=${encodeURIComponent(gameName)}`, {
                method:'GET',
            });
            
            const responseData = await response.json();
            // console.log(responseData);
            let editedData : Array<gameSearch>= []

            console.log(responseData);

            if (responseData && responseData.responseDataArray && Array.isArray(responseData.responseDataArray)) {

                for(let i : number = 0; i < responseData.responseDataArray.length; i++){

                    let releaseYearStr : string = "";

                    console.log("returned from FetchGames");
                    console.log(responseData.responseDataArray[i]);

                    if("releaseDate" in responseData.responseDataArray[i]){
                        const date = new Date(responseData.responseDataArray[i].releaseDate * 1000)
                        let releaseYear = date.getFullYear();
                        releaseYearStr = releaseYear.toString();
                    }
                    else{
                        releaseYearStr = "N/A";
                    }

                    let data = {
                        id: responseData.responseDataArray[i].id,
                        url: responseData.responseDataArray[i].url,
                        name: responseData.responseDataArray[i].name,
                        releaseDate: releaseYearStr,
                        platforms: responseData.responseDataArray[i].platforms,
                    }

                    console.log(data);

                    editedData.push(data);


                }
                setGameData(editedData);

            }

            
            setShowSearchResults(true);
        }

        catch(error){
            console.error("Error: ", error);
        }
    };

    // Function for setting and changing the user's game playing status
    // Data is sent to the backend through a POST request
    // User is alerted on success
    const setStatusFunction = async (game : string) => {


        const sendData = {
            username : loggedInUser, 
            game : game,
        };

        const submit = await fetch('http://localhost:8000/api/setStatus/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            },


            body: JSON.stringify(sendData),

        });


        if(submit.status == 401){
            redirect('/Login/');
        }

        if(submit.status == 200){
            console.log(submit);
            alert("Status has been set");
        }
        else{
            console.log(submit);
            alert("Error setting status");
        }

        
    };

    
    // HTML page
    return(
        <div className="bg-black min-h-screen w-full pt-5 pb-5">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100 hover:bg-gray-500 hover:text-cyan-400">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal text-gray-100">
                        <li>
                            <Link href="/Recommendations/" className="hover:bg-gray-500 hover:text-cyan-400 ">Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/SavedRecommendations/" className="hover:bg-gray-500 hover:text-cyan-400">Saved Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/Social/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Social</Link>
                        </li>

                        <li>
                            <Link href="/Friends/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Friends</Link>
                        </li>

                        <li>
                            <Link href="/AddRatings/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Add Ratings</Link>
                        </li>

                        <li>
                            <details>
                                <summary className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">{localStorage.getItem('user')}</summary>
                                <ul className="bg-gray-900 rounded-t-none p-2">
                                    <li><Link href="/Profile/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Profile</Link></li>
                                    <li><Link href="/Logout/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>


            <h2 className="mx-[20rem] text-3xl text-gray-100 font-bold py-5">My Profile</h2>

            

            <div className="rounded-md mx-auto max-w-screen-xl bg-gray-900 shadow-md p-6 mb-8">

                {user.username != '' ? (
                    <>
                <form onSubmit={formSubmit} className="flex items-center gap-4 mb-3">
                    <fieldset className="w-32 font-semibold text-gray-300">Username:</fieldset>
                    <input type="text" name="username" onChange={handleChange} placeholder={user.username} className="input input-bordered bg-gray-800 text-white flex-1"/>
                    <button type="submit" className="btn bg-cyan-500 text-black hover:bg-cyan-400 transition-colors hover:scale-[1.025]">Change Username</button>
                </form>

                <form onSubmit={formSubmit} className="flex items-center gap-4 mb-3">
                    <fieldset className="w-32 font-semibold text-gray-300">Email:</fieldset>
                    <input type="email" name='email' onChange={handleChange} placeholder={user.email} className="input input-bordered bg-gray-800 text-white flex-1"/>
                    <button type="submit" className="btn bg-cyan-500 text-black hover:bg-cyan-400 transition-colors hover:scale-[1.025]">Change Email</button>
                </form>

                <form onSubmit={formSubmit} className="flex items-center gap-4 mb-3">
                    <fieldset className="w-32 font-semibold text-gray-300">Date of Birth:</fieldset>
                    <input type="date" name='dob' onChange={handleChange} defaultValue={user.dob} className="input input-bordered bg-gray-800 text-white flex-1"/>
                    <button type="submit" className="btn bg-cyan-500 text-black hover:bg-cyan-400 transition-colors hover:scale-[1.025]">Change Date of Birth</button>
                </form>

                <form onSubmit={formSubmit} className="flex items-center gap-4 mb-3">
                    <fieldset className="w-32 font-semibold text-gray-300">First Name:</fieldset>
                    <input type="text" name='firstName' onChange={handleChange} placeholder={user.firstName} className="input input-bordered bg-gray-800 text-white flex-1"/>
                    <button type="submit" className="btn bg-cyan-500 text-black hover:bg-cyan-400 transition-colors hover:scale-[1.025]">Change First Name</button>
                </form>

                <form onSubmit={formSubmit} className="flex items-center gap-4 mb-3">
                    <fieldset className="w-32 font-semibold text-gray-300">Last Name:</fieldset>
                    <input type="text" name='lastName' onChange={handleChange} placeholder={user.lastName} className="input input-bordered bg-gray-800 text-white flex-1"/>
                    <button type="submit" className="btn bg-cyan-500 text-black hover:bg-cyan-400 transition-colors hover:scale-[1.025]">Change Last Name</button>
                </form>

                <form onSubmit={formChangePassword} className="flex items-center gap-4 mb-3">
                    <fieldset className="w-32 font-semibold text-gray-300">Password:</fieldset>
                    <input type="text" name='password'  placeholder='Enter new password...' className="input input-bordered bg-gray-800 text-white flex-1" onChange={(e) => setNewPassword(e.target.value)}/>
                    <button type="submit" className="btn bg-cyan-500 text-black hover:bg-cyan-400 transition-colors hover:scale-[1.025]">Change Password</button>
                </form>

                <div className="flex items-center gap-4 mb-3">
                    <fieldset className="w-32 font-semibold text-gray-300">Status: </fieldset>
                    <div className="text-gray-100">{status ? `Playing ${status}` : "No status set"}</div>
                </div>

                </>
                ) : (
                    <div className="skeleton h-[22rem] w-[16.5rem]"></div>
                )}

            </div>

            <div className="mt-5 w-full max-w-screen-xl mx-auto">
                <fieldset className="fieldset w-xs bg-gray-900 bg-opacity-75 backdrop-blur-md p-4 rounded-box">
                    <h3 className="text-xl font-bold pb-2 text-gray-100">Search for a game to add as your status</h3>
                    <div className="join">
                        <input type="text" className="input join-item w-[25rem]" placeholder="Game Name" value={gameName} onChange={(e)=>setGameName(e.target.value)}/>
                        <button className="btn join-item hover:scale-[1.01] bg-cyan-400 text-gray-100" onClick={fetchGames}>Search</button>
                    </div>
                </fieldset>
            </div>

            {showSearchResults && (<ul className="list bg-gray-900 bg-opacity-75 backdrop-blur-md shadow-md rounded-box mt-5 w-full max-w-screen-xl mx-auto">
  
                <li className="p-4 pb-2 text-md opacity-60 tracking-wide text-gray-100">Search Results</li>

                {gameData.map((games, index) => (
                
                    <li key={games.id} className="list-row flex items-center px-4 py-3 border-t border-black">
                        <div className="w-10 text-4xl font-thin opacity-30 tabular-nums text-white">{index+1}</div>
                        <div><img className="size-10 rounded-box" src={games.url}/></div>
                        <div className="flex-1 px-4">
                            <div className="text-gray-100">{games.name}</div>
                            <div className="text-xs uppercase font-semibold opacity-60 text-gray-100">{games.releaseDate}</div>
                            {games.platforms && games.platforms.length > 0 && (
                                <div className="text-xs opacity-70 text-gray-100">Platforms: {games.platforms.join(', ')}</div>
                            )}
                        </div>
                        <button className="btn btn-square btn-ghost hover:scale-[1.01] text-cyan-400" onClick={() => setStatusFunction(games.name)}>Select</button>
                    </li>
                ))}
            </ul>)}
        </div>
    );
    
};

export default Profile;