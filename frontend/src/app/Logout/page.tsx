'use client';

import { redirect } from "next/navigation";
import Cookies from "js-cookie";

// Function for managing logging out
// Removes data saved in the Cookies and localStorage, ready for a new session
// Redirects to the home page
const Logout = () => {

  function logoutProcess() {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('user');
  }
  logoutProcess();
  redirect('/Home/');
}

export default Logout;