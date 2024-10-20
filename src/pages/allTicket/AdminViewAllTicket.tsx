import React, { useEffect, useState } from "react";
import { Assigns, Category, TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import LoadingComponent from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Assigned } from "../assigns/CreateAssigns";
import {   ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

export interface Ticket {
  _id: string;
  assignedTo: string;
  category: string;
  createdAt: string;
  description: string;
  status: string;
  user: string;
  name: string;
  priority: string;
}

interface Category {
  category: string;
}

const ITEMS_PER_PAGE = 10;

const ViewAllRaisedTickets: React.FC = () => {
  const [allRaisedTickets, setAllRaisedTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [, setAssignedToOptions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [itCategories, setItCategories] = useState<string[]>([]);
  const [hrCategories, setHrCatergories] = useState<string[]>([]);
  const [assign, setAssign] = useState<Assigned[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const logInUser = JSON.parse(localStorage.getItem("user")!);
  const loginUserRole = logInUser.role;
  const navigate = useNavigate();

  const getHrCategory = async () => {
    try {
      const response = await Category.getHrCategories();
      const categories: Category[] = response.data.categories;  
      const categoryNames = categories.map((category: Category) => category.category); 
      setHrCatergories(categoryNames);
    } catch (error) {
      console.error(error);
    }  
  };

  const getItCategory = async () => {
    try {
      const response = await Category.getItCategories();
      const categories: Category[] = response.data.categories;  
      const categoryNames = categories.map((category: Category) => category.category); 
      setItCategories(categoryNames);
    } catch (error) {
      console.error(error);
    }  
  };

  useEffect(() => {
    getHrCategory();
    getItCategory();
  }, []);

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
        itCategories.includes(ticket.category)
      );
    } else if (role === "HR") {
      filtered = filtered.filter((ticket) =>
        hrCategories.includes(ticket.category)
      );
    }

    // AssignedTo filtering
    if (assignedTo === "ALL IT") {
      filtered = filtered.filter((ticket) =>
        itCategories.includes(ticket.category)
      );
    } else if (assignedTo === "ALL HR") {
      filtered = filtered.filter((ticket) =>
        hrCategories.includes(ticket.category)
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
    setCurrentPage(1); // Reset to first page when filters change
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

  const getAssigns = async () => {
    try {
      const response = await Assigns.getAssign();
      setAssign(response.data.assigns);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAssigns()
    filterTickets(allRaisedTickets, statusFilter, assignedToFilter, userRole);
  }, [statusFilter, assignedToFilter, allRaisedTickets, userRole]);
  
  const getFilteredAssign = (assign: Assigned[], loginUserRole: string): Assigned[] => { 
    if (loginUserRole === "SUPERADMIN") {
      return assign;
    }
    return assign.filter((item) => item.role === loginUserRole);
  };

  const filteredAssign = getFilteredAssign(assign, loginUserRole);

  if (loading) {
    return <LoadingComponent />;
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  return (
    <div className="container mx-auto">
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-3">
          <BackButton />
        </div>
        <h1 className="text-4xl font-bold text-center pt-7 pb-2">
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
              {filteredAssign.map((assign) => (
                <option key={assign._id} value={assign.name}>
                  {assign.name}
                </option>
              ))}
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
            <TableHead className="text-center font-bold text-black w-48">Date</TableHead>
            <TableHead className="text-center font-bold text-black w-40">Category</TableHead>
            <TableHead className="font-bold text-black text-center w-40">Name</TableHead>
            <TableHead className="font-bold text-black text-center w-80">Description</TableHead>
            <TableHead className="font-bold text-black text-center w-26">Priority</TableHead>
            <TableHead className="text-center font-bold text-black w-26">Status</TableHead>
            <TableHead className="text-center font-bold text-black w-36">Assigned to</TableHead>
            <TableHead className="font-bold text-black text-center w-24">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentTickets.map((ticket, index) => (
            <TableRow
              key={ticket._id}
              className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} text-sm`}
            >
              <TableCell className="font-medium text-center text-xs">
                {formattedDate(ticket.createdAt)}
              </TableCell>
              <TableCell className="text-center">{ticket.category}</TableCell>
              <TableCell className="text-center">{ticket.name}</TableCell>
              <TableCell className="text-center max-w-xs truncate">
                {ticket.description.length > 45
                  ? `${ticket.description.substring(0, 45)}...`
                  : ticket.description}
              </TableCell>
              <TableCell className="text-center">{ticket.priority}</TableCell>
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
                <Button onClick={() => navigate(`/ticket/${ticket._id}`)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
       
      </Table>
      <div className="flex  items-center justify-end gap-4 border-t-2   mb-16 ">
        <div className="mt-4 flex items-center  gap-4">
        <button onClick={goToPreviousPage} disabled={currentPage === 1} >
          <ChevronsLeftIcon className="text-blue-950 hover:scale-150 hover:text-green-600" />
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          <ChevronsRightIcon className="text-blue-950 hover:scale-150 hover:text-green-600" />
          </button>
          </div>
      </div>
    </div>
  );
};

export default ViewAllRaisedTickets;