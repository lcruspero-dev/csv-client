import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, isSameDay, isToday } from "date-fns";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import React from "react";
import { Calendar } from "../ui/calendar";

type Employee = {
  id: string;
  name: string;
  department: string;
  avatarUrl?: string;
};

type AttendanceStatus = "present" | "absent" | "late" | "holiday" | "pending";

type AttendanceEntry = {
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  checkinTime?: string;
  checkoutTime?: string;
};

type EmployeeAttendanceProps = {
  employees: Employee[];
  days: Date[];
  attendance: AttendanceEntry[];
  onAttendanceCellClick: (employee: Employee, date: Date) => void;
};

const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = ({
  employees,
  days,
  attendance,
  onAttendanceCellClick,
}) => {
  const getAttendanceStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-orange-100 text-orange-800";
      case "holiday":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const AttendanceStatusIcon = ({ status }: { status: AttendanceStatus }) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "holiday":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "pending":
        return (
          <div className="h-4 w-4 rounded-full border border-gray-300"></div>
        );
      default:
        return null;
    }
  };

  const findAttendanceEntry = (
    employeeId: string,
    date: Date
  ): AttendanceEntry | undefined => {
    return attendance.find(
      (entry) => entry.employeeId === employeeId && isSameDay(entry.date, date)
    );
  };

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="p-2 border sticky left-0 bg-white z-10 min-w-40">
            Employee
          </th>
          {days.map((day) => (
            <th
              key={day.toString()}
              className="p-2 border text-center min-w-32"
            >
              <div
                className={`font-medium ${isToday(day) ? "text-blue-600" : ""}`}
              >
                {format(day, "EEE")}
              </div>
              <div
                className={`text-sm ${
                  isToday(day) ? "text-blue-600 font-bold" : ""
                }`}
              >
                {format(day, "MMM d")}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td className="p-2 border sticky left-0 bg-white z-10">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 rounded-full overflow-hidden border-2 border-blue-200">
                  <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-sm">{employee.name}</div>
                  <div className="text-xs text-gray-500">
                    {employee.department}
                  </div>
                </div>
              </div>
            </td>
            {days.map((day) => {
              const attendanceEntry = findAttendanceEntry(employee.id, day);
              return (
                <td
                  key={day.toString()}
                  className={`p-2 border text-center cursor-pointer hover:bg-gray-50 ${
                    isToday(day) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => onAttendanceCellClick(employee, day)}
                >
                  {attendanceEntry && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center">
                            <Badge
                              variant="outline"
                              className={`mb-1 ${getAttendanceStatusColor(
                                attendanceEntry.status
                              )}`}
                            >
                              <span className="flex items-center">
                                <AttendanceStatusIcon
                                  status={attendanceEntry.status}
                                />
                                <span className="ml-1">
                                  {attendanceEntry.status
                                    .charAt(0)
                                    .toUpperCase() +
                                    attendanceEntry.status.slice(1)}
                                </span>
                              </span>
                            </Badge>
                            {attendanceEntry.checkinTime && (
                              <div className="text-xs text-gray-500">
                                {attendanceEntry.checkinTime}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {attendanceEntry.status !== "pending" && (
                            <>
                              <p>Status: {attendanceEntry.status}</p>
                              {attendanceEntry.checkinTime && (
                                <p>In: {attendanceEntry.checkinTime}</p>
                              )}
                              {attendanceEntry.checkoutTime && (
                                <p>Out: {attendanceEntry.checkoutTime}</p>
                              )}
                            </>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeAttendance;
