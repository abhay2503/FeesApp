import React, { useEffect, useState } from 'react'
import Loadingdialog from '../components/Loading'
import {Student,StudentInput,SubjectInput} from '../Student.ts'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import baseUrl from '../build.ts'
import Navbar from '../components/Navbar.tsx'

const Dashboard:React.FC = () => {

  const [load,setLoad]=useState<boolean>(false)
  const navigate=useNavigate();
  const [stuData,setStuData]=useState<Student[]>([])

  const calculateFeesCycle = (date: Date) => {
    const day = date.getDate();
  
    if (day >= 1 && day <= 10) {
      return "1-10";
    } else if (day >= 11 && day <= 20) {
      return "11-20";
    } else {
      return "21-30";
    }
  };

  

  const [inputData,setInputData]=useState<StudentInput>({
    Studentid:'',
    StudentName:'',
    StudentClass:'',
    StudentSubject:'',
    StudentDoj:new Date(),
     StudentFeesCycle: calculateFeesCycle(new Date()),
    StudentFees:0
  })

  const [selectedSubjects, setSelectedSubjects] = useState<SubjectInput>({
    Physics: false,
    Chemistry: false,
    Computer:false,
    Maths: false,
    Accounts: false,
    Economics: false,
    English: false,
    Biology:false,
    SST: false,
  });

  const formatDate = (date: Date): string => {
    const d=new Date(date)
    return d.toISOString().split('T')[0];
 }

  const getdata=async()=>{
    const tokenString=localStorage.getItem('token')

    if(tokenString){
      const token=JSON.parse(tokenString);
      setLoad(true)
      const response=await fetch(`${baseUrl}/api/fees/getStudents`,{
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

  useEffect(()=>{
    getdata()
  },[])


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
  
    if (name === "StudentDoj") {
      const selectedDate = new Date(value);
      const day = selectedDate.getDate();
  
      // Determine the fee cycle based on the day
      let feescycle = "";
      if (day >= 1 && day <= 10) {
        feescycle = "1-10";
      } else if (day >= 11 && day <= 20) {
        feescycle = "11-20";
      } else if (day >= 21 && day <= 31) {
        feescycle = "21-30";
      }
  
      // Update StudentDoj and StudentFeesCycle together
      setInputData(prevState => ({
        ...prevState,
        StudentDoj: selectedDate, // Use the string value of the date for input field
        StudentFeesCycle: feescycle,
      }));
    } else {
      // Handle other fields
      setInputData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  

 const handleSubjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, checked } = event.target;

  
  setSelectedSubjects(prev => ({
    ...prev,
    [name]: checked,
  }));

  let selectedSubjects = inputData.StudentSubject!=='' ? inputData.StudentSubject.split(',') : [];

  if (checked) {
    
    selectedSubjects.push(name);
  } else {
   
    selectedSubjects = selectedSubjects.filter(subject => subject !== name);
  }

  
  const updatedSubjectsString = selectedSubjects.join(',');

  // Update the inObject with the new studentSubject value
 setInputData({...inputData,"StudentSubject":updatedSubjectsString})
};



 const handleAddUpdate=async()=>{
  const tokenString=localStorage.getItem('token')

  if(tokenString){

    const token=JSON.parse(tokenString)
    const {Studentid,StudentName,StudentDoj,StudentFees,StudentClass,StudentFeesCycle,StudentSubject}=inputData

    console.log(inputData);
    
    if(StudentName==='' || StudentDoj===null || StudentFees===0 ||StudentClass=='' || StudentFeesCycle=='' || StudentSubject=='')
    {
      toast.error('Plz Fill all Fields!!!')
      return
    }
    if(Studentid===''){
      setLoad(true)
   
      // const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
      const response= await fetch(`${baseUrl}/api/fees/addStudent`,{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
          "authorization":token
        },
        body:JSON.stringify({StudentName,StudentDoj,StudentFees,StudentClass,StudentFeesCycle,StudentSubject,StudentIsDelist:"No"})
      });

      const data=await response.json()
      setLoad(false)
      if(!response.ok)
      return toast.error(data.msg)

      toast.success(data.msg)
      getdata()
      reset()

    }
    else{
      setLoad(true)

      const response=await fetch(`${baseUrl}/api/fees/updateStudent/${Studentid}`,{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
          "authorization":token
        },
        body:JSON.stringify({StudentName,StudentFees,StudentClass,StudentFeesCycle,StudentSubject}) 
      });

      const data=await response.json()
      setLoad(false)

     
      if(!response.ok)
      toast.error(data.msg)
      toast.success(data.msg)
      getdata()
      reset()
    }

  }
  else{
    toast.error('Plz Login')
    navigate("/")
  }
}

const reset=()=>{
  setInputData({
    Studentid:'',
    StudentName:'',
    StudentClass:'',
    StudentSubject:'',
    StudentDoj:new Date(),
    StudentFeesCycle: calculateFeesCycle(new Date()),
    StudentFees:0
  })
  setSelectedSubjects({
    Physics: false,
    Chemistry: false,
    Computer:false,
    Maths: false,
    Accounts: false,
    Economics: false,
    English: false,
    Biology:false,
    SST: false
  })
 }

 const handleedit=(student:Student)=>{
    
  
  const {Studentid,StudentName,StudentDoj,StudentFees,StudentClass,StudentFeesCycle,StudentSubject}=student
  setInputData({
    Studentid,StudentName,StudentDoj,StudentFees,StudentClass,StudentFeesCycle,StudentSubject
  })
 
  let availSubject = StudentSubject!=='' ? StudentSubject.split(',') : [];

 let updatedSubjects = { ...selectedSubjects }; 

 Object.keys(updatedSubjects).forEach(subject => {
   if (availSubject.includes(subject)) {
     updatedSubjects[subject as keyof SubjectInput] = true;
   } else {
     updatedSubjects[subject as keyof SubjectInput] = false;
   }
 });

 setSelectedSubjects(updatedSubjects);
 }

 const handleDelist=async(id:string)=>{
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

  const response=await fetch(`${baseUrl}/api/fees/updateStudentList/${id}`,{
    method:"PUT",
    headers: {
      "Content-Type": "application/json",
      "authorization":token
    }
  });

  const data=await response.json()
  setLoad(false)

 
  if(!response.ok)
  toast.error(data.msg)
  toast.success(data.msg)
  getdata()
  reset()
  }

  
 }


  return (
    <>

    <Loadingdialog  isloading={load}/>
    <Navbar/>
    <div className='background rounded-md bg-slate-50 m-2 '>
   
    <div className="dasboard-section flex flex-col gap-4 space-x-4 p-2 px-3 pt-3 md:flex-row md:items-start items-end">
        <div className="ticket-section flex  flex-col w-full px-1">
       
        <h2 className='text-xl text-black text-center font-bold underline underline-offset-2'>ADD DETAILS</h2>
        <div className="inputs mt-5">
        
           
            <div className="input-details mt-4 flex flex-1 md:flex-row flex-col justify-between">
              <div className="input-organisation w-full">
            <label htmlFor="Employeename" className="block mb-2 text-sm font-medium text-gray-900 " >Name</label>
            <input type="text" id="Employee" name="StudentName" value={inputData.StudentName} onChange={(e)=>handleChange(e)} aria-describedby="helper-text-explanation" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-1 focus:outline-gray-900 block w-full p-1" placeholder="Enter Student Name" />
            </div>

            </div>

            <div className="input-details mt-4 flex flex-1 md:flex-row flex-col justify-between gap-8">
              <div className="input-organisation w-full">
            <label htmlFor="Employeename" className="block mb-2 text-sm font-medium text-gray-900 " >Class</label>
            <select id="role" className="bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-1 focus:outline-gray-900 block w-full p-1" value={inputData.StudentClass} name="StudentClass" onChange={(e)=>handleChange(e)} >
            <option value="">--Select Option--</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>

            </select>
            </div>


            <div className="input-organisation w-full">
            <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 " >Date</label>
            <input type="date" disabled={inputData.Studentid!==''} id="mobno" aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-1 focus:outline-gray-900 block w-full p-1" name='StudentDoj' 
           value={formatDate(inputData.StudentDoj)} onChange={(e)=>handleChange(e)}/>
            </div>
            </div>


            <div className="input-details mt-4 flex flex-1 md:flex-row flex-col justify-between">
               <div className="input-organisation w-full">
            <label htmlFor="Employeename" className="block mb-2 text-sm font-medium text-gray-900 " >Fees Cycle</label>
            <input type="text" id="Employee" disabled={true} name="StudentFeesCycle" value={inputData.StudentFeesCycle} onChange={(e)=>handleChange(e)} aria-describedby="helper-text-explanation" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-1 focus:outline-gray-900 block w-full p-1" placeholder="Student FeesCycle" />
            </div>


            </div>

            <div className="input-details mt-4 flex flex-1 md:flex-row flex-col justify-between">
             


            <div className="input-organisation w-full">
            <label htmlFor="Employeename" className="block mb-2 text-sm font-medium text-gray-900 " >Fees</label>
            <input type="number" id="Employee" name="StudentFees" value={inputData.StudentFees} onChange={(e)=>handleChange(e)} aria-describedby="helper-text-explanation" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-1 focus:outline-gray-900 block w-full p-1" placeholder="Enter Student Fees" />
            </div>


            </div>


            <div className="input-details mt-4 flex flex-1 md:flex-row flex-col justify-between">
            <div className="input-organisation w-full">
            <label htmlFor="Employeename" className="block mb-2 text-sm font-medium text-gray-900 " >Subjects</label>
            <ul className="items-center w-full text-sm font-medium md:mt-6 text-gray-900  rounded-lg sm:flex">
    <li className="w-full  ">
        <div className="flex items-center ps-3">
            <input id="vue-checkbox-list" type="checkbox"  className="w-4 h-4 text-blue-600  " onChange={handleSubjectChange} name="Physics" checked={selectedSubjects.Physics}/>
            <label htmlFor="vue-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 ">Physics</label>
        </div>
    </li>
    <li className="w-full  ">
        <div className="flex items-center ps-3">
            <input id="react-checkbox-list" type="checkbox"  className="w-4 h-4 text-blue-600   " onChange={handleSubjectChange} name="Chemistry" checked={selectedSubjects.Chemistry}/>
            <label htmlFor="react-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 ">Chemistry</label>
        </div>
    </li>
    <li className="w-full  ">
        <div className="flex items-center ps-3">
            <input id="angular-checkbox-list" type="checkbox"  className="w-4 h-4 text-blue-600   " onChange={handleSubjectChange} name="Maths"  checked={selectedSubjects.Maths}/>
            <label htmlFor="angular-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 ">Maths</label>
        </div>
    </li>
  
</ul>

<ul className="items-center w-full text-sm font-medium text-gray-900  rounded-lg sm:flex">

    <li className="w-full  ">
        <div className="flex items-center ps-3">
            <input id="vue-checkbox-list" type="checkbox" onChange={handleSubjectChange} name="Biology" className="w-4 h-4 text-blue-600   " checked={selectedSubjects.Biology}/>
            <label htmlFor="vue-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 ">Biology</label>
        </div>
    </li>

    
    <li className="w-full  ">
        <div className="flex items-center ps-3">
            <input id="vue-checkbox-list" type="checkbox" onChange={handleSubjectChange} name="SST"  className="w-4 h-4 text-blue-600   " checked={selectedSubjects.SST}/>
            <label htmlFor="vue-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 ">SST</label>
        </div>
    </li>

    <li className="w-full  ">
        <div className="flex items-center ps-3">
            <input id="vue-checkbox-list" type="checkbox" onChange={handleSubjectChange} name="Computer" className="w-4 h-4 text-blue-600   " checked={selectedSubjects.Computer}/>
            <label htmlFor="vue-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 ">Computer</label>
        </div>
    </li>
   
</ul>
              </div>
              </div>


            <div className="detail-btn mt-10 flex flex-1 justify-start gap-4">
              <button className='rounded-lg text-md p-1 px-3 text-white bg-blue-700 hover:bg-blue-600' onClick={handleAddUpdate} >{inputData.Studentid!==''?"UPDATE":"ADD"}</button>  
              <button className='rounded-lg text-md p-1 px-3 text-white bg-blue-700 hover:bg-blue-600' onClick={reset} >RESET</button>  
            </div>
        </div>
        </div>

        <div className="table-section  w-full  px-3">
        <h2 className='text-xl text-black text-center font-bold underline underline-offset-2'>DISPLAY</h2>

        <div className="tablediv border-black border md:h-[33em] h-[27em] w-full my-5 rounded overflow-scroll">

<div className="relative overflow-x-auto">
  <table className=" w-full text-sm text-center rtl:text-right text-gray-500">
    {stuData.length===0? <thead><tr><th className='text-2xl'>ADD STUDENTS !!!</th></tr></thead>:
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
        
       <button className='rounded mr-2 bg-green-700 text-xs text-white px-3 py-1  hover:bg-green-500 shadow-md' onClick={()=>handleedit(stu)}>Edit</button>
       <button className='rounded bg-blue-700 text-xs text-white px-3 py-1  hover:bg-blue-500 shadow-md' onClick={()=>handleDelist(stu.Studentid)}>Delist</button>
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
   </div>
    </>
    
  )
}

export default Dashboard