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

    

    return(
        <div className="bg-black h-screen w-full pt-5 pb-5">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100 hover:bg-gray-500 hover:text-cyan-400">VGR</Link>
                </div>
                <div>
                    <ul className="menu menu-horizontal text-black">
                        <li>
                            <Link href="/Recommendations/" className="hover:bg-gray-500 hover:text-cyan-400 text-gray-100">Recommendations</Link>
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

                </>
                ) : (
                    <div className="skeleton h-[22rem] w-[16.5rem]"></div>
                )}

            </div>
        </div>
    );
    
};

export default Profile;