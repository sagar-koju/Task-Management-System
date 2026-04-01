import React from 'react'
import Navbar from '@/components/UI/Navbar'
import Sidebar from '@/components/UI/Sidebar'
import Otp from '@/components/Authentication/Otp'
const Homepage = () => {
    return (
        <div className='min-h-screen flex'>
            <Sidebar />
            <div className='flex flex-col flex-1'>
                <Navbar />
            </div>
        </div>
        
    )   
}

export default Homepage
