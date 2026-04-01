"use client";
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { authService } from '@/api/services/authService';
import { useRouter } from "next/navigation";


const Login = () => {
    const router = useRouter();
    const [state, setState] = useState("login");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            if (state === "register") {
                if (formData.password.length < 6) {
                    setErrorMessage("Password must be at least 6 characters long");
                    return;
                }
                setErrorMessage("");
                setLoading(true);

                await authService.register({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                });
                toast.success("OTP sent to your email");
                router.push(`/verifyEmail?email=${encodeURIComponent(formData.email)}`);
                setLoading(false);
            } else {
                setLoading(true);
                await authService.login({
                    email: formData.email.trim(),
                    password: formData.password,
                });
                setLoading(false);
                toast.success("Login successful!");
                router.push("/dashboard");
            }
        } catch (error: any) {
            const serverMessage =
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error?.message ||
                "Registration failed. Please try again.";

            toast.error(serverMessage);
            setLoading(false);
        }

    }

    const handleChange = (e: any) => {
        e.preventDefault()
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <form onSubmit={handleSubmit} className="sm:w-87.5 w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
                <h1 className="text-gray-900 text-3xl mt-10 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
                <p className={`${errorMessage ? "text-red-500 text-xs" : "text-gray-500"} text-sm mt-2`}>
                    {errorMessage || `Please ${state} in to continue`}
                </p>
                {state !== "login" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
                    </div>
                )}
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <input type="password" name="password" placeholder="Password" className="border-none outline-none ring-0" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="mt-4 text-center text-gray-500">
                    <button className="text-sm" type="reset">Forget password?</button>
                    <a href="#" className="text-sm  ml-1 text-blue-500 hover:underline">Reset</a>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full h-11 rounded-full text-white bg-blue-500 hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        state === "login" ? "Login" : "Sign up"
                    )}
                </button>

                <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-blue-500 hover:underline">click here</a></p>
            </form>
        </div>
    )
}


export default Login

