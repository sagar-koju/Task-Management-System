"use client";
import React from 'react'
import Navbar from '@/components/UI/Navbar'
import Sidebar from '@/components/UI/Sidebar'
import { useSearchParams } from 'next/navigation'
import Board from '@/components/Project/Board';
import Project from '@/components/Project/Project';
import MyProject from '../components/Project/MyProject';
import Member from '@/components/Project/Member';
import UserProfile from '@/components/Profile/UserProfile';

const Dashboard = () => {
    const searchParams = useSearchParams();
    const view = searchParams?.get('view') ?? 'projects';

    const renderSelectedView = () => {
        if (view === 'board') {
            return <Board />;
        }

        if (view === 'project') {
            return <Project />;
        }

        if (view === 'projects' || view === 'workspace') {
            return <MyProject />;
        }

        if (view === 'members') {
            return <Member />;
        }

        if (view === 'settings') {
            return <UserProfile />;
        }

        return <MyProject />;
    };

  return (
    <div>
            <div className='h-screen flex overflow-hidden'>
            <Sidebar />
                        <div className='flex flex-col flex-1 overflow-hidden'>
                                <div className='sticky top-0 z-20 bg-white'>
                                    <Navbar />
                                </div>
                                <div className="flex-1 overflow-y-auto">
                    {renderSelectedView()}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard
