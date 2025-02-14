/* eslint-disable prefer-const */
import { TimeRecordAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
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
import { useToast } from "@/components/ui/use-toast";
import { EyeIcon, EyeOffIcon, Pencil, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface TimeRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  totalHours: string;
  notes?: string | null;
  shift?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  totalBreakTime?: string | null;
  secretKey?: string | null;
}

const calculateTotalHours = (
  record: TimeRecord
): { totalHours: string; totalBreakTime: string } => {
  // Guard clause for invalid or incomplete data
  if (!record.timeIn || !record.timeOut) {
    return {
      totalHours: "0.00",
      totalBreakTime: "0.00",
    };
  }

  const parseTime = (time: string | null | undefined) => {
    if (!time) return { hours: 0, minutes: 0, seconds: 0 };

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes, seconds] = timePart.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return { hours, minutes, seconds };
  };

  const convertToSeconds = (timeString: string | null | undefined) => {
    if (!timeString) return 0;
    const { hours, minutes, seconds } = parseTime(timeString);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Calculate main work duration
  let inTotalSeconds = convertToSeconds(record.timeIn);
  let outTotalSeconds = convertToSeconds(record.timeOut);

  // Guard against invalid time values
  if (inTotalSeconds === 0 || outTotalSeconds === 0) {
    return {
      totalHours: "0.00",
      totalBreakTime: "0.00",
    };
  }

  // Adjust for crossing midnight
  if (outTotalSeconds < inTotalSeconds) {
    outTotalSeconds += 24 * 3600;
  }

  // Calculate break duration if break times exist and are valid
  let breakTimeSeconds = 0;
  if (record.breakStart && record.breakEnd) {
    let breakStartSeconds = convertToSeconds(record.breakStart);
    let breakEndSeconds = convertToSeconds(record.breakEnd);

    if (breakStartSeconds > 0 && breakEndSeconds > 0) {
      // Adjust break time for midnight crossing
      if (breakEndSeconds < breakStartSeconds) {
        breakEndSeconds += 24 * 3600;
      }
      breakTimeSeconds = breakEndSeconds - breakStartSeconds;
    }
  }

  const totalWorkSeconds = outTotalSeconds - inTotalSeconds;
  const netWorkSeconds = Math.max(0, totalWorkSeconds - breakTimeSeconds);

  // Convert to hours with 2 decimal places, ensuring non-negative values
  const totalHours = (netWorkSeconds / 3600).toFixed(2);
  const totalBreakTime = (breakTimeSeconds / 3600).toFixed(2);

  return {
    totalHours,
    totalBreakTime,
  };
};

const AdminTimeRecordEdit: React.FC = () => {
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [secretKeyError, setSecretKeyError] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const validateSecretKey = () => {
    if (!secretKey) {
      setSecretKeyError("Key is required");
      return false;
    }
    setSecretKeyError("");
    return true;
  };

  const handleSearch = async () => {
    if (!searchName || !searchDate) {
      toast({
        title: "Validation Error",
        description: "Please enter both name and date",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await TimeRecordAPI.getTimeRecordsByNameAndDate(
        searchName,
        formatDate(searchDate)
      );
      setTimeRecords(response.data);

      if (response.data.length === 0) {
        toast({
          title: "No Records",
          description: "No time records found for the given name and date",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Search failed", error);
      toast({
        title: "Search Error",
        description: "No time records found",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: TimeRecord) => {
    setEditingRecord(record);
    setSecretKey("");
    setSecretKeyError("");
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;

    if (!validateSecretKey()) {
      toast({
        title: "Validation Error",
        description: "Please enter the secret key",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate updated total hours and break time before saving
      const { totalHours, totalBreakTime } = calculateTotalHours(editingRecord);

      // Create the complete updated record with all fields
      const updatedRecord = {
        ...editingRecord,
        breakStart: editingRecord.breakStart || null,
        breakEnd: editingRecord.breakEnd || null,
        totalHours,
        totalBreakTime,
      };

      // Make the API call with the complete record and secret key
      await TimeRecordAPI.updateTimeRecord(updatedRecord._id, {
        ...updatedRecord,
        secretKey,
      });

      // Update the local state with the new record
      setTimeRecords((prev) =>
        prev.map((record) =>
          record._id === updatedRecord._id ? updatedRecord : record
        )
      );

      toast({
        title: "Success",
        description: "Time record updated successfully",
        variant: "default",
      });

      setEditingRecord(null);
      setSecretKey("");
      setSecretKeyError("");
    } catch (error) {
      console.error("Update failed", error);
      toast({
        title: "Update Error",
        description: "Failed to update time record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      await TimeRecordAPI.deleteTimeRecord(_id);
      setTimeRecords((prev) => prev.filter((record) => record._id !== _id));

      toast({
        title: "Success",
        description: "Time record deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Delete failed", error);
      toast({
        title: "Delete Error",
        description: "Failed to delete time record",
        variant: "destructive",
      });
    }
  };

  const handleTimeInputChange = (
    field: keyof TimeRecord,
    value: string,
    record: TimeRecord
  ) => {
    const updatedRecord = {
      ...record,
      [field]: value || null,
    };

    const { totalHours, totalBreakTime } = calculateTotalHours(updatedRecord);
    setEditingRecord({
      ...updatedRecord,
      totalHours,
      totalBreakTime,
    });
  };

  const toggleSecretKeyVisibility = () => {
    setShowSecretKey(!showSecretKey);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-4 pt-16">
      <div className="mb-2">
        <BackButton />
      </div>
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-center">Time Record Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="flex-grow">
              <Label>Employee Name</Label>
              <Input
                placeholder="Enter employee name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="flex-grow">
              <Label>Date</Label>
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="mr-2" size={16} /> Search
              </Button>
            </div>
          </div>

          {editingRecord && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Edit Time Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="text"
                      value={editingRecord.date}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "date",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Shift</Label>
                    <Input
                      value={editingRecord.shift || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "shift",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Time In</Label>
                    <Input
                      type="text"
                      value={editingRecord.timeIn || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "timeIn",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Time Out</Label>
                    <Input
                      type="text"
                      value={editingRecord.timeOut || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "timeOut",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Break Start</Label>
                    <Input
                      type="text"
                      value={editingRecord.breakStart || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "breakStart",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Break End</Label>
                    <Input
                      type="text"
                      value={editingRecord.breakEnd || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "breakEnd",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Total Hours</Label>
                    <Input
                      type="text"
                      value={editingRecord.totalHours}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Total Break Time</Label>
                    <Input
                      type="text"
                      value={editingRecord.totalBreakTime || "0.00"}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      type="text"
                      value={editingRecord.notes || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "notes",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="relative">
                    <Label>Key</Label>
                    <Input
                      type={showSecretKey ? "text" : "password"}
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className={secretKeyError ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={toggleSecretKeyVisibility}
                      className="absolute right-3 top-8 text-gray-500"
                    >
                      {showSecretKey ? (
                        <EyeOffIcon size={20} />
                      ) : (
                        <EyeIcon size={20} />
                      )}
                    </button>
                    {secretKeyError && (
                      <p className="text-red-500 text-sm mt-1">
                        {secretKeyError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingRecord(null);
                      setSecretKey("");
                      setSecretKeyError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {timeRecords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Total Break</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.timeIn || "-"}</TableCell>
                    <TableCell>{record.timeOut || "-"}</TableCell>
                    <TableCell>{record.totalHours}</TableCell>
                    <TableCell>{record.totalBreakTime || "0.00"}</TableCell>
                    <TableCell>{record.shift || "-"}</TableCell>
                    <TableCell>{record.notes || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(record)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                            </DialogHeader>
                            <p>
                              Are you sure you want to delete this time record?
                            </p>
                            <div className="flex justify-end space-x-2">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(record._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTimeRecordEdit;
