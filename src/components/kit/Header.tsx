import { UserProfileAPI } from "@/API/endpoint";
import logo from "@/assets/logo.webp";
import NotificationBell from "@/components/kit/NotificationBell";
import { useViewMode } from "@/components/kit/ViewModeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/useAuth";
import { Key, LogOut, NotebookPenIcon, User, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, isLoading, user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { setAdminView } = useViewMode();
  // Fetch user profile when authenticated or user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const response = await UserProfileAPI.getProfile();
        if (response.data?.avatar) {
          setAvatarUrl(
            `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${
              response.data.avatar
            }`
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    setAvatarUrl(null);
    logout(); // This already handles localStorage clearing
  };

  const handleEditProfile = () => navigate("/profile/edit");
  const handleChangePassword = () => navigate("/profile/change-password");

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#5a95ff] to-[#bdd5ff]">
        <div className="container p-5">
          <div className="flex flex-row justify-between">
            <img src={logo} alt="Logo" width={75} height={50} />
            <div className="flex items-center gap-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#5a95ff] to-[#bdd5ff]">
      <div className="container p-5">
        <div className="flex flex-row justify-between">
          <div>
            <img
              src={logo}
              alt="Company Logo"
              width={75}
              height={50}
              onClick={() => navigate("/")}
              className="cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-1xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                  Welcome, {user.name}
                </span>
                {user.isAdmin && (
                  <div className="pr-4">
                    <NotificationBell />
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 cursor-pointer border-2 border-white hover:border-blue-300 transition-all">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={avatarUrl || undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate w-40">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleEditProfile}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    {(user.isAdmin ||
                      user.role === "TM" ||
                      user.role === "TL") && (
                      <DropdownMenuItem
                        onClick={() => navigate("/schedule-and-attendance")}
                        className="cursor-pointer"
                      >
                        <NotebookPenIcon className="mr-2 h-4 w-4" />
                        <span>Shift & Attendance</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleChangePassword}
                      className="cursor-pointer"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem
                        onClick={() => {
                          setAdminView(true); // This will set viewAsUser to false
                          navigate("/");
                        }}
                        className="cursor-pointer"
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500 hover:text-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <div>
                  <Link to="/sign-in">
                    <Button>Login</Button>
                  </Link>
                </div>
                <div>
                  <Link to="/sign-up">
                    <Button>Register</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
