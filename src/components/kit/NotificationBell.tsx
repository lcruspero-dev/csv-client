import { TicketAPi } from "@/API/endpoint";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Ticket {
  name: string;
  category: string;
  department: string;
  priority: string;
  description: string;
  user: { name: string };
  createdAt: string;
  updatedAt: string;
  closingNote: string;
  assignedTo: string;
  _id: string;
  status: string;
  file: string | null;
}

const NotificationBell = () => {
  const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Function to get user role from localStorage
  const getUserRole = (): string | null => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.role || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Check if user has required role (HR, IT, or SUPERADMIN)
  const hasRequiredRole = (): boolean => {
    const role = getUserRole();
    return role === "HR" || role === "IT" || role === "SUPERADMIN";
  };

  // Filter tickets based on user's role and department
  const getFilteredTickets = (tickets: Ticket[]): Ticket[] => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return [];

      const user = JSON.parse(userStr);

      // SUPERADMIN can see tickets from both IT and HR departments
      if (user.role === "SUPERADMIN") {
        return tickets.filter(
          (ticket) => ticket.department === "IT" || ticket.department === "HR"
        );
      }

      // HR and IT users can only see their department's tickets
      if (["HR", "IT"].includes(user.role)) {
        return tickets.filter((ticket) => ticket.department === user.role);
      }

      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const response = await TicketAPi.getAllOpenTickets();
        setOpenTickets(response.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch tickets if user has required role
    if (hasRequiredRole()) {
      const interval = setInterval(fetchOpenTickets, 60000);
      fetchOpenTickets();
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (loading) return null;
  if (error) return null;
  if (!hasRequiredRole()) return null;

  const filteredTickets = getFilteredTickets(openTickets);

  // Group tickets by department for SUPERADMIN view
  const groupedTickets = filteredTickets.reduce((acc, ticket) => {
    const dept = ticket.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  return (
    <div className="relative">
      <div
        className="cursor-pointer flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-6 w-6 text-blue-800" />
        {filteredTickets.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {filteredTickets.length}
          </span>
        )}
      </div>

      {isOpen && (
        <Card
          ref={cardRef}
          className="absolute right-0 mt-2 w-96 shadow-lg z-50 bg-white"
        >
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              Open Tickets ({filteredTickets.length})
            </h3>
          </div>
          <ScrollArea className="h-96">
            <div className="p-4 space-y-4">
              {filteredTickets.length === 0 ? (
                <p className="text-center text-gray-500">No open tickets</p>
              ) : getUserRole() === "SUPERADMIN" ? (
                // SUPERADMIN view with department grouping
                Object.entries(groupedTickets).map(([dept, tickets]) => (
                  <div key={dept} className="mb-4">
                    <h4 className="font-medium text-sm mb-2 text-gray-700">
                      {dept} Department ({tickets.length})
                    </h4>
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket._id}
                          className="p-3 hover:bg-gray-50 rounded-lg border"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">
                                {ticket.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {ticket.category}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                ticket.priority === "1-Critical"
                                  ? "bg-red-100 text-red-800"
                                  : ticket.priority === "2-High"
                                  ? "bg-orange-100 text-orange-800"
                                  : ticket.priority === "3-Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {ticket.description.length > 100
                              ? `${ticket.description.substring(0, 100)}...`
                              : ticket.description}
                          </p>
                          <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <span>Assigned to: {ticket.assignedTo}</span>
                            <span>
                              {format(
                                new Date(ticket.createdAt),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Regular view for HR and IT users
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="p-3 hover:bg-gray-50 rounded-lg border"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{ticket.name}</p>
                        <p className="text-xs text-gray-600">
                          {ticket.category}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          ticket.priority === "1-Critical"
                            ? "bg-red-100 text-red-800"
                            : ticket.priority === "2-High"
                            ? "bg-orange-100 text-orange-800"
                            : ticket.priority === "3-Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {ticket.description.length > 100
                        ? `${ticket.description.substring(0, 100)}...`
                        : ticket.description}
                    </p>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Assigned to: {ticket.assignedTo}</span>
                      <span>
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
