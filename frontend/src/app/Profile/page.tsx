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

var currentUsername:string;

const Profile = () => {

    const [newPassword, setNewPassword] = useState('');

    const [user, setUser] = useState<userInfo>({
        username: '',
        email: '', 
        firstName: '',
        lastName: '', 
        dob: '',
    });

    useEffect(() => {
        
        const fetchUserInfo = async () => {

            try{
                const userinforesponse = await fetch("http://127.0.0.1:8000/api/user/", {
                    method:'GET',
                });
        
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

        fetchUserInfo();
        
                
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
            },


            body: JSON.stringify(sendData),

        });

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
            },


            body: JSON.stringify(sendData),

        });

        // const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
        }
        else{
            console.log(submit);
        }

        
    };

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
        </div>
    );
    
};

export default Profile;