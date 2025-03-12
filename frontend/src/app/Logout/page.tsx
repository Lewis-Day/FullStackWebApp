'use client';

import { redirect } from "next/navigation";
import Cookies from "js-cookie";


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