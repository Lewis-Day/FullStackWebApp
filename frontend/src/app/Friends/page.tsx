'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";


interface userInfo{
    username: string,
    email: string, 
    firstName: string,
    lastName: string, 
    dob: string,
}

interface friendInfo{
    username: string,
}

var currentUsername:string;

const Profile = () => {

    const token = Cookies.get('access_token');
    const loggedInUser = localStorage.getItem('user');

    if(!token){
        redirect('/Login/');
    }
    
    const [search, setSearch] = useState('');
    const [foundUser, setFoundUser] = useState('');
    const [friends, setFriends] = useState<friendInfo[]>([]);
    const [status, setStatus] = useState<string[]>([]);
    const [friendRequests, setFriendRequests] = useState<friendInfo[]>([]);
    const [sentFriendRequests, setSentFriendRequests] = useState<friendInfo[]>([]);

    useEffect(() => {

        if (!loggedInUser) {
            redirect('/Login/'); 
        }

        const fetchFriends = async (searchUser:string) => {

            try{
                const friendsResponse = await fetch(`http://127.0.0.1:8000/api/getFriends/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });

                if(friendsResponse.status == 401){
                    redirect('/Login/');
                }
        
                const data = await friendsResponse.json();  
                console.log("friends data")      
                console.log(data);

                if (!Array.isArray(data)){
                    setFriends([]);
                }
                else{
                    setFriends(data);

                    const statusArray : string[] = [];
                    
                    for(const friend of data){
                        const status = await fetchStatus(friend.username);
                        if(status){
                            statusArray.push(status);
                        }
                        else{
                            statusArray.push("No Status Set")
                        }
                    }
                    setStatus(statusArray);
                }
                
            }

            catch(error){
                console.error("Error: ", error);
                setFriends([]);
                setStatus([]);
            }
        };

        fetchFriends(loggedInUser);

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

                return data.status;
            }

            catch(error){
                console.error("Error: ", error);
            }
        };

        

        
        const fetchFriendRequests = async (searchUser:string) => {

            try{
                const friendsResponse = await fetch(`http://127.0.0.1:8000/api/getFriendRequests/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });

                if(friendsResponse.status == 401){
                    redirect('/Login/');
                }
                
        
                const data = await friendsResponse.json();        
                console.log(data);

                if (!Array.isArray(data)){
                    setFriendRequests([]);
                }
                else{
                    setFriendRequests(data);
                }
                
            }

            catch(error){
                console.error("Error: ", error);
                setFriendRequests([]);
            }
        };

        fetchFriendRequests(loggedInUser);


        const fetchSentFriendRequests = async (searchUser:string) => {


            try{
                const friendsResponse = await fetch(`http://127.0.0.1:8000/api/getSentFriendRequests/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });

                if(friendsResponse.status == 401){
                    redirect('/Login/');
                }
        
                const data = await friendsResponse.json();        
                console.log(data);


                if (!Array.isArray(data)){
                    setSentFriendRequests([]);
                }
                else{
                    setSentFriendRequests(data);
                }
                
            }

            catch(error){
                console.error("Error: ", error);
                setSentFriendRequests([]);
            }
        };

        fetchSentFriendRequests(loggedInUser);
        
                
    }, []);

    const formGetUsers = async (e : React.FormEvent) => {
        e.preventDefault();

        try{
            const userinforesponse = await fetch(`http://127.0.0.1:8000/api/user/?username=${encodeURIComponent(search)}`, {
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

            const foundUser = data.username;
            setFoundUser(foundUser);
        }

        catch(error){
            console.error("Error: ", error);
        }

    }

    const formSendFriendRequest = async (friendUsername : string) => {


        const sendData = {
            username : friendUsername, 
            ownUsername : currentUsername,
        };

        const submit = await fetch('http://localhost:8000/api/addFriend/', {
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

       const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            alert("Friend Request Sent");
            setFoundUser(''); 
            setSearch(''); 
        }
        else{
            console.log(submit);
            alert(response.message);
        }

        
    };

    const formRemoveFriend = async (friendUsername : string) => {


        const sendData = {
            username : friendUsername, 
            ownUsername : currentUsername,
        };

        const submit = await fetch('http://localhost:8000/api/deleteFriend/', {
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

       const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            alert("Friend Removed");
        }
        else{
            console.log(submit);
            alert(response.message);
        }

        
    };

    const acceptRequest = async (friendUsername : string) => {


        const sendData = {
            username : friendUsername, 
            ownUsername : currentUsername,
        };

        const submit = await fetch('http://localhost:8000/api/acceptRequest/', {
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

       const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            alert("Friend Request Accepted");
        }
        else{
            console.log(submit);
            alert(response.message);
        }

        
    };

    const declineRequest = async (friendUsername : string) => {


        const sendData = {
            username : friendUsername, 
            ownUsername : currentUsername,
        };

        const submit = await fetch('http://localhost:8000/api/deleteRequest/', {
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

       const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            alert("Friend Request Declined");
        }
        else{
            console.log(submit);
            alert(response.message);
        }

        
    };

    const deleteRequest = async (friendUsername : string) => {


        const sendData = {
            username : friendUsername, 
            ownUsername : currentUsername,
        };

        const submit = await fetch('http://localhost:8000/api/deleteRequest/', {
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

       const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            alert("Friend Request Deleted");
        }
        else{
            console.log(submit);
            alert(response.message);
        }

        
    };

    

    return(
        <div className="bg-black h-screen w-full pt-5 pb-5">
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


            <h2 className="mx-[20rem] text-3xl text-gray-100 font-bold py-5">My Friends</h2>

            <div className="rounded-lg mx-auto max-w-screen-xl bg-gray-900 shadow-lg p-6 mt-5">
                <form action="GET" onSubmit={formGetUsers} className="flex items-center gap-3">
                    <fieldset>
                        <h2 className="text-xl font-bold mb-3 text-gray-100 pt-2">Add Friends:</h2>
                    </fieldset>
                    <input className="flex-1 px-4 py-2 input input-bordered rounded-lg bg-gray-800" type="text" placeholder="Friend Username..." onChange={(e) => setSearch(e.target.value)}/>
                    <button type="submit" className="btn bg-cyan-500 text-black hover:bg-cyan-400 transition-colors hover:scale-[1.025]">Search</button>
                </form>

                {foundUser && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg flex items-center justify-between">
                        <p className="font-medium text-gray-100">User: {foundUser}</p>
                        <button className="px-4 py-2 bg-green-500 hover:bg-green-700 rounded-md text-white transition-colors hover:scale-[1.025]" onClick={() => formSendFriendRequest(foundUser)}>Add Friend</button>
                    </div>
                )}
            </div>


            <div className="rounded-md mx-auto max-w-screen-xl bg-gray-900 shadow-lg p-2 mt-5">

                <h2 className="text-xl font-bold mb-3 text-gray-100">My Friends: </h2>

                {friends.length > 0 ? (
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {friends.map((friend, index) => (
                            <li key={friend.username} className="bg-gray-700 p-3 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-medium font-semibold text-gray-300">{friend.username}</div>
                                    <button className="btn bg-red-500 p-2 rounded-md hover:bg-red-700 transition-colors hover:scale-[1.025]" onClick={() => formRemoveFriend(friend.username)}>Remove Friend</button>
                                </div>
                                <div>{status[index] && <div className="text-gray-400 text-sm">{status ? `Playing ${status[index]}` : ""}</div>}</div>
                            </li>
                        ))}
                    </ul>
                    
                    ) : (
                    
                    <p className="text-gray-500">No friends found...</p> 
                )}

            </div>

        


            <div className="rounded-md mx-auto max-w-screen-xl bg-gray-900 shadow-lg p-2 mt-5">

                <h2 className="text-xl font-bold mb-3 text-gray-100">Friend Requests: </h2>

                {friendRequests.length > 0 ?(
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {friendRequests.map((friend) => (
                            <li key={friend.username} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg shadow-sm">
                                <div className="font-medium font-semibold text-gray-300">{friend.username}</div>
                                <div>
                                    <button className="bg-green-300 p-2 rounded-md mx-1 btn hover:bg-green-500 transition-colors hover:scale-[1.025]" onClick={() => acceptRequest(friend.username)}>Accept</button>
                                    <button className="bg-red-300 p-2 rounded-md mx-1 btn hover:bg-red-700 transition-colors hover:scale-[1.025]" onClick={() => declineRequest(friend.username)}>Decline</button>
                                </div>
                                
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <p className="text-gray-500">No pending friend requests...</p> 
                )}

            </div>

            <div className="rounded-md mx-auto max-w-screen-xl bg-gray-900 p-2 mt-5">

                <h2 className="text-xl font-bold mb-3 text-gray-100">Sent Friend Requests: </h2>

                {sentFriendRequests.length > 0 ?(
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sentFriendRequests.map((friend) => (
                            <li key={friend.username} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg shadow-sm">
                                <div className="font-medium font-semibold text-gray-300">{friend.username}</div>
                                <button className="bg-orange-300 p-2 rounded-md mx-1 btn hover:bg-orange-500 transition-colors hover:scale-[1.025]" onClick={() => deleteRequest(friend.username)}>Cancel</button>
                            </li>
                        ))}
                    </ul>
                    
                    ) : (
                    
                    <p className="text-gray-500">No friend requests sent...</p> 
                )}

            </div>
        </div>
    );
    
};

export default Profile;