// components/ScheduleAndAttendance.tsx
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

import { ScheduleAndAttendanceAPI, UserProfileAPI } from "@/API/endpoint";
import { AbsenteeismAnalytics } from "@/components/kit/AbsenteeismAnalytics";
import AddEmployee from "@/components/kit/AddEmployee";
import { Attendance } from "@/components/kit/EmployeeAttendance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
export type Employee = {
  id: string;
  name: string;
  department: string;
  teamLeader: string;
  avatarUrl?: string;
  schedule: { date: string; shiftType: ShiftType }[];
};

type ShiftTypeValue =
  | "shift1"
  | "shift2"
  | "shift3"
  | "staff"
  | "restday"
  | "paidTimeOff"
  | "plannedLeave";

export type ShiftType = {
  type: ShiftTypeValue;
  startTime?: string;
  endTime?: string;
  break1?: string;
  break2?: string;
  lunch?: string;
};

export type AttendanceStatus =
  | "Present"
  | "NCNS"
  | "Call In"
  | "Rest Day"
  | "Tardy"
  | "RDOT"
  | "Suspended"
  | "Attrition"
  | "LOA"
  | "PTO"
  | "Half Day"
  | "Early Log Out"
  | "VTO"
  | "TB"
  | "Pending";

export type ScheduleEntry = {
  date: string;
  shiftType: ShiftType;
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
  __v: number;
};

export type AttendanceEntry = {
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  checkinTime?: string;
  checkoutTime?: string;
};

type ViewMode = "weekly" | "monthly";

