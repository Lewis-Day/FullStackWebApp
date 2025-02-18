'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const pageRouter = useRouter();
    

    const formSubmit = async (e : React.FormEvent) => {

        e.preventDefault();

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

        // const response = await submit.json();

        if(submit.status == 200){
            console.log(submit);
            pageRouter.push('/Recommendations')
        }
        else{
            console.log(submit);
        }
    }




    return(
        <div className="bg-gray-700 h-screen w-full pt-5 ">
            <div className="navbar bg-white rounded-md mx-auto max-w-screen-xl">
                <div className="flex-1">
                    <Link href="/Home" className="btn btn-ghost text-xl text-black">VGR</Link>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 text-black">
                    <li><Link href="/SignUp">Sign Up</Link></li>
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
                        d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path
                        d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                    </svg>
                    <input type="text" className="bg-white" placeholder="Username" required onChange={(e) => setUsername(e.target.value)}/>
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
                <input type="password" className="" placeholder="Password" required onChange={(e) => setPassword(e.target.value)}/>
                </label>

                <Link href="" className="flex flex-row justify-end pb-5 text-white font-bold">Forgot Password?</Link>

                <div className="flex justify-center">
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Login</button>
                </div>

                <h3 className="flex flex-row justify-start pt-5 text-white">Don't Have an Account? &nbsp;<Link href="/SignUp" className="font-bold">Sign Up</Link></h3>

                
            </form>
        </div>
        
    );
    
};

export default Login;