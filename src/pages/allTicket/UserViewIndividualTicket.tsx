/* eslint-disable @typescript-eslint/no-explicit-any */
import { TicketAPi, UserProfileAPI } from "@/API/endpoint"; // Add UserProfileAPI import
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  Send,
  Tag,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "./ViewAllTicket";

const UserViewIndividualTicket: React.FC = () => {
  const [details, setDetails] = useState<Ticket>();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
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

  const submitNote = async (e: React.FormEvent) => {
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
      console.log(response);
      setMessage("");
      getAllNotes(id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const handleFileDownload = (file: string) => {
    window.open(
      `${import.meta.env.VITE_UPLOADFILES_URL}/files/${file}`,
      "_blank"
    );
  };
  // Helper function to get status badge color
  const getStatusBadgeClass = (status: string | undefined) => {
    if (!status) return "bg-gray-500";
    switch (status) {
      case "new":
      case "open":
        return "bg-green-500";
      case "closed":
        return "bg-red-500";
      case "In Progress":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  // Helper function to get priority badge color
  const getPriorityBadgeClass = (priority: string | undefined) => {
    if (!priority) return "bg-gray-500";
    switch (priority) {
      case "1-Critical":
        return "bg-red-500";
      case "2-High":
        return "bg-yellow-500";
      case "3-Moderate":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="container py-6 mx-auto max-w-4xl">
      <div className="text-sm scale-90 origin-top-left">
        <BackButton />
      </div>

      <Card className="mb-6 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-bold">
                Ticket #{details?.ticketNumber}
              </h1>
              <Badge className={getStatusBadgeClass(details?.status)}>
                {details?.status || "Unknown"}
              </Badge>
            </div>
            <div className="mt-2 md:mt-0">
              <Badge
                variant="outline"
                className={`${getPriorityBadgeClass(
                  details?.priority
                )} text-white`}
              >
                Priority: {details?.priority || "Unset"}
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

        {details?.status !== "closed" && (
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
                className="flex items-center gap-2 text-sm"
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
                            <p className="font-medium text-sm">
                              {note.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-900">
                              {formattedDate(note.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
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

export default UserViewIndividualTicket;
