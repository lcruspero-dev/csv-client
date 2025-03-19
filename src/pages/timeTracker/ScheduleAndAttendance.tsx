/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { ScheduleAndAttendanceAPI } from "@/API/endpoint";
import AddEmployee from "@/components/kit/AddEmployee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
type Employee = {
  id: string;
  name: string;
  department: string;
  teamLeader: string;
  avatarUrl?: string;
  schedule: { date: string; shiftType: string }[];
};

type ShiftType = "morning" | "afternoon" | "night" | "off";

type AttendanceStatus = "present" | "absent" | "late" | "holiday" | "pending";

type ScheduleEntry = {
  date: string;
  shiftType: ShiftType;
  _id: string;
  employeeId: string;
  employeeName: string;
  teamLeader: string;
  position: string;
  schedule: {
    date: string;
    shiftType: string;
    _id: string;
  }[];
  __v: number;
};

type AttendanceEntry = {
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  checkinTime?: string;
  checkoutTime?: string;
};

type ViewMode = "weekly" | "monthly";

// Helper to get shift color
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

// Helper to get attendance status color
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

// Helper to get attendance status icon
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
    useState<ShiftType>("morning");
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] =
    useState<AttendanceStatus>("present");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repeatDays, setRepeatDays] = useState<number>(1);
  // Add new state variable to track active tab
  const [activeTab, setActiveTab] = useState("schedule");

  const resetDialogState = () => {
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedShiftType("morning");
    setSelectedAttendanceStatus("present");
    setRepeatDays(1);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await ScheduleAndAttendanceAPI.getScheduleEntries();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedEmployees = response.data.map((entry: any) => ({
          id: entry.employeeId,
          name: entry.employeeName,
          department: entry.position,
          teamLeader: entry.teamLeader,
          avatarUrl: `https://i.pravatar.cc/150?u=${entry.employeeId}`,
          schedule: entry.schedule || [],
        }));
        setEmployees(formattedEmployees);

        // Flatten the schedule array
        const flattenedSchedule = response.data.flatMap(
          (entry: ScheduleEntry) =>
            entry.schedule.map((sched) => ({
              ...sched,
              employeeId: entry.employeeId,
              employeeName: entry.employeeName,
              teamLeader: entry.teamLeader,
              position: entry.position,
            }))
        );
        setSchedule(flattenedSchedule);
      } catch (err) {
        setError("Failed to fetch employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees =
    selectedDepartment === "all"
      ? employees
      : employees.filter((emp) => emp.department === selectedDepartment);

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
        entry.employeeId === employeeId && isSameDay(new Date(entry.date), date)
    );
  };

  const findAttendanceEntry = (
    employeeId: string,
    date: Date
  ): AttendanceEntry | undefined => {
    return attendance.find(
      (entry) => entry.employeeId === employeeId && isSameDay(entry.date, date)
    );
  };

  const updateSchedule = async (
    employeeId: string,
    date: Date,
    shiftType: ShiftType
  ) => {
    try {
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      // Call the API to update the schedule
      await ScheduleAndAttendanceAPI.updateScheduleEntry(employeeId, {
        date: formattedDate,
        shiftType,
      });

      // Find the existing schedule entry for the employee and date
      const existingEntryIndex = schedule.findIndex(
        (entry) =>
          entry.employeeId === employeeId &&
          isSameDay(new Date(entry.date), date) // Convert entry.date to Date
      );

      if (existingEntryIndex !== -1) {
        // If an entry exists, update it
        const updatedSchedule = [...schedule];
        updatedSchedule[existingEntryIndex] = {
          ...updatedSchedule[existingEntryIndex],
          shiftType,
        };
        setSchedule(updatedSchedule);
      } else {
        // If no entry exists, create a new one
        const newEntry: ScheduleEntry = {
          date: formattedDate,
          shiftType,
          _id: Date.now().toString(), // Generate a unique ID (temporary)
          employeeId,
          employeeName: selectedEmployee?.name || "",
          teamLeader: selectedEmployee?.teamLeader || "",
          position: selectedEmployee?.department || "",
          schedule: [],
          __v: 0,
        };
        setSchedule([...schedule, newEntry]);
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
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

      for (let i = 0; i < repeatDays; i++) {
        const currentDate = addDays(selectedDate, i);
        const formattedDate = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

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
            shiftType: selectedShiftType,
          };
        } else {
          // If no entry exists, create a new one
          const newEntry: ScheduleEntry = {
            date: formattedDate,
            shiftType: selectedShiftType,
            _id: Date.now().toString(), // Generate a unique ID (temporary)
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            teamLeader: selectedEmployee.teamLeader,
            position: selectedEmployee.department,
            schedule: [],
            __v: 0,
          };
          updatedSchedule.push(newEntry);
        }

        // Call the API to update the schedule for each repeated day
        await ScheduleAndAttendanceAPI.updateScheduleEntry(
          selectedEmployee.id,
          {
            date: formattedDate,
            shiftType: selectedShiftType,
          }
        );
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
    setSelectedShiftType(entry ? entry.shiftType : "morning");
    setIsAddShiftOpen(true);
  };

  const handleAttendanceCellClick = (employee: Employee, date: Date) => {
    if (date > new Date()) return;
    setSelectedEmployee(employee);
    setSelectedDate(date);
    const entry = findAttendanceEntry(employee.id, date);
    setSelectedAttendanceStatus(entry ? entry.status : "present");
    setIsAddShiftOpen(true);
  };

  const handleUpdateAttendance = () => {
    if (selectedEmployee && selectedDate) {
      updateAttendance(
        selectedEmployee.id,
        selectedDate,
        selectedAttendanceStatus
      );
      setIsAddShiftOpen(false);
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
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
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
                                      {scheduleEntry.shiftType
                                        .charAt(0)
                                        .toUpperCase() +
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
            </TabsContent>
            <TabsContent value="attendance" className="overflow-x-auto">
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
                            />
                            <AvatarFallback>
                              {employee.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm">{employee.name}</p>
                            <p className="text-xs text-gray-500">
                              {employee.department}
                            </p>
                          </div>
                        </div>
                      </td>
                      {days.map((day) => {
                        const attendanceEntry = findAttendanceEntry(
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
                              handleAttendanceCellClick(employee, day)
                            }
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
                                          <p>
                                            In: {attendanceEntry.checkinTime}
                                          </p>
                                        )}
                                        {attendanceEntry.checkoutTime && (
                                          <p>
                                            Out: {attendanceEntry.checkoutTime}
                                          </p>
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
              onAdd={(employee) =>
                setEmployees([...employees, employee as unknown as Employee])
              }
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
                  onValueChange={(value: string) =>
                    setSelectedShiftType(value as ShiftType)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning">Morning (6am - 2pm)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="afternoon" />
                    <Label htmlFor="afternoon">Afternoon (2pm - 10pm)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="night" id="night" />
                    <Label htmlFor="night">Night (10pm - 6am)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="off" id="off" />
                    <Label htmlFor="off">Rest Day</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PTO" id="PTO" />
                    <Label htmlFor="PTO">Paid Time Off</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Leave" id="Leave" />
                    <Label htmlFor="Leave">Plan Leave</Label>
                  </div>
                </RadioGroup>
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="present" id="present" />
                    <Label htmlFor="present">Present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absent" id="absent" />
                    <Label htmlFor="absent">Absent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="late" id="late" />
                    <Label htmlFor="late">Late</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="holiday" id="holiday" />
                    <Label htmlFor="holiday">Holiday</Label>
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
