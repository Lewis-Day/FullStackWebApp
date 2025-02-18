'use client';

import Link from "next/link";


const Social = () => {

    return(
        <div className="bg-gray-700 h-screen w-full pt-5 ">
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

            <div className="flex flex-row justify-start">
                <ul className="menu bg-base-200 rounded-box w-56 h-[80vh] mx-28">
                    <div>
                    <button className="btn bg-gray-500">
                        {/* <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg> */}
                        New Chat
                    </button>
                    </div>
                    <li>
                        <a className="flex flex-row justify-between">
                            User 1

                            <button className="btn btn-square">
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
                        </a>
                        
                    </li>
                    <li>
                        <a className="flex flex-row justify-between">
                            User 2

                            <button className="btn btn-square">
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
                        </a>
                        
                    </li>
                </ul>

                <div className="w-[50rem] h-[80vh] bg-white rounded-xl flex flex-col justify-between p-1">
                    <div>
                        <h1>Chat with Username</h1>
                    </div>

                    <div className="chat chat-start">
                        <div className="chat-bubble">
                            It's over Anakin,
                            <br />
                            I have the high ground.
                        </div>
                    </div>
                    <div className="chat chat-end">
                        <div className="chat-bubble">You underestimate my power!</div>
                    </div>

                    <form action="" className="">
                        <input type="text" placeholder="Type your message here..." className="w-[40rem] h-[3rem] ml-[1rem]"/>
                        <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Send</button>
                    </form>

                </div>

            </div>

            

            <div></div>
        </div>
    );
    
};

export default Social;