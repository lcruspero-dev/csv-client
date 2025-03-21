import { timer } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingComponent from "@/components/ui/loading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Loader2, LogIn } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AttendanceEntry {
  id: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  totalHours?: number;
  notes?: string;
  shift?: string;
  breakStart?: string;
  breakEnd?: string;
  totalBreakTime?: number;
  dateBreakStart?: string;
  dateBreakEnd?: string;
  lunchStart?: string;
  lunchEnd?: string;
  totalLunchTime?: number;
  dateLunchStart?: string;
  dateLunchEnd?: string;
}

interface CurrentTimeResponse {
  date: string;
  time: string;
}

export const AttendanceTracker: React.FC = () => {
  const [isTimeIn, setIsTimeIn] = useState(false);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>(
    []
  );
  const [currentEntry, setCurrentEntry] = useState<Partial<AttendanceEntry>>(
    {}
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentServerTime, setCurrentServerTime] =
    useState<CurrentTimeResponse>({
      date: "",
      time: "",
    });
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Loading states
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingTimeIn, setIsLoadingTimeIn] = useState(false);
  const [isLoadingTimeOut, setIsLoadingTimeOut] = useState(false);
  const [isLoadingBreakStart, setIsLoadingBreakStart] = useState(false);
  const [isLoadingBreakEnd, setIsLoadingBreakEnd] = useState(false);
  const [isLoadingLunchStart, setIsLoadingLunchStart] = useState(false);
  const [isLoadingLunchEnd, setIsLoadingLunchEnd] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const entriesPerPage = 10;
  const SHIFT_OPTIONS = ["Shift 1", "Shift 2", "Shift 3", "Staff"];

  const totalPages = Math.ceil(attendanceEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = attendanceEntries.slice(startIndex, endIndex);
  const { toast } = useToast();

  const LoadingSpinner = () => (
    <Loader2 className="animate-spin h-4 w-4 ml-2" />
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getAttendance = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await timer.getAttendanceEntries();
      setAttendanceEntries(response.data);
    } catch (error) {
      console.error("Error getting attendance entries:", error);
      // Check if the error message is "Employee time not found" and prevent showing the toast
      if (typeof error === "object" && error !== null && "message" in error) {
        if (
          (error as { message: string }).message === "Employee time not found"
        ) {
          return; // Don't show the toast for this specific error
        }
      }
      toast({
        title: "Error",
        description:
          "Failed to load attendance history. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getCurrentTimeFromAPI = async (): Promise<CurrentTimeResponse> => {
    try {
      const response = await timer.getServerTime();
      setCurrentServerTime(response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting current time from API:", error);
      const now = new Date();
      return {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      };
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingInitial(true);
      try {
        await Promise.all([
          getAttendance(),
          getCurrentTimeFromAPI(),
          getCurrentTime(),
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This is a replacement for the entire useEffect that handles the timer calculations

  useEffect(() => {
    // Only run this effect if the user is timed in
    if (!isTimeIn || !currentEntry.date) {
      return;
    }

    let intervalId: NodeJS.Timeout;

    // Calculate server-client time offset for accurate time tracking
    const serverTime = new Date(
      `${currentServerTime.date} ${currentServerTime.time}`
    ).getTime();
    const localTime = Date.now();
    const timeOffset = serverTime - localTime;

    // Determine the current status (on break, on lunch, or regular work)
    const isOnBreak = currentEntry.breakStart && !currentEntry.breakEnd;
    const isOnLunch = currentEntry.lunchStart && !currentEntry.lunchEnd;

    // Set up the interval to update elapsed time
    // eslint-disable-next-line prefer-const
    intervalId = setInterval(() => {
      const currentTime = Date.now() + timeOffset;
      let diffMs = 0;

      if (isOnBreak) {
        // On break: calculate time since break started
        const breakStartTime = new Date(
          `${currentEntry.dateBreakStart || currentEntry.date} ${
            currentEntry.breakStart
          }`
        ).getTime();
        diffMs = currentTime - breakStartTime;
      } else if (isOnLunch) {
        // On lunch: calculate time since lunch started
        const lunchStartTime = new Date(
          `${currentEntry.dateLunchStart || currentEntry.date} ${
            currentEntry.lunchStart
          }`
        ).getTime();
        diffMs = currentTime - lunchStartTime;
      } else {
        // Regular work: Calculate total work time minus breaks
        const timeInDate = new Date(
          `${currentEntry.date} ${currentEntry.timeIn}`
        ).getTime();

        // Calculate total break time
        let totalBreakMs = 0;
        if (currentEntry.breakStart && currentEntry.breakEnd) {
          const breakStart = new Date(
            `${currentEntry.dateBreakStart || currentEntry.date} ${
              currentEntry.breakStart
            }`
          );
          const breakEnd = new Date(
            `${currentEntry.dateBreakEnd || currentEntry.date} ${
              currentEntry.breakEnd
            }`
          );

          // Adjust if break spans midnight
          if (breakEnd < breakStart) {
            breakEnd.setDate(breakEnd.getDate() + 1);
          }

          totalBreakMs = breakEnd.getTime() - breakStart.getTime();
        }

        // Calculate total lunch time
        let totalLunchMs = 0;
        if (currentEntry.lunchStart && currentEntry.lunchEnd) {
          const lunchStart = new Date(
            `${currentEntry.dateLunchStart || currentEntry.date} ${
              currentEntry.lunchStart
            }`
          );
          const lunchEnd = new Date(
            `${currentEntry.dateLunchEnd || currentEntry.date} ${
              currentEntry.lunchEnd
            }`
          );

          // Adjust if lunch spans midnight
          if (lunchEnd < lunchStart) {
            lunchEnd.setDate(lunchEnd.getDate() + 1);
          }

          totalLunchMs = lunchEnd.getTime() - lunchStart.getTime();
        }

        // Total elapsed time = current time - time in - breaks - lunch
        diffMs = currentTime - timeInDate - totalBreakMs - totalLunchMs;
      }

      // Update the elapsed time state
      setElapsedTime(Math.max(0, Math.floor(diffMs / 1000)));
    }, 1000);

    // Clean up the interval when the component unmounts or dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [isTimeIn, currentEntry, currentServerTime]);

  const formatElapsedTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getCurrentTime = async () => {
    try {
      const response = await timer.getCurrentTimeIn();
      const currentTimeData = response.data[0];
      if (currentTimeData.timeOut) {
        setIsTimeIn(false);
      } else {
        setIsTimeIn(true);
      }
      setCurrentEntry(currentTimeData);
    } catch (error) {
      console.error("Error getting current time:", error);
    }
  };

  const handleTimeIn = async () => {
    setIsLoadingTimeIn(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      const entry: AttendanceEntry = {
        id: `entry-${new Date().getTime()}`,
        date: currentTimeData.date,
        timeIn: currentTimeData.time,
        shift: selectedShift || "",
      };

      const response = await timer.timeIn(entry);
      setCurrentEntry(response.data);
      getAttendance();
      setIsTimeIn(true);
      setElapsedTime(0);
      toast({
        title: "Success",
        description: "Time-in logged successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error logging time:", error);
      toast({
        title: "Error",
        description:
          "Failed to log time. Please try again. If the issue persists, contact IT support.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTimeIn(false);
    }
  };

  const handleTimeOut = async ({ notes }: { notes?: string }) => {
    setIsLoadingTimeOut(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      const timeInDate = new Date(
        `${currentEntry.date} ${currentEntry.timeIn}`
      );
      const timeOutDate = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );
      // dapat sa backend data
      const breakStart = new Date(
        `${currentEntry.dateBreakStart} ${currentEntry.breakStart}`
      );
      const breakEnd = new Date(
        `${currentEntry.dateBreakEnd} ${currentEntry.breakEnd}`
      );
      const lunchStart = new Date(
        `${currentEntry.dateLunchStart} ${currentEntry.lunchStart}`
      );
      const lunchEnd = new Date(
        `${currentEntry.dateLunchEnd} ${currentEntry.lunchEnd}`
      );

      // Adjust break end date if it's the next day
      if (breakEnd < breakStart) {
        breakEnd.setDate(breakEnd.getDate() + 1);
      }
      // Adjust lunch end date if it's the next day
      if (lunchEnd < lunchStart) {
        lunchEnd.setDate(lunchEnd.getDate() + 1);
      }

      // Calculate the new break duration in milliseconds
      const breakDurationMs = currentEntry.totalBreakTime
        ? breakEnd.getTime() - breakStart.getTime()
        : 0;
      // Calculate the new lunch duration in milliseconds
      const lunchDurationMs = currentEntry.totalLunchTime
        ? lunchEnd.getTime() - lunchStart.getTime()
        : 0;

      const diffMs =
        timeOutDate.getTime() -
        timeInDate.getTime() -
        breakDurationMs -
        lunchDurationMs;
      const totalHours = diffMs / (1000 * 60 * 60);

      const updatedEntry = {
        ...currentEntry,
        timeOut: currentTimeData.time,
        totalHours: Number(totalHours.toFixed(2)),
        notes: notes,
      };

      await timer.timeOut(updatedEntry);
      setCurrentEntry(updatedEntry);
      getAttendance();
      setIsTimeIn(false);
      setDialogOpen(false);
      setElapsedTime(0);
      setSelectedShift(null);
      toast({
        title: "Success",
        description: "Time-out logged successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error logging timeout:", error);
      toast({
        title: "Error",
        description:
          "Failed to log time-out. Please try again. If the issue persists, contact IT support.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTimeOut(false);
    }
  };

  const handleBreakStart = async () => {
    setIsLoadingBreakStart(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      const updatedEntry = {
        ...currentEntry,
        breakStart: currentTimeData.time,
        dateBreakStart: currentTimeData.date,
      };

      const response = await timer.updateBreakStart(updatedEntry);
      setCurrentEntry(response.data);
      setElapsedTime(0);
      toast({
        title: "Success",
        description: "Break started successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error starting break:", error);
      toast({
        title: "Error",
        description:
          "Failed to start break. Please try again. If the issue persists, contact IT support.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBreakStart(false);
    }
  };

  const handleBreakEnd = async () => {
    setIsLoadingBreakEnd(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      // Create date objects for break start and end
      const breakStart = new Date(
        `${currentEntry.dateBreakStart} ${currentEntry.breakStart}`
      );
      const breakEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      // Adjust break end date if it's the next day
      if (breakEnd < breakStart) {
        breakEnd.setDate(breakEnd.getDate() + 1);
      }

      // Calculate the new break duration in milliseconds
      const breakDurationMs = breakEnd.getTime() - breakStart.getTime();

      // Convert break duration to hours and add to any existing break time
      const newBreakTimeHours = breakDurationMs / (1000 * 60 * 60);
      const totalBreakTimeHours =
        (currentEntry.totalBreakTime || 0) + newBreakTimeHours;

      const updatedEntry = {
        ...currentEntry,
        breakEnd: currentTimeData.time,
        dateBreakEnd: currentTimeData.date,
        totalBreakTime: Number(totalBreakTimeHours.toFixed(2)),
      };

      const response = await timer.updateBreakEnd(updatedEntry);
      setCurrentEntry(response.data);
      toast({
        title: "Success",
        description: "End break logged successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error ending break:", error);
      toast({
        title: "Error",
        description: "Failed to log end break. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBreakEnd(false);
    }
  };

  const handleLunchStart = async () => {
    setIsLoadingLunchStart(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      const updatedEntry = {
        ...currentEntry,
        lunchStart: currentTimeData.time,
        dateLunchStart: currentTimeData.date,
      };

      const response = await timer.updateLunchStart(updatedEntry);
      setCurrentEntry(response.data);
      setElapsedTime(0);
      toast({
        title: "Success",
        description: "Lunch started successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error starting lunch:", error);
      toast({
        title: "Error",
        description:
          "Failed to start lunch. Please try again. If the issue persists, contact IT support.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLunchStart(false);
    }
  };

  const handleLunchEnd = async () => {
    setIsLoadingLunchEnd(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      // Create date objects for lunch start and end
      const lunchStart = new Date(
        `${currentEntry.dateLunchStart} ${currentEntry.lunchStart}`
      );
      const lunchEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      // Adjust lunch end date if it's the next day
      if (lunchEnd < lunchStart) {
        lunchEnd.setDate(lunchEnd.getDate() + 1);
      }

      // Calculate the new lunch duration in milliseconds
      const lunchDurationMs = lunchEnd.getTime() - lunchStart.getTime();

      // Convert lunch duration to hours and add to any existing lunch time
      const newLunchTimeHours = lunchDurationMs / (1000 * 60 * 60);
      const totalLunchTimeHours =
        (currentEntry.totalLunchTime || 0) + newLunchTimeHours;

      const updatedEntry = {
        ...currentEntry,
        lunchEnd: currentTimeData.time,
        dateLunchEnd: currentTimeData.date,
        totalLunchTime: Number(totalLunchTimeHours.toFixed(2)),
      };

      const response = await timer.updateLunchEnd(updatedEntry);
      setCurrentEntry(response.data);
      toast({
        title: "Success",
        description: "End lunch logged successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error ending lunch:", error);
      toast({
        title: "Error",
        description: "Failed to log end lunch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLunchEnd(false);
    }
  };

  const handleActionChange = (value: string) => {
    setSelectedAction(value);
  };

  const handleConfirmAction = async () => {
    switch (selectedAction) {
      case "startBreak":
        await handleBreakStart();
        setSelectedAction("endBreak"); // Preselect "End Break"
        break;
      case "endBreak":
        await handleBreakEnd();
        setSelectedAction(null); // Reset to show "Select Action" placeholder
        break;
      case "startLunch":
        await handleLunchStart();
        setSelectedAction("endLunch"); // Preselect "End Lunch"
        break;
      case "endLunch":
        await handleLunchEnd();
        setSelectedAction(null); // Reset to show "Select Action" placeholder
        break;
      case "timeOut":
        setDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    // If break is started but not ended, ONLY show "End Break"
    if (currentEntry.breakStart && !currentEntry.breakEnd) {
      actions.push({ value: "endBreak", label: "End Break" });
    }
    // If lunch is started but not ended, ONLY show "End Lunch"
    else if (currentEntry.lunchStart && !currentEntry.lunchEnd) {
      actions.push({ value: "endLunch", label: "End Lunch" });
    }
    // Otherwise, show the available actions
    else {
      if (!currentEntry.breakStart) {
        actions.push({ value: "startBreak", label: "Start Break" });
      }
      if (!currentEntry.lunchStart) {
        actions.push({ value: "startLunch", label: "Start Lunch" });
      }
      if (isTimeIn) {
        actions.push({ value: "timeOut", label: "Time Out" });
      }
    }

    return actions;
  };

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-start w-full pt-4">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <Clock className="mr-2" /> Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="absolute left-40 top-24 text-xs">
          <BackButton />
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {!isTimeIn && (
              <div className="w-full max-w-xs text-center">
                <Label>Select your shift schedule</Label>
                <Select
                  value={selectedShift || undefined}
                  onValueChange={(value) => setSelectedShift(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_OPTIONS.map((shift) => (
                      <SelectItem key={shift} value={shift}>
                        {shift}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentEntry.breakStart !== null &&
            currentEntry.breakEnd === null ? (
              <div className="text-4xl font-bold tracking-tighter text-red-600 text-center">
                <p className="text-base text-black tracking-wide">
                  BREAK TIME{" "}
                </p>
                {formatElapsedTime(elapsedTime)}
              </div>
            ) : currentEntry.lunchStart !== null &&
              currentEntry.lunchEnd === null ? (
              <div className="text-4xl font-bold tracking-tighter text-red-600 text-center">
                <p className="text-base text-black tracking-wide">
                  LUNCH TIME{" "}
                </p>
                {formatElapsedTime(elapsedTime)}
              </div>
            ) : (
              <div
                className={`mb-2 text-4xl font-bold tracking-tighter text-center text-green-700 ${
                  isTimeIn ? "" : "hidden"
                }`}
              >
                <p className="text-base text-black tracking-wide">
                  RUNNING TIME{" "}
                </p>
                {formatElapsedTime(elapsedTime)}
              </div>
            )}

            <div className="flex justify-center space-x-4">
              {!isTimeIn ? (
                <Button
                  onClick={handleTimeIn}
                  className="flex items-center"
                  disabled={!selectedShift || isLoadingTimeIn}
                >
                  {isLoadingTimeIn ? (
                    <LoadingSpinner />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Time In
                </Button>
              ) : (
                <>
                  <Select
                    value={selectedAction || undefined}
                    onValueChange={handleActionChange}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableActions().map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAction && (
                    <Button
                      onClick={handleConfirmAction}
                      className="flex items-center text-sm"
                      disabled={
                        isLoadingBreakStart ||
                        isLoadingBreakEnd ||
                        isLoadingLunchStart ||
                        isLoadingLunchEnd ||
                        isLoadingTimeOut
                      }
                    >
                      Confirm
                    </Button>
                  )}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Time Out</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="notes" className="text-right">
                            Notes (Optional)
                          </Label>
                          <Input
                            id="notes"
                            className="col-span-3"
                            placeholder="Add any notes about your work day"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              const notesInput = document.getElementById(
                                "notes"
                              ) as HTMLInputElement;
                              handleTimeOut({
                                notes: notesInput?.value,
                              });
                            }}
                            disabled={isLoadingTimeOut}
                          >
                            {isLoadingTimeOut ? <LoadingSpinner /> : null}
                            Confirm Time Out
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>

            {isTimeIn && (
              <div className="text-center p-4 bg-muted rounded-lg text-sm">
                <p className="font-semibold">Current Session</p>

                {currentEntry.date && <p>Date: {currentEntry.date}</p>}
                {currentEntry.timeIn && <p>Time In: {currentEntry.timeIn}</p>}
                {currentEntry.shift && <p>Shift: {currentEntry.shift}</p>}
                {currentEntry.breakStart && (
                  <p>Break Started: {currentEntry.breakStart}</p>
                )}
                {currentEntry.breakEnd && (
                  <p>Break Ended: {currentEntry.breakEnd}</p>
                )}

                {currentEntry.totalBreakTime !== undefined &&
                  currentEntry.totalBreakTime !== null && (
                    <p>
                      Total Break Time:{" "}
                      {Math.round(currentEntry.totalBreakTime * 60)} min.
                    </p>
                  )}

                {currentEntry.lunchStart && (
                  <p>Lunch Started: {currentEntry.lunchStart}</p>
                )}
                {currentEntry.lunchEnd && (
                  <p>Lunch Ended: {currentEntry.lunchEnd}</p>
                )}

                {currentEntry.totalLunchTime !== undefined &&
                  currentEntry.totalLunchTime !== null && (
                    <p>
                      Total Lunch Time:{" "}
                      {Math.round(currentEntry.totalLunchTime * 60)} min.
                    </p>
                  )}
              </div>
            )}
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Time Tracker History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead>Time Out</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Break Time</TableHead>
                        <TableHead>Lunch Time</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentEntries.length > 0 ? (
                        currentEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.timeIn}</TableCell>
                            <TableCell>
                              {entry.timeOut || "In Progress"}
                            </TableCell>
                            <TableCell>{entry.totalHours || "N/A"}</TableCell>
                            <TableCell>
                              {entry.totalBreakTime
                                ? `${Math.round(
                                    entry.totalBreakTime * 60
                                  )} min.`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {entry.totalLunchTime
                                ? `${Math.round(
                                    entry.totalLunchTime * 60
                                  )} min.`
                                : "-"}
                            </TableCell>
                            <TableCell>{entry.shift}</TableCell>
                            <TableCell>{entry.notes || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            No attendance records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 0 && (
                    <div className="mt-4 flex justify-end items-end text-xs">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {getPageNumbers().map((pageNumber) => (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNumber)}
                                isActive={currentPage === pageNumber}
                                className="cursor-pointer text-xs"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTracker;
