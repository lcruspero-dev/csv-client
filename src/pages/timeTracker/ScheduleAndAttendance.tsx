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
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";

import AddEmployee from "@/components/kit/AddEmployee";
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
type Employee = {
  id: string;
  name: string;
  department: string;
  avatarUrl?: string;
};

type ShiftType = "morning" | "afternoon" | "night" | "off";

type AttendanceStatus = "present" | "absent" | "late" | "holiday" | "pending";

type ScheduleEntry = {
  employeeId: string;
  date: Date;
  shiftType: ShiftType;
};

type AttendanceEntry = {
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  checkinTime?: string;
  checkoutTime?: string;
};

type ViewMode = "weekly" | "monthly";

// Sample data
const employees: Employee[] = [
  {
    id: "1",
    name: "Jane Smith",
    department: "CSR",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "John Doe",
    department: "HR",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "Alice Johnson",
    department: "CSR",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    name: "Bob Wilson",
    department: "IT",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: "5",
    name: "Carol Brown",
    department: "HR",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "6",
    name: "Carol Brown",
    department: "HR",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
];

// Generate sample schedule data
const generateSampleSchedule = (): ScheduleEntry[] => {
  const today = new Date();
  const startDate = startOfWeek(today);
  const endDate = endOfMonth(today);

  const schedule: ScheduleEntry[] = [];
  const shiftTypes: ShiftType[] = ["morning", "afternoon", "night", "off"];

  employees.forEach((employee) => {
    let currentDate = startDate;

    while (currentDate <= endDate) {
      // Assign a random shift type for each day
      const randomShiftIndex = Math.floor(Math.random() * shiftTypes.length);

      schedule.push({
        employeeId: employee.id,
        date: new Date(currentDate),
        shiftType: shiftTypes[randomShiftIndex],
      });

      currentDate = addDays(currentDate, 1);
    }
  });

  return schedule;
};

// Generate sample attendance data
const generateSampleAttendance = (): AttendanceEntry[] => {
  const today = new Date();
  const startDate = startOfWeek(today);
  const endDate = endOfMonth(today);

  const attendance: AttendanceEntry[] = [];
  const statuses: AttendanceStatus[] = [
    "present",
    "absent",
    "late",
    "holiday",
    "pending",
  ];

  employees.forEach((employee) => {
    let currentDate = startDate;

    while (currentDate <= endDate) {
      // Don't generate attendance data for future dates
      if (currentDate <= today) {
        const randomStatusIndex = Math.floor(
          Math.random() * (statuses.length - 1)
        ); // Exclude 'pending' for past dates

        attendance.push({
          employeeId: employee.id,
          date: new Date(currentDate),
          status: statuses[randomStatusIndex],
          checkinTime:
            statuses[randomStatusIndex] !== "absent"
              ? `0${7 + Math.floor(Math.random() * 3)}:${Math.floor(
                  Math.random() * 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : undefined,
          checkoutTime:
            statuses[randomStatusIndex] !== "absent"
              ? `${16 + Math.floor(Math.random() * 3)}:${Math.floor(
                  Math.random() * 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : undefined,
        });
      } else {
        // Future dates are always 'pending'
        attendance.push({
          employeeId: employee.id,
          date: new Date(currentDate),
          status: "pending",
        });
      }

      currentDate = addDays(currentDate, 1);
    }
  });

  return attendance;
};

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
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(
    generateSampleSchedule()
  );
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(
    generateSampleAttendance()
  );
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShiftType, setSelectedShiftType] =
    useState<ShiftType>("morning");
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] =
    useState<AttendanceStatus>("present");
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "Jane Smith",
      department: "CSR",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "John Doe",
      department: "HR",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
    },
  ]);

  // Filter employees by department
  const filteredEmployees =
    selectedDepartment === "all"
      ? employees
      : employees.filter((emp) => emp.department === selectedDepartment);

  // Get days based on view mode
  const getDaysInView = () => {
    if (viewMode === "weekly") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  const days = getDaysInView();

  // Navigation functions
  const goToPreviousPeriod = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prevDate) => addDays(prevDate, -7));
    } else {
      const prevMonth = new Date(currentDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentDate(prevMonth);
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prevDate) => addDays(prevDate, 7));
    } else {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentDate(nextMonth);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Find schedule entry for an employee on a specific day
  const findScheduleEntry = (
    employeeId: string,
    date: Date
  ): ScheduleEntry | undefined => {
    return schedule.find(
      (entry) => entry.employeeId === employeeId && isSameDay(entry.date, date)
    );
  };

  // Find attendance entry for an employee on a specific day
  const findAttendanceEntry = (
    employeeId: string,
    date: Date
  ): AttendanceEntry | undefined => {
    return attendance.find(
      (entry) => entry.employeeId === employeeId && isSameDay(entry.date, date)
    );
  };

  // Update schedule
  const updateSchedule = (
    employeeId: string,
    date: Date,
    shiftType: ShiftType
  ) => {
    const updatedSchedule = [...schedule];
    const existingEntryIndex = updatedSchedule.findIndex(
      (entry) => entry.employeeId === employeeId && isSameDay(entry.date, date)
    );

    if (existingEntryIndex !== -1) {
      updatedSchedule[existingEntryIndex].shiftType = shiftType;
    } else {
      updatedSchedule.push({
        employeeId,
        date,
        shiftType,
      });
    }

    setSchedule(updatedSchedule);
  };

  // Update attendance
  const updateAttendance = (
    employeeId: string,
    date: Date,
    status: AttendanceStatus
  ) => {
    const updatedAttendance = [...attendance];
    const existingEntryIndex = updatedAttendance.findIndex(
      (entry) => entry.employeeId === employeeId && isSameDay(entry.date, date)
    );

    if (existingEntryIndex !== -1) {
      updatedAttendance[existingEntryIndex].status = status;
    } else {
      updatedAttendance.push({
        employeeId,
        date,
        status,
      });
    }

    setAttendance(updatedAttendance);
  };

  // Handle adding a new shift
  const handleAddShift = () => {
    if (selectedEmployee && selectedDate) {
      updateSchedule(selectedEmployee.id, selectedDate, selectedShiftType);
      setIsAddShiftOpen(false);
    }
  };

  // Handle click on a schedule cell
  const handleScheduleCellClick = (employee: Employee, date: Date) => {
    setSelectedEmployee(employee);
    setSelectedDate(date);
    const entry = findScheduleEntry(employee.id, date);
    if (entry) {
      setSelectedShiftType(entry.shiftType);
    } else {
      setSelectedShiftType("morning");
    }
    setIsAddShiftOpen(true);
  };

  // Handle click on an attendance cell
  const handleAttendanceCellClick = (employee: Employee, date: Date) => {
    // Only allow updating attendance for current or past dates
    if (date > new Date()) return;

    setSelectedEmployee(employee);
    setSelectedDate(date);
    const entry = findAttendanceEntry(employee.id, date);
    if (entry) {
      setSelectedAttendanceStatus(entry.status);
    } else {
      setSelectedAttendanceStatus("present");
    }
    setIsAddShiftOpen(true);
  };

  // Handle confirmation of attendance status update
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="container mx-auto p-4">
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
          <Tabs defaultValue="schedule">
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
                              src="/api/placeholder/32/32"
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
                            className={`p-2 border text-center cursor-pointer hover:bg-gray-50 ${
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
                              src="/api/placeholder/32/32"
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
                        const attendanceEntry = findAttendanceEntry(
                          employee.id,
                          day
                        );
                        return (
                          <td
                            key={day.toString()}
                            className={`p-2 border text-center cursor-pointer hover:bg-gray-50 ${
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
            {/* <Button>Add Employee</Button> */}
            <AddEmployee
              onAdd={(employee) => setEmployees([...employees, employee])}
            />
          </div>
        </CardFooter>
      </Card>

      {/* Dialog for adding or updating shift/attendance */}
      <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
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

          <Tabs defaultValue="shift">
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
                    <Label htmlFor="off">Day Off</Label>
                  </div>
                </RadioGroup>
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
            <Button variant="outline" onClick={() => setIsAddShiftOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddShift}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleAndAttendance;
