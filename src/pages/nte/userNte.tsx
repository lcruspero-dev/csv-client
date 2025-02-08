import { NteAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import RespondToNteDialog from "@/components/kit/RespondDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PdfNteViewer from "@/components/ui/viewNteDialog";
import { CheckSquare, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";

interface NteDetails {
  employeeId: string;
  name: string;
  position: string;
  dateIssued: string;
  issuedBy: string;
  offenseType: string;
  offenseDescription: string;
  file: string | null;
}

interface employeeFeedbackDetails {
  name: string;
  position: string;
  responseDate: string;
  responseDetail: string;
}
interface NoticeOfDecisionDetails {
  name: string;
  position: string;
  nteIssuanceDate: string;
  writtenExplanationReceiptDate: string;
  offenseType: string;
  offenseDescription: string;
  findings: string;
  decision: string;
}

interface NteData {
  nte: NteDetails;
  employeeFeedback: employeeFeedbackDetails;
  noticeOfDecision: NoticeOfDecisionDetails;
  _id: string;
  status: "PER" | "PNOD" | "PNODA" | "FTHR";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const NteSummaryTable: React.FC = () => {
  const [data, setData] = useState<NteData[]>([]);
  const [selectedNte, setSelectedNte] = useState<NteData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState<boolean>(false);
  const [initialPage, setInitialPage] = useState<number>(1);
  const [showRespondDialog, setShowRespondDialog] = useState<boolean>(false);
  const [selectedNteForResponse, setSelectedNteForResponse] =
    useState<NteData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await NteAPI.getNtesByUser();
        const result = response.data;
        setData(result);
      } catch (error) {
        console.error("Error fetching NTE data:", error);
      }
    };

    fetchData();
  }, []);

  const handleView = (item: NteData, page: number): void => {
    setSelectedNte(item);
    setInitialPage(page);
    setShowViewDialog(true);
  };

  const handleRespond = (item: NteData) => {
    setSelectedNteForResponse(item);
    setShowRespondDialog(true);
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await NteAPI.acknowledgeDecision(id);
      const response = await NteAPI.getNtesByUser();
      setData(response.data);
    } catch (error) {
      console.error("Error acknowledging decision:", error);
    }
  };

  const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }> = ({ icon, label, onClick, className = "" }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: NteData["status"]): string => {
    const statusColors: Record<NteData["status"], string> = {
      PER: "bg-yellow-100 text-yellow-800",
      PNOD: "bg-blue-100 text-blue-800",
      PNODA: "bg-purple-100 text-purple-800",
      FTHR: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: NteData["status"]): string => {
    const statusText: Record<NteData["status"], string> = {
      PER: "Please click the respond button to submit your feedback",
      PNOD: "Notice of Decision Pending: A decision has not yet been made, and you will be notified once it is finalized.",
      PNODA:
        "Please click the acknowledge button to confirm the decision based on the findings",
      FTHR: "✔ Forwarded to HR",
    };
    return statusText[status] || status;
  };

  const truncateText = (
    text: string | undefined,
    limit: number,
    item: NteData,
    section: "nte" | "feedback" | "decision"
  ): JSX.Element => {
    if (!text) return <span>-</span>;
    if (text.length <= limit) return <span>{text}</span>;

    const pageMap = {
      nte: 1,
      feedback: 2,
      decision: 3,
    };

    return (
      <div>
        <span>{text.slice(0, limit)}...</span>
        <button
          onClick={() => handleView(item, pageMap[section])}
          className="ml-1 text-blue-600 hover:text-blue-800 text-sm"
        >
          Read More
        </button>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto px-6">
      <div className="absolute left-36 top-24">
        <BackButton />
      </div>
      <div className="text-2xl text-gray-700 text-center py-4 font-bold">
        Notice to Explain
      </div>
      <Table>
        <TableHeader className="bg-slate-200">
          <TableRow>
            <TableHead className="font-bold text-black border-2 border-slate-300 text-center">
              Notice to Explain
            </TableHead>
            <TableHead className="font-bold text-black border-2 border-slate-300 text-center">
              Employee Feedback
            </TableHead>
            <TableHead className="font-bold text-black border-2 border-slate-300 text-center">
              Notice of Decision
            </TableHead>
            <TableHead className="font-bold text-black text-center w-48 border-2 border-slate-300">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="align-top border-2 border-slate-300">
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-bold">Issue Date:</span>{" "}
                    {formatDate(item.nte.dateIssued)}
                  </div>
                  <div className="font-medium">
                    <span className="font-bold">Name:</span> {item.nte.name}
                  </div>
                  <div>
                    <span className="font-bold">Position:</span>{" "}
                    {item.nte.position}
                  </div>
                  <div className="text-sm font-medium">
                    <span className="font-bold">Policy:</span>{" "}
                    {item.nte.offenseType}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Description of Offense/s:</span>{" "}
                    {truncateText(item.nte.offenseDescription, 70, item, "nte")}
                  </div>
                </div>
              </TableCell>
              <TableCell className=" align-top border-2 border-slate-300">
                {item.employeeFeedback ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-bold">Response Date:</span>{" "}
                      {formatDate(item.employeeFeedback.responseDate)}
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">Feedback:</span>{" "}
                      {truncateText(
                        item.employeeFeedback.responseDetail,
                        70,
                        item,
                        "feedback"
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">No feedback yet</span>
                )}
              </TableCell>
              <TableCell className="align-top border-2 border-slate-300">
                {item.noticeOfDecision ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-bold">Date:</span>{" "}
                      {formatDate(item.noticeOfDecision.nteIssuanceDate)}
                    </div>
                    <div className="font-medium">
                      <span className="font-bold">Decision:</span>{" "}
                      {truncateText(
                        item.noticeOfDecision.decision,
                        70,
                        item,
                        "decision"
                      )}
                    </div>
                    <div className="font-medium">
                      <span className="font-bold">Findings:</span>{" "}
                      {truncateText(
                        item.noticeOfDecision.findings,
                        70,
                        item,
                        "decision"
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">No decision yet</span>
                )}
              </TableCell>
              <TableCell className="align-center border-2 border-slate-300">
                <div className="space-y-2">
                  <div
                    className={`text-sm font-medium px-2 py-1 rounded-md ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {getStatusText(item.status)}
                  </div>
                  <div className="flex flex-col gap-1">
                    {item.status === "PER" && (
                      <ActionButton
                        icon={<MessageSquare size={16} />}
                        label="Respond"
                        onClick={() => handleRespond(item)}
                        className="w-auto justify-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white border-2 border-green-800 rounded-lg shadow-lg hover:bg-gradient-to-l hover:from-green-600 hover:via-green-500 hover:to-green-400 transition duration-300 ease-in-out transform hover:scale-105"
                      />
                    )}
                    {item.status === "PNODA" && (
                      <ActionButton
                        icon={<CheckSquare size={16} />}
                        label="Acknowledge"
                        onClick={() => handleAcknowledge(item._id)}
                        className="w-auto justify-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white border-2 border-green-800 rounded-lg shadow-lg hover:bg-gradient-to-l hover:from-green-600 hover:via-green-500 hover:to-green-400 transition duration-300 ease-in-out transform hover:scale-105"
                      />
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedNte && (
        <PdfNteViewer
          nteData={{
            ...selectedNte,
            nte: {
              ...selectedNte.nte,
              employeeSignatureDate: null,
              authorizedSignatureDate: null,
            },
          }}
          initialPage={initialPage}
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
        />
      )}
      {selectedNteForResponse && (
        <RespondToNteDialog
          open={showRespondDialog}
          onOpenChange={setShowRespondDialog}
          nteId={selectedNteForResponse._id}
          nteData={selectedNteForResponse}
          onRespondSuccess={() => {
            const fetchData = async () => {
              try {
                const response = await NteAPI.getNtesByUser();
                setData(response.data);
              } catch (error) {
                console.error("Error fetching NTE data:", error);
              }
            };
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default NteSummaryTable;
