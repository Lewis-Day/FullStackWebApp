import Link from "next/link";


const Profile = () => {

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

                <form action="" className="flex flex-row justify-between">
                    <fieldset>Username:</fieldset>
                    <input type="text" placeholder="current username" className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Username</button>
                </form>

                <form action="" className="flex flex-row justify-between">
                    <fieldset>Email:</fieldset>
                    <input type="email" placeholder="email@email.com" className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Email</button>
                </form>

                <form action="" className="flex flex-row justify-between">
                    <fieldset>Date of Birth:</fieldset>
                    <input type="date" placeholder="" className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change First Name</button>
                </form>

                <form action="" className="flex flex-row justify-between">
                    <fieldset>First Name:</fieldset>
                    <input type="text" placeholder="current fname" className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change First Name</button>
                </form>

                <form action="" className="flex flex-row justify-between">
                    <fieldset>Last Name:</fieldset>
                    <input type="text" placeholder="current lname" className="bg-white h-[2.5rem]"/>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Last Name</button>
                </form>

                <form action="" className="flex flex-row justify-between">
                    <fieldset>Password:</fieldset>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Password</button>
                </form>

                

            </div>
        </div>
    );
    
};

export default Profile;