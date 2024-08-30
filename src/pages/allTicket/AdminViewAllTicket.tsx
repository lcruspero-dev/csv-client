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
import React, { useEffect, useState } from "react";
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

const ViewAllRaisedTickets: React.FC = () => {
  const [allRaisedTickets, setAllRaisedTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [assignedToOptions, setAssignedToOptions] = useState<string[]>([]);
  const navigate = useNavigate();

  const getAllRaisedTickets = async () => {
    try {
      const response = await TicketAPi.getAllRaisedTickets();
      setAllRaisedTickets(response.data);
      const uniqueAssignedTo = [
        "all",
        ...new Set(response.data.map((ticket: Ticket) => ticket.assignedTo)),
      ];
      setAssignedToOptions(uniqueAssignedTo);
      filterTickets(response.data, statusFilter, "all");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = (
    tickets: Ticket[],
    status: string,
    assignedTo: string
  ) => {
    let filtered = tickets;

    if (status !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === status);
    }

    if (assignedTo !== "all") {
      filtered = filtered.filter((ticket) => ticket.assignedTo === assignedTo);
    }

    setFilteredTickets(filtered);
  };

  useEffect(() => {
    getAllRaisedTickets();
  }, []);

  useEffect(() => {
    filterTickets(allRaisedTickets, statusFilter, assignedToFilter);
  }, [statusFilter, assignedToFilter, allRaisedTickets]);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="container mx-auto">
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-3">
          <BackButton />
        </div>
        <h1 className="text-5xl font-bold text-center pt-7">Tickets</h1>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <div>
            <label htmlFor="statusFilter" className="mr-2">
              Filter by status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="open">Open</option>
              <option value="ongoing">In-Progress</option>
              <option value="closed">Closed</option>
              <option value="all">All</option>
            </select>
          </div>
          <div>
            <label htmlFor="assignedToFilter" className="mr-2">
              Filter by assigned to:
            </label>
            <select
              id="assignedToFilter"
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="border p-2 rounded"
            >
              {assignedToOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-lg font-semibold">
          Total Tickets: {filteredTickets.length}
        </div>
      </div>
      <Table>
        <TableHeader className="bg-slate-200">
          <TableRow>
            <TableHead className="text-center font-bold text-black w-48">
              Date
            </TableHead>
            <TableHead className="text-center font-bold text-black w-60">
              Category
            </TableHead>
            <TableHead className="font-bold text-black text-center w-52">
              Name
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
          {filteredTickets.map((ticket, index) => (
            <TableRow
              key={ticket._id}
              className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <TableCell className="font-medium text-center">
                {formattedDate(ticket.createdAt)}
              </TableCell>
              <TableCell className="text-center">{ticket.category}</TableCell>
              <TableCell className="text-center">{ticket.name}</TableCell>
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

export default ViewAllRaisedTickets;
