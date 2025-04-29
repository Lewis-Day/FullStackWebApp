'use client';

import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";


interface SavedRecos {
    id : string,
    name: string,
    imgURL: string,
    releaseDate: string,
    platforms: string,
}



const AddRatings = () => {

    const [savedRecs, setSavedRecs] = useState<SavedRecos[]>([]);

    const token = Cookies.get('access_token');

    if(!token){
        redirect('/Login/');
    }

    

    useEffect(() => {

        

        const fetchSavedRecommendations = async () => {

            const token = Cookies.get('access_token');
            

                try{
                    const response = await fetch("../api/FetchSavedRecs/", {
                        method:'GET',
                        headers:{
                            Authorization: `Bearer ${token}`,
                        }
                    });
        
                    if(response.status == 401){
                        redirect('/Login/')
                    }
                    const data = await response.json();
        
                    console.log(data);
        
                    const saved: SavedRecos[] = [];
                    for(let i = 0; i<data.holdingArray.length; i++){
        
                        saved.push({
                            id : data.holdingArray[i].id,
                            name: data.holdingArray[i].name,
                            imgURL: data.holdingArray[i].imgURL,
                            releaseDate: data.holdingArray[i].releaseDate,
                            platforms: data.holdingArray[i].platforms,
        
                        });             
                    }
                    setSavedRecs(saved);
                }
        
                catch(error){
                    console.error("Error: ", error);
                }
        }

        fetchSavedRecommendations();

    }, [])



    return(
        <div className="bg-black min-h-screen py-5 ">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100 hover:bg-gray-500 hover:text-cyan-400">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal text-gray-100">
                        <li>
                            <Link href="/Recommendations/" className="hover:bg-gray-500 hover:text-cyan-400">Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/SavedRecommendations/" className="hover:bg-gray-500 hover:text-cyan-400">Saved Recommendations</Link>
                        </li>

                        <li>
                            <Link href="/Social/" className="hover:bg-gray-500 hover:text-cyan-400">Social</Link>
                        </li>

                        <li>
                            <Link href="/Friends/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Friends</Link>
                        </li>

                        <li>
                            <Link href="/AddRatings/" className="hover:bg-gray-500 hover:text-cyan-400">Add Ratings</Link>
                        </li>

                        <li>
                            <details>
                                <summary>{localStorage.getItem('user')}</summary>
                                <ul className="bg-base-100 rounded-t-none p-2 bg-gray-800">
                                    <li><Link href="/Profile/" className="hover:bg-gray-500 hover:text-cyan-400">Profile</Link></li>
                                    <li><Link href="/Logout/" className="hover:bg-gray-500 hover:text-cyan-400">Logout</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col justify-self-center items-start flex-wrap w-full max-w-screen-xl mx-auto">

                <h2 className="text-3xl text-gray-100 font-bold py-5">My Saved Ratings</h2>

                <div className="overflow-x-auto rounded-lg mx-auto max-w-screen-xl bg-gray-900 shadow-lg p-6 mt-5">
                    <table className="table">
                        <thead>
                        <tr className="text-gray-100 border-b border-gray-700">
                            <th></th>
                            <th>Name</th>
                            <th>Platforms</th>
                            <th>Release Date</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody className="text-gray-200">
                            {savedRecs.map((game, index) => (
                                <tr key={game.id} className="border-b border-gray-700">
                                    <th>
                                    <label>
                                        {index + 1}
                                    </label>
                                    </th>
                                    <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                        <div className="mask mask-squircle h-12 w-12">
                                            <img
                                            src={game.imgURL}
                                            alt="Game Cover Image" />
                                        </div>
                                        </div>
                                        <div>
                                        <div className="font-bold">{game.name}</div>
                                        </div>
                                    </div>
                                    </td>
                                    <td>
                                    {game.platforms}
                                    </td>
                                    <td>{game.releaseDate}</td>
                                    <th>
                                    </th>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot className="text-gray-100">
                        <tr>
                        <th></th>
                            <th>Name</th>
                            <th>Platforms</th>
                            <th>Release Date</th>
                            <th></th>
                        </tr>
                        </tfoot>
                    </table>
                    </div>

            </div>
        </div>
    );
};

export default AddRatings;