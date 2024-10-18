import React, { useEffect, useState } from 'react'
import Loadingdialog from '../components/Loading'
import { useNavigate } from 'react-router-dom';
import {Student} from '../Student.ts'
import baseUrl from '../build.ts';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.tsx';


const StudentEnlist:React.FC = () => {
    const [load,setLoad]=useState<boolean>(false)
    const navigate=useNavigate();
    const [stuData,setStuData]=useState<Student[]>([])
    const formatDate = (date: Date): string => {
        const d=new Date(date)
        return d.toISOString().split('T')[0];
     }
     useEffect(()=>{
        getdata()
      },[])

     const getdata=async()=>{
        const tokenString=localStorage.getItem('token')
    
        if(tokenString){
          const token=JSON.parse(tokenString);
          setLoad(true)
          const response=await fetch(`${baseUrl}/api/fees/getDelistStudents`,{
            method:"GET",
            headers:{
              "Content-Type": "application/json",
              "authorization":token
            },
          });
          
            const data=await response.json()
            console.log(data);
            setLoad(false)
    
            if(!response.ok)
            {
              toast.error(data.msg)
              return
            }
            
           
            setStuData(data.msg)
        }
        else{
          toast.error('Plz Login!!')
          navigate('/')
        }
      }

      const handleEnlist=async(id:string)=>{
        if(window.confirm('Are You Sure!!')){
          const tokenString=localStorage.getItem('token')
      
        if(!tokenString)
        {
          toast.error('Plz Login')
          navigate("/")
          return
        }
      
        const token=JSON.parse(tokenString)
        setLoad(true)
      
        const response=await fetch(`${baseUrl}/api/fees/enlistStudentList/${id}`,{
          method:"PUT",
          headers: {
            "Content-Type": "application/json",
            "authorization":token
          }
        });
      
        const data=await response.json()
        setLoad(false)
      
       
        if(!response.ok)
        {
          toast.error(data.msg)
          return;
        }
       
        toast.success(data.msg)
       await getdata()
        }
       }


       const handleStudentDelete=async(id:string)=>{
        if(window.confirm('Are You Sure!!')){
          const tokenString=localStorage.getItem('token')
      
        if(!tokenString)
        {
          toast.error('Plz Login')
          navigate("/")
          return
        }
        const token=JSON.parse(tokenString)
        setLoad(true)
      
        const response=await fetch(`${baseUrl}/api/fees/studentDelete/${id}`,{
          method:"DELETE",
          headers: {
            "Content-Type": "application/json",
            "authorization":token
          }
        });
      
        const data=await response.json()
        setLoad(false)
      
       
        if(!response.ok)
        {
          toast.error(data.msg)
          return;
        }
       
        toast.success(data.msg)
       await getdata()
      }
       }
    
     console.log(stuData);
     
    
  return (
   <>
    <Loadingdialog  isloading={load}/>
    <Navbar/>
    <div className='background rounded-md bg-slate-50 m-2 '>
    <div className="table-section  w-full  px-7 py-2">
        <h2 className='text-xl text-black text-center font-bold underline underline-offset-2'>DISPLAY</h2>

        <div className="tablediv border-black border md:h-[33em] h-[27em] w-full my-5 rounded overflow-scroll">

<div className="relative overflow-x-auto ">
  <table className=" w-full text-sm text-center rtl:text-right text-gray-500">
    {stuData.length===0? <thead><tr><th className='text-2xl'>NO STUDENTS !!!</th></tr></thead>:
    <>
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 truncate">
     
     <tr>
       <th scope="col" className="md:px-6 md:py-3 truncate">
        Name
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Class
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Subject
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Date Of Join
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       FeesCycle
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Fees
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Action
       </th>
     </tr>
   </thead>
   <tbody>
   {stuData.map((stu,index)=>{
     return(
       <tr className="bg-white border-b truncate" key={index+1}>
         <td scope="row" className="md:px-2 md:py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
         {stu.StudentName}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.StudentClass}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.StudentSubject}
       </td>

       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {formatDate(stu.StudentDoj)}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.StudentFeesCycle}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.StudentFees}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-gray-900">
        
     
       <button className='rounded mr-1 bg-blue-700 text-xs text-white px-2 py-1  hover:bg-blue-500 shadow-md' onClick={()=>handleEnlist(stu.Studentid)}>Enlist</button>

       <button className='rounded bg-red-700 text-xs text-white px-2 py-1  hover:bg-red-500 shadow-md' onClick={()=>handleStudentDelete(stu.Studentid)}>Delete</button>
       </td>

         </tr>
     )
   })}



   </tbody>
    </>
    }
  
    
  </table>
</div>

</div>

        </div>
        </div>

   </>
  )
}

export default StudentEnlist