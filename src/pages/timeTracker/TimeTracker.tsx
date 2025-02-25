import { timer } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

import { Clock, Coffee, LogIn, LogOut } from "lucide-react";
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

  // Loading states
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingTimeIn, setIsLoadingTimeIn] = useState(false);
  const [isLoadingTimeOut, setIsLoadingTimeOut] = useState(false);
  const [isLoadingBreakStart, setIsLoadingBreakStart] = useState(false);
  const [isLoadingBreakEnd, setIsLoadingBreakEnd] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const entriesPerPage = 10;
  const SHIFT_OPTIONS = ["Shift 1", "Shift 2", "Shift 3", "Staff"];

  const totalPages = Math.ceil(attendanceEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = attendanceEntries.slice(startIndex, endIndex);
  const { toast } = useToast();

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

  useEffect(() => {
    let startTime: number;
    let timeInstartTime: number;
    let intervalId: NodeJS.Timeout;
    let timeOffset = 0;

    const breakStart = new Date(
      `${currentEntry.dateBreakStart} ${currentEntry.breakStart}`
    );
    const breakEnd = new Date(
      `${currentEntry.dateBreakEnd} ${currentEntry.breakEnd}`
    );
    console.log(breakStart, breakEnd);
    // Adjust break end date if it's the next day
    if (breakEnd < breakStart) {
      breakEnd.setDate(breakEnd.getDate() + 1);
    }
    // Calculate the new break duration in milliseconds
    const breakDurationMs = currentEntry.totalBreakTime
      ? breakEnd.getTime() - breakStart.getTime()
      : 0;

    if (isTimeIn && currentEntry.date) {
      // Calculate server-client time offset
      const serverTime = new Date(
        `${currentServerTime.date} ${currentServerTime.time}`
      ).getTime();
      const localTime = Date.now();
      timeOffset = serverTime - localTime;

      // Determine reference start time based on break status
      const isOnBreak = currentEntry.breakStart && !currentEntry.breakEnd;
      const timeReference = isOnBreak
        ? currentEntry.breakStart
        : currentEntry.timeIn;

      startTime = new Date(
        `${currentEntry.dateBreakStart} ${timeReference}`
      ).getTime();
      timeInstartTime = new Date(
        `${currentEntry.date} ${timeReference}`
      ).getTime();
      intervalId = setInterval(() => {
        const currentTime = Date.now() + timeOffset;
        let diffMs;

        if (isOnBreak) {
          // If on break, calculate time from break start
          diffMs = currentTime - startTime;
        } else {
          // Convert totalBreakTime from hours to seconds before applying
          diffMs = currentTime - timeInstartTime - breakDurationMs;
        }

        setElapsedTime(Math.floor(diffMs / 1000));
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
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

      // Adjust break end date if it's the next day
      if (breakEnd < breakStart) {
        breakEnd.setDate(breakEnd.getDate() + 1);
      }
      // Calculate the new break duration in milliseconds
      const breakDurationMs = currentEntry.totalBreakTime
        ? breakEnd.getTime() - breakStart.getTime()
        : 0;

      const diffMs =
        timeOutDate.getTime() - timeInDate.getTime() - breakDurationMs;
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

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-center h-screen">
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
            ) : (
              <div
                className={`text-4xl font-bold tracking-tighter text-center ${
                  currentEntry?.timeIn ? "" : "hidden"
                }`}
              >
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
                    <LoadingComponent />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Time In
                </Button>
              ) : (
                <>
                  {currentEntry.shift === "Staff" &&
                    (currentEntry.breakStart === null ? (
                      <Button
                        onClick={handleBreakStart}
                        variant="default"
                        className="flex items-center"
                        disabled={
                          currentEntry.totalBreakTime !== null ||
                          isLoadingBreakStart
                        }
                      >
                        {isLoadingBreakStart ? (
                          <LoadingComponent />
                        ) : (
                          <Coffee className="mr-1 h-4 w-4" />
                        )}
                        Start Break
                      </Button>
                    ) : (
                      <Button
                        onClick={handleBreakEnd}
                        variant="default"
                        className="flex items-center"
                        disabled={
                          (currentEntry.breakStart !== null &&
                            currentEntry.breakEnd !== null) ||
                          isLoadingBreakEnd
                        }
                      >
                        {isLoadingBreakEnd ? (
                          <LoadingComponent />
                        ) : (
                          <Coffee className="mr-2 h-4 w-4" />
                        )}
                        End Break
                      </Button>
                    ))}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex items-center"
                        disabled={
                          (currentEntry.breakStart !== null &&
                            currentEntry.breakEnd === null) ||
                          isLoadingTimeOut
                        }
                      >
                        {isLoadingTimeOut ? (
                          <LoadingComponent />
                        ) : (
                          <LogOut className="mr-2 h-4 w-4" />
                        )}
                        Time Out
                      </Button>
                    </DialogTrigger>
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
                            {isLoadingTimeOut ? <LoadingComponent /> : null}
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
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="font-semibold">Current Session</p>
                <p>Date: {currentEntry.date}</p>
                <p>Time In: {currentEntry.timeIn}</p>
                <p>Shift: {currentEntry.shift}</p>
                {currentEntry.shift === "Staff" && (
                  <>
                    <p>Break Started: {currentEntry.breakStart}</p>
                    <p>Break Ended: {currentEntry.breakEnd}</p>
                    <p>
                      Total Break Time:{" "}
                      {currentEntry.totalBreakTime
                        ? `${Math.round(currentEntry.totalBreakTime * 60)} min.`
                        : " "}
                    </p>
                  </>
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
                  <LoadingComponent />
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
                        {attendanceEntries.some(
                          (entry) => entry.shift === "Staff"
                        ) && <TableHead>Break Time</TableHead>}
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
                            {attendanceEntries.some(
                              (e) => e.shift === "Staff"
                            ) && (
                              <TableCell>
                                {entry.shift === "Staff"
                                  ? entry.totalBreakTime
                                    ? `${Math.round(
                                        entry.totalBreakTime * 60
                                      )} min.`
                                    : "-"
                                  : "-"}
                              </TableCell>
                            )}
                            <TableCell>{entry.shift}</TableCell>
                            <TableCell>{entry.notes || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
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
