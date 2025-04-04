import { TicketAPi } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
}

interface AcknowledgedBy {
  userId: string;
  name: string;
  acknowledgedAt: string;
}

interface UnacknowledgedUser {
  _id: string;
  name: string;
}

interface Memo {
  subject: string;
  createdAt: string;
  file: string;
  description: string;
  acknowledgedby: AcknowledgedBy[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} ${formattedTime}`;
};

const ITEMS_PER_PAGE = 10;

const MemoTabs = ({
  acknowledgedUsers,
  unacknowledgedUsers,
}: {
  acknowledgedUsers: AcknowledgedBy[];
  unacknowledgedUsers: UnacknowledgedUser[];
}) => {
  const [currentAckPage, setCurrentAckPage] = useState(1);
  const [currentUnackPage, setCurrentUnackPage] = useState(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paginateData = (data: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalAckPages = Math.ceil(
    (acknowledgedUsers?.length || 0) / ITEMS_PER_PAGE
  );
  const totalUnackPages = Math.ceil(
    unacknowledgedUsers.length / ITEMS_PER_PAGE
  );

  const paginatedAckUsers = acknowledgedUsers
    ? paginateData(acknowledgedUsers, currentAckPage)
    : [];
  const paginatedUnackUsers = paginateData(
    unacknowledgedUsers,
    currentUnackPage
  );

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void
  ) => (
    <Pagination className="my-4 text-xs">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <Tabs defaultValue="confirmed" className="w-full">
      <TabsList className="grid w-1/4 grid-cols-2">
        <TabsTrigger value="confirmed">Confirmed By</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
      </TabsList>

      <TabsContent value="confirmed">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date of Acknowledgement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAckUsers.length > 0 ? (
              paginatedAckUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{formatDate(user.acknowledgedAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500">
                  No confirmations yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {acknowledgedUsers?.length > ITEMS_PER_PAGE &&
          renderPagination(currentAckPage, totalAckPages, setCurrentAckPage)}
      </TabsContent>

      <TabsContent value="pending">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUnackUsers.length > 0 ? (
              paginatedUnackUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>Pending</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500">
                  No pending acknowledgments
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {unacknowledgedUsers.length > ITEMS_PER_PAGE &&
          renderPagination(
            currentUnackPage,
            totalUnackPages,
            setCurrentUnackPage
          )}
      </TabsContent>
    </Tabs>
  );
};

const ViewIndividualMemo = () => {
  const [memos, setMemos] = useState<Memo>();
  const [unacknowledgedUsers, setUnacknowledgedUsers] = useState<
    UnacknowledgedUser[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;
  const { toast } = useToast();
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const getIndividualMemo = async (id: string) => {
    try {
      const response = await TicketAPi.getIndividualMemo(id);
      setMemos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getUnacknowledgedUsers = async (id: string) => {
    try {
      const response = await TicketAPi.getUserUnacknowledged(id);
      setUnacknowledgedUsers(response.data.unacknowledgedUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowldged = async (id: string) => {
    try {
      const response = await TicketAPi.acknowledgement(id);
      console.log(response.data);
      getIndividualMemo(id);
      getUnacknowledgedUsers(id);
      toast({
        title: "Success",
        description: "Your acknowledgement of this memo has been recorded",
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getIndividualMemo(id);
      getUnacknowledgedUsers(id);
    }
  }, [id]);

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
    <div className="container">
      <div className="px-36 pt-5">
        <div className="text-xs">
          <BackButton />
        </div>
        <div className="flex justify-between items-center mt-5">
          <div className="max-w-3xl">
            <p className="font-bold text-base">Re: {memos?.subject}</p>
            <p className="text-sm">
              Date: {formatDate(memos?.createdAt || "")}
            </p>
            <p className="text-sm">
              File Attachment:{" "}
              <span
                className="text-blue-700 cursor-pointer hover:underline hover:decoration-solid"
                onClick={() => handleFileDownload(memos?.file as string)}
              >
                {memos?.file}
              </span>
            </p>
          </div>

          {memos?.acknowledgedby.some((ack) => ack.userId === user?._id) ? (
            <div></div>
          ) : (
            <div>
              <p className="text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={handleCheckboxChange}
                  checked={isChecked}
                />{" "}
                I hereby acknowledge receipt of this memo
              </p>
              <Button
                className="text-xs ml-5 mt-2"
                onClick={() => handleAcknowldged(id as string)}
                disabled={!isChecked}
              >
                Confirm
              </Button>
            </div>
          )}
        </div>

        <hr className="w-full border-t border-gray-300 my-4" />

        <div className="bg-slate-200 p-4 rounded-sm border-2 border-gray-300">
          <pre className="whitespace-pre-wrap font-sans p-3 rounded-sm overflow-x-auto text-sm">
            {memos?.description}
          </pre>
        </div>

        {user?.isAdmin && (
          <div className="mt-10">
            <MemoTabs
              acknowledgedUsers={memos?.acknowledgedby || []}
              unacknowledgedUsers={unacknowledgedUsers}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewIndividualMemo;
