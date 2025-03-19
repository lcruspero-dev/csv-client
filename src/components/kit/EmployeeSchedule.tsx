import { ScheduleAndAttendanceAPI } from "@/API/endpoint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, isSameDay, isToday } from "date-fns";
import React, { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  department: string;
  avatarUrl?: string;
};

type ShiftType = "morning" | "afternoon" | "night" | "off";

type ScheduleEntry = {
  employeeId: string;
  date: Date;
  shiftType: ShiftType;
};

type EmployeeScheduleProps = {
  days: Date[];
  onScheduleCellClick: (employee: Employee, date: Date) => void;
};

type ApiEmployee = {
  _id: string;
  employeeId: string;
  employeeName: string;
  teamLeader: string;
  position: string;
  schedule: {
    date: string;
    shiftType: ShiftType;
    _id: string;
  }[];
};

const EmployeeSchedule: React.FC<EmployeeScheduleProps> = ({
  days,
  onScheduleCellClick,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  // Fetch employee and schedule data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ScheduleAndAttendanceAPI.getAttendanceEntries();
        const fetchedEmployees: Employee[] = response.data.map(
          (emp: ApiEmployee) => ({
            id: emp.employeeId,
            name: emp.employeeName,
            department: emp.position,
            avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(
              Math.random() * 70
            )}`, // Random avatar for demo
          })
        );
        setEmployees(fetchedEmployees);

        const fetchedSchedule: ScheduleEntry[] = response.data.flatMap(
          (emp: ApiEmployee) =>
            emp.schedule.map((sched) => ({
              employeeId: emp.employeeId,
              date: new Date(sched.date),
              shiftType: sched.shiftType,
            }))
        );
        setSchedule(fetchedSchedule);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Update schedule via API
  //   const updateSchedule = async (employeeId: string, date: Date, shiftType: ShiftType) => {
  //     try {
  //       const response = await ScheduleAndAttendanceAPI.updateScheduleEntry({
  //         employeeId,
  //         date: date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
  //         shiftType,
  //       });

  //       if (response.data.success) {
  //         // Update local state
  //         const updatedSchedule = [...schedule];
  //         const existingEntryIndex = updatedSchedule.findIndex(
  //           (entry) => entry.employeeId === employeeId && isSameDay(entry.date, date)
  //         );

  //         if (existingEntryIndex !== -1) {
  //           updatedSchedule[existingEntryIndex].shiftType = shiftType;
  //         } else {
  //           updatedSchedule.push({
  //             employeeId,
  //             date,
  //             shiftType,
  //           });
  //         }

  //         setSchedule(updatedSchedule);
  //       } else {
  //         console.error("Failed to update schedule:", response.data.message);
  //       }
  //     } catch (error) {
  //       console.error("Error updating schedule:", error);
  //     }
  //   };

  const getShiftColor = (shiftType: ShiftType): string => {
    switch (shiftType) {
      case "morning":
        return "bg-blue-100 text-blue-800";
      case "afternoon":
        return "bg-yellow-100 text-yellow-800";
      case "night":
        return "bg-purple-100 text-purple-800";
      case "off":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const findScheduleEntry = (
    employeeId: string,
    date: Date
  ): ScheduleEntry | undefined => {
    return schedule.find(
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
              const scheduleEntry = findScheduleEntry(employee.id, day);
              return (
                <td
                  key={day.toString()}
                  className={`p-2 border text-center cursor-pointer hover:bg-gray-50 ${
                    isToday(day) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => onScheduleCellClick(employee, day)}
                >
                  {scheduleEntry && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className={`${getShiftColor(
                              scheduleEntry.shiftType
                            )}`}
                          >
                            {scheduleEntry.shiftType.charAt(0).toUpperCase() +
                              scheduleEntry.shiftType.slice(1)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to update shift</p>
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

export default EmployeeSchedule;
