import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as XLSX from "xlsx";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportDatas } from "@/API/endpoint";

interface FormData {
  startDate: string;
  endDate: string;
  department: string;
  status: string;
}

interface Ticket {
  _id: string;
  createdAt: string;
  department: string;
  status: string;
  // Add other ticket properties as needed
}

const ExportData: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      startDate: "",
      endDate: "",
      department: "",
      status: "",
    },
  });

  const filterData = (data: Ticket[], filters: FormData): Ticket[] => {
    return data.filter((ticket) => {
      const ticketDate = new Date(ticket.createdAt);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      // Date range filter
      if (ticketDate < startDate || ticketDate > endDate) return false;

      // Department filter
      if (filters.department !== "ALL" && ticket.department !== filters.department) return false;

      // Status filter
      if (filters.status !== "ALL" && ticket.status !== filters.status) return false;

      return true;
    });
  };

  const onSubmit = async (formData: FormData): Promise<void> => {
    setIsLoading(true);
    try {
      // Fetch all data from your API
      const response = await ExportDatas.getAllTicket();
      const allTickets: Ticket[] = response.data;

      // Apply filters
      const filteredTickets = filterData(allTickets, formData);

      // Generate and download Excel file
      const worksheet = XLSX.utils.json_to_sheet(filteredTickets);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Tickets");

      // Generate a filename with the current date
      const fileName = `Filtered_Tickets_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Trigger the file download
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex justify-center p-3">
      <BackButton />
      <form className="mt-5 w-1/2" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-center">
          <div className="mb-3"></div>
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Export Ticket Data
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Please select the export criteria
          </p>
        </div>

        <Label htmlFor="startDate" className="text-base font-bold">
          <p>Start Date</p>
        </Label>
        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => <Input {...field} type="date" required className="!mb-2" />}
        />
        {errors.startDate && <p className="text-red-500">{errors.startDate.message}</p>}

        <Label htmlFor="endDate" className="text-base font-bold">
          <p>End Date</p>
        </Label>
        <Controller
          name="endDate"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => <Input {...field} type="date" required className="!mb-2" />}
        />
        {errors.endDate && <p className="text-red-500">{errors.endDate.message}</p>}

        <Label htmlFor="department" className="text-base font-bold">
          Department
        </Label>
        <Controller
          name="department"
          control={control}
          rules={{ required: "Department is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="IT">IT Department</SelectItem>
                  <SelectItem value="HR">HR Department</SelectItem>
                  <SelectItem value="ALL">All Departments</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.department && <p className="text-red-500">{errors.department.message}</p>}

        <Label htmlFor="status" className="text-base font-bold">
          Status
        </Label>
        <Controller
          name="status"
          control={control}
          rules={{ required: "Status is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="ALL">All</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && <p className="text-red-500">{errors.status.message}</p>}

        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
          {isLoading ? "Exporting..." : "Export Data"}
        </Button>
      </form>
    </div>
  );
};

export default ExportData;
