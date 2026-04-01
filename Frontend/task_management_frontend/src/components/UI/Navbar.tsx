"use client";
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import SearchBar from './Searchbar'

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const menuref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuref.current && target && !menuref.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className='grid grid-cols-5 gap-10 items-center h-20 '>
        <div className='flex items-center gap-2'>
          <Image src='/assets/logo.png' alt='Logo' width={20}
            height={20} className='h-11 w-11 rounded-full' />
          <div className='text-blue-900 font-bold text-lg'>
            <p className=' font-semibold text-black'>Task</p>
            <p className='text-sm font-semibold text-black -mt-2'>Management</p>
          </div>
        </div>
        <div className='flex gap-10 col-span-3 max-w-150  '><SearchBar />
          <button className='bg-blue-700 text-sm text-white border-0 rounded-md w-20 hover:bg-blue-600'>Create</button>
        </div>
        <div className="flex justify-end">
          <Image
            src="/assets/profile.jpg"
            alt="Avatar"
            width={20}
            height={20}
            className="rounded-full h-11 w-11 hover:border-2 hover:ring-2 hover:ring-blue-500 mx-5 hover:cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>
      </div>
      {open && (
        <div className="absolute right-0 mt-2 mr-8 w-52 bg-white border rounded-lg shadow-md" ref={menuref}>
          <ul className="p-2">
            <li className="p-2 hover:bg-gray-100 cursor-pointer">My Account</li>
            <li className="p-2 hover:bg-gray-100 cursor-pointer">Settings</li>
            <li className="p-2 hover:bg-gray-100 cursor-pointer text-red-500">Logout</li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar
