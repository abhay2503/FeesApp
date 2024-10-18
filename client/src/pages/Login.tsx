import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Loadingdialog from '../components/Loading';
import toast from 'react-hot-toast';
import baseUrl from '../build.ts'
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";

const Login:React.FC = () => {
    const [load, setload] = useState<boolean>(false);

    const navigate=useNavigate()
    const [user,setUser]=useState<{name:string;password:string}>({
    name:'',
    password:''
    })
    const [showPassword, setShowPassword] = useState<boolean>(false);
    
    useEffect(()=>{
        const token=localStorage.getItem('token')
        if(token){
          localStorage.removeItem('token')
        }
      },[])  

      const handleedit=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setUser({...user,[e.target.name]:e.target.value})
      }

      const login=async()=>{
        if(!user.name || !user.password)
        return toast.error('Plz Fill All Field')

        setload(true)
        const response=await fetch(`${baseUrl}/api/fees/login`,{
          method:"POST",
          headers: {
            "Content-Type": "application/json",   
          },
          body:JSON.stringify(user)
        })

        const data=await response.json()
        
        if(!response.ok)
        {
          setload(false) 
          toast.error(data.msg)
          return
        }

        localStorage.setItem('token',JSON.stringify(data.token))
        toast.success(data.msg)
        navigate('/dashboard')
      }


  return (
    <>
     <Loadingdialog  isloading={load}/>
     <div className=' bg-slate-50 h-screen flex items-center justify-center font-poppins'>
  
  <div className="shadow-lg w-96">
  <div className="border-t-8 rounded-sm border-[#C75B7A] bg-white p-12 shadow-2xl w-96">
       <img src='NEWLOGO1.png' className="md:w-[64%] mx-auto"/>
      <form className='space-y-6 p-6'>
     
    <div>
     <label htmlFor="name" className='block text-sm text-gray-700 font-medium'>Name</label>    
     <input type="text" id="name" name='name' value={user.name} onChange={handleedit}  placeholder='Enter Name'  className='text-sm py-2 form-input p-1 rounded mt-1 w-full block focus:outline-gray-500 focus:outline-1 outline-none border border-gray-300' />       
      </div> 
      <div>
      <label htmlFor="password" className='block text-sm text-gray-700 font-medium'>Password</label>    

      <div className="relative mt-5">
      <input className='text-sm py-2 pe-9 form-input p-1 rounded mt-1 w-full block focus:outline-gray-500 focus:outline-1 outline-none border border-gray-300' inputMode='numeric'
          type={showPassword ? "text" : "password"} name='password' placeholder="Enter Password" value={user.password} onChange={handleedit} />
      <button type="button" className="absolute right-3 top-2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <FaRegEye />  :  <FaRegEyeSlash />}
                                        </button>
                                    </div>
     {/* <input type="password" id="password" name='password' value={user.password} onChange={handleedit}  placeholder='Enter Password' className=' text-sm form-input p-1 rounded mt-1 w-full block focus:outline-gray-500 focus:outline-1 outline-none border border-gray-300' />        */}
     <button type='button' className="mt-10 transition block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-[#C75B7A] hover:bg-[#bc395e] focus:bg-[#bc395e] transform hover:-translate-y-1 hover:shadow-lg" onClick={login}>Login</button>
      </div>
    
  </form>
    </div>
  </div>
</div>
    </>
  )
}

export default Login