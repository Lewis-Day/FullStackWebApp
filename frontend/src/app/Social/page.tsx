'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface userInfo{
    username: string,
    email: string, 
    firstName: string,
    lastName: string, 
    dob: string,
}

interface message{
    chat:string, 
    sender:string, 
    time:string, 
    msg:string,
}

const Social = () => {

    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<message[]>([]);
    const [friends, setFriends] = useState<userInfo[]>([]);
    const [newChatFriend, setNetChatFriend] = useState<string>('');
    const [chats, setChats] = useState<string[]>([]);
    const [currentChat, setCurrentChat] = useState('');

    useEffect(() => {
        const fetchFriends = async (searchUser:string) => {


            try{
                const friendsResponse = await fetch(`http://127.0.0.1:8000/api/getFriends/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                });
        
                const data = await friendsResponse.json();        
                console.log(data);

                const friends = data.friendList;

                console.log(friends)

                if (!Array.isArray(friends)){
                    setFriends([]);
                }
                else{
                    setFriends(friends);
                }
                
            }

            catch(error){
                console.error("Error: ", error);
                setFriends([]);
            }
        };

        fetchFriends("Test")

        const fetchChats = async (searchUser:string) => {


            try{
                const chatResponse = await fetch(`http://127.0.0.1:8000/api/getFriends/?username=${encodeURIComponent(searchUser)}`, {
                    method:'GET',
                });
        
                const data = await chatResponse.json();        
                console.log(data);

                const allChats = data.chats;

                console.log(allChats)

                if (!Array.isArray(allChats)){
                    setChats([]);
                }
                else{
                    setChats(allChats);
                }
                
            }

            catch(error){
                console.error("Error: ", error);
                setChats([]);
            }
        };

        fetchChats("Test")

    }, []);

    const newConversation = async () => {

        const data = {
            user1 : 'Test',
            user2 : newChatFriend,
        }

        const submit = await fetch('http://localhost:8000/api/createChat/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(data),

        });

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

    }

    const addMessage = async () => {

        const data = {
            user1 : 'Test',
            user2 : 'Test2',
            message : message,
        }

        const submit = await fetch('http://localhost:8000/api/sendMessage/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(data),

        });

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

    }

    const deleteChat = async () => {

        const data = {
            user1 : 'Test',
            user2 : currentChat,
        }

        const submit = await fetch('http://localhost:8000/api/deleteChat/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(data),

        });

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

    }

    function chatClick(chat:string){

        setCurrentChat(chat);
        getMessages();

    }

    const getMessages = async () => {

        const data = {
            user1 : 'Test',
            user2 : currentChat,
        }

        const submit = await fetch('http://localhost:8000/api/getMessages/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(data),

        });


        if(submit.status == 201){
            console.log(submit);
            const response = await submit.json()
            console.log(response);
            setChatMessages(response);
        }
        else{
            console.log(submit);
        }

    }

    return(
        <div className="bg-gray-700 h-full w-full pt-5 ">
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
                            <details>
                                <summary>Username</summary>
                                <ul className="bg-base-100 rounded-t-none p-2">
                                    <li><Link href="/Profile/">Profile</Link></li>
                                    <li><Link href="/Logout/">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>

            <h2 className="mx-28 text-3xl text-gray-100 font-bold py-5">Social</h2>

            <div className="flex flex-row justify-start pb-5">
                <ul className="menu bg-base-200 rounded-box w-56 h-[80vh] mx-28">
                    <div>
                        <label>Select a Friend to Chat With:</label><br></br>
                        <select name="friends" id="friends" onChange={(e)=>setNetChatFriend(e.target.value)}>
                            {friends.map((friend) => (
                                <option key={friend.username} value={friend.username}>{friend.username}</option>
                            ))}
                        </select>
                        <button className="btn bg-gray-500" onClick={newConversation} disabled={newChatFriend == ''}>
                            New Chat
                        </button>
                    </div>
                    {chats.length === 0 ? (
                        <p>No Chats Found</p> 
                        ) : (
                        <ul>
                            {chats.map((chat) => (
                                <li key={chat}>
                                    <button className="flex flex-row justify-between" onClick={() => chatClick(chat)}>
                                        {chat}

                                        <button className="btn btn-square" onClick={deleteChat} disabled={currentChat == ''}>
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
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </ul>

                <div className="w-[50rem] h-[80vh] bg-white rounded-xl flex flex-col justify-between p-1">
                    <div>
                        <h1>Chat with {currentChat}</h1>
                    </div>

                    <div className="overflow-y-auto">
                        {chatMessages.length == 0 ? (
                            <p>No messages found</p>
                        ) : (
                            chatMessages.map((msg, idx) => (
                                <div key={idx} className={`chat ${msg.sender == currentChat && "chat-start"} ${msg.sender != currentChat && "chat-end"}`}>
                                    <div className="chat-bubble">{msg.msg}</div>
                                </div>
                            ))
                        )}
                    </div>

                    

                    <form onSubmit={addMessage} className="">
                        <input type="text" placeholder="Type your message here..." className="w-[40rem] h-[3rem] ml-[1rem]" onChange={(e) => setMessage(e.target.value)}/>
                        <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Send</button>
                    </form>

                </div>

            </div>

            

            <div></div>
        </div>
    );
    
};

export default Social;