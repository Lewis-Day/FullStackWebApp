'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

// Uses modified components from DaisyUI
// DaisyUI, “Components — Tailwind CSS Components,” daisyui.com. https://daisyui.com/components/ (accessed Feb. 18, 2025).

const Home = () => {

    // State variable for images
    const[imgs, setImgs] = useState <string[]>([]);
    let numImages: number = 10;

    // Use effect ensures that it is fetched when the page loads
    useEffect(() => {

        // Function for fetching the images that need to be displayed from the server side
        const fetchImgs = async () => {

            try{
                const response = await fetch("../api/PopularImgs/");
                const data = await response.json();
                console.log(data.imgURL);
                setImgs(data.imgURL);
            }

            catch(error){
                console.error("Error: ", error);
            }
        };

        fetchImgs();

        
    }, []);


    // HTML page displayed
    return(
        <div className="bg-black h-screen w-full pt-5 ">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100 hover:bg-gray-500 hover:text-cyan-400">VGR</Link>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 text-gray-100">
                    <li><Link href="/SignUp" className="hover:bg-gray-500 hover:text-cyan-400">Sign Up</Link></li>
                    <li>
                        <Link href="/Login" className="hover:bg-gray-500 hover:text-cyan-400">Login</Link>
                    </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col items-start content-center flex-wrap">
                <h2 className="text-3xl text-gray-100 font-bold py-5">Popular Games</h2>

                <div className="carousel carousel-center bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-box max-w-screen-xl p-4">

                    {imgs.length > 0 ? imgs.map((url, index) => (
                        <div key={index} className="carousel-item px-2">
                            <img src={url} className="object-cover rounded-box shadow-md hover:scale-[1.05] transition-transform " />
                        </div>
                    )) :
                    (
                        Array.from({length : numImages}).map((_, index) =>
                            <div key={index} className="carousel-item px-2">
                                <div className="skeleton bg-gray-600 h-[22rem] w-[16.5rem]"></div>
                            </div>
                        )
                    )}
                </div>

                <div className="pt-2">
                    <p className="text-gray-400 text-sm mb-1">
                        Press <kbd className="kbd kbd-sm bg-gray-800 text-blue-400 border-none">▶︎</kbd> to scroll right.
                    </p>
                    <p className="text-gray-400 text-sm">
                        Press <kbd className="kbd kbd-sm bg-gray-800 text-blue-400 border-none">◀︎</kbd> to scroll left.
                    </p>
                </div>


                <div className="mockup-window max-w-screen-xl p-4 mt-5 bg-gray-900 text-gray-100 w-full">
                    <p className="text-xl font-bold pl-5 text-cyan-400">Welcome to VGR!</p>
                    <p className="pl-5">VGR is a video game recommendation system available to users of all platforms.</p>
                    <p className="pl-5">Here you'll find popular games however, if you <Link href="/Login" className="text-cyan-400 hover:underline">log in</Link> or <Link href="/SignUp" className="text-cyan-400 hover:underline">create an account</Link>, you'll get personalised game recommedations.</p>
                </div>
            </div>

            
        </div>
    );
    
};

export default Home;