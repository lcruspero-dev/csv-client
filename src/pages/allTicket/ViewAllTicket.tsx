import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import LoadingComponent from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface Ticket {
  _id: string;
  assignedTo: string;
  category: string;
  createdAt: string;
  description: string;
  status: string;
  user: string;
  name: string;
}

const ViewAllTicket: React.FC = () => {
  const [allTicket, setAllTicket] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const navigate = useNavigate();

  const getAllTicket = async () => {
    try {
      const response = await TicketAPi.getAllTicket();
      setAllTicket(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading after the request is done
    }
  };

  useEffect(() => {
    getAllTicket();
  }, []);

  if (loading) {
    return <LoadingComponent />; // Render loading component while fetching data
  }

  return (
    <div className="container mx-auto">
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-12">
          <BackButton />
        </div>
        <h1 className="text-5xl font-bold text-center py-7">Tickets</h1>
      </div>
      <Table>
        <TableHeader className="bg-slate-200 ">
          <TableRow>
            <TableHead className="text-center font-bold text-black w-48">
              Date
            </TableHead>
            <TableHead className="text-center font-bold text-black w-60">
              Category
            </TableHead>
            <TableHead className="font-bold text-black text-center w-80">
              Description
            </TableHead>
            <TableHead className="text-center font-bold text-black w-24">
              Status
            </TableHead>
            <TableHead className="text-center font-bold text-black w-36">
              Assign
            </TableHead>
            <TableHead className="font-bold text-black text-center w-24">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTicket.map((ticket, index) => (
            <TableRow
              key={ticket._id}
              className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <TableCell className="font-medium text-center">
                {formattedDate(ticket.createdAt)}
              </TableCell>
              <TableCell className="text-center">{ticket.category}</TableCell>
              <TableCell className="text-center max-w-xs truncate">
                {ticket.description.length > 45
                  ? `${ticket.description.substring(0, 45)}...`
                  : ticket.description}
              </TableCell>
              <TableCell>
                <p
                  className={`p-1 rounded-md text-center text-primary-foreground font-semibold ${
                    ticket.status === "new" || ticket.status === "open"
                      ? "bg-green-600"
                      : ticket.status === "closed"
                      ? "bg-red-600"
                      : "bg-[#FF8C00]"
                  }`}
                >
                  {ticket.status}
                </p>
              </TableCell>
              <TableCell className="text-center">{ticket.assignedTo}</TableCell>
              <TableCell className="text-center">
                <Button
                  onClick={() => {
                    navigate(`/ticket/${ticket._id}`);
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
  );
};

export default ViewAllTicket;
