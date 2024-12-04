import logo from "@/assets/logo.webp";
import { useAuth } from "@/context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
  decodedToken?: string; // Optional, in case you decode the token
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
  console.log(user);
  return (
    <div className="bg-gradient-to-b from-[#5a95ff] to-[#bdd5ff]">
      <div className="container p-5 ">
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
                <span className=" text-1xl  p-2 drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                  {" "}
                  Welcome, {user?.name}
                </span>
                <Button onClick={handleLogout}>Logout</Button>
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
