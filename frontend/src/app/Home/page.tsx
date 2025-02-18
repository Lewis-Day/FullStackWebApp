'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

const Home = () => {

    const[imgs, setImgs] = useState <string[]>([]);
    let numImages: number = 10;

    useEffect(() => {

        const fetchImgs = async () => {

            try{
                const response = await fetch("/api/PopularImgs");
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



    return(
        <div className="bg-gray-700 h-screen w-full pt-5 ">
            <div className="navbar bg-white rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-black">VGR</Link>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 text-black">
                    <li><Link href="/SignUp">Sign Up</Link></li>
                    <li>
                        <Link href="/Login">Login</Link>
                    </li>
                    </ul>
                </div>
            </div>

            <h2 className="mx-[7.5rem] text-3xl text-gray-100 font-bold py-5">Popular Games</h2>

            <div className="carousel carousel-center bg-neutral rounded-box mx-28 max-w-screen-xl p-4">

                {imgs.length > 0 ? imgs.map((url, index) => (
                    <div key={index} className="carousel-item px-2">
                        <img src={url} className="rounded-box hover:scale-[1.025] transition-transform" />
                    </div>
                )) :
                (
                    Array.from({length : numImages}).map((_, index) =>
                        <div key={index} className="carousel-item px-2">
                            <div className="skeleton h-[22rem] w-[16.5rem]"></div>
                        </div>
                    )
                )}
            </div>


            <div className="mockup-window border-base-300 border mx-28 max-w-screen-xl p-4 mt-5 bg-gray-200 text-black">
                <p className="text-xl font-bold pl-5">Welcome to VGR!</p>
                <p className="pl-5">VGR is a video game recommendation system available to users of all platforms.</p>
                <p className="pl-5">Here you'll find popular games however, if you log in or create an account, you'll get personalised game recommedations.</p>
            </div>

            
        </div>
    );
    
};

export default Home;