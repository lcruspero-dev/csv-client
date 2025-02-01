import { NteAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PdfNteViewer from "@/components/ui/viewNteDialog";
import { FileText } from "lucide-react";
import React, { useEffect, useState } from "react";

interface EmployeeFeedback {
  name: string;
  position: string;
  responseDate: string;
  responseDetail: string;
}

interface NoticeOfDecision {
  name: string;
  position: string;
  nteIssuanceDate: string;
  writtenExplanationReceiptDate: string;
  offenseType: string;
  offenseDescription: string;
  findings: string;
  decision: string;
}

interface Nte {
  employeeId: string;
  name: string;
  position: string;
  dateIssued: string;
  issuedBy: string;
  offenseType: string;
  offenseDescription: string;
  file: string | null;
}

interface NteData {
  _id: string;
  nte: Nte;
  employeeFeedback?: EmployeeFeedback;
  noticeOfDecision?: NoticeOfDecision;
  createdBy?: string;
  status: "PER" | "PNOD" | "PNODA" | "FTHR";
  createdAt: string;
  updatedAt: string;
  __v: string;
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
      PER: "Pending Employee Response",
      PNOD: "Pending Notice of Decision",
      PNODA: "Pending NOD Acknowledgment",
      FTHR: "Filed to HR Records",
    };
    return statusText[status] || status;
  };

  const truncateText = (text: string | undefined, limit: number): string => {
    if (!text) return "-";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  const handleView = (item: NteData): void => {
    setSelectedNte(item);
    setShowViewDialog(true);
  };

  return (
    <div className="w-full overflow-x-auto">
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
            <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
              Created By
            </TableHead>
            <TableHead className="font-bold bg-gray-800 text-white border-r text-center w-32">
              Status
            </TableHead>
            <TableHead className="font-bold bg-gray-800 text-white text-center w-24">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="align-top">
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
              </TableCell>
              <TableCell className="align-top">
                {item.employeeFeedback ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      Response Date:{" "}
                      {formatDate(item.employeeFeedback.responseDate)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {truncateText(item.employeeFeedback.responseDetail, 100)}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">No feedback yet</span>
                )}
              </TableCell>
              <TableCell className="align-top">
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
                  </div>
                ) : (
                  <span className="text-gray-400">No decision yet</span>
                )}
              </TableCell>
              <TableCell className="align-top text-center">
                {item.createdBy || <span className="text-gray-400">N/A</span>}
              </TableCell>
              <TableCell
                className={`align-top text-center ${getStatusColor(
                  item.status
                )}`}
              >
                {getStatusText(item.status)}
              </TableCell>
              <TableCell className="align-top text-center">
                <Button variant="ghost" onClick={() => handleView(item)}>
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {showViewDialog && selectedNte && (
        <PdfNteViewer
          isOpen={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          nteData={selectedNte}
        />
      )}
    </div>
  );
};

export default NteSummaryTable;
