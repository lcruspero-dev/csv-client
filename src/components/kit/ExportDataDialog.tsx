import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AttendanceEntry,
  AttendanceStatus,
  Employee,
} from "@/pages/timeTracker/ScheduleAndAttendance";
import { format, isAfter, isBefore, subDays } from "date-fns";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

type DateRange = {
  from: Date;
  to: Date;
};

// Define status categories
const PAID_STATUSES: AttendanceStatus[] = ["Present", "PTO", "LOA", "Call In"];
const PARTIAL_PAID_STATUSES: AttendanceStatus[] = ["Half Day", "RDOT", "VTO"];
const NEUTRAL_STATUSES: AttendanceStatus[] = ["Rest Day"];

// Helper function to parse time strings (HH:MM) to hours
const parseTimeToHours = (timeString: string | null | undefined): number => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60;
};

type AttendanceSummary = {
  "Employee Name": string;
  Position: string;
  "Team Leader": string;
  "Date Range": string;
  Present: number;
  "Call In": number;
  PTO: number;
  LOA: number;
  "Half Day": number;
  VTO: number;
  RDOT: number;
  Tardy: number;
  NCNS: number;
  Suspended: number;
  Attrition: number;
  "Early Log Out": number;
  TB: number;
  "Rest Day": number;
  "Regular Hours": string;
  "Overtime Hours": string;
  "Total Hours Worked": string;
  "Attendance Rate": string;
  "Performance Note": string;
};

type DetailedAttendanceEntry = {
  "Employee Name": string;
  "Employee ID": string;
  Date: string;
  Status: string;
  "Log In": string;
  "Log Out": string;
  "Total Hours": string;
  "Overtime Hours": string;
  Shift: string;
};

