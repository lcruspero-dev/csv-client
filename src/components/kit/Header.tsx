import logo from "@/assets/logo.webp";
import NotificationBell from "@/components/kit/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/useAuth";
import { Key, LogOut, User, UserCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface User {
  profileImage: string | undefined;
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
  decodedToken?: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user: User = JSON.parse(localStorage.getItem("user")!);
  const { isAuthenticated } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate("/sign-in");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleChangePassword = () => {
    navigate("/profile/change-password");
  };

  // Get initials from user name for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-gradient-to-b from-[#5a95ff] to-[#bdd5ff]">
      <div className="container p-5">
        <div className="flex flex-row justify-between">
          <div>
            <img
              src={logo}
              alt="test"
              width={75}
              height={50}
              onClick={() => navigate("/")}
              className="cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            {isAuthenticated.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-1xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                  Welcome, {user?.name}
                </span>
                {user?.isAdmin && (
                  <div className="pr-4">
                    <NotificationBell />
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 cursor-pointer border-2 border-white hover:border-blue-300 transition-all">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.profileImage}
                          alt={user?.name}
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate w-40">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleEditProfile}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleChangePassword}
                      className="cursor-pointer"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
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
