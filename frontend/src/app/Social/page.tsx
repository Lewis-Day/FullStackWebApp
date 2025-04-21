'use client';

import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface User{
    username:string
}

interface message{
    conversation:string, 
    message:string,
    messageTime:string, 
    sendingUser:User, 
}

interface friendInfo{
    username: string,
}

const Social = () => {
    let loggedInUser = localStorage.getItem('user');

    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<message[]>([]);
    const [friends, setFriends] = useState<friendInfo[]>([]);
    const [newChatFriend, setNewChatFriend] = useState<string>('');
    const [chats, setChats] = useState<friendInfo[]>([]);
    const [currentChat, setCurrentChat] = useState('');

    const token = Cookies.get('access_token');

    if(!token){
        redirect('/Login/');
    }

    useEffect(() => {
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
        
        const fetchChats = async (searchUser:string) => {


            try{
                const chatResponse = await fetch(`http://127.0.0.1:8000/api/getFriends/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                    
                });

                if(chatResponse.status == 401){
                    redirect('/Login/');
                }
        
                const data = await chatResponse.json(); 
                console.log('CHATS');       
                console.log(data);

                if (!Array.isArray(data)){
                    setChats([]);
                }
                else{
                    setChats(data);
                }
                
            }

            catch(error){
                console.error("Error: ", error);
                setChats([]);
            }
        };

        if(loggedInUser){
            fetchFriends(loggedInUser);
            fetchChats(loggedInUser);
        }
        else{
            setFriends([]);
            setChats([]);
        }

        

    }, [loggedInUser, token]);

    const newConversation = async () => {

        const data = {
            user1 : loggedInUser,
            user2 : newChatFriend,
        }

        const submit = await fetch('http://localhost:8000/api/createChat/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),

        });

        if(submit.status == 401){
            redirect('/Login/');
        }

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

    }

    const addMessage = async () => {

        const data = {
            user1 : loggedInUser,
            user2 : currentChat,
            message : message,
        }

        const submit = await fetch('http://localhost:8000/api/sendMessage/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),

        });

        if(submit.status == 401){
            redirect('/Login/');
        }

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

    }

    const deleteChat = async () => {

        const data = {
            user1 : loggedInUser,
            user2 : currentChat,
        }

        const submit = await fetch('http://localhost:8000/api/deleteChat/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),

        });

        if(submit.status == 401){
            redirect('/Login/');
        }

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

    }

    function chatClick(chat:string){

        setCurrentChat(chat);
        // getMessages();

    }

    const getMessages = useCallback(async () => {

        if (!currentChat) {
            setChatMessages([]); 
            return;
        }

        if(loggedInUser){

            const data = {
                user1 : loggedInUser,
                user2 : currentChat,
            }

            const submit = await fetch(`http://localhost:8000/api/getMessages/?user1=${encodeURIComponent(data.user1)}&user2=${encodeURIComponent(data.user2)}`, {
                method:'GET',
                headers:{
                    Authorization: `Bearer ${token}`,
                }

            });

            if(submit.status == 401){
                redirect('/Login/');
            }


            if(submit.status == 200){
                console.log(submit);
                const response = await submit.json()
                console.log(response);
                setChatMessages(response);

                // console.log(response[0].message);
                // console.log(chatMessages[0].message)

            }
            else{
                console.log(submit);
            }
        }
        else{
            setChatMessages([]);
        }

    }, [currentChat, loggedInUser, token]);


    useEffect(() => {
        if (currentChat){
            getMessages();
        } 
        else{
            setChatMessages([]);
        }
    }, [currentChat, loggedInUser, token, getMessages]);

    return(
        <div className="bg-black min-h-screen w-full pt-5 ">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal text-black">
                        <li>
                            <Link href="/Recommendations/" className="text-gray-100 hover:text-cyan-400">Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/Social/" className="text-gray-100 hover:text-cyan-400">Social</Link>
                        </li>

                        <li>
                            <Link href="/AddRatings/" className="text-gray-100 hover:text-cyan-400">Add Ratings</Link>
                        </li>

                        <li>
                            <details>
                                <summary className="text-gray-100 hover:text-cyan-400">{localStorage.getItem('user')}</summary>
                                <ul className="bg-gray-900 rounded-t-none p-2">
                                    <li><Link href="/Profile/" className="text-gray-100 hover:text-cyan-400">Profile</Link></li>
                                    <li><Link href="/Logout/" className="text-gray-100 hover:text-cyan-400">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col justify-self-center">

            <h2 className="text-3xl text-gray-100 font-bold py-5">Social</h2>

            <div className="flex flex-row justify-start pb-5 space-x-8">
                <ul className="menu bg-gray-900 rounded-md rounded-box p-6 w-72 h-[80vh] overflow-y-auto">
                    <div className="mb-4">
                        <label className="text-sm font-bold mb-2 text-gray-400">Select a Friend to Chat With:</label><br></br>
                        <select name="friends" id="friends" onChange={(e)=>setNewChatFriend(e.target.value)} className="select select-bordered w-full bg-gray-700 text-white">
                            <option value="">Select a Friend</option>
                            {friends.map((friend) => (
                                <option key={friend.username} value={friend.username}>{friend.username}</option>
                            ))}
                        </select>
                        <button className="btn bg-cyan-500 text-gray-100 mt-2 w-full hover:bg-cyan-600" onClick={newConversation} disabled={!newChatFriend}>
                            New Chat
                        </button>
                    </div>

                    <div className="divider text-gray-600">Chats</div>

                    {chats.length === 0 ? (
                        <p className="text-gray-500">No Chats Found</p> 
                        ) : (
                        <ul>
                            {chats.map((chat) => (
                                <li key={chat.username}>
                                    <div className={`flex justify-between p-2 rounded-md cursor-pointer border border-gray-800 ${currentChat === chat.username ? 'bg-gray-500' : 'hover:bg-gray-500'}`} onClick={() => chatClick(chat.username)}>
                                        <span className="text-white">{chat.username}</span> 

                                        <button className="btn btn-square border border-gray-800" onClick={deleteChat} disabled={currentChat == ''}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </ul>

                <div className="w-[50rem] h-[80vh] bg-gray-900 rounded-xl flex flex-col justify-between p-6">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-100 mb-4">Chat with {currentChat}</h1>
                    </div>

                    <div className="overflow-y-auto mb-4">
                        {chatMessages.length == 0 ? (
                            <p className="text-gray-500 flex flex-row justify-center">No messages found</p>
                        ) : (
                               chatMessages.map((msg, idx) => (     
                                <div key={idx} className={`chat ${msg.sendingUser.username == loggedInUser && "chat-start"} ${msg.sendingUser.username != loggedInUser && "chat-end"}`}>
                                    <div className="chat-header">
                                        {/* {msg.sendingUser.username}
                                        <time className="text-xs opacity-50 pl-2">{msg.messageTime}</time> */}
                                        <span className="font-semibold text-sm text-cyan-400">{msg.sendingUser.username}</span>
                                        <time className="text-xs opacity-50 pl-2 text-cyan-400">{msg.messageTime}</time>
                                    </div>
                                    <div className="chat-bubble bg-blue-500 text-black">{msg.message}</div>
                                </div>
                            ))
                        )}
                    </div>

                    

                    <form onSubmit={addMessage} className="flex items-center">
                        <input type="text" placeholder="Type your message here..." className="input input-bordered bg-gray-700 text-white w-full mr-2" onChange={(e) => setMessage(e.target.value)}/>
                        <button type="submit" className="btn bg-cyan-400 text-black hover:bg-cyan-600 hover:scale-[1.01] transition-transform">Send</button>
                    </form>

                </div>

            </div>


            </div>

            

            <div></div>
        </div>
    );
    
};

export default Social;