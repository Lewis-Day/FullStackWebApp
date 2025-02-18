'use client';


import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";


const SignUp = () => {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');

    const pageRouter = useRouter();
    

    const formSubmit = async (e : React.FormEvent) => {

        e.preventDefault();

        const formData = {
            username,
            email,
            password,
            firstName,
            lastName,
            dob,
        };

        const submit = await fetch('http://localhost:8000/api/signup/', {
            method:'POST',

            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(formData),

        });

        // const response = await submit.json();

        if(submit.status == 201){
            console.log(submit);
            pageRouter.push('/Login')
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
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 text-black">
                    <li><Link href="/Login">Login</Link></li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col justify-self-center">
                <h2 className="mr-[29.5rem] text-2xl text-gray-100 font-bold py-5">Sign Up</h2>
            </div>
            


            <form className="flex flex-col justify-self-center" method="POST" onSubmit={formSubmit}>

                <label className="text-white pb-3">Account Details</label>

                <input type="text" name='username' placeholder="Enter Username" className="input input-bordered w-[35rem] mb-3 text-black placeholder-black bg-white" required onChange={(e) => setUsername(e.target.value)}/>

                <input type="email" name='email' placeholder="Enter Email" className="input input-bordered w-[35rem] mb-3 text-black placeholder-black bg-white" required onChange={(e) => setEmail(e.target.value)}/>

                <input type="password" name='password' placeholder="Enter Password" className="input input-bordered w-[35rem] mb-5 text-black placeholder-black bg-white" required onChange={(e) => setPassword(e.target.value)}/>

                <label className="text-white pb-3">Name</label>
                
                <fieldset className="flex flex-row pb-5">

                    <input type="text" name='firstName' placeholder="First Name" className="input input-bordered w-full max-w-xs bg-white placeholder-black text-black mr-1" required onChange={(e) => setFirstName(e.target.value)}/>

                    <input type="text" name='lastName' placeholder="Last Name" className="input input-bordered w-full max-w-xs bg-white placeholder-black text-black ml-1" required onChange={(e) => setLastName(e.target.value)}/>

                </fieldset>

                <label className="text-white pb-3">Date of Birth</label>
                <input type="date" name='dob' className="input input-bordered w-[35rem] mb-5 bg-white" required onChange={(e) => setDob(e.target.value)}/>

                <div className="flex justify-center">
                    <button type="submit" className="btn w-[8rem] text-black hover:scale-[1.025] transition-transform bg-white">Sign Up</button>
                </div>

                <h3 className="flex flex-row justify-start pt-5 text-white">Already Have an Account? &nbsp;<Link href="/Login" className="font-bold">Login</Link></h3>

                
            </form>
        </div>
    );

};

export default SignUp;