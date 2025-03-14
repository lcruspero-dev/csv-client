import { ScheduleAndAttendanceAPI, UserAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  name: string;
  department: string;
  position: string;
  avatarUrl?: string;
}

interface AddEmployeeProps {
  onAdd: (employee: Employee) => void;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  useEffect(() => {
    const searchEmployees = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await UserAPI.searchUser(searchQuery);
          const filteredEmployees = response.data.filter(
            (emp: { status: string }) => emp.status !== "inactive"
          );
          setEmployees(filteredEmployees);
        } catch (error) {
          console.error("Error fetching employees", error);
          toast({
            title: "Error",
            description: "Failed to fetch employees. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        setEmployees([]);
      }
    };

    const debounceTimeout = setTimeout(searchEmployees, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleAddEmployee = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      // Send the selected employee data to the schedule entry API
      await ScheduleAndAttendanceAPI.createScheduleEntry({
        employeeId: selectedEmployee._id,
        employeeName: selectedEmployee.name,
        department: selectedDepartment,
      });

      // Call the onAdd callback to update the parent component
      onAdd(selectedEmployee);

      // Show success message
      toast({
        title: "Success",
        description: `${selectedEmployee.name} has been added to the schedule.`,
      });

      // Reset and close the dialog
      setIsOpen(false);
      setSearchQuery("");
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error creating schedule entry", error);
      toast({
        title: "Error",
        description: "Failed to add employee to schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSearchQuery(emp.name); // Update search input with the selected name
    setSelectedDepartment(emp.department); // Set the initial department value
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Employee</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              {!selectedEmployee ? (
                <>
                  <Label>Search Employee</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedEmployee) setSelectedEmployee(null);
                    }}
                    placeholder="Search employee..."
                  />
                  {employees.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                      {employees.map((emp) => (
                        <div
                          key={emp._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                          onClick={() => handleSelectEmployee(emp)}
                        >
                          {emp.avatarUrl && (
                            <div className="w-6 h-6 rounded-full mr-2 overflow-hidden">
                              <img
                                src={emp.avatarUrl}
                                alt={emp.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-gray-500">
                              {" "}
                              - {emp.position} ({emp.department})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Label>Selected Employee</Label>
                  <div className="mt-2 p-1 border rounded-md bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{selectedEmployee.name}</p>
                        <p className="text-xs text-gray-600">
                          {selectedEmployee.position}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setSelectedEmployee(null);
                          setSearchQuery("");
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  {/* Department selection */}
                  <div className="mt-4 mb-2">
                    <Label>Department</Label>
                    <Select
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                    >
                      <SelectTrigger className="w-full mt-1">
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
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="text-xs">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="w-24"
              onClick={handleAddEmployee}
              disabled={!selectedEmployee || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddEmployee;
