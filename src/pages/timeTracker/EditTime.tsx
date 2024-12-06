import { TimeRecordAPI } from "@/API/endpoint"; // Assuming this is your API endpoint
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
import { Pencil, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";

// Interface for Time Record
interface TimeRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  totalHours: string;
  notes?: string;
  shift?: string;
}

const AdminTimeRecordEdit: React.FC = () => {
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const { toast } = useToast();

  // Utility function to convert date to MM/DD/YYYY format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Utility function to calculate total hours
  const calculateTotalHours = (timeIn: string, timeOut: string): string => {
    const parseTime = (time: string) => {
      const [timePart, modifier] = time.split(" ");
      // eslint-disable-next-line prefer-const
      let [hours, minutes, seconds] = timePart.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return { hours, minutes, seconds };
    };

    const {
      hours: inHours,
      minutes: inMinutes,
      seconds: inSeconds,
    } = parseTime(timeIn);
    const {
      hours: outHours,
      minutes: outMinutes,
      seconds: outSeconds,
    } = parseTime(timeOut);

    // eslint-disable-next-line prefer-const
    let inTotalSeconds = inHours * 3600 + inMinutes * 60 + inSeconds;
    let outTotalSeconds = outHours * 3600 + outMinutes * 60 + outSeconds;

    // Adjust for crossing midnight
    if (outTotalSeconds < inTotalSeconds) {
      outTotalSeconds += 24 * 3600; // Add 24 hours in seconds
    }

    const totalSeconds = outTotalSeconds - inTotalSeconds;
    const totalHours = (totalSeconds / 3600).toFixed(2);

    return totalHours;
  };

  // Search for time records
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

  // Edit record handler
  const handleEdit = (record: TimeRecord) => {
    setEditingRecord(record);
  };

  // Update record
  const handleUpdate = async () => {
    if (!editingRecord) return;

    try {
      await TimeRecordAPI.updateTimeRecord(editingRecord._id, editingRecord);

      // Update local state
      setTimeRecords((prev) =>
        prev.map((record) =>
          record._id === editingRecord._id ? editingRecord : record
        )
      );

      toast({
        title: "Success",
        description: "Time record updated successfully",
        variant: "default",
      });

      setEditingRecord(null);
    } catch (error) {
      console.error("Update failed", error);
      toast({
        title: "Update Error",
        description: "Failed to update time record",
        variant: "destructive",
      });
    }
  };

  // Delete record
  const handleDelete = async (_id: string) => {
    try {
      await TimeRecordAPI.deleteTimeRecord(_id);

      // Update local state
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

  return (
    <div className="container mx-auto p-4">
      <div className="mb-2">
        <BackButton />
      </div>
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Time Record Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Section */}
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

          {/* Edit Modal (if a record is being edited) */}
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
                        setEditingRecord((prev) =>
                          prev ? { ...prev, date: e.target.value } : null
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Time Out</Label>
                    <Input
                      type="text"
                      value={editingRecord.timeOut}
                      onChange={(e) =>
                        setEditingRecord((prev) =>
                          prev
                            ? {
                                ...prev,
                                timeOut: e.target.value,
                                totalHours: calculateTotalHours(
                                  prev.timeIn,
                                  e.target.value
                                ),
                              }
                            : null
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Time In</Label>
                    <Input
                      type="text"
                      value={editingRecord.timeIn}
                      onChange={(e) =>
                        setEditingRecord((prev) =>
                          prev
                            ? {
                                ...prev,
                                timeIn: e.target.value,
                                totalHours: calculateTotalHours(
                                  e.target.value,
                                  prev.timeOut
                                ),
                              }
                            : null
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
                    <Label>Shift</Label>
                    <Input
                      value={editingRecord.shift || ""}
                      onChange={(e) =>
                        setEditingRecord((prev) =>
                          prev ? { ...prev, shift: e.target.value } : null
                        )
                      }
                      placeholder="Enter shift"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      type="text"
                      value={editingRecord.notes}
                      onChange={(e) =>
                        setEditingRecord((prev) =>
                          prev ? { ...prev, notes: e.target.value } : null
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingRecord(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Records Table */}
          {timeRecords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Total Hours</TableHead>
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
                    <TableCell>{record.timeIn}</TableCell>
                    <TableCell>{record.timeOut}</TableCell>
                    <TableCell>{record.totalHours}</TableCell>
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
