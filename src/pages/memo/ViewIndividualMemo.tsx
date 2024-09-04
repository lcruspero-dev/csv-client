import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Memo } from "./ViewMemo";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";

const ViewIndividualMemo = () => {
  const [memos, setMemos] = useState<Memo>();
  const { id } = useParams<{ id: string }>();
  console.log(id);
  const getIndividualMemo = async (id: string) => {
    try {
      const response = await TicketAPi.getIndividualMemo(id);
      console.log(response.data);
      setMemos(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (id) {
      getIndividualMemo(id);
    }
  }, [id]);

  console.log("memos", memos?.acknowledgedby.length);
  return (
    <div className="container">
      <div className="px-36 pt-5">
        <BackButton />
        <div className="flex justify-between  items-center mt-5 ">
          <div>
            <p className="font-bold text-xl">Re: {memos?.subject}</p>
            <p>Date: {formattedDate(memos?.createdAt || "")}</p>
            <p>File Attatchment: {memos?.file}</p>
          </div>
          <div>
            <p>
              <input type="checkbox" className="w-4 h-4" /> i hereby acknowldge
              reciept of this memo
              {/* <span
                className={`py-1 px-2 ml-2 rounded-md text-center text-primary-foreground font-semibold ${
                  details?.status === "new" || details?.status === "open"
                    ? "bg-green-600"
                    : details?.status === "closed"
                    ? "bg-red-600"
                    : "bg-[#FF8C00]"
                }`}
              >
                {details?.status}
              </span> */}
            </p>
            <Button className="text-xs ml-5 mt-2 ">Confirm</Button>
          </div>
        </div>
        <hr className="w-full border-t border-gray-300 my-4" />
        <div className="bg-slate-200 p-4 rounded-sm border-2 border-gray-300">
          {/* <p className="font-semibold mb-2">Description</p> */}
          <pre className="whitespace-pre-wrap font-sans p-3 rounded-sm overflow-x-auto">
            {memos?.description}
          </pre>
        </div>
        <div>
          <ScrollArea className=" h-24    bg-red-600 rounded-md border p-4 mt-10">
            {memos?.acknowledgedby.length !== 0 ? (
              memos?.acknowledgedby?.map((user, index) => (
                <p key={index}>{user}</p>
              ))
            ) : (
              <p>No Acknowledged By</p>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ViewIndividualMemo;
