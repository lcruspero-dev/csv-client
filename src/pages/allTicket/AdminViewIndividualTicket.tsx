/* eslint-disable @typescript-eslint/no-explicit-any */
import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
 
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";
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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "./ViewAllTicket";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 

const AdminViewIndovidualTicket: React.FC = () => {
  const [details, setDetails] = useState<Ticket>();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assign, setAssign] = useState<any>();
  const [status, setStatus] = useState<any>();

 
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
  useEffect(() => {
    if (id) {
      setIsLoading(true); // Set loading to true before fetching data
      Promise.all([getTicket(id), getAllNotes(id)])
        .then(() => setIsLoading(false)) // Set loading to false after both promises resolve
        .catch((error) => {
          console.error(error);
          setIsLoading(false); // Ensure loading is set to false even if there's an error
        });
    }
  }, [id]);
 console.log(assign)
 console.log(status)
 const handleAssignChange = (value: string) => {
  setAssign({ ...assign, assign: value });
};
const handleStatusChange = (value: string) => {
  setStatus({ ...status, status: value });
};
  const SubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
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
  if (isLoading) {
    return <Loading />; // Show loading component while data is being fetched
  }
  const handleEditButton = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      assignedTo: assign?.assign,
      status: status?.status,
    }
    try {
      const response = await TicketAPi.updateTicket(id, body);
      console.log("response.data",response.data);
      getTicket(String(id));
      
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="container">
      <div className="px-36 pt-5">
        {/* for admin only */}
        <form className="flex justify-between px-10 items-center mt-5 " >
          <BackButton />
          <Sheet>
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
                <div >
                  <Label htmlFor="name" className="text-right   mb-10">
                    Assign to
                  </Label>
                  <Select  onValueChange={handleAssignChange} required>
                    <SelectTrigger className="mb-2 mt-2">
                      <SelectValue placeholder="Please Select " />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="IT1">
                          Arvin B.
                        </SelectItem>
                        <SelectItem value="IT2">John G.</SelectItem>
                        <SelectItem value="IT3">Joriz C.</SelectItem>
                        <SelectItem value="HR1">HR 1.</SelectItem>
                        <SelectItem value="HR2"> HR 2.</SelectItem>
                        <SelectItem value="HR3">HR 3.</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div >
                  <Label htmlFor="username" className="text-right">
                    Status
                  </Label>
                  <Select onValueChange={handleStatusChange}  required>
                    <SelectTrigger className="mb-2 mt-2">
                      <SelectValue placeholder="Please Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="open"> Open </SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                         
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit" onClick={handleEditButton}>Save changes</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </form>

        <div className="flex justify-between px-10 items-center mt-5 ">
          <div>
            <h1 className="font-bold text-xl">Ticket ID: {details?._id}</h1>
            <p>Date Submitted: {formattedDate(details?.createdAt || "")}</p>
            <p>Category: {details?.category}</p>
            <p>Created By: {details?.name}</p>
            <p>Assigned To: {details?.assignedTo === "IT1" 
    ? "Arvin B." 
    : details?.assignedTo === "IT2" 
    ? "John G." 
    : details?.assignedTo === "IT3" 
    ? "Joriz C." 
    : details?.assignedTo === "HR1" 
    ? "HR 1." 
    : details?.assignedTo === "HR2" 
    ? "HR 2." 
    : details?.assignedTo === "HR3" 
    ? "HR 3." 
    : "Not Assigned"}</p>
          </div>
          <div>
            <p>
              Status:
              <span
                className={`py-1 px-2 ml-2 rounded-md text-center text-primary-foreground font-semibold ${
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
          <p className="font-semibold ">Description</p>
          <p>{details?.description}</p>
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
                    <p className="font-semibold break-words">
                      Note From {note.name}
                    </p>
                    <p className="break-words">{note.text}</p>
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
