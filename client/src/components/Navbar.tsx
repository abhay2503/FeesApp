import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlelogout = () => {
    if(window.confirm('Are You Sure!!')){
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        navigate('/');
        toast.success('Successfully Logged Out!');
        return;
      }
    }
  
  };

  return (
    <nav className="bg-gray-200 shadow-lg text-black md:flex md:flex-row md:items-center md:justify-between md:px-24 px-5 w-full z-10 p-2">
      <div className="flex items-center justify-between">
        <Link to="#">
          <img className="h-16 md:h-16" src="/NEWLOGO1.png" alt="Logo" />
        </Link>

        <span
          className="text-2xl cursor-pointer md:hidden inline-block float-right"
          onClick={toggleDropdown}
        >
          <i className="fas fa-solid fa-bars"></i>
        </span>
      </div>

      <ul
        className={`md:flex md:items-center z-[999] md:z-auto md:static absolute bg-gray-200 w-full left-0 md:w-auto md:bg-transparent md:pl-0 pl-2 md:opacity-100 ${
          isDropdownOpen ? 'opacity-100 top-[66px]' : 'opacity-0 top-[-400px]'
        } transition-all ease-in duration-500`}
      >
        <li className="mx-4 my-6 md:my-0 group">
          <a
            href="/dashboard"
            className="md:text-lg font-medium duration-200 relative pb-2"
          >
            DASHBOARD
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
          </a>
        </li>

        <li className="mx-4 my-6 md:my-0 group">
          <a
            href="/Fees"
            className="md:text-lg font-medium duration-200 relative pb-2"
          >
            FEES
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
          </a>
        </li>

        <li className="mx-4 my-6 md:my-0 group">
          <a
            href="/Delist"
            className="md:text-lg font-medium duration-200 relative pb-2"
          >
            DELIST
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
          </a>
        </li>

        <li className="mx-4 my-6 md:my-0">
          <a href="/dashboard" className="md:text-lg font-medium">
            <button
              className="bg-blue-200 text-black rounded-md text-sm px-4 py-2 hover:bg-blue-300 transition-all duration-300 md:text-md"
              onClick={handlelogout}
            >
              LOGOUT
            </button>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
