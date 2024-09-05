import { TicketAPi } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateMemo from "@/pages/memo/CreateMemo";

import { Button } from "@/components/ui/button";
import LoadingComponent from "@/components/ui/loading";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "../../API/helper";
export interface Memo {
  _id: string;
  subject: string;
  file: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  acknowledgedby: { name: string }[];
}
interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
  email: string;
}
function ViewMemo() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;

  const navigate = useNavigate();
  const getMemos = async () => {
    try {
      const response = await TicketAPi.getAllMemo();
      console.log(response.data);
      setMemos(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading after the request is done
    }
  };
  useEffect(() => {
    getMemos();
  }, []);
  if (loading) {
    return <LoadingComponent />; // Render loading component while fetching data
  }
  return (
    <>
      <div className="container mx-auto">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute left-36 top-12">
            <BackButton />
          </div>
          <div className="absolute right-36 top-12">
            <CreateMemo />
          </div>
          <h1 className="text-5xl font-bold text-center py-7">Memo List</h1>
        </div>
        <Table>
          <TableHeader className="bg-slate-200 ">
            <TableRow>
              <TableHead className="text-center font-bold text-black w-40">
                Date
              </TableHead>
              <TableHead className="text-center font-bold text-black w-96">
                Subject
              </TableHead>
              <TableHead className="text-center font-bold text-black w-16">
                Acknowledge
              </TableHead>
              <TableHead className="text-center font-bold text-black w-16">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memos.map((ticket, index) => (
              <TableRow
                key={ticket._id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <TableCell className="font-medium text-center">
                  {formattedDate(ticket.createdAt)}
                </TableCell>
                <TableCell className=" max-w-xs truncate">
                  {ticket.subject.length > 60
                    ? `${ticket.subject.substring(0, 60)}...`
                    : ticket.subject}
                </TableCell>
                <TableCell className="text-center">
                  {ticket.acknowledgedby.length > 0 &&
                  ticket.acknowledgedby.includes(user?.email)
                    ? "Admin"
                    : "No Acknowledgement"}
                </TableCell>
                {/* <TableCell className="text-center">{ticket.assignedTo}</TableCell> */}
                <TableCell className="text-center">
                  <Button
                    onClick={() => {
                      navigate(`/memo/${ticket._id}`);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>{/* Additional footer content can go here */}</TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  );
}

export default ViewMemo;
