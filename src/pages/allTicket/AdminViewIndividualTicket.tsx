/* eslint-disable @typescript-eslint/no-explicit-any */
import { Assigns, TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "./ViewAllTicket";

const AdminViewIndovidualTicket: React.FC = () => {
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

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const getTicket = async (ticketId: string) => {
    try {
      const response = await TicketAPi.getIndividualTicket(ticketId);
      console.log(response.data);
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
      console.log(response.data);
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
    setShowTextArea(value === "closed");
  };

  const handlePriorityChange = (value: string) => {
    setPriority({ ...priority, priority: value });
  };

  const SubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!id || !details?._id) {
      console.error("Ticket ID or User ID is missing");
      return;
    }
    setIsSubmitting(true);
    const body = {
      ticket: id,
      text: message,
      isStaff: false,
      user: details?._id,
    };
    try {
      const response = await TicketAPi.createNote(id, body);
      console.log(response.data);
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
      console.log("response.data", response.data);

      // If status is closed and there's a close message, submit the note
      if (status?.status === "closed" && closeMessage.trim()) {
        const noteBody = {
          ticket: id,
          text: closeMessage,
          isStaff: false,
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
      window.location.reload();
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

  return (
    <div className="container text-sm">
      <div className="px-36 pt-1">
        <div className="flex justify-between px-10 items-center mt-5 ">
          <div className="text-xs">
            <BackButton />
          </div>
          <form>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button className="font-bold py-2 px-4 rounded">Edit</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit Ticket Information</SheetTitle>
                  <SheetDescription>
                    Make changes to the ticket here. Click Save Changes when
                    you're done.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="name" className="text-right mb-10">
                      Assign to
                    </Label>
                    <Select onValueChange={handleAssignChange} required>
                      <SelectTrigger className="mb-2 mt-2">
                        <SelectValue placeholder={details?.assignedTo} />
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
                    <Label htmlFor="username" className="text-right">
                      Status
                    </Label>
                    <Select onValueChange={handleStatusChange} required>
                      <SelectTrigger className="mb-2 mt-2">
                        <SelectValue placeholder={details?.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select onValueChange={handlePriorityChange} required>
                      <SelectTrigger className="mb-2 mt-2">
                        <SelectValue placeholder={details?.priority} />
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

                  {showTextArea && (
                    <div>
                      <Label htmlFor="closeNote" className="text-right">
                        Closing Note
                      </Label>
                      <Textarea
                        id="closeNote"
                        placeholder="Enter a closing note"
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
                      type="submit"
                      onClick={handleEditButton}
                      disabled={
                        isUpdating || (showTextArea && !closeMessage.trim())
                      }
                    >
                      {isUpdating ? "Saving..." : "Save changes"}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </form>
        </div>

        <div className="flex justify-between px-10 items-center mt-5 ">
          <div>
            <h1 className="font-bold text-base">
              Ticket ID: {details?.ticketNumber}
            </h1>
            <p className="text-sm">
              Date Submitted: {formattedDate(details?.createdAt || "")}
            </p>
            <p className="text-sm">Category: {details?.category}</p>
            <p className="text-sm">Assigned To: {details?.assignedTo}</p>

            {details?.file && details.file.trim() !== "" && (
              <p className="text-sm">
                File Attachment:{" "}
                <span
                  className="text-blue-700 cursor-pointer hover:underline hover:decoration-solid"
                  onClick={() => handleFileDownload(details.file as string)}
                >
                  {details.file}
                </span>
              </p>
            )}
          </div>
          <div>
            <p className="text-sm mb-2">Priority: {details?.priority}</p>
            <p className="text-sm">
              Status:
              <span
                className={`py-1 px-2 ml-2 rounded-md text-center text-primary-foreground font-semibold text-xs ${
                  details?.status === "new" || details?.status === "open"
                    ? "bg-green-600"
                    : details?.status === "closed"
                    ? "bg-red-600"
                    : "bg-[#FF8C00]"
                }`}
              >
                {details?.status}
              </span>
            </p>
          </div>
        </div>
        <hr className="w-full border-t border-gray-300 my-4" />
        <div className="bg-slate-200 p-4 rounded-sm border-2 border-gray-300">
          <p className="font-semibold mb-2 text-sm">Description</p>
          <pre className="whitespace-pre-wrap font-sans p-3 rounded-sm overflow-x-auto text-sm">
            {details?.description}
          </pre>
        </div>
        <div className="mt-4">
          <p className="font-semibold">Notes</p>
        </div>

        {details?.status !== "closed" && (
          <form className="mt-2" onSubmit={SubmitNote}>
            <Textarea
              placeholder="Enter your response here"
              value={message}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <div className="flex justify-end my-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        )}
        <div>
          {notes
            ?.slice()
            .reverse()
            .map((note: any) => (
              <div
                className="p-4 rounded-sm border-2 border-gray-300 my-2"
                key={note._id}
              >
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-semibold break-words text-sm">
                      {note.name}
                    </p>
                    <p className="break-words text-sm">{note.text}</p>
                  </div>
                  <div className="flex-shrink-0 mt-2 sm:mt-0">
                    <p className="text-xs whitespace-nowrap">
                      {formattedDate(note.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminViewIndovidualTicket;
