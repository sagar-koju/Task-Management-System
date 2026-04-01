"use client";
import { useState, useEffect } from 'react'
import Link from 'next/link';
import { Users, Settings, SquareKanban, LogIn, LogOut, FolderOpenDot } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/api/services/authService';
import { userService } from '@/api/services/userService';


const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams?.get('view') ?? 'projects';

  const topMenuItems = [
    { label: 'Boards', href: '/dashboard?view=board', icon: SquareKanban, view: 'board' },
    { label: 'My Projects', href: '/dashboard?view=projects', icon: FolderOpenDot, view: 'projects' },
    { label: 'Settings', href: '/dashboard?view=settings', icon: Settings, view: 'settings' },
  ];

  const workspaceItems = [
    { label: 'Members', href: '/dashboard?view=members', icon: Users, view: 'members' },
  ];


  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      try {
        await authService.logout();
        setIsLoggedIn(false);
        router.push('/');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

    useEffect(() => {
      const checkLoginStatus = async () => {
        try {
          await userService.getMe();
          setIsLoggedIn(true);
        } catch (error) {
          setIsLoggedIn(false);
        }
      };
      checkLoginStatus();
    }, []);

  return (
    <nav className='flex flex-col'>
      <div className={`bg-gray-100 h-screen p-2 pt-8 ${open ? "w-60" : "w-15"} relative duration-300 overflow-hidden flex flex-col`}>
        <div className='flex items-center gap-3'>
          <button
            className="text-gray-600 hover:text-gray-900 focus:outline-none px-3 shrink-0"
            onClick={() => setOpen(!open)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className={`text-md origin-left font-bold whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Task Manager
          </h1>
        </div>

        <hr className='my-5 mt-2 border-gray-300 border' />
        <div className='mt-4 flex flex-col gap-2'>
          {topMenuItems.map(({ label, href, icon: Icon, view }) => {
            const isActive = pathname === '/dashboard' && currentView === view;

            return (
            <Link
              key={label}
              href={href}
              className={`flex items-center justify-start rounded-md p-2 px-3 transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              <Icon className='h-5 w-5 shrink-0' />
              <span
                className={`text-md whitespace-nowrap transition-all duration-300 ${open ? 'ml-3 opacity-100' : 'ml-0 w-0 overflow-hidden opacity-0'}`}
              >
                {label}
              </span>
            </Link>
          )})}

          <div className={`flex items-center justify-start mt-5 transition-all duration-300 ${open ? 'gap-2 px-3' : 'gap-0 px-3'}`}>
            <p className={`text-sm font-semibold text-md origin-left whitespace-nowrap transition-all duration-300 ${open ? 'ml-2 opacity-100' : 'overflow-hidden opacity-0 ml-0 w-0'}`}>Team</p>
          </div>

          <hr className=' border-gray-300 border' />

          {workspaceItems.map(({ label, href, icon: Icon, view }) => {
            const isActive = pathname === '/dashboard' && currentView === view;

            return (
            <Link
              key={label}
              href={href}
              className={`flex items-center justify-start rounded-md p-2 px-3 transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              <Icon className='h-5 w-5 shrink-0' />
              <span
                className={`text-md whitespace-nowrap transition-all duration-300 ${open ? 'ml-3 opacity-100' : 'ml-0 w-0 overflow-hidden opacity-0'}`}
              >
                {label}
              </span>
            </Link>
          )})}
        </div>

        <div className='mt-auto pt-4'>
          <hr className='border-gray-300 border mb-2' />
          <button
            type='button'
            onClick={handleClick}
            className='w-full flex items-center justify-start rounded-md p-2 px-3 transition-colors hover:bg-gray-200'
          >
            {isLoggedIn ? <LogOut className='h-5 w-5 shrink-0' /> : <LogIn className='h-5 w-5 shrink-0' />}
            <span
              className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${open ? 'ml-2 opacity-100' : 'ml-0 w-0 overflow-hidden opacity-0'}`}
            >
              {isLoggedIn ? 'Logout' : 'Login'}
            </span>
          </button>
        </div>

      </div>

    </nav>
  );
};

export default Sidebar
