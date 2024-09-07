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
  const [, setAssignedToOptions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const navigate = useNavigate();

  const IT_CATEGORIES = [
    "General IT Support",
    "Hardware Issue",
    "Software Issue",
    "Network & Connectivity",
    "Account & Access Management",
    "Email & Communication",
    "Project & Change Management",
  ];

  const HR_CATEGORIES = [
    "Request for Documents",
    "Request for Meeting",
    "Certificate of Employment",
    "Onboarding Request",
    "Employee Benefits",
    "Leave Request",
    "Payroll",
    "Loan Request",
    "Other",
  ];

  const getAllRaisedTickets = async () => {
    try {
      const response = await TicketAPi.getAllRaisedTickets();
      if (Array.isArray(response.data)) {
        setAllRaisedTickets(response.data as Ticket[]);
        const uniqueAssignedTo = [
          "all",
          ...new Set(response.data.map((ticket: Ticket) => ticket.assignedTo)),
        ];
        setAssignedToOptions(uniqueAssignedTo);
        filterTickets(response.data as Ticket[], statusFilter, "all", userRole);
      } else {
        console.error("Unexpected response data format");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = (
    tickets: Ticket[],
    status: string,
    assignedTo: string,
    role: string
  ) => {
    let filtered = tickets;

    // Role-based filtering
    if (role === "IT") {
      filtered = filtered.filter((ticket) =>
        IT_CATEGORIES.includes(ticket.category)
      );
    } else if (role === "HR") {
      filtered = filtered.filter((ticket) =>
        HR_CATEGORIES.includes(ticket.category)
      );
    }

    // AssignedTo filtering
    if (assignedTo === "ALL IT") {
      filtered = filtered.filter((ticket) =>
        IT_CATEGORIES.includes(ticket.category)
      );
    } else if (assignedTo === "ALL HR") {
      filtered = filtered.filter((ticket) =>
        HR_CATEGORIES.includes(ticket.category)
      );
    } else if (assignedTo !== "all") {
      filtered = filtered.filter((ticket) => ticket.assignedTo === assignedTo);
    }

    // Status filtering
    if (status !== "all") {
      if (status === "open") {
        filtered = filtered.filter(
          (ticket) =>
            ticket.status === "open" || ticket.status === "In Progress"
        );
      } else {
        filtered = filtered.filter((ticket) => ticket.status === status);
      }
    }

    setFilteredTickets(filtered);
  };

  useEffect(() => {
    const getUserRole = () => {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setUserRole(user.role);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          setUserRole(""); // Set a default role or handle the error as needed
        }
      } else {
        console.error("User data not found in localStorage");
        setUserRole(""); // Set a default role or handle the error as needed
      }
    };

    getUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      getAllRaisedTickets();
    }
  }, [userRole]);

  useEffect(() => {
    filterTickets(allRaisedTickets, statusFilter, assignedToFilter, userRole);
  }, [statusFilter, assignedToFilter, allRaisedTickets, userRole]);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="container mx-auto">
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-3">
          <BackButton />
        </div>
        <h1 className="text-5xl font-bold text-center pt-7 pb-2">
          All Tickets
        </h1>
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
              <option value="In Progress">In Progress</option>
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
              <option value="all">All Tickets</option>
              {userRole === "SUPERADMIN" && (
                <>
                  <option value="ALL IT">All IT Tickets</option>
                  <option value="ALL HR">All HR Tickets</option>
                </>
              )}
              <option value="IT-Joriz Cabrera">Joriz</option>
              <option value="IT-Arvin Bautista">Arvin</option>
              <option value="IT-John Louie Gastardo">John Louie</option>
              <option value="HR-Cindy Tabudlong">Cindy</option>
              <option value="HR2">HR2</option>
              <option value="HR3">HR3</option>
              <option value="Not Assigned">Not Assigned</option>
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
            <TableHead className="text-center font-bold text-black w-26">
              Status
            </TableHead>
            <TableHead className="text-center font-bold text-black w-36">
              Assigned
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
              className={`${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              } text-sm`}
            >
              <TableCell className="font-medium text-center text-xs">
                {formattedDate(ticket.createdAt)}
              </TableCell>
              <TableCell className="text-center">{ticket.category}</TableCell>
              <TableCell className="text-center">{ticket.name}</TableCell>
              <TableCell className="text-center max-w-xs truncate ">
                {ticket.description.length > 45
                  ? `${ticket.description.substring(0, 45)}...`
                  : ticket.description}
              </TableCell>
              <TableCell>
                <p
                  className={`py-1 mx-4 rounded-sm text-center text-primary-foreground font-semibold text-xs ${
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
