import { ResetPassword, UserAPI, UserProfileAPI } from "@/API/endpoint";
import UserDetails from "@/components/kit/UserDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Check, EyeIcon, EyeOffIcon, Pencil, Search, X } from "lucide-react";
import React, { useState } from "react";
import BackButton from "../../components/kit/BackButton";

interface ResetPasswordFormData {
  email: string;
  password: string;
  confirmPassword: string;
  secretKey: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  status: string;
  isAdmin: boolean;
  role: string;
  loginLimit?: number;
}

interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  streetAddress: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipCode: string;
  personalEmail: string;
  contactNumber: string;
  dateOfBirth: string;
  emergencyContactPerson: string;
  emergencyContactNumber: string;
  relationship: string;
  civilStatus: string;
  gender: string;
  pagibigNo: string;
  philhealthNo: string;
  sssNo: string;
  tinNo: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const UserManagement: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [editingLoginLimit, setEditingLoginLimit] = useState<{
    userId: string;
    value: number;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordFormData> = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{12,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 12 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }
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
        const response = await ResetPassword.AdminResetPassword(formData);
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          secretKey: "",
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast({
          title: "Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await UserAPI.searchUser(searchQuery);
      setUsers(response.data);
      if (response.data.length === 0) {
        toast({
          title: "No Users Found",
          description: "No users match your search criteria",
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }

    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      if (newStatus === "inactive") {
        await UserAPI.setUserToInactive(userId);
      } else {
        await UserAPI.setUserToActive(userId);
      }

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );

      toast({
        title: "Success",
        description: `User ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
        variant: "default",
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const viewUserDetails = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const response = await UserProfileAPI.getProfileById(userId);
      setSelectedUserProfile(response.data);
      setModalOpen(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Failed to Load Profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleEditLoginLimit = (userId: string, currentLimit: number = 1) => {
    setEditingLoginLimit({ userId, value: currentLimit });
  };

  const handleSaveLoginLimit = async () => {
    if (!editingLoginLimit) return;

    try {
      await UserAPI.updateLoginLimit(editingLoginLimit.userId, {
        loginLimit: editingLoginLimit.value,
      });
      
      setUsers(users.map(user => 
        user._id === editingLoginLimit.userId 
          ? { ...user, loginLimit: editingLoginLimit.value } 
          : user
      ));
      
      setEditingLoginLimit(null);
      toast({
        title: "Success",
        description: "Login limit updated successfully",
        variant: "default",
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingLoginLimit(null);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-4 pt-16">
      <div className="absolute top-32 left-[28rem]">
        <BackButton />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reset" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reset">Reset Password</TabsTrigger>
              <TabsTrigger value="deactivate">Manage User</TabsTrigger>
            </TabsList>

            <TabsContent value="reset">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
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
                    className={errors.secretKey ? "border-red-500" : ""}
                  />
                  {errors.secretKey && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.secretKey}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="deactivate">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Status: {user.status}
                        </p>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => viewUserDetails(user._id)}
                          disabled={loadingProfile}
                          className="text-xs text-blue-600 p-0 m-0"
                        >
                          View Details
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center space-y-1">
                          <Label htmlFor={`login-limit-${user._id}`} className="text-xs text-gray-500">
                            Daily Login Limit
                          </Label>
                          {editingLoginLimit?.userId === user._id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editingLoginLimit.value}
                                onChange={(e) => 
                                  setEditingLoginLimit({
                                    ...editingLoginLimit,
                                    value: parseInt(e.target.value)
                                  })
                                }
                                className="h-8 rounded border border-gray-300 px-2 text-sm"
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                              </select>
                              <Button 
                                size="sm" 
                                onClick={handleSaveLoginLimit}
                                className="h-8 px-2"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8 px-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
                                {user.loginLimit || 1}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditLoginLimit(user._id, user.loginLimit)}
                                className="h-8 px-2 text-gray-500 hover:text-gray-700"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`user-status-${user._id}`}>
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Label>
                          <Switch
                            id={`user-status-${user._id}`}
                            checked={user.status === "active"}
                            onCheckedChange={() =>
                              handleStatusToggle(user._id, user.status)
                            }
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Profile Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedUserProfile && (
            <UserDetails
              userData={selectedUserProfile}
              onEdit={() => {
                // Handle edit functionality here
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;