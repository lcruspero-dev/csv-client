import request from "@/assets/Checklist.webp";
import gethelp from "@/assets/g10.webp";
import ticket from "@/assets/Group.webp";
import test from "@/assets/login.webp";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const UserHome = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="heading container text-center pt-5">
        <h1 className="text-4xl  p-2 drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
          What do you need help with?
        </h1>
        <p className="text-2xl font-bold">Please choose from an option below</p>
      </section>
      <div className=" container grid grid-cols-3 gap-5 mt-5 text-center p-5 drop-shadow-lg w-6/12">
        <Card
          className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]  "
          onClick={() => navigate("/create-ticket")}
        >
          <img src={gethelp} alt="test" />
          <p className="py-3 font-bold">IT Support Request</p>
        </Card>
        <Card
          className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] "
          onClick={() => navigate("/request-something")}
        >
          <img src={request} alt="test" />
          <p className="py-3 font-bold">HR Support Request</p>
        </Card>
        <Card
          className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] "
          onClick={() => navigate("/view-ticket")}
        >
          <img src={ticket} alt="test" />
          <p className="py-3 font-bold">View My Tickets</p>
        </Card>

        <Card>
          <img src={test} alt="test" />
          <p className="py-3 font-bold">Coming Soon</p>
        </Card>
        <Card>
          <img src={test} alt="test" />
          <p className="py-3 font-bold">Coming Soon</p>
        </Card>
        <Card>
          <img src={test} alt="test" />
          <p className="py-3 font-bold">Coming Soon</p>
        </Card>
      </div>
    </>
  );
};

export default UserHome;
