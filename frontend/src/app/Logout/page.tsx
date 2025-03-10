import { redirect } from "next/navigation";
import Cookies from "js-cookie";


const Logout = () => {

  const logoutProcess = async() => {
    const response = await fetch('http://localhost:8000/api/logout/', {
    method: 'POST',
    });

    if(response.status == 200){
      Cookies.remove('sessionid');
    }
  }
  logoutProcess();
  redirect('/Home/');
}

export default Logout;