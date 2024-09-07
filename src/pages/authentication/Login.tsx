/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChangeEvent, useState } from "react";

import { AuthAPI } from "@/API/authEndPoint";
import { useAuth } from "@/context/useAuth";

import { Navigate, useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { login } = useAuth();
  const isAuthenticated = localStorage.getItem("user");

  // If the user is authenticated, redirect them to the homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log(form);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await AuthAPI.login(form);
      console.log(response.data);
      toast({
        title: "Success",
        description: " Login successfully",
        variant: "default",
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      login({ isAuthenticated: true, isAdmin: response.data.isAdmin });
      navigate(from, { replace: true });
    } catch (response: any) {
      if (response.message === "Invalid credentials") {
        toast({
          title: "Invalid Account",
          description: "Your email or password is incorrect.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred during login. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex w-full justify-end mb-40">
      <form className=" w-1/2 space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-4xl drop-shadow-lg p-2 text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
          Welcome
        </h1>
        <Input
          placeholder="Email"
          name="email"
          type="email"
          className="w-full"
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Password"
          name="password"
          type="password"
          className="w-full"
          onChange={handleChange}
          required
        />
        <Button className="w-full">Sign in</Button>
      </form>
    </div>
  );
};

export default Login;
