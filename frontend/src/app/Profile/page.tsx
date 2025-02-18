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
                <h3>Username: Username</h3> 
                <h3>Email: email@email.com</h3>

                <h3>Date of Birth: 1/1/2000</h3>
                <h3>First Name: fName</h3>
                <h3>Last Name: lName</h3>

                <form action="">
                    <fieldset>Password:</fieldset>
                    <button type="submit" className="btn w-[8rem] text-black bg-white hover:scale-[1.025] transition-transform">Change Password</button>
                </form>

                

            </div>
        </div>
    );
    
};

export default Profile;