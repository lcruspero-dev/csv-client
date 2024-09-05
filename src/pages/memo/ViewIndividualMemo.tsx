import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading"; // Ensure this path is correct
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Memo } from "./ViewMemo";

const ViewIndividualMemo = () => {
  const [memos, setMemos] = useState<Memo>();
  const [isLoading, setIsLoading] = useState(true); // State to manage loading
  const { id } = useParams<{ id: string }>();

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
          <div>
            <p className="font-bold text-base">Re: {memos?.subject}</p>
            <p className="text-sm">
              Date: {formattedDate(memos?.createdAt || "")}
            </p>
            <p className="text-sm">File Attachment: {memos?.file}</p>
          </div>
          <div>
            <p className="text-sm">
              <input type="checkbox" className="w-4 h-4" /> I hereby acknowledge
              receipt of this memo
            </p>
            <Button className="text-xs ml-5 mt-2 ">Confirm</Button>
          </div>
        </div>
        <hr className="w-full border-t border-gray-300 my-4" />
        <div className="bg-slate-200 p-4 rounded-sm border-2 border-gray-300">
          <pre className="whitespace-pre-wrap font-sans p-3 rounded-sm overflow-x-auto text-sm">
            {memos?.description}
          </pre>
        </div>
        <div>
          <ScrollArea className="h-24 bg-red-600 rounded-md border p-4 mt-10">
            {memos?.acknowledgedby && memos.acknowledgedby.length > 0 ? (
              memos.acknowledgedby.map((user, index) => (
                <p key={index}>{user.name}</p>
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
