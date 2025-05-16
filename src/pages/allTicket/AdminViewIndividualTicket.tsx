/* eslint-disable @typescript-eslint/no-explicit-any */
import { Assigns, TicketAPi, UserProfileAPI } from "@/API/endpoint"; // Add UserProfileAPI import
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Add these imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  PenSquare,
  Send,
  Tag,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "./ViewAllTicket";

const AdminViewIndividualTicket: React.FC = () => {
  const [details, setDetails] = useState<Ticket>();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assign, setAssign] = useState<any>();
  const [status, setStatus] = useState<any>();
  const [priority, setPriority] = useState<any>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [listAssigns, setListAssigns] = useState<any[]>([]);
  const [closeMessage, setCloseMessage] = useState("");
  const [showTextArea, setShowTextArea] = useState(false);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({}); // Add avatarMap state

  // Fetch all avatars when component mounts
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await UserProfileAPI.getAllUserAvatar();
        const map = response.data.reduce(
          (
            acc: Record<string, string>,
            curr: { userId: string; avatar: string }
          ) => {
            acc[curr.userId] = curr.avatar;
            return acc;
          },
          {}
        );
        setAvatarMap(map);
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    };

    fetchAvatars();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const getTicket = async (ticketId: string) => {
    try {
      const response = await TicketAPi.getIndividualTicket(ticketId);
      setDetails(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllNotes = async (ticketId: string) => {
    try {
      const response = await TicketAPi.getNotes(ticketId);
      setNotes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getAssigns = async () => {
    try {
      const response = await Assigns.getAssign();
      setListAssigns(response.data.assigns);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAssigns();
    if (id) {
      setIsLoading(true);
      Promise.all([getTicket(id), getAllNotes(id)])
        .then(() => setIsLoading(false))
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleAssignChange = (value: string) => {
    setAssign({ ...assign, assign: value });
  };

  const handleStatusChange = (value: string) => {
    setStatus({ ...status, status: value });
    setShowTextArea(value === "closed" || value === "Rejected");
  };

  const handlePriorityChange = (value: string) => {
    setPriority({ ...priority, priority: value });
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !message.trim()) return;
    if (!id || !details?._id) {
      console.error("Ticket ID or User ID is missing");
      return;
    }
    setIsSubmitting(true);
    const body = {
      ticket: id,
      text: message,
      isStaff: true, // Mark as staff note for admin
      user: details?._id,
    };
    try {
      const response = await TicketAPi.createNote(id, body);
      console.log(response);
      setMessage("");
      getAllNotes(id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditButton = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;

    setIsUpdating(true);
    const body = {
      assignedTo: assign?.assign,
      status: status?.status,
      priority: priority?.priority,
      closingNote: closeMessage,
    };

    try {
      const response = await TicketAPi.updateTicket(id, body);
      console.log(response);

      // If status is closed and there's a close message, submit the note
      if (
        status?.status === "closed" ||
        (status?.status === "Rejected" && closeMessage.trim())
      ) {
        const noteBody = {
          ticket: id,
          text: closeMessage,
          isStaff: true, // Mark as staff note
          user: details?._id,
        };
        await TicketAPi.createNote(id, noteBody);
        setCloseMessage("");
      }

      getTicket(String(id));
      getAllNotes(String(id));
      setIsSheetOpen(false);
      toast({
        title: "Ticket Updated",
        description: "The ticket has been updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while updating the ticket",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      // Refresh the page
      // window.location.reload();
    }
  };

  const handleFileDownload = (file: string) => {
    window.open(
      `${import.meta.env.VITE_UPLOADFILES_URL}/files/${file}`,
      "_blank"
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  // Helper function to get status badge color and icon
  const getStatusInfo = (status: string | undefined) => {
    if (!status)
      return { color: "bg-gray-500", icon: <Clock className="h-4 w-4" /> };

    switch (status) {
      case "new":
      case "open":
        return {
          color: "bg-green-500",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case "closed":
        return {
          color: "bg-red-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
      case "In Progress":
        return {
          color: "bg-yellow-500",
          icon: <Clock className="h-4 w-4" />,
        };
      case "Approved":
        return {
          color: "bg-green-500",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case "Rejected":
        return {
          color: "bg-red-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
      default:
        return {
          color: "bg-blue-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
    }
  };
  // Helper function to get priority badge color and icon
  const getPriorityInfo = (priority: string | undefined) => {
    if (!priority)
      return { color: "bg-gray-500", icon: <Clock className="h-4 w-4" /> };

    if (priority.includes("Critical") || priority.includes("1-")) {
      return {
        color: "bg-red-500",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    } else if (priority.includes("High") || priority.includes("2-")) {
      return {
        color: "bg-orange-500",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    } else if (priority.includes("Moderate") || priority.includes("3-")) {
      return {
        color: "bg-yellow-500",
        icon: <Clock className="h-4 w-4" />,
      };
    } else if (priority.includes("Low") || priority.includes("4-")) {
      return {
        color: "bg-green-500",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }

    return { color: "bg-blue-500", icon: <AlertCircle className="h-4 w-4" /> };
  };

  const statusInfo = getStatusInfo(details?.status);
  const priorityInfo = getPriorityInfo(details?.priority);

  return (
    <div className="container py-5 mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs scale-90 origin-top-left">
          <BackButton />
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="text-base font-medium flex items-center gap-2 scale-90">
              <PenSquare className="h-4 w-4" />
              Edit
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Ticket Information</SheetTitle>
              <SheetDescription>
                Make changes to the ticket here. Click Save Changes when you're
                done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="assign" className="text-sm font-medium">
                  Assign to
                </Label>
                <Select onValueChange={handleAssignChange} required>
                  <SelectTrigger className="mt-2">
                    <SelectValue
                      placeholder={details?.assignedTo || "Select assignee"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {listAssigns.map((assign: any) => (
                        <SelectItem key={assign.name} value={assign.name}>
                          {assign.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select onValueChange={handleStatusChange} required>
                  <SelectTrigger className="mt-2">
                    <SelectValue
                      placeholder={details?.status || "Select status"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {details?.category === "Leave Request" ? (
                        <>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {details?.category !== "Leave Request" && (
                <div>
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <Select onValueChange={handlePriorityChange} required>
                    <SelectTrigger className="mt-2">
                      <SelectValue
                        placeholder={details?.priority || "Select priority"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="1-Critical">1-Critical</SelectItem>
                        <SelectItem value="2-High">2-High</SelectItem>
                        <SelectItem value="3-Moderate">3-Moderate</SelectItem>
                        <SelectItem value="4-Low">4-Low</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showTextArea &&
                (status?.status === "closed" ||
                  status?.status === "Rejected") && (
                  <div>
                    <Label htmlFor="closeNote" className="text-sm font-medium">
                      {status?.status === "Rejected"
                        ? "Rejection Note"
                        : "Closing Note"}
                    </Label>
                    <Textarea
                      id="closeNote"
                      placeholder={
                        status?.status === "Rejected"
                          ? "Enter a rejection note"
                          : "Enter a closing note"
                      }
                      value={closeMessage}
                      onChange={(e) => setCloseMessage(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button
                  className="text-base font-medium flex items-center gap-2 scale-90"
                  type="submit"
                  onClick={handleEditButton}
                  disabled={
                    isUpdating ||
                    ((status?.status === "closed" ||
                      status?.status === "Rejected") &&
                      !closeMessage.trim())
                  }
                >
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="mb-6 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-bold">
                Ticket #{details?.ticketNumber}
              </h1>
              <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                {statusInfo.icon}
                <span>{details?.status || "Unknown"}</span>
              </Badge>
            </div>
            <div className="mt-2 md:mt-0">
              <Badge
                variant="outline"
                className={`${priorityInfo.color} text-white flex items-center gap-1`}
              >
                {priorityInfo.icon}
                <span>Priority: {details?.priority || "Unset"}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-900" />
                <span className="text-sm text-gray-900">
                  Created: {formattedDate(details?.createdAt || "")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-900" />
                <span className="text-sm text-gray-900">
                  Submitted by: {details?.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-900" />
                <span className="text-sm text-gray-900">
                  Category: {details?.category || "Uncategorized"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-900" />
                <span className="text-sm text-gray-900">
                  Assigned to: {details?.assignedTo || "Unassigned"}
                </span>
              </div>
              {details?.file && details.file.trim() !== "" && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-900" />
                  <button
                    onClick={() => handleFileDownload(details.file as string)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    title={details.file}
                  >
                    <span>Attachment</span>
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h2 className="font-medium mb-3">Description</h2>
            <div className="bg-slate-200 p-4 rounded-sm border-2 border-gray-300">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
                {details?.description || "No description provided."}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Notes & Responses</h2>

        {details?.status !== "closed" &&
          details?.status !== "Rejected" &&
          details?.status !== "Approved" && (
            <Card className="mb-6 shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={submitNote}>
                  <Textarea
                    placeholder="Add your response here..."
                    value={message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="min-h-24 resize-none"
                  />
                </form>
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                <Button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  onClick={submitNote}
                  className="text-base font-medium flex items-center gap-2 scale-90"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Response"}
                </Button>
              </CardFooter>
            </Card>
          )}

        <div className="space-y-4">
          {notes?.length === 0 ? (
            <p className="text-center text-gray-900 py-8">
              No notes or responses yet.
            </p>
          ) : (
            notes
              ?.slice()
              .reverse()
              .map((note: any) => {
                // Get avatar URL from avatarMap or use default
                const avatarFilename = avatarMap[note.user];
                const avatarUrl = avatarFilename
                  ? `${
                      import.meta.env.VITE_UPLOADFILES_URL
                    }/avatars/${avatarFilename}`
                  : `https://ui-avatars.com/api/?background=2563EB&color=fff&name=${
                      note.name || "?"
                    }`;

                return (
                  <Card
                    key={note._id}
                    className={`shadow-sm ${
                      note.isStaff ? "border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Updated Avatar with the same styling as ScheduleAndAttendance */}
                        <Avatar className="h-8 w-8 rounded-full overflow-hidden border-2 border-blue-200">
                          <AvatarImage
                            src={avatarUrl}
                            alt={note.name}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {note.name?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">
                                {note.name || "Unknown User"}
                              </p>
                              {note.isStaff && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-600 text-xs"
                                >
                                  Staff
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-900">
                              {formattedDate(note.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {note.text}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewIndividualTicket;
