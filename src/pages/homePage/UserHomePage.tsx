/* eslint-disable @typescript-eslint/no-explicit-any */
import { TicketAPi } from "@/API/endpoint";
import memo from "@/assets/AllTickets.webp";
import request from "@/assets/Checklist.webp";
import gethelp from "@/assets/g10.webp";
import ticket from "@/assets/Group.webp";
import test from "@/assets/login.webp";
import timetracker from "@/assets/timetracker.webp";
import SurveyModal from "@/components/kit/Survey"; // Import the SurveyModal component
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserHome = () => {
  const navigate = useNavigate();
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const getUnacknowledgedCount = async () => {
      try {
        const response = await TicketAPi.getAllMemo();
        const unacknowledgedMemos = response.data.filter(
          (memo: { acknowledgedby: { userId: any }[] }) =>
            !memo.acknowledgedby.some(
              (ack: { userId: any }) => ack.userId === user?._id
            )
        );
        setUnacknowledgedCount(unacknowledgedMemos.length);
      } catch (error) {
        console.error("Error fetching memos:", error);
      }
    };

    if (user) {
      getUnacknowledgedCount();
    }
  }, [user]);

  return (
    <>
      <SurveyModal /> {/* Add the SurveyModal component here */}
      <section className="heading container text-center pt-5">
        <h1 className="text-4xl p-2 drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
          What do you need help with?
        </h1>
        <p className="text-2xl font-bold">Please choose from an option below</p>
      </section>
      <div className="container grid grid-cols-3 gap-5 mt-5 text-center p-5 drop-shadow-lg w-6/12">
        <Card
          className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]"
          onClick={() => navigate("/timetracker")}
        >
          <img src={timetracker} alt="Time tracker" />
          <p className="py-3 font-bold">Time Tracker</p>
        </Card>
        <Card
          className="relative hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]"
          onClick={() => navigate("/all-memo")}
        >
          {unacknowledgedCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-5 mt-5">
              {unacknowledgedCount}
            </div>
          )}
          <img src={memo} alt="memo" />
          <p className="py-3 font-bold">Memo</p>
        </Card>
        <Card
          className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]"
          onClick={() => navigate("/request-something")}
        >
          <img src={request} alt="test" />
          <p className="py-3 font-bold">HR Support Request</p>
        </Card>
        <Card
          className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]"
          onClick={() => navigate("/create-ticket")}
        >
          <img src={gethelp} alt="test" />
          <p className="py-3 font-bold">IT Support Request</p>
        </Card>
        <Card
          className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]"
          onClick={() => navigate("/view-ticket")}
        >
          <img src={ticket} alt="tickets" />
          <p className="py-3 font-bold">View My Tickets</p>
        </Card>
        <Card className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]">
          <img src={test} alt="NTE" />
          <p className="py-3 font-bold">Coming Soon</p>
        </Card>
      </div>
    </>
  );
};

export default UserHome;
