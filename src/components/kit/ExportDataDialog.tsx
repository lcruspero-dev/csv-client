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

      const presentDays = statusCounts["Present"] || 0;
      const totalDaysWithData = attendedDates.size;
      const absentDays = totalDaysWithData - presentDays;

      return {
        "Employee Name": employee.name,
        Position: employee.department,
        "Team Leader": employee.teamLeader,
        "Days Tracked": totalDaysWithData,
        "Present Days": presentDays,
        "Absent Days": absentDays > 0 ? absentDays : 0,
        "Attendance %":
          totalDaysWithData > 0
            ? `${Math.round((presentDays / totalDaysWithData) * 100)}%`
            : "No data",
        NCNS: statusCounts["NCNS"] || 0,
        Tardy: statusCounts["Tardy"] || 0,
        PTO: statusCounts["PTO"] || 0,
        Leave: statusCounts["LOA"] || 0,
        "Other Absences": Object.entries(statusCounts)
          .filter(
            ([status]) =>
              !["Present", "NCNS", "Tardy", "PTO", "LOA"].includes(status)
          )
          .reduce((sum, [, count]) => sum + count, 0),
      };
    });
  };

  const handleExportExcel = () => {
    const data = getAttendanceSummary();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance_Summary");

    const filename = `Attendance_Summary_${format(
      dateRange.from,
      "yyyyMMdd"
    )}_to_${format(dateRange.to, "yyyyMMdd")}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const attendanceData = getAttendanceSummary();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Export Attendance Data</Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Export Attendance Data</DialogTitle>
          <DialogDescription>
            Select date range and view attendance summary before exporting
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="grid gap-2">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={format(dateRange.from, "yyyy-MM-dd")}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-to">To Date</Label>
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
              Save as Excel
            </Button>
          </div>

          <div className="mt-4">
            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {attendanceData.length > 0 &&
                      Object.keys(attendanceData[0]).map((key) => (
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
                  {attendanceData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className={cn(
                            "px-4 py-2 whitespace-nowrap text-sm border",
                            typeof value === "string" && value.includes("%")
                              ? value === "100%"
                                ? "text-green-600 font-medium"
                                : value === "No data"
                                ? "text-gray-400"
                                : Number(value.replace("%", "")) > 80
                                ? "text-green-600"
                                : Number(value.replace("%", "")) > 50
                                ? "text-yellow-600"
                                : "text-red-600"
                              : "text-gray-700"
                          )}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
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
