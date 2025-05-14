/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface EmployeeLeaveCredit {
  id: string;
  employeeName: string;
  leaveCredit: number;
}

const LeaveCredit = () => {
  const { toast } = useToast();
  const [allEmployees, setAllEmployees] = useState<EmployeeLeaveCredit[]>([
    { id: "1", employeeName: "John Doe", leaveCredit: 15 },
    { id: "2", employeeName: "Jane Smith", leaveCredit: 12 },
    { id: "3", employeeName: "Robert Johnson", leaveCredit: 18 },
    { id: "4", employeeName: "Emily Davis", leaveCredit: 10 },
    { id: "5", employeeName: "Michael Brown", leaveCredit: 14 },
    { id: "6", employeeName: "Sarah Wilson", leaveCredit: 16 },
    { id: "7", employeeName: "David Taylor", leaveCredit: 8 },
    { id: "8", employeeName: "Jessica Anderson", leaveCredit: 20 },
    { id: "9", employeeName: "Thomas Martinez", leaveCredit: 11 },
    { id: "10", employeeName: "Lisa Robinson", leaveCredit: 13 },
    { id: "11", employeeName: "Christopher Clark", leaveCredit: 17 },
    { id: "12", employeeName: "Amanda Rodriguez", leaveCredit: 9 },
    { id: "13", employeeName: "Matthew Lewis", leaveCredit: 15 },
    { id: "14", employeeName: "Jennifer Lee", leaveCredit: 12 },
    { id: "15", employeeName: "Daniel Walker", leaveCredit: 18 },
    { id: "16", employeeName: "Michelle Hall", leaveCredit: 14 },
    { id: "17", employeeName: "Kevin Allen", leaveCredit: 10 },
    { id: "18", employeeName: "Stephanie Young", leaveCredit: 16 },
    { id: "19", employeeName: "Ryan Hernandez", leaveCredit: 8 },
    { id: "20", employeeName: "Nicole King", leaveCredit: 20 },
  ]);

  const [filteredEmployees, setFilteredEmployees] = useState<
    EmployeeLeaveCredit[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] =
    useState<EmployeeLeaveCredit | null>(null);
  const [editedCredit, setEditedCredit] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const employeesPerPage = 15;

  useEffect(() => {
    const filtered = allEmployees.filter((employee) =>
      employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
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
    setEditedCredit(employee.leaveCredit);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentEmployee) return;

    setIsSaving(true);
    try {
      setTimeout(() => {
        const updatedEmployees = allEmployees.map((emp) =>
          emp.id === currentEmployee.id
            ? { ...emp, leaveCredit: editedCredit }
            : emp
        );
        setAllEmployees(updatedEmployees);
        toast({
          title: "Success",
          description: "Leave credit updated successfully",
          variant: "default",
        });
        setIsDialogOpen(false);
      }, 500);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleBack = () => navigate(-1);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Back Button - Aligned to Start (Left) */}
            <Button
              variant="ghost"
              onClick={handleBack}
              className="absolute left-0 text-blue-600 hover:text-blue-800 p-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>

            {/* Title Section - Centered */}
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
                <TableHead className="text-center font-bold text-gray-700 w-1/2">
                  Employee
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Leave Credit
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50">
                    <TableCell className="text-center font-medium">
                      {employee.employeeName}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {employee.leaveCredit} days
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(employee)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              onClick={() => setIsDialogOpen(false)}
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
    </div>
  );
};

export default LeaveCredit;
