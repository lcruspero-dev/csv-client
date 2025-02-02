import { NteAPI } from "@/API/endpoint";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PdfNteViewer from "@/components/ui/viewNteDialog";
import { CheckSquare, Eye, MessageSquare } from "lucide-react";
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

  const handleView = (item: NteData): void => {
    setSelectedNte(item);
    setShowViewDialog(true);
  };

  const handleRespond = async (id: string) => {
    try {
      // Implement your response logic here
      await NteAPI.respondToNte(id);
      // Refresh data after response
      const response = await NteAPI.getNtesByUser();
      setData(response.data);
    } catch (error) {
      console.error("Error responding to NTE:", error);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      // Implement your acknowledge logic here
      await NteAPI.acknowledgeDecision(id);
      // Refresh data after acknowledgment
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
  }> = ({ icon, label, onClick }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const HoverButtons: React.FC<{
    item: NteData;
    type: "nte" | "feedback" | "decision";
  }> = ({ item, type }) => {
    const buttons = {
      nte: (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex gap-2 p-2 bg-white shadow-md rounded transition-all duration-200">
          <ActionButton
            icon={<Eye size={16} />}
            label="View"
            onClick={() => handleView(item)}
          />
          {item.status === "PER" && (
            <ActionButton
              icon={<MessageSquare size={16} />}
              label="Respond"
              onClick={() => handleRespond(item._id)}
            />
          )}
        </div>
      ),
      feedback: (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-2 bg-white shadow-md rounded transition-all duration-200">
          <ActionButton
            icon={<Eye size={16} />}
            label="View"
            onClick={() => handleView(item)}
          />
        </div>
      ),
      decision: (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex gap-2 p-2 bg-white shadow-md rounded transition-all duration-200">
          <ActionButton
            icon={<Eye size={16} />}
            label="View"
            onClick={() => handleView(item)}
          />
          {item.status === "PNODA" && (
            <ActionButton
              icon={<CheckSquare size={16} />}
              label="Acknowledge"
              onClick={() => handleAcknowledge(item._id)}
            />
          )}
        </div>
      ),
    };

    return buttons[type];
  };

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
      PER: "Waiting for your Feedback",
      PNOD: "Pending Notice of Decision",
      PNODA: "Pending NOD Acknowledgment",
      FTHR: "Forwarded to HR",
    };
    return statusText[status] || status;
  };

  const truncateText = (text: string | undefined, limit: number): string => {
    if (!text) return "-";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  return (
    <div className="w-full overflow-x-auto px-6">
      <div className="text-2xl text-gray-700 text-center py-6">
        PENDING NOD ACKNOWLEDGEMENT
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
              Notice to Explain
            </TableHead>
            <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
              Employee Feedback
            </TableHead>
            <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
              Notice of Decision
            </TableHead>
            <TableHead className="font-bold bg-gray-800 text-white border-r text-center w-32">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id} className="group">
              <TableCell className="align-top relative">
                <div className="space-y-1">
                  <div className="font-medium">{item.nte.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.nte.position}
                  </div>
                  <div className="text-sm">
                    Issue Date: {formatDate(item.nte.dateIssued)}
                  </div>
                  <div className="text-sm font-medium">
                    {item.nte.offenseType}
                  </div>
                  <div className="text-sm text-gray-600">
                    {truncateText(item.nte.offenseDescription, 100)}
                  </div>
                </div>
                <HoverButtons item={item} type="nte" />
              </TableCell>
              <TableCell className="align-top relative">
                {item.employeeFeedback ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      Response Date:{" "}
                      {formatDate(item.employeeFeedback.responseDate)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {truncateText(item.employeeFeedback.responseDetail, 100)}
                    </div>
                    <HoverButtons item={item} type="feedback" />
                  </div>
                ) : (
                  <span className="text-gray-400">No feedback yet</span>
                )}
              </TableCell>
              <TableCell className="align-top relative">
                {item.noticeOfDecision ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      Date: {formatDate(item.noticeOfDecision.nteIssuanceDate)}
                    </div>
                    <div className="font-medium">Findings:</div>
                    <div className="text-sm text-gray-600">
                      {truncateText(item.noticeOfDecision.findings, 100)}
                    </div>
                    <div className="font-medium">Decision:</div>
                    <div className="text-sm text-gray-600">
                      {truncateText(item.noticeOfDecision.decision, 100)}
                    </div>
                    <HoverButtons item={item} type="decision" />
                  </div>
                ) : (
                  <span className="text-gray-400">No decision yet</span>
                )}
              </TableCell>
              <TableCell
                className={` text-center ${getStatusColor(item.status)}`}
              >
                {getStatusText(item.status)}
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
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
        />
      )}
    </div>
  );
};

export default NteSummaryTable;
