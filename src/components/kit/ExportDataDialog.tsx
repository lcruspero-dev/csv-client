/* eslint-disable @typescript-eslint/no-unused-vars */
// components/ExportDataDialog.tsx
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
import { useState } from "react";
import * as XLSX from "xlsx";

type DateRange = {
  from: Date;
  to: Date;
};

// Define status categories
const PAID_STATUSES: AttendanceStatus[] = ["Present", "PTO", "LOA", "Call In"];
const PARTIAL_PAID_STATUSES: AttendanceStatus[] = ["Half Day", "RDOT", "VTO"];
const UNPAID_STATUSES: AttendanceStatus[] = [
  "NCNS",
  "Tardy",
  "Suspended",
  "Attrition",
  "Early Log Out",
  "TB",
];
const NEUTRAL_STATUSES: AttendanceStatus[] = ["Rest Day"];

// Helper function to parse time strings (HH:MM) to hours
const parseTimeToHours = (timeString: string | null | undefined): number => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60;
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

  const handleDateChange = (type: "from" | "to", value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setDateRange((prev) => ({
        ...prev,
        [type]: date,
      }));
    }
  };

  const getAttendanceSummary = () => {
    return filteredEmployees.map((employee) => {
      const employeeAttendance = attendance.filter(
        (entry) =>
          entry.employeeId === employee.id &&
          entry.date &&
          !isBefore(new Date(entry.date), dateRange.from) &&
          !isAfter(new Date(entry.date), dateRange.to)
      );

      // Get all unique dates with attendance data for this employee
      const attendedDates = new Set(
        employeeAttendance.map((entry) =>
          format(new Date(entry.date), "yyyy-MM-dd")
        )
      );

      const statusCounts = employeeAttendance.reduce((acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      }, {} as Record<AttendanceStatus, number>);

      // Calculate days by category
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

      const unpaidDays = Object.entries(statusCounts)
        .filter(([status]) =>
          UNPAID_STATUSES.includes(status as AttendanceStatus)
        )
        .reduce((sum, [, count]) => sum + count, 0);

      const neutralDays = Object.entries(statusCounts)
        .filter(([status]) =>
          NEUTRAL_STATUSES.includes(status as AttendanceStatus)
        )
        .reduce((sum, [, count]) => sum + count, 0);

      const totalDaysTracked = attendedDates.size;
      const workingDays = paidDays + partialPaidDays + unpaidDays;
      const restDays = totalDaysTracked - workingDays - neutralDays;

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

      return {
        "Employee Name": employee.name,
        Position: employee.department,
        "Team Leader": employee.teamLeader,
        "Date Range": `${format(dateRange.from, "MMM dd")} - ${format(
          dateRange.to,
          "MMM dd, yyyy"
        )}`,
        "Total Days Tracked": totalDaysTracked,
        "Working Days": workingDays,
        "Present Days": statusCounts["Present"] || 0,
        "Rest Days": restDays > 0 ? restDays : 0,
        "Neutral Days": neutralDays,
        "Paid Days": paidDays + partialPaidDays,
        "Full Paid Days": paidDays,
        "Partial Paid Days": partialPaidDays,
        "Unpaid Days": unpaidDays,
        "Regular Hours": regularHours.toFixed(2),
        "Overtime Hours": overtimeHours.toFixed(2),
        "Total Hours Worked": totalHoursWorked.toFixed(2),
        "Attendance Rate":
          workingDays > 0
            ? `${Math.round(
                ((paidDays + partialPaidDays * 0.5) / workingDays) * 100
              )}%`
            : "N/A",
        "Detailed Breakdown": {
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
        },
        "Performance Note":
          workingDays === 0
            ? "No working days tracked"
            : statusCounts["Suspended"]
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
            : "Poor attendance",
      };
    });
  };

  const handleExportExcel = () => {
    const data = getAttendanceSummary();

    // Flatten the data for Excel export
    const excelData = data.map((item) => ({
      ...item,
      ...item["Detailed Breakdown"],
      "Detailed Breakdown": undefined,
      "Performance Note": item["Performance Note"],
      "Regular Hours": item["Regular Hours"],
      "Overtime Hours": item["Overtime Hours"],
      "Total Hours Worked": item["Total Hours Worked"],
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance_Report");

    const filename = `Attendance_Report_${format(
      dateRange.from,
      "yyyyMMdd"
    )}_to_${format(dateRange.to, "yyyyMMdd")}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const attendanceData = getAttendanceSummary();

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
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
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
            <Button className="text-xs" onClick={handleExportExcel}>
              Export Full Report (Excel)
            </Button>
          </div>

          <div className="mt-4">
            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {attendanceData.length > 0 &&
                      Object.keys(attendanceData[0])
                        .filter(
                          (key) =>
                            ![
                              "Detailed Breakdown",
                              "Regular Hours",
                              "Overtime Hours",
                              "Total Hours Worked",
                            ].includes(key)
                        )
                        .map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                          >
                            {key}
                          </th>
                        ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((row, index) => {
                    const {
                      "Detailed Breakdown": _,
                      "Regular Hours": __,
                      "Overtime Hours": ___,
                      "Total Hours Worked": ____,
                      ...rest
                    } = row;
                    return (
                      <tr key={index}>
                        {Object.values(rest).map((value, i) => (
                          <td
                            key={i}
                            className={cn(
                              "px-4 py-2 whitespace-nowrap text-sm border",
                              typeof value === "string" && value.includes("%")
                                ? value === "100%"
                                  ? "text-green-600 font-medium"
                                  : value === "N/A"
                                  ? "text-gray-400"
                                  : Number(value.replace("%", "")) > 90
                                  ? "text-green-600"
                                  : Number(value.replace("%", "")) > 75
                                  ? "text-yellow-600"
                                  : "text-red-600"
                                : "text-gray-700",
                              typeof value === "string" &&
                                value.includes("attendance") &&
                                typeof value === "string" &&
                                value.includes("Perfect")
                                ? "bg-green-50"
                                : typeof value === "string" &&
                                  value.includes("Excellent")
                                ? "bg-green-100"
                                : typeof value === "string" &&
                                  value.includes("Good")
                                ? "bg-yellow-100"
                                : typeof value === "string" &&
                                  value.includes("improvement")
                                ? "bg-orange-100"
                                : typeof value === "string" &&
                                  value.includes("Poor")
                                ? "bg-red-100"
                                : typeof value === "string" &&
                                  value.includes("Suspended")
                                ? "bg-red-200"
                                : typeof value === "string" &&
                                  value.includes("Attrition")
                            )}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {attendanceData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No attendance data available for the selected date range
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
