import { Outlet } from "react-router-dom";
import loginImage from "../../assets/Customer-Service.gif";

const Layout = () => {
  return (
    <div className="container mx-auto py-5">
      <h1 className="text-4xl drop-shadow-lg p-2 text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4] mt-6">
        Employee Portal
      </h1>
      <div className="grid grid-cols-2  justify-center items-center drop-shadow-lg">
        <div className="mr-10">
          <Outlet />
        </div>
        <div>
          <img src={loginImage} alt="Login" width={500} height={500} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
