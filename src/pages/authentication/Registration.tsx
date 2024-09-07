import { AuthAPI } from "@/API/authEndPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";

import { ChangeEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface Form {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const Registration = () => {
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log(form);
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast({ title: "Passwords do not match" });
      return;
    }

    // Email validation
    if (!form.email.endsWith("@csvnow.com")) {
      toast({
        title: "Invalid email domain",
        description: "Please use an email address ending with @csvnow.com",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await AuthAPI.register(form);
      console.log(response.data);
      toast({
        title: "Account created successfully",
        description: "We've created your account for you.",
      });

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data));

      // Update the authentication context
      login({ isAuthenticated: true, isAdmin: response.data.isAdmin });

      navigate("/");
    } catch (error) {
      toast({
        title: "Error creating account",
        description: "User Already Exists",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const isAuthenticated = localStorage.getItem("user");

  // If the user is authenticated, redirect them to the homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex w-full justify-end mb-40 mt-10">
      <form className="w-1/2 space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-4xl drop-shadow-lg p-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
          Create Account
        </h1>
        <Input
          placeholder="Full Name"
          name="name"
          type="text"
          className="w-full"
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Company Email"
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
        <Input
          placeholder="Confirm Password"
          name="confirm_password"
          type="password"
          className="w-full"
          onChange={handleChange}
          required
        />
        <Button className="w-full" type="submit">
          SignUp
        </Button>
      </form>
    </div>
  );
};

export default Registration;
