import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading"; // Ensure this path is correct

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Memo, User } from "./ViewMemo";
import { useToast } from "@/components/ui/use-toast";

const ViewIndividualMemo = () => {
  const [memos, setMemos] = useState<Memo>();
  const [isLoading, setIsLoading] = useState(true); // State to manage loading
  const { id } = useParams<{ id: string }>();
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;
  const { toast } = useToast();
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  const getIndividualMemo = async (id: string) => {
    try {
      const response = await TicketAPi.getIndividualMemo(id);
      setMemos(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Set loading to false once data is fetched or an error occurs
    }
  };

  const handleAcknowldged = async( id: string) => {
    try {
      const response = await TicketAPi.acknowledgement(id);
      console.log("acknowledged",response.data);
      getIndividualMemo(id)
      toast({ title: "Your acknowledgement of the memo has  been recorded. Thank you !" });
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (id) {
      setIsLoading(true); // Set loading to true before fetching data
      getIndividualMemo(id);
       
    }
  }, [id]);

  if (isLoading) {
    return <Loading />; // Show loading component while data is being fetched
  }

  return (
    <div className="container">
      <div className="px-36 pt-5">
        <BackButton />
        <div className="flex justify-between items-center mt-5 ">
          <div className="  max-w-3xl">
            <p className="font-bold text-base">Re: {memos?.subject}</p>
            <p className="text-sm">
              Date: {formattedDate(memos?.createdAt || "")}
            </p>
            <p className="text-sm">File Attachment: {memos?.file}</p>
          </div>

          {memos?.acknowledgedby.some(
                    (ack) => ack.userId === user?._id
                  ) ? (
                   <div></div>
                  ) : (
                    <>
                      <div>
                          <p className="text-sm">
                            <input type="checkbox" className="w-4 h-4"  onChange={handleCheckboxChange}
          checked={isChecked} /> I hereby acknowledge
                            receipt of this memo
                          </p>
                          <Button className="text-xs ml-5 mt-2 " onClick={()=> handleAcknowldged(id as string)}   disabled={!isChecked}>Confirm</Button>
                      </div> 
                     </>
                  )}

           
        </div>
        <hr className="w-full border-t border-gray-300 my-4" />
        <div className="bg-slate-200 p-4 rounded-sm border-2 border-gray-300">
          <pre className="whitespace-pre-wrap font-sans p-3 rounded-sm overflow-x-auto text-sm">
            {memos?.description}
          </pre>
        </div>
        <div>
          <div className="mt-10">
            <h1>Acknowledged By:</h1>
            {memos?.acknowledgedby && memos.acknowledgedby.length > 0 ? (
              memos.acknowledgedby.map((user, index) => (
               <div className=" flex gap-2 flex-wrap text-xs p-4 ">
                    <p key={index}>{user.name},</p>
                    </div>
              ))
            ) : (
              <p>N/A</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewIndividualMemo;