export const ExportDataDialog = ({
  attendance,
  filteredEmployees,
}: {
  attendance: AttendanceEntry[];
  filteredEmployees: Employee[];
}) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleDateChange = (type: "from" | "to", value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setDateRange((prev) => ({
        ...prev,
        [type]: date,
      }));
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return filteredEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, filteredEmployees]);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(employee.name);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedEmployee(null);
    setShowSuggestions(false);
  };

  const getAttendanceSummary = (): AttendanceSummary[] => {
    let employeesToShow = filteredEmployees;
    if (selectedEmployee) {
      employeesToShow = filteredEmployees.filter(
        (e) => e.id === selectedEmployee.id
      );
    }

    return employeesToShow.map((employee) => {
      const employeeAttendance = attendance.filter(
        (entry) =>
          entry.employeeId === employee.id &&
          entry.date &&
          !isBefore(new Date(entry.date), dateRange.from) &&
          !isAfter(new Date(entry.date), dateRange.to)
      );

      const statusCounts = employeeAttendance.reduce((acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      }, {} as Record<AttendanceStatus, number>);

      // Calculate hours worked
      let regularHours = 0;
      let overtimeHours = 0;

      employeeAttendance.forEach((entry) => {
        if (entry.status === "Present") {
          regularHours += 8; // Full day present
          overtimeHours += parseTimeToHours(entry.ot);
        } else if (entry.status === "Half Day") {
          regularHours += 4; // Half day
          overtimeHours += parseTimeToHours(entry.ot);
        } else if (entry.status === "RDOT") {
          regularHours += 8; // Rest day OT counts as full day
          overtimeHours += parseTimeToHours(entry.ot);
        } else if (PAID_STATUSES.includes(entry.status)) {
          regularHours += 8; // Other paid statuses count as full day
        } else if (PARTIAL_PAID_STATUSES.includes(entry.status)) {
          regularHours += 4; // Other partial day statuses
        }
      });

      const totalHoursWorked = regularHours + overtimeHours;

      // Create base summary object
      const summary: AttendanceSummary = {
        "Employee Name": employee.name,
        Position: employee.department,
        "Team Leader": employee.teamLeader,
        "Date Range": `${format(dateRange.from, "MMM dd")} - ${format(
          dateRange.to,
          "MMM dd, yyyy"
        )}`,
        Present: statusCounts["Present"] || 0,
        "Call In": statusCounts["Call In"] || 0,
        PTO: statusCounts["PTO"] || 0,
        LOA: statusCounts["LOA"] || 0,
        "Half Day": statusCounts["Half Day"] || 0,
        VTO: statusCounts["VTO"] || 0,
        RDOT: statusCounts["RDOT"] || 0,
        Tardy: statusCounts["Tardy"] || 0,
        NCNS: statusCounts["NCNS"] || 0,
        Suspended: statusCounts["Suspended"] || 0,
        Attrition: statusCounts["Attrition"] || 0,
        "Early Log Out": statusCounts["Early Log Out"] || 0,
        TB: statusCounts["TB"] || 0,
        "Rest Day": statusCounts["Rest Day"] || 0,
        "Regular Hours": regularHours.toFixed(2),
        "Overtime Hours": overtimeHours.toFixed(2),
        "Total Hours Worked": totalHoursWorked.toFixed(2),
        "Attendance Rate": "N/A",
        "Performance Note": "No working days tracked",
      };

      // Calculate working days for attendance rate
      const workingDays = Object.entries(statusCounts)
        .filter(
          ([status]) =>
            !NEUTRAL_STATUSES.includes(status as AttendanceStatus) &&
            status !== "Rest Day"
        )
        .reduce((sum, [, count]) => sum + count, 0);

      const paidDays = Object.entries(statusCounts)
        .filter(([status]) =>
          PAID_STATUSES.includes(status as AttendanceStatus)
        )
        .reduce((sum, [, count]) => sum + count, 0);

      const partialPaidDays = Object.entries(statusCounts)
        .filter(([status]) =>
          PARTIAL_PAID_STATUSES.includes(status as AttendanceStatus)
        )
        .reduce((sum, [, count]) => sum + count, 0);

      // Update attendance rate and performance note
      if (workingDays > 0) {
        summary["Attendance Rate"] = `${Math.round(
          ((paidDays + partialPaidDays * 0.5) / workingDays) * 100
        )}%`;

        summary["Performance Note"] = statusCounts["Suspended"]
          ? "Suspended during period"
          : statusCounts["Attrition"]
          ? "Attrition case"
          : paidDays + partialPaidDays === workingDays
          ? "Perfect attendance"
          : (paidDays + partialPaidDays * 0.5) / workingDays > 0.9
          ? "Excellent attendance"
          : (paidDays + partialPaidDays * 0.5) / workingDays > 0.75
          ? "Good attendance"
          : (paidDays + partialPaidDays * 0.5) / workingDays > 0.5
          ? "Needs improvement"
          : "Poor attendance";
      }

      return summary;
    });
  };

  const getDetailedAttendance = (): DetailedAttendanceEntry[] => {
    let entries = attendance.filter(
      (entry) =>
        entry.date &&
        !isBefore(new Date(entry.date), dateRange.from) &&
        !isAfter(new Date(entry.date), dateRange.to)
    );

    if (selectedEmployee) {
      entries = entries.filter(
        (entry) => entry.employeeId === selectedEmployee.id
      );
    }

    return entries.map((entry) => {
      const employee = filteredEmployees.find((e) => e.id === entry.employeeId);
      return {
        "Employee Name": employee?.name || "Unknown",
        "Employee ID": entry.employeeId,
        Date: entry.date ? format(new Date(entry.date), "MMM dd, yyyy") : "N/A",
        Status: entry.status,
        "Log In": entry.logIn || "-",
        "Log Out": entry.logOut || "-",
        "Total Hours": entry.totalHours || "-",
        "Overtime Hours": entry.ot || "-",
        Shift: entry.shift || "-",
      };
    });
  };

  const handleExportExcel = () => {
    // Create summary sheet
    const summaryData = getAttendanceSummary();
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);

    // Create detailed sheet
    const detailedData = getDetailedAttendance();
    const detailedWs = XLSX.utils.json_to_sheet(detailedData);

    // Create workbook with both sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summaryWs, "Attendance_Summary");
    XLSX.utils.book_append_sheet(wb, detailedWs, "Detailed_Entries");

    // Auto-size columns for both sheets
    const setColumnWidths = (worksheet: XLSX.WorkSheet) => {
      const colWidths = Object.keys(worksheet).reduce((acc, cellAddress) => {
        const cell = worksheet[cellAddress];
        if (cell.v && cellAddress.match(/[A-Z]+1/)) {
          const col = cellAddress.replace(/\d+/, "");
          const length = cell.v.toString().length;
          acc[col] = Math.max(acc[col] || 0, length);
        }
        return acc;
      }, {} as Record<string, number>);

      const cols = Object.keys(colWidths).map((col) => ({
        wch: Math.min(Math.max(colWidths[col] || 10, 10), 30),
      }));

      worksheet["!cols"] = cols;
    };

    setColumnWidths(summaryWs);
    setColumnWidths(detailedWs);

    const filename = `Attendance_Report_${format(
      dateRange.from,
      "yyyyMMdd"
    )}_to_${format(dateRange.to, "yyyyMMdd")}${
      selectedEmployee ? `_${selectedEmployee.name.replace(/\s+/g, "_")}` : ""
    }.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const attendanceData = getAttendanceSummary();

  // Get all status columns that have at least one non-zero value
  const statusColumns = [
    "Present",
    "Call In",
    "PTO",
    "LOA",
    "Half Day",
    "VTO",
    "RDOT",
    "Tardy",
    "NCNS",
    "Suspended",
    "Attrition",
    "Early Log Out",
    "TB",
    "Rest Day",
  ].filter((status) =>
    attendanceData.some(
      (row) => (row[status as keyof AttendanceSummary] as number) > 0
    )
  );

  // Style for sticky first column
  const stickyColumnStyle = {
    position: "sticky" as const,
    left: 0,
    zIndex: 10,
    backgroundColor: "white",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Generate Attendance Report</Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Comprehensive Attendance Analysis</DialogTitle>
          <DialogDescription>
            Generate detailed attendance reports with working hours, overtime,
            and status breakdowns
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date-from">Start Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={format(dateRange.from, "yyyy-MM-dd")}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date-to">End Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={format(dateRange.to, "yyyy-MM-dd")}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                  className="w-full"
                  min={format(dateRange.from, "yyyy-MM-dd")}
                />
              </div>
            </div>

            <div className="grid gap-2 relative w-full md:w-auto">
              <Label htmlFor="employee-search">Search Employee</Label>
              <div className="relative">
                <Input
                  id="employee-search"
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                    if (!e.target.value) {
                      setSelectedEmployee(null);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full md:w-64"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSuggestions.map((employee) => (
                      <li
                        key={employee.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        {employee.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Button className="text-xs" onClick={handleExportExcel}>
              Export Full Report (Excel)
            </Button>
          </div>

          <div className="mt-4">
            <div className="overflow-auto max-h-[60vh] relative">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {attendanceData.length > 0 &&
                      [
                        "Employee Name",
                        "Position",
                        "Group",
                        "Date Range",
                        ...statusColumns,
                        "Regular Hours",
                        "Overtime Hours",
                        "Total Hours Worked",
                        "Attendance Rate",
                        "Performance Note",
                      ].map((key, colIndex) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                          style={colIndex === 0 ? stickyColumnStyle : {}}
                        >
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((row, index) => (
                    <tr key={index}>
                      {[
                        "Employee Name",
                        "Position",
                        "Team Leader",
                        "Date Range",
                        ...statusColumns,
                        "Regular Hours",
                        "Overtime Hours",
                        "Total Hours Worked",
                        "Attendance Rate",
                        "Performance Note",
                      ].map((key, colIndex) => (
                        <td
                          key={key}
                          className={cn(
                            "px-4 py-2 whitespace-nowrap text-sm border",
                            typeof row[key as keyof AttendanceSummary] ===
                              "string" &&
                              (
                                row[key as keyof AttendanceSummary] as string
                              ).includes("%")
                              ? (row[
                                  key as keyof AttendanceSummary
                                ] as string) === "100%"
                                ? "text-green-600 font-medium"
                                : (row[
                                    key as keyof AttendanceSummary
                                  ] as string) === "N/A"
                                ? "text-gray-400"
                                : Number(
                                    (
                                      row[
                                        key as keyof AttendanceSummary
                                      ] as string
                                    ).replace("%", "")
                                  ) > 90
                                ? "text-green-600"
                                : Number(
                                    (
                                      row[
                                        key as keyof AttendanceSummary
                                      ] as string
                                    ).replace("%", "")
                                  ) > 75
                                ? "text-yellow-600"
                                : "text-red-600"
                              : "text-gray-700",
                            typeof row[key as keyof AttendanceSummary] ===
                              "string" &&
                              (
                                row[key as keyof AttendanceSummary] as string
                              ).includes("attendance") &&
                              typeof row[key as keyof AttendanceSummary] ===
                                "string" &&
                              (
                                row[key as keyof AttendanceSummary] as string
                              ).includes("Perfect")
                              ? "bg-green-50"
                              : typeof row[key as keyof AttendanceSummary] ===
                                  "string" &&
                                (
                                  row[key as keyof AttendanceSummary] as string
                                ).includes("Excellent")
                              ? "bg-green-100"
                              : typeof row[key as keyof AttendanceSummary] ===
                                  "string" &&
                                (
                                  row[key as keyof AttendanceSummary] as string
                                ).includes("Good")
                              ? "bg-yellow-100"
                              : typeof row[key as keyof AttendanceSummary] ===
                                  "string" &&
                                (
                                  row[key as keyof AttendanceSummary] as string
                                ).includes("improvement")
                              ? "bg-orange-100"
                              : typeof row[key as keyof AttendanceSummary] ===
                                  "string" &&
                                (
                                  row[key as keyof AttendanceSummary] as string
                                ).includes("Poor")
                              ? "bg-red-100"
                              : typeof row[key as keyof AttendanceSummary] ===
                                  "string" &&
                                (
                                  row[key as keyof AttendanceSummary] as string
                                ).includes("Suspended")
                              ? "bg-red-200"
                              : typeof row[key as keyof AttendanceSummary] ===
                                  "string" &&
                                (
                                  row[key as keyof AttendanceSummary] as string
                                ).includes("Attrition")
                              ? "bg-red-200"
                              : ""
                          )}
                          style={colIndex === 0 ? stickyColumnStyle : {}}
                        >
                          {row[key as keyof AttendanceSummary]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendanceData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No attendance data available for the selected date range
                  {selectedEmployee
                    ? ` and employee ${selectedEmployee.name}`
                    : ""}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
