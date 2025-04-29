'use client';

import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const pageRouter = useRouter();
    

    const formSubmit = async (e : React.FormEvent) => {

        localStorage.clear();

        e.preventDefault();

        if(username == "admin"){
            redirect("http://localhost:8000/admin/")
        }

        const formData = {
            username,
            password,
        };


        const submit = await fetch('http://localhost:8000/api/login/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(formData),

        });

        const response = await submit.json();

        if(submit.status == 200){
            console.log(submit);

            console.log(response)
            Cookies.set('access_token', response.access, { expires: 1 });
            Cookies.set('refresh_token', response.refresh, { expires: 7 });

            localStorage.setItem('user', response.user);
            pageRouter.push('/Recommendations')
        }
        else{
            console.log(submit);
        }
    }




    return(
        <div className="bg-black h-screen w-full pt-5 ">
            <div className="navbar bg-gray-800 bg-opacity-75 backdrop-blur-md rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-gray-100 hover:bg-gray-500 hover:text-cyan-400">VGR</Link>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 text-gray-100">
                    <li><Link href="/SignUp" className="hover:bg-gray-500 hover:text-cyan-400">Sign Up</Link></li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col justify-self-center">
                <h2 className="mr-[31rem] text-2xl text-gray-100 font-bold py-5">Login</h2>
            </div>
            


            <form className="flex flex-col justify-self-center" method="POST" onSubmit={formSubmit}>
                <label className="input input-bordered flex items-center gap-2 bg-white mb-10 w-[35rem]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70">
                    <path
                    d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                    <input type="text" className="bg-white placeholder-gray-500" placeholder="Username" required onChange={(e) => setUsername(e.target.value)}/>
                </label>
                
                <label className="input input-bordered flex items-center gap-2 bg-white mb-10 w-[35rem]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70">
                    <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd" />
                </svg>
                <input type="password" className="bg-white placeholder-gray-500" placeholder="Password" required onChange={(e) => setPassword(e.target.value)}/>
                </label>

                <Link href="/ForgotPassword" className="flex flex-row justify-end pb-5 text-cyan-400 font-bold">Forgot Password?</Link>

                <div className="flex justify-center">
                    <button type="submit" className="btn w-[8rem] text-gray-100 hover:bg-cyan-600 hover:scale-[1.025] transition-transform duration-200 shadow-md bg-cyan-400">Login</button>
                </div>

                <h3 className="flex flex-row justify-start pt-5 text-gray-100">Don't Have an Account? &nbsp;<Link href="/SignUp" className="font-bold text-cyan-400">Sign Up</Link></h3>

                
            </form>
        </div>
        
    );
    
};

export default Login;