// Helper to get shift color
const getShiftColor = (shiftType: ShiftType): string => {
  if (!shiftType || !shiftType.type) return "bg-gray-100 text-gray-500";

  switch (shiftType.type) {
    case "shift1":
      return "bg-blue-100 text-blue-800";
    case "shift2":
      return "bg-yellow-100 text-yellow-800";
    case "shift3":
      return "bg-purple-100 text-purple-800";
    case "staff":
      return "bg-green-100 text-green-800";
    case "restday":
      return "bg-orange-100 text-orange-800";
    case "paidTimeOff":
      return "bg-pink-100 text-pink-800";
    case "plannedLeave":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

// Helper to check if a shift type has time
const hasShiftTime = (shiftType: ShiftTypeValue): boolean => {
  return ["shift1", "shift2", "shift3", "staff"].includes(shiftType);
};

const formatTimeToAMPM = (time: string): string => {
  if (!time) return "";

  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM

  return `${displayHour}:${minute} ${period}`;
};

// Helper function to display shift information
const displayShiftInfo = (
  shiftType: ShiftType
): { name: string; time: string; details?: string } => {
  if (!shiftType || !shiftType.type) return { name: "", time: "" };

  let displayName = "";
  let displayTime = "";
  let details = "";

  // Format the shift type name
  switch (shiftType.type) {
    case "shift1":
      displayName = "Shift 1";
      break;
    case "shift2":
      displayName = "Shift 2";
      break;
    case "shift3":
      displayName = "Shift 3";
      break;
    case "staff":
      displayName = "Staff";
      break;
    case "restday":
      displayName = "Rest Day";
      break;
    case "paidTimeOff":
      displayName = "PTO";
      break;
    case "plannedLeave":
      displayName = "Leave";
      break;
    default:
      displayName = shiftType.type;
  }

  // Only show time for shift types that have times
  if (
    hasShiftTime(shiftType.type) &&
    shiftType.startTime &&
    shiftType.endTime
  ) {
    displayTime = `${formatTimeToAMPM(
      shiftType.startTime
    )} - ${formatTimeToAMPM(shiftType.endTime)}`;

    // Build details string with all available times
    const detailsParts = [];
    if (shiftType.startTime)
      detailsParts.push(`Login: ${formatTimeToAMPM(shiftType.startTime)}`);
    if (shiftType.endTime)
      detailsParts.push(`Logout: ${formatTimeToAMPM(shiftType.endTime)}`);
    if (shiftType.break1)
      detailsParts.push(`Break1: ${formatTimeToAMPM(shiftType.break1)}`);
    if (shiftType.break2)
      detailsParts.push(`Break2: ${formatTimeToAMPM(shiftType.break2)}`);
    if (shiftType.lunch)
      detailsParts.push(`Lunch: ${formatTimeToAMPM(shiftType.lunch)}`);

    details = detailsParts.join("\n");
  }

  return {
    name: displayName,
    time: displayTime,
    details,
  };
};

// Helper function to convert 24-hour time to 12-hour AM/PM format

const ScheduleAndAttendance: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShiftType, setSelectedShiftType] =
    useState<ShiftTypeValue>("shift1");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("00:00");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("00:00");
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] =
    useState<AttendanceStatus>("Present");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repeatDays, setRepeatDays] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedBreak1, setSelectedBreak1] = useState<string | undefined>();
  const [selectedBreak2, setSelectedBreak2] = useState<string | undefined>();
  const [selectedLunch, setSelectedLunch] = useState<string | undefined>();

  const resetDialogState = () => {
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedShiftType("shift1");
    setSelectedStartTime("00:00");
    setSelectedEndTime("00:00");
    setSelectedBreak1(undefined);
    setSelectedLunch(undefined);
    setSelectedBreak2(undefined);
    setSelectedAttendanceStatus("Present");
    setRepeatDays(1);
  };

  const fetchEmployees = async (avatarMap: Record<string, string>) => {
    try {
      setLoading(true);
      const response = await ScheduleAndAttendanceAPI.getScheduleEntries();

      // Normalize employee data with avatar URLs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedEmployees = response.data.map((entry: any) => {
        const schedule = Array.isArray(entry.schedule) ? entry.schedule : [];
        const avatarFilename = avatarMap[entry.employeeId];
        const avatarUrl = avatarFilename
          ? `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${avatarFilename}`
          : `https://ui-avatars.com/api/?background=2563EB&color=fff&name=${entry.employeeName}`;

        return {
          id: entry.employeeId,
          name: entry.employeeName,
          department: entry.position,
          teamLeader: entry.teamLeader,
          avatarUrl: avatarUrl,
          schedule: schedule,
        };
      });

      setEmployees(formattedEmployees);

      // Normalize schedule data
      let flattenedSchedule: ScheduleEntry[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data.forEach((entry: any) => {
        if (Array.isArray(entry.schedule)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const employeeSchedules = entry.schedule.map((sched: any) => {
            const shiftType: ShiftType = {
              type: sched.shiftType as ShiftTypeValue,
            };

            if (hasShiftTime(sched.shiftType as ShiftTypeValue)) {
              if (sched.startTime) shiftType.startTime = sched.startTime;
              if (sched.endTime) shiftType.endTime = sched.endTime;
              if (sched.break1) shiftType.break1 = sched.break1;
              if (sched.break2) shiftType.break2 = sched.break2;
              if (sched.lunch) shiftType.lunch = sched.lunch;
            }

            return {
              date: sched.date,
              shiftType: shiftType,
              _id: sched._id || Date.now().toString(),
              employeeId: entry.employeeId,
              employeeName: entry.employeeName,
              teamLeader: entry.teamLeader,
              position: entry.position,
              schedule: [],
              __v: 0,
            };
          });

          flattenedSchedule = [...flattenedSchedule, ...employeeSchedules];
        }
      });

      setSchedule(flattenedSchedule);
    } catch (err) {
      console.error("Error fetching employee data:", err);
      setError("Failed to fetch employee data");
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await ScheduleAndAttendanceAPI.getAttendanceEntries();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedAttendance = response.data.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));
      setAttendance(formattedAttendance);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // First fetch avatars
        const avatarResponse = await UserProfileAPI.getAllUserAvatar();
        const avatarMap = avatarResponse.data.reduce(
          (
            acc: Record<string, string>,
            curr: { userId: string; avatar: string }
          ) => {
            acc[curr.userId] = curr.avatar;
            return acc;
          },
          {}
        );
        // setAvatars(avatarMap);

        // Then fetch employees with avatar data
        await fetchEmployees(avatarMap);

        // Finally fetch attendance
        await fetchAttendance();
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const filteredEmployees =
    selectedDepartment === "all"
      ? employees
      : employees.filter((emp) => emp.teamLeader === selectedDepartment);

  if (loading) return <p>Loading employees...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const getDaysInView = () => {
    const start =
      viewMode === "weekly"
        ? startOfWeek(currentDate)
        : startOfMonth(currentDate);
    const end =
      viewMode === "weekly" ? endOfWeek(currentDate) : endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInView();

  const goToPreviousPeriod = () => {
    setCurrentDate((prevDate) =>
      viewMode === "weekly"
        ? addDays(prevDate, -7)
        : new Date(prevDate.setMonth(prevDate.getMonth() - 1))
    );
  };

  const goToNextPeriod = () => {
    setCurrentDate((prevDate) =>
      viewMode === "weekly"
        ? addDays(prevDate, 7)
        : new Date(prevDate.setMonth(prevDate.getMonth() + 1))
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const findScheduleEntry = (
    employeeId: string,
    date: Date
  ): ScheduleEntry | undefined => {
    return schedule.find(
      (entry) =>
        entry.employeeId === employeeId &&
        entry.date &&
        isSameDay(new Date(entry.date), date)
    );
  };

  const findAttendanceEntry = (
    employeeId: string,
    date: Date
  ): AttendanceEntry | undefined => {
    return attendance.find(
      (entry) =>
        entry.employeeId === employeeId &&
        entry.date &&
        isSameDay(entry.date, date)
    );
  };

  const updateAttendance = (
    employeeId: string,
    date: Date,
    status: AttendanceStatus
  ) => {
    const updatedAttendance = attendance.map((entry) =>
      entry.employeeId === employeeId && isSameDay(entry.date, date)
        ? { ...entry, status }
        : entry
    );
    setAttendance(updatedAttendance);
  };

  const handleAddShift = async () => {
    if (selectedEmployee && selectedDate) {
      const updatedSchedule = [...schedule]; // Create a copy of the current schedule

      // Format the date for the API
      const formattedDate = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

      // Create the schedule entry matching the backend schema format
      const scheduleData = {
        date: formattedDate,
        shiftType: selectedShiftType,
        startTime: "",
        endTime: "",
        break1: selectedBreak1 || "",
        break2: selectedBreak2 || "",
        lunch: selectedLunch || "",
      };

      // Add time properties only for shift types that need them
      if (hasShiftTime(selectedShiftType)) {
        scheduleData.startTime = selectedStartTime;
        scheduleData.endTime = selectedEndTime;
      } else {
        // For non-time shift types, still include empty strings to match schema
        scheduleData.startTime = "";
        scheduleData.endTime = "";
        scheduleData.break1 = "";
        scheduleData.break2 = "";
        scheduleData.lunch = "";
      }

      for (let i = 0; i < repeatDays; i++) {
        const currentDate = addDays(selectedDate, i);
        const currentFormattedDate = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

        // Update the date for the current iteration
        const currentScheduleData = {
          ...scheduleData,
          date: currentFormattedDate,
        };

        // Find the existing schedule entry for the employee and date
        const existingEntryIndex = updatedSchedule.findIndex(
          (entry) =>
            entry.employeeId === selectedEmployee.id &&
            isSameDay(new Date(entry.date), currentDate)
        );

        if (existingEntryIndex !== -1) {
          // If an entry exists, update it
          updatedSchedule[existingEntryIndex] = {
            ...updatedSchedule[existingEntryIndex],
            shiftType: {
              type: selectedShiftType,
              ...(hasShiftTime(selectedShiftType) && {
                startTime: selectedStartTime,
                endTime: selectedEndTime,
              }),
            },
          };
        } else {
          // If no entry exists, create a new one
          const newEntry: ScheduleEntry = {
            date: currentFormattedDate,
            shiftType: {
              type: selectedShiftType,
              ...(hasShiftTime(selectedShiftType) && {
                startTime: selectedStartTime,
                endTime: selectedEndTime,
              }),
            },
            _id: Date.now().toString() + i, // Generate a unique ID (temporary)
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            teamLeader: selectedEmployee.teamLeader,
            position: selectedEmployee.department,
            schedule: [],
            __v: 0,
          };
          updatedSchedule.push(newEntry);
        }

        try {
          // Call the API to update the schedule for each repeated day
          // Following the schema format for the backend
          await ScheduleAndAttendanceAPI.updateScheduleEntry(
            selectedEmployee.id,
            currentScheduleData
          );
          console.log(`Successfully updated shift for ${currentFormattedDate}`);
        } catch (err) {
          console.error(
            `Error updating shift for ${currentFormattedDate}:`,
            err
          );
          setError(`Failed to update shift for ${currentFormattedDate}`);
        }
      }

      // Update the state once with all the changes
      setSchedule(updatedSchedule);
      setIsAddShiftOpen(false);
      setRepeatDays(1); // Reset repeatDays to default value
    }
  };

  const handleScheduleCellClick = (employee: Employee, date: Date) => {
    setSelectedEmployee(employee);
    setSelectedDate(date);

    const entry = findScheduleEntry(employee.id, date);

    if (entry && entry.shiftType) {
      setSelectedShiftType(entry.shiftType.type);

      if (hasShiftTime(entry.shiftType.type)) {
        if (entry.shiftType.startTime) {
          setSelectedStartTime(entry.shiftType.startTime);
        } else {
          setSelectedStartTime("00:00");
        }

        if (entry.shiftType.endTime) {
          setSelectedEndTime(entry.shiftType.endTime);
        } else {
          setSelectedEndTime("00:00");
        }

        // Set break times if they exist
        setSelectedBreak1(entry.shiftType.break1 || undefined);
        setSelectedLunch(entry.shiftType.lunch || undefined);
        setSelectedBreak2(entry.shiftType.break2 || undefined);
      }
    } else {
      setSelectedShiftType("shift1");
      setSelectedStartTime("00:00");
      setSelectedEndTime("00:00");
      setSelectedBreak1(undefined);
      setSelectedLunch(undefined);
      setSelectedBreak2(undefined);
    }

    setIsAddShiftOpen(true);
  };

  const handleAttendanceCellClick = (employee: Employee, date: Date) => {
    if (date > new Date()) return;
    setSelectedEmployee(employee);
    setSelectedDate(date);
    const entry = findAttendanceEntry(employee.id, date);
    setSelectedAttendanceStatus(entry ? entry.status : "Present");
    setIsAddShiftOpen(true);
  };

  const handleUpdateAttendance = async () => {
    if (selectedEmployee && selectedDate) {
      try {
        // Format the date for the API
        const formattedDate = `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

        // Create the attendance data object
        const attendanceData = {
          employeeId: selectedEmployee.id,
          date: formattedDate,
          status: selectedAttendanceStatus,
        };

        // Call the API to create/update the attendance entry
        await ScheduleAndAttendanceAPI.createAttendanceEntry(attendanceData);

        // Update local state
        updateAttendance(
          selectedEmployee.id,
          selectedDate,
          selectedAttendanceStatus
        );

        // Refresh attendance data
        await fetchAttendance();

        setIsAddShiftOpen(false);
      } catch (err) {
        console.error("Error updating attendance:", err);
        setError("Failed to update attendance");
      }
    }
  };

  return (
    <div className="container mx-auto p-1">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Schedule & Attendance</CardTitle>
              <CardDescription>
                Manage employee shifts and track attendance
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPreviousPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Team Leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {Array.from(new Set(employees.map((emp) => emp.teamLeader)))
                    .filter((leader) => leader) // Filter out empty/null team leaders
                    .map((leader) => (
                      <SelectItem key={leader} value={leader}>
                        {leader}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Tabs
                value={viewMode}
                onValueChange={(value) => setViewMode(value as ViewMode)}
              >
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {viewMode === "weekly"
                  ? `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`
                  : format(currentDate, "MMMM yyyy")}
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AbsenteeismAnalytics
            employees={employees}
            attendance={attendance}
            schedule={schedule}
            viewMode={viewMode}
            currentDate={currentDate}
            filteredEmployees={filteredEmployees.map((emp) => emp.id)} // Pass filtered employee IDs
          />
          <Tabs defaultValue="schedule" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="overflow-x-auto">
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
                          className={`font-medium ${
                            isToday(day) ? "text-blue-600" : ""
                          }`}
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
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="p-2 border sticky left-0 bg-white z-10">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2 rounded-full overflow-hidden border-2 border-blue-200">
                            <AvatarImage
                              src={employee.avatarUrl}
                              alt={employee.name}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {employee.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-sm">
                              {employee.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      {days.map((day) => {
                        const scheduleEntry = findScheduleEntry(
                          employee.id,
                          day
                        );
                        return (
                          <td
                            key={day.toString()}
                            className={`p-2 border text-center cursor-pointer hover:bg-blue-100 ${
                              isToday(day) ? "bg-blue-50" : ""
                            }`}
                            onClick={() =>
                              handleScheduleCellClick(employee, day)
                            }
                          >
                            {scheduleEntry && scheduleEntry.shiftType && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center">
                                      <Badge
                                        variant="outline"
                                        className={`w-fit flex items-center justify-center px-3 py-1 min-w-24 ${getShiftColor(
                                          scheduleEntry.shiftType
                                        )}`}
                                      >
                                        {
                                          displayShiftInfo(
                                            scheduleEntry.shiftType
                                          ).name
                                        }
                                      </Badge>
                                      {displayShiftInfo(scheduleEntry.shiftType)
                                        .time && (
                                        <span className="text-[11px] text-gray-500">
                                          {
                                            displayShiftInfo(
                                              scheduleEntry.shiftType
                                            ).time
                                          }
                                        </span>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs whitespace-pre-line text-sm">
                                    <div className="space-y-1">
                                      <p className="font-semibold">
                                        {
                                          displayShiftInfo(
                                            scheduleEntry.shiftType
                                          ).name
                                        }
                                      </p>
                                      {displayShiftInfo(scheduleEntry.shiftType)
                                        .details?.split("\n")
                                        .map((line, i) => (
                                          <p key={i}>{line}</p>
                                        ))}
                                    </div>
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
            </TabsContent>
            <TabsContent value="attendance">
              <Attendance
                viewMode={viewMode}
                currentDate={currentDate}
                filteredEmployees={filteredEmployees}
                attendance={attendance}
                handleAttendanceCellClick={handleAttendanceCellClick}
                refreshAttendance={fetchAttendance} // Add this prop
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredEmployees.length} employees
          </div>
          <div className="flex gap-2 text-xs">
            <Button variant="outline">Export Data</Button>
            <AddEmployee
              onEmployeeAdded={async () => {
                try {
                  setLoading(true);
                  // First refresh avatars in case new employee has one
                  const avatarResponse =
                    await UserProfileAPI.getAllUserAvatar();
                  const avatarMap = avatarResponse.data.reduce(
                    (
                      acc: Record<string, string>,
                      curr: { userId: string; avatar: string }
                    ) => {
                      acc[curr.userId] = curr.avatar;
                      return acc;
                    },
                    {}
                  );
                  // setAvatars(avatarMap);

                  // Then refresh employee data
                  await fetchEmployees(avatarMap);
                  await fetchAttendance(); // Also refresh attendance data
                } catch (err) {
                  console.error("Error refreshing after adding employee:", err);
                  setError("Failed to refresh data after adding employee");
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        </CardFooter>
      </Card>
      <Dialog
        open={isAddShiftOpen}
        onOpenChange={(open) => {
          setIsAddShiftOpen(open);
          if (!open) resetDialogState();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee && selectedDate ? (
                <>
                  Update {format(selectedDate, "MMM d, yyyy")} for{" "}
                  {selectedEmployee.name}
                </>
              ) : (
                "Update Schedule"
              )}
            </DialogTitle>
            <DialogDescription>
              Select shift type or attendance status to update
            </DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue={activeTab === "schedule" ? "shift" : "attendance"}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shift">Shift Schedule</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            <TabsContent value="shift">
              <div className="space-y-4 mt-4">
                <Label htmlFor="shift-type">Shift Type</Label>
                <RadioGroup
                  id="shift-type"
                  value={selectedShiftType}
                  onValueChange={(value: string) => {
                    setSelectedShiftType(value as ShiftTypeValue);

                    // Set default times based on whether this shift type has time or not
                    if (hasShiftTime(value as ShiftTypeValue)) {
                      // Set default shift times
                      setSelectedStartTime("00:00");
                      setSelectedEndTime("00:00");
                    } else {
                      // Clear break times for non-time shift types
                      setSelectedBreak1(undefined);
                      setSelectedLunch(undefined);
                      setSelectedBreak2(undefined);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shift1" id="shift1" />
                    <Label htmlFor="shift1">Shift 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shift2" id="shift2" />
                    <Label htmlFor="shift2">Shift 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shift3" id="shift3" />
                    <Label htmlFor="shift3">Shift 3</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="staff" id="staff" />
                    <Label htmlFor="staff">Staff</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="restday" id="restday" />
                    <Label htmlFor="restday">Rest Day</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paidTimeOff" id="paidTimeOff" />
                    <Label htmlFor="paidTimeOff">Paid Time Off</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="plannedLeave" id="plannedLeave" />
                    <Label htmlFor="plannedLeave">Planned Leave</Label>
                  </div>
                </RadioGroup>

                {/* Input fields for custom start and end times - only show for shift types that have times */}
                {hasShiftTime(selectedShiftType) && (
                  <>
                    <div className="flex space-x-4">
                      <div>
                        <Label htmlFor="start-time">Shift Start </Label>
                        <input
                          id="start-time"
                          type="time"
                          value={selectedStartTime}
                          onChange={(e) => setSelectedStartTime(e.target.value)}
                          className="border p-2 rounded text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">Shift End </Label>
                        <input
                          id="end-time"
                          type="time"
                          value={selectedEndTime}
                          onChange={(e) => setSelectedEndTime(e.target.value)}
                          className="border p-2 rounded text-sm"
                        />
                      </div>
                    </div>

                    {/* Break and lunch times */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="break1">Break 1</Label>
                        <input
                          id="break1"
                          type="time"
                          value={selectedBreak1 || ""}
                          onChange={(e) =>
                            setSelectedBreak1(e.target.value || undefined)
                          }
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lunch">Lunch</Label>
                        <input
                          id="lunch"
                          type="time"
                          value={selectedLunch || ""}
                          onChange={(e) =>
                            setSelectedLunch(e.target.value || undefined)
                          }
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="break2">Break 2</Label>
                        <input
                          id="break2"
                          type="time"
                          value={selectedBreak2 || ""}
                          onChange={(e) =>
                            setSelectedBreak2(e.target.value || undefined)
                          }
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Repeat days selector */}
                <div className="flex items-center space-x-2 text-sm">
                  <span>Repeat for</span>
                  <Select
                    value={repeatDays.toString()}
                    onValueChange={(value) => setRepeatDays(parseInt(value))}
                  >
                    <SelectTrigger className="w-40 text-sm">
                      <SelectValue placeholder="Repeat days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="attendance">
              <div className="space-y-4 mt-4">
                <Label htmlFor="attendance-status">Attendance Status</Label>
                <RadioGroup
                  id="attendance-status"
                  value={selectedAttendanceStatus}
                  onValueChange={(value: string) =>
                    setSelectedAttendanceStatus(value as AttendanceStatus)
                  }
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Present" id="present" />
                      <Label htmlFor="present">Present</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NCNS" id="ncns" />
                      <Label htmlFor="ncns">NCNS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Call In" id="call-in" />
                      <Label htmlFor="call-in">Call In</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Rest Day" id="rest-day" />
                      <Label htmlFor="rest-day">Rest Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Tardy" id="tardy" />
                      <Label htmlFor="tardy">Tardy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="RDOT" id="rdot" />
                      <Label htmlFor="rdot">RDOT</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Suspended" id="suspended" />
                      <Label htmlFor="suspended">Suspended</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Attrition" id="attrition" />
                      <Label htmlFor="attrition">Attrition</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LOA" id="loa" />
                      <Label htmlFor="loa">LOA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PTO" id="pto" />
                      <Label htmlFor="pto">PTO</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Half Day" id="half-day" />
                      <Label htmlFor="half-day">Half Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Early Log Out"
                        id="early-log-out"
                      />
                      <Label htmlFor="early-log-out">Early Log Out</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="VTO" id="vto" />
                      <Label htmlFor="vto">VTO</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="TB" id="tb" />
                      <Label htmlFor="tb">TB</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="text-xs">
            <Button
              variant="outline"
              onClick={() => {
                resetDialogState(); // Reset all state data
                setIsAddShiftOpen(false); // Close the dialog
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                activeTab === "schedule"
                  ? handleAddShift
                  : handleUpdateAttendance
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleAndAttendance;
