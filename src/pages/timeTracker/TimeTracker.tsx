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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios"; // Ensure axios is imported
import { Clock, LogIn, LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AttendanceEntry {
  id: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  totalHours?: number;
  notes?: string;
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
  const entriesPerPage = 10;

  const totalPages = Math.ceil(attendanceEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = attendanceEntries.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
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

  // Fetch current time from API
  const getCurrentTimeFromAPI = async (): Promise<CurrentTimeResponse> => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/current-time"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting current time from API:", error);
      // Fallback to local time if API fails
      const now = new Date();
      return {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      };
    }
  };

  // Load saved entries and current time on component mount
  useEffect(() => {
    getAttendance();
    getCurrentTime();
  }, []);

  // Elapsed time tracking using requestAnimationFrame
  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    if (isTimeIn && currentEntry.date && currentEntry.timeIn) {
      startTime = new Date(
        `${currentEntry.date} ${currentEntry.timeIn}`
      ).getTime();

      const updateTimer = () => {
        const currentTime = new Date().getTime();
        const diffMs = currentTime - startTime;
        setElapsedTime(Math.floor(diffMs / 1000));
        animationFrameId = requestAnimationFrame(updateTimer);
      };

      animationFrameId = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isTimeIn, currentEntry]);

  // Format elapsed time to hours and minutes
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
      // Get current time from API
      const currentTimeData = await getCurrentTimeFromAPI();

      const entry: AttendanceEntry = {
        id: `entry-${new Date().getTime()}`,
        date: currentTimeData.date,
        timeIn: currentTimeData.time,
      };

      const response = await timer.timeIn(entry);
      setCurrentEntry(response.data);
      setIsTimeIn(true);
      setElapsedTime(0);
    } catch (error) {
      console.error("Error logging time:", error);
    }
  };

  const handleTimeOut = async ({ notes }: { notes?: string }) => {
    try {
      // Get current time from API for time out
      const currentTimeData = await getCurrentTimeFromAPI();

      const timeInDate = new Date(
        `${currentEntry.date} ${currentEntry.timeIn}`
      );
      const timeOutDate = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      // Calculate total hours
      const diffMs = timeOutDate.getTime() - timeInDate.getTime();
      const totalHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours

      const updatedEntry = {
        ...currentEntry,
        timeOut: currentTimeData.time,
        totalHours: Number(totalHours.toFixed(2)),
        notes: notes,
      };

      await timer.timeOut(updatedEntry);
      setCurrentEntry(updatedEntry);
      setIsTimeIn(false);
      setDialogOpen(false);
      setElapsedTime(0);
    } catch (error) {
      console.error("Error logging timeout:", error);
    }
  };

  console.log("currentEntry", currentEntry);
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
          {/* Time In/Out Section */}
          <div className="flex flex-col items-center space-y-4">
            {/* Running Time Display */}
            {isTimeIn && (
              <div className="text-4xl font-bold tracking-tighter text-center">
                {formatElapsedTime(elapsedTime)}
              </div>
            )}

            {/* Time In/Out Buttons */}
            <div className="flex justify-center space-x-4">
              {!isTimeIn ? (
                <Button onClick={handleTimeIn} className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" /> Time In
                </Button>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center">
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
              )}
            </div>

            {/* Current Session Information */}
            {isTimeIn && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="font-semibold">Current Session</p>
                <p>Date: {currentEntry.date}</p>
                <p>Time In: {currentEntry.timeIn}</p>
              </div>
            )}
          </div>

          {/* Attendance History Table (Unchanged) */}
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
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.timeIn}</TableCell>
                      <TableCell>{entry.timeOut || "N/A"}</TableCell>
                      <TableCell>{entry.totalHours || "N/A"}</TableCell>
                      <TableCell>{entry.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination (Unchanged) */}
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
