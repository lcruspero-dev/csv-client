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
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);

  const entriesPerPage = 10;
  const SHIFT_OPTIONS = ["Shift 1", "Shift 2", "Shift 3", "Staff"];

  const totalPages = Math.ceil(attendanceEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = attendanceEntries.slice(startIndex, endIndex);

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
    try {
      const response = await timer.getAttendanceEntries();
      setAttendanceEntries(response.data);
    } catch (error) {
      console.error("Error getting attendance entries:", error);
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
    getAttendance();
    getCurrentTimeFromAPI();
    getCurrentTime();
  }, []);

  useEffect(() => {
    let startTime: number;
    let intervalId: NodeJS.Timeout;
    let timeOffset = 0;

    if (isTimeIn && currentEntry.date && currentEntry.timeIn) {
      const serverTime = new Date(
        `${currentServerTime.date} ${currentServerTime.time}`
      ).getTime();
      const localTime = Date.now();
      timeOffset = serverTime - localTime;

      startTime = new Date(
        `${currentEntry.date} ${currentEntry.timeIn}`
      ).getTime();

      intervalId = setInterval(() => {
        const currentTime = Date.now() + timeOffset;
        const diffMs = currentTime - startTime - totalBreakTime * 1000;
        setElapsedTime(Math.floor(diffMs / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTimeIn, currentEntry, currentServerTime, totalBreakTime]);

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
      setTotalBreakTime(0);
    } catch (error) {
      console.error("Error logging time:", error);
    }
  };

  const handleTimeOut = async ({ notes }: { notes?: string }) => {
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      const timeInDate = new Date(
        `${currentEntry.date} ${currentEntry.timeIn}`
      );
      const timeOutDate = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      const diffMs =
        timeOutDate.getTime() - timeInDate.getTime() - totalBreakTime * 1000;
      const totalHours = diffMs / (1000 * 60 * 60);

      const updatedEntry = {
        ...currentEntry,
        timeOut: currentTimeData.time,
        totalHours: Number(totalHours.toFixed(2)),
        notes: notes,
        totalBreakTime: totalBreakTime,
      };

      await timer.timeOut(updatedEntry);
      setCurrentEntry(updatedEntry);
      getAttendance();
      setIsTimeIn(false);
      setDialogOpen(false);
      setElapsedTime(0);
      setTotalBreakTime(0);
      setSelectedShift(null);
      setIsBreakTime(false);
    } catch (error) {
      console.error("Error logging timeout:", error);
    }
  };

  const handleBreakStart = async () => {
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      const updatedEntry = {
        ...currentEntry,
        breakStart: currentTimeData.time,
      };

      await timer.updateBreakStart(updatedEntry);
      setIsBreakTime(true);
      setBreakStartTime(Date.now());
    } catch (error) {
      console.error("Error starting break:", error);
    }
  };

  const handleBreakEnd = async () => {
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      if (breakStartTime) {
        const breakDuration = Math.floor((Date.now() - breakStartTime) / 1000);
        setTotalBreakTime((prev) => prev + breakDuration);

        const updatedEntry = {
          ...currentEntry,
          breakEnd: currentTimeData.time,
          totalBreakTime: totalBreakTime + breakDuration,
        };

        await timer.updateBreakEnd(updatedEntry);
        setIsBreakTime(false);
        setBreakStartTime(null);
      }
    } catch (error) {
      console.error("Error ending break:", error);
    }
  };

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

            {isTimeIn && (
              <div className="text-4xl font-bold tracking-tighter text-center">
                {formatElapsedTime(elapsedTime)}
              </div>
            )}

            <div className="flex justify-center space-x-4">
              {!isTimeIn ? (
                <Button
                  onClick={handleTimeIn}
                  className="flex items-center"
                  disabled={!selectedShift}
                >
                  <LogIn className="mr-2 h-4 w-4" /> Time In
                </Button>
              ) : (
                <>
                  {currentEntry.shift === "Staff" &&
                    (!isBreakTime ? (
                      <Button
                        onClick={handleBreakStart}
                        variant="default"
                        className="flex items-center"
                      >
                        <Coffee className="mr-1 h-4 w-4" />
                        Start Break
                      </Button>
                    ) : (
                      <Button
                        onClick={handleBreakEnd}
                        variant="default"
                        className="flex items-center"
                      >
                        <Coffee className="mr-2 h-4 w-4" /> End Break
                      </Button>
                    ))}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex items-center"
                        disabled={isBreakTime}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Time Out
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
                          >
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
                    {isBreakTime && (
                      <p>Break Started: {currentEntry.breakStart}</p>
                    )}
                    <p>Total Break Time: {formatElapsedTime(totalBreakTime)}</p>
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
                  {currentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.timeIn}</TableCell>
                      <TableCell>{entry.timeOut || "In Progress"}</TableCell>
                      <TableCell>{entry.totalHours || "N/A"}</TableCell>
                      {attendanceEntries.some((e) => e.shift === "Staff") && (
                        <TableCell>
                          {entry.shift === "Staff"
                            ? entry.totalBreakTime || "-"
                            : "-"}
                        </TableCell>
                      )}
                      <TableCell>{entry.shift}</TableCell>
                      <TableCell>{entry.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination (unchanged) */}
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
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTracker;
