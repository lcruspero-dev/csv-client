import { ResetPassword } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useState } from "react";
import BackButton from "../../components/kit/BackButton";

interface ResetPasswordFormData {
  email: string;
  password: string;
  confirmPassword: string;
  secretKey: string;
}

const AdminResetPassword: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: "",
  });
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordFormData> = {};

    // Email validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    // Password validation (at least 12 alphanumeric)
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{12,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 12 characters, and can include letters, numbers, and special characters";
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }

    // secretKey validation
    if (!formData.secretKey) {
      newErrors.secretKey = "secretKey is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // TODO: Implement actual reset password API call
        console.log("Reset Password Submitted:", formData);
        // Example axios call:
        const response = await ResetPassword.AdminResetPassword(formData);
        console.log("response", response.data);
        toast({
          title: "Success",
          description: `${response.data.message}`,
          variant: "default",
        });
        // Reset form after successful submission
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          secretKey: "",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Reset password failed", error);
        toast({
          title: "Failed",
          description: `${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-4 pt-16">
      <div className="absolute top-32 left-[28rem]">
        <BackButton />{" "}
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Reset User Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter user email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <Label htmlFor="password">Password</Label>
              <Input
                type={showPassword.password ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className={errors.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className="absolute right-3 top-8 text-gray-500"
              >
                {showPassword.password ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type={showPassword.confirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                className="absolute right-3 top-8 text-gray-500"
              >
                {showPassword.confirmPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                type="password"
                id="secretKey"
                name="secretKey"
                value={formData.secretKey}
                onChange={handleChange}
                placeholder="Enter admin Secret Key"
                className={errors.secretKey ? "border-red-500" : ""}
              />
              {errors.secretKey && (
                <p className="text-red-500 text-sm mt-1">{errors.secretKey}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResetPassword;
