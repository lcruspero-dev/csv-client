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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  // Load saved entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("attendanceEntries");
    if (savedEntries) {
      setAttendanceEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "attendanceEntries",
      JSON.stringify(attendanceEntries)
    );
  }, [attendanceEntries]);

  // Real-time elapsed time tracking
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTimeIn) {
      const startTime = new Date(
        `${currentEntry.date} ${currentEntry.timeIn}`
      ).getTime();

      intervalId = setInterval(() => {
        const currentTime = new Date().getTime();
        const diffMs = currentTime - startTime;
        setElapsedTime(Math.floor(diffMs / 1000)); // Convert to seconds
      }, 1000);
    }

    // Cleanup interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
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

  const handleTimeIn = () => {
    const now = new Date();
    const entry: AttendanceEntry = {
      id: `entry-${now.getTime()}`,
      date: now.toLocaleDateString(),
      timeIn: now.toLocaleTimeString(),
    };

    setCurrentEntry(entry);
    setIsTimeIn(true);
    setElapsedTime(0);
  };

  const handleTimeOut = (notes?: string) => {
    if (!currentEntry) return;

    const now = new Date();
    const timeInDate = new Date(`${currentEntry.date} ${currentEntry.timeIn}`);
    const timeOutDate = now;

    // Calculate total hours
    const diffMs = timeOutDate.getTime() - timeInDate.getTime();
    const totalHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours

    const completedEntry: AttendanceEntry = {
      ...(currentEntry as AttendanceEntry),
      timeOut: now.toLocaleTimeString(),
      totalHours: Number(totalHours.toFixed(2)),
      notes: notes,
    };

    setAttendanceEntries((prev) => [completedEntry, ...prev]);
    setCurrentEntry({});
    setIsTimeIn(false);
    setDialogOpen(false);
    setElapsedTime(0);
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
                            handleTimeOut(notesInput?.value);
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

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
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
                  {attendanceEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.timeIn}</TableCell>
                      <TableCell>{entry.timeOut || "N/A"}</TableCell>
                      <TableCell>
                        {entry.totalHours
                          ? `${entry.totalHours.toFixed(2)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{entry.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTracker;
