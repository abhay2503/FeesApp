import React, { useEffect, useState } from 'react'
import Loadingdialog from '../components/Loading'
import { useNavigate } from 'react-router-dom';
import {StudentFees,FeesDetails} from '../Student.ts'
import baseUrl from '../build.ts';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.tsx';


const Fees:React.FC = () => {
    const [load,setLoad]=useState<boolean>(false)
    const navigate=useNavigate();
    const [stuFeesData,setStuFeesData]=useState<StudentFees[]>([])
    const [selectedMonth,setSelectedMonth]=useState<string>('')
    const [studentArr,setStudentArr]=useState<FeesDetails[]>([])
    // const [feesDetails,setFeesDetails]=useState<FeesDetails[]>([])

    useEffect(()=>{
    
        const token=localStorage.getItem('token')
        if(!token)
        {
          navigate('/')
          toast.error('Plz Login')
        }
      },[])

      const formatDate = (date: Date): string => {
        console.log(date);
        
        const d=new Date(date)
        return d.toISOString().split('T')[0];
     }

    const getdata=async(month:string)=>{
        const tokenString=localStorage.getItem('token')
    
        if(tokenString){
          const token=JSON.parse(tokenString);
          setLoad(true)
          const response=await fetch(`${baseUrl}/api/fees/getStudentsFees`,{
            method:"POST",
            headers:{
              "Content-Type": "application/json",
              "authorization":token
            },
            body:JSON.stringify({month})
          });
          
            const data=await response.json()
            console.log(data);
            setLoad(false)
    
            if(!response.ok)
            {
              toast.error(data.msg)
              return
            }
    
            if(data.msg.length==0)
            {
                toast.error('No Data Found!')
                setStuFeesData([])
                return
            }
            setStuFeesData(data.msg)
            
        }
        else{
          toast.error('Plz Login!!')
          navigate('/')
        }
      }
    
      const handleChange=(e:React.ChangeEvent<HTMLSelectElement>)=>{
        setSelectedMonth(e.target.value)
        getdata(e.target.value)
        setStudentArr([])
      }

      const handleStudentFees = (feesid: string, studentName: string, studentFees: number, isChecked: boolean) => {
        if (isChecked) {
          // If the checkbox is checked, add the student
          setStudentArr(prev => [...prev, { "id": feesid, "StudentName": studentName, "StudentFees": studentFees }]);
        } else {
          // If the checkbox is unchecked, remove the student
          setStudentArr(prev => prev.filter(student => student.id !== feesid));
        }
      };

  
      console.log(setStudentArr);
      
      

      const handleSubmitFees=async()=>{
        if(studentArr.length==0)
        {
            toast.error("Select Students First")
            return
        }
        const confirmMessage = studentArr
        .map((stu) => `${stu.StudentName} - ${stu.StudentFees}`)
        .join('\n');
    
      const isConfirmed = window.confirm(`Are you sure you want to proceed with the following students?\n\n${confirmMessage}`);
    
        if (isConfirmed) {
            const tokenString=localStorage.getItem('token')

            if(!tokenString){
                toast.error('Plz Login!!')
                navigate('/')
                return
            }

            const token=JSON.parse(tokenString);
          setLoad(true)
          const response=await fetch(`${baseUrl}/api/fees/updateFees`,{
            method:"POST",
            headers:{
              "Content-Type": "application/json",
              "authorization":token
            },
            body:JSON.stringify({studentArr,month:selectedMonth})
          });
          const data=await response.json()
          setLoad(false)
          if(!response.ok)
          return toast.error(data.msg)
    
          toast.success(data.msg)
          getdata(selectedMonth)
          setStudentArr([])
        }
     
      }
    
  return (
    <>
    <Loadingdialog  isloading={load}/>
    <Navbar/>
    <div className='background rounded-md bg-slate-50 m-2 '>
   
    <div className="dasboard-section flex flex-col gap-4 md:space-x-4 p-2 px-3 pt-3 md:flex-row md:items-start">
        <div className="ticket-section flex  flex-col md:w-[40%] w-full px-1">
       
        <h2 className='text-xl text-black text-center font-bold underline underline-offset-2'>SELECT MONTH</h2>
        <div className="inputs mt-5">
        
           
            <div className="input-details mt-4 flex flex-1 md:flex-row flex-col justify-between">
              <div className="input-organisation w-full">
            <label htmlFor="Employeename" className="block mb-2 text-sm font-medium text-gray-900 " >Month</label>
           
            <select id="role" className="bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-1 focus:outline-gray-900 block w-full p-1" value={selectedMonth} name="StudentClass" onChange={(e)=>handleChange(e)}>
            <option value="">--Select Option--</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>

            </select>
            </div>

            </div>

           


        </div>
        </div>

        <div className="table-section md:w-[60%] w-full  md:px-3">
        <h2 className='text-xl text-black text-center font-bold underline underline-offset-2'>DISPLAY</h2>

        <div className="tablediv border-black border md:h-[30em] h-[27em] w-full my-5 rounded overflow-scroll">

<div className="relative overflow-x-auto">
  <table className=" w-full text-sm text-center rtl:text-right text-gray-500">
    {stuFeesData.length===0? <thead><tr><th className='text-2xl'>NO STUDENTS !!!</th></tr></thead>:
    <>
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 truncate">
     
     <tr>
     <th scope="col" className="md:px-6 md:py-3 truncate">
        Select
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
        Name
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Class
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Month 
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Year
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Payment
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Payment Date
       </th>
       <th scope="col" className="md:px-6 md:py-3 truncate">
       Status
       </th>
      
     </tr>
   </thead>
   <tbody>
   {stuFeesData.map((stu,index)=>{
     return(
       <tr className={`${stu.payStatus==="Yes"?'bg-green-300 opacity-90':'bg-red-300'} border-b truncate`} key={index+1} >
        
         <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
         <input id="react-checkbox-list" type="checkbox"  className="w-4 h-4 text-blue-600" disabled={stu.payStatus==="Yes"}  checked={(studentArr.some(student => student.id === stu.id))|| stu.payStatus==="Yes"}  onChange={(e) => handleStudentFees(stu.id, stu.StudentName, stu.StudentFees, e.target.checked)}/>
         </td>
         <td scope="row" className="md:px-2 md:py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
         {stu.StudentName}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.StudentClass}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.month}
       </td>

       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.year}
       </td>
        <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.FeesPaid}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.payDate===null?'':formatDate(stu.payDate)}
       </td>
       <td className="md:px-2 md:py-3 truncate whitespace-nowrap font-medium overflow-hidden overflow-ellipsis text-sm text-gray-900 ">
       {stu.payStatus==="Yes"?"Paid":"Not Paid"}
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
        <div className='w-full flex items-center justify-center'>
        <button className='w-[40%] rounded text-md md:my-3 bg-green-700 text-md text-white px-5 py-2  hover:bg-green-500 shadow-md' onClick={()=>handleSubmitFees()}>Submit</button>
        </div>
      
        </div>  
    </div>
   </div>
    </>
  )
}

export default Fees