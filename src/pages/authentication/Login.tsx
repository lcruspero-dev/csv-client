/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthAPI } from "@/API/authEndPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import { Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
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
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await AuthAPI.login(form);

      if (response.data.status === "inactive") {
        toast({
          title: "Account Deactivated",
          description:
            "Your account has been deactivated. Please contact admin.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: "Login successful",
        variant: "default",
      });

      localStorage.setItem("user", JSON.stringify(response.data));
      login({ isAuthenticated: true, isAdmin: response.data.isAdmin });
      navigate(from, { replace: true });
    } catch (error: any) {
      console.log("Login error:", error);

      // Check for 401 status code which indicates invalid credentials
      if (
        error.response?.status === 401 ||
        error.message.includes("Invalid credentials")
      ) {
        toast({
          title: "Invalid Account",
          description: "Your email or password is incorrect.",
          variant: "destructive",
        });
      } else if (error.message === "Network Error") {
        toast({
          title: "Connection Error",
          description:
            "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description:
            error.message ||
            "An error occurred during login. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-end mb-40">
      <form className="w-1/2 space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-3xl drop-shadow-lg p-2 text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
          Welcome
        </h1>
        <Input
          placeholder="Email"
          name="email"
          type="email"
          className="w-full"
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Input
          placeholder="Password"
          name="password"
          type="password"
          className="w-full"
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
};

export default Login;
