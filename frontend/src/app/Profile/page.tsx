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

    const [newPassword, setNewPassword] = useState('');
    const [search, setSearch] = useState('');
    const [foundUser, setFoundUser] = useState('');
    const [friends, setFriends] = useState<friendInfo[]>([]);
    const [friendRequests, setFriendRequests] = useState<friendInfo[]>([]);
    const [sentFriendRequests, setSentFriendRequests] = useState<friendInfo[]>([]);

    const [user, setUser] = useState<userInfo>({
        username: '',
        email: '', 
        firstName: '',
        lastName: '', 
        dob: '',
    });

    useEffect(() => {

        if (!loggedInUser) {
            redirect('/Login/'); 
        }
        
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
                }
                
            }

            catch(error){
                console.error("Error: ", error);
                setFriends([]);
            }
        };

        fetchFriends(loggedInUser);

        
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

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
        <div className="bg-gray-700 h-full w-full pt-5 pb-5">
            <div className="navbar bg-white rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-black">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal text-black">
                        <li>
                            <Link href="/Recommendations/">Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/Social/">Social</Link>
                        </li>

                        <li>
                            <Link href="/AddRatings/">Add Ratings</Link>
                        </li>

                        <li>
                            <details>
                                <summary>{localStorage.getItem('user')}</summary>
                                <ul className="bg-base-100 rounded-t-none p-2">
                                    <li><Link href="/Profile/">Profile</Link></li>
                                    <li><Link href="/Logout/">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>

            <h2 className="mx-28 text-3xl text-gray-100 font-bold py-5">Your Profile</h2>

            <div className="rounded-md mx-auto max-w-screen-xl bg-white h-[60vh] p-2">

                {user.username != '' ? (
                    <>
                <form onSubmit={formSubmit} className="flex flex-row justify-between pb-5">
                    <fieldset>Username:</fieldset>
                    <input type="text" name="username" onChange={handleChange} placeholder={user.username} className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Username</button>
                </form>

                <form onSubmit={formSubmit} className="flex flex-row justify-between pb-5">
                    <fieldset>Email:</fieldset>
                    <input type="email" name='email' onChange={handleChange} placeholder={user.email} className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Email</button>
                </form>

                <form onSubmit={formSubmit} className="flex flex-row justify-between pb-5">
                    <fieldset>Date of Birth:</fieldset>
                    <input type="date" name='dob' onChange={handleChange} defaultValue={user.dob} className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Date of Birth</button>
                </form>

                <form onSubmit={formSubmit} className="flex flex-row justify-between pb-5">
                    <fieldset>First Name:</fieldset>
                    <input type="text" name='firstName' onChange={handleChange} placeholder={user.firstName} className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change First Name</button>
                </form>

                <form onSubmit={formSubmit} className="flex flex-row justify-between pb-5">
                    <fieldset>Last Name:</fieldset>
                    <input type="text" name='lastName' onChange={handleChange} placeholder={user.lastName} className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Last Name</button>
                </form>

                <form onSubmit={formChangePassword} className="flex flex-row justify-between pb-5">
                    <fieldset>Password:</fieldset>
                    <input type="text" name='password'  placeholder='Enter new password...' className="bg-white h-[2.5rem]" onChange={(e) => setNewPassword(e.target.value)}/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Password</button>
                </form>

                </>
                ) : (
                    <div className="skeleton h-[22rem] w-[16.5rem]"></div>
                )}

            </div>

            <div className="rounded-lg mx-auto max-w-screen-xl bg-white shadow-lg p-6 mt-5">
                <form action="GET" onSubmit={formGetUsers} className="flex items-center gap-3">
                    <fieldset>
                        <h2 className="text-xl font-bold mb-3">Add Friends:</h2>
                    </fieldset>
                    <input className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" type="text" placeholder="Friend Username..." onChange={(e) => setSearch(e.target.value)}/>
                    <button type="submit" className="px-4 py-2 bg-blue-500 rounded-md text-white">Search</button>
                </form>

                {foundUser && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg flex items-center justify-between">
                        <p className="font-medium">User: {foundUser}</p>
                        <button className="px-4 py-2 bg-green-500 rounded-md text-white" onClick={() => formSendFriendRequest(foundUser)}>Add Friend</button>
                    </div>
                )}
            </div>


            <div className="rounded-md mx-auto max-w-screen-xl bg-white p-2 mt-5">

                <h2 className="text-xl font-bold mb-3">My Friends: </h2>

                {friends.length > 0 ? (
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {friends.map((friend) => (
                            <li key={friend.username} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm">
                                <div className="font-medium">{friend.username}</div>
                                <button className="bg-red-500 p-2 rounded-md" onClick={() => formRemoveFriend(friend.username)}>Remove Friend</button>
                            </li>
                        ))}
                    </ul>
                    
                    ) : (
                    
                    <p className="text-gray-500">No friends found...</p> 
                )}

            </div>

        


            <div className="rounded-md mx-auto max-w-screen-xl bg-white p-2 mt-5">

                <h2 className="text-xl font-bold mb-3">Friend Requests: </h2>

                {friendRequests.length > 0 ?(
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {friendRequests.map((friend) => (
                            <li key={friend.username} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm">
                                <div className="font-medium">{friend.username}</div>
                                <div>
                                    <button className="bg-green-300 p-2 rounded-md mx-1" onClick={() => acceptRequest(friend.username)}>Accept</button>
                                    <button className="bg-red-300 p-2 rounded-md mx-1" onClick={() => declineRequest(friend.username)}>Decline</button>
                                </div>
                                
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <p className="text-gray-500">No pending friend requests...</p> 
                )}

            </div>

            <div className="rounded-md mx-auto max-w-screen-xl bg-white p-2 mt-5">

                <h2 className="text-xl font-bold mb-3">Sent Friend Requests: </h2>

                {sentFriendRequests.length > 0 ?(
                    <ul>
                        {sentFriendRequests.map((friend) => (
                            <li key={friend.username} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm">
                                <div className="font-medium">{friend.username}</div>
                                <button className="bg-orange-300 p-2 rounded-md mx-1" onClick={() => deleteRequest(friend.username)}>Cancel</button>
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