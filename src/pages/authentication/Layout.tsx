import { Outlet } from "react-router-dom";
import loginImage from "../../assets/Customer-Service.gif";

const Layout = () => {
  return (
    <div className="container mx-auto py-5">
      <h1 className=" text-2xl drop-shadow-lg font-bold text-center">
        We aim to resolve your concerns quickly and effectively, <br />
        minimizing downtime and maximizing productivity.
      </h1>
      <div className="grid grid-cols-2  justify-center items-center drop-shadow-lg">
        <div className="mr-10">
          <Outlet />
        </div>
        <div>
          <img src={loginImage} alt="Login" width={1000} height={1000} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
