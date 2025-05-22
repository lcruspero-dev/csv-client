/* eslint-disable @typescript-eslint/no-unused-vars */
import { LeaveCreditAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LeaveHistoryItem {
  date: string;
  description: string;
  days: number;
  ticket: string;
  status: string;
  _id: string;
}

interface EmployeeLeaveCredit {
  _id: string;
  employeeId: string;
  employeeName: string;
  annualLeaveCredit: number;
  currentBalance: number;
  startDate: string;
  accrualRate: number;
  lastAccrualDate: string;
  nextAccrualDate: string;
  timezone: string;
  history: LeaveHistoryItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isActive?: boolean;
}

const LeaveCredit = () => {
  const { toast } = useToast();
  const [allEmployees, setAllEmployees] = useState<EmployeeLeaveCredit[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<
    EmployeeLeaveCredit[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] =
    useState<EmployeeLeaveCredit | null>(null);
  const [editedCredit, setEditedCredit] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const employeesPerPage = 15;

  useEffect(() => {
    const fetchLeaveCredits = async () => {
      try {
        const response = await LeaveCreditAPI.getLeaveCredit();
        if (response.data) {
          // Filter out inactive records if needed
          const activeEmployees = response.data.filter(
            (emp: EmployeeLeaveCredit) => emp.isActive !== false
          );
          setAllEmployees(activeEmployees);
          setFilteredEmployees(activeEmployees);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load leave credits",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveCredits();
  }, [toast]);

  useEffect(() => {
    const filtered = allEmployees.filter((employee) =>
      employee?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, allEmployees]);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const handleEditClick = (employee: EmployeeLeaveCredit) => {
    setCurrentEmployee(employee);
    setEditedCredit(employee.currentBalance);
    setIsEditDialogOpen(true);
  };

  const handleViewHistory = (employee: EmployeeLeaveCredit) => {
    setCurrentEmployee(employee);
    setIsHistoryDialogOpen(true);
  };

  const handleDeleteClick = (employee: EmployeeLeaveCredit) => {
    setCurrentEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentEmployee) return;

    setIsDeleting(true);
    try {
      const response = await LeaveCreditAPI.updateLeaveCredit(
        currentEmployee._id,
        {
          isActive: false,
        }
      );

      if (response.data) {
        setAllEmployees((prevEmployees) =>
          prevEmployees.filter((emp) => emp._id !== currentEmployee._id)
        );
        toast({
          title: "Success",
          description: "Leave record deleted successfully",
          variant: "default",
        });
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leave record",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!currentEmployee) return;

    setIsSaving(true);
    try {
      const response = await LeaveCreditAPI.updateLeaveCredit(
        currentEmployee._id,
        {
          currentBalance: editedCredit,
        }
      );

      if (response.data) {
        setAllEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp._id === currentEmployee._id
              ? {
                  ...emp,
                  currentBalance: editedCredit,
                  annualLeaveCredit:
                    response.data.annualLeaveCredit || emp.annualLeaveCredit,
                  updatedAt: response.data.updatedAt || emp.updatedAt,
                }
              : emp
          )
        );
        toast({
          title: "Success",
          description: "Leave credit updated successfully",
          variant: "default",
        });
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update leave credit",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleBack = () => navigate(-1);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-6xl shadow-lg">
        <CardHeader className="space-y-4">
          <div className="relative flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="absolute left-0 text-blue-600 hover:text-blue-800 p-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>

            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">
                Employee Leave Credits
              </CardTitle>
              <p className="text-gray-500 mt-2">
                Manage and update employee leave balances
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative w-64 text-end ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table className="rounded-lg">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="text-center font-bold text-gray-700">
                  Employee
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Start Date
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Next Accrual Date
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Current Balance
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <TableRow key={employee._id} className="hover:bg-gray-50">
                    <TableCell className="text-center font-medium">
                      {employee.employeeName}
                    </TableCell>
                    <TableCell className="text-center">
                      {employee.startDate}
                    </TableCell>
                    <TableCell className="text-center">
                      {formattedDate(employee.nextAccrualDate)}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        {employee.currentBalance} days
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      {/* History Button (icon only) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(employee)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="View History"
                      >
                        <Calendar className="h-5 w-5" />
                      </Button>

                      {/* Edit/Delete Container */}
                      <div className="flex items-center border-l border-gray-200 pl-2 ml-2">
                        {/* Edit Button (icon only) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(employee)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Edit"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>

                        {/* Delete Button (icon only) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(employee)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredEmployees.length > employeesPerPage && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstEmployee + 1} to{" "}
                {Math.min(indexOfLastEmployee, filteredEmployees.length)} of{" "}
                {filteredEmployees.length} employees
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800">
              Edit Leave Credit
            </DialogTitle>
            <DialogDescription className="text-center">
              Update leave balance for{" "}
              <span className="font-semibold">
                {currentEmployee?.employeeName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-xs">
                <Label
                  htmlFor="leaveCredit"
                  className="block text-center mb-2 text-gray-700"
                >
                  Available Leave Days
                </Label>
                <Input
                  id="leaveCredit"
                  type="number"
                  className="text-center text-lg font-medium py-6"
                  value={editedCredit}
                  onChange={(e) => setEditedCredit(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 scale-95"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Leave History for {currentEmployee?.employeeName}
            </DialogTitle>
            <DialogDescription>
              View all leave requests and usage
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Days</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ticket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-center">
                {currentEmployee?.history &&
                currentEmployee.history.length > 0 ? (
                  currentEmployee.history.map((history) => (
                    <TableRow key={history._id}>
                      <TableCell>{formattedDate(history.date)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {history.description
                          .split("\n")
                          .find((line) => line.includes("Leave Type:"))
                          ?.split("Leave Type:")[1]
                          ?.trim()}
                      </TableCell>

                      <TableCell>{history.days}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            history.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : history.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {history.status}
                        </span>
                      </TableCell>
                      <TableCell>{history.ticket}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No leave history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHistoryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Delete Leave Record
            </DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {currentEmployee?.employeeName}'s
              </span>{" "}
              leave data?
              <br />
              This action cannot be undone. This will permanently delete the
              record.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-center space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveCredit;
