import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as XLSX from "xlsx";

import { ExportDatas } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  startDate: string;
  endDate: string;
}

interface EmployeeTimes {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  totalHours: string;
  notes: string;
  shift: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  breakEnd: string;
  breakStart: string;
  totalBreakTime: number;
}

// Helper function to parse the date for filtering
const parseDate = (dateString: string): Date => {
  const [month, day, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const ExportDataTime: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = async (formData: FormData): Promise<void> => {
    setIsLoading(true);
    try {
      // Fetch all employee times from the API
      const response = await ExportDatas.getEmployeeTimes();
      const allEmployeeTimes: EmployeeTimes[] = response.data;

      // Parse user-provided date range
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      // Filter data to include only records within the date range
      const filteredEmployeeTimes = allEmployeeTimes.filter((entry) => {
        const entryDate = parseDate(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Handle no data scenario
      if (filteredEmployeeTimes.length === 0) {
        alert("No data found for the selected date range");
        setIsLoading(false);
        return;
      }

      // Map data to match desired Excel columns
      const mappedData = filteredEmployeeTimes.map((entry) => ({
        Date: entry.date,
        EmployeeName: entry.employeeName,
        Shift: entry.shift,
        TimeIn: entry.timeIn,
        TimeOut: entry.timeOut,
        TotalHours: entry.totalHours,
        TotalBreakTime: entry.totalBreakTime
          ? `${Math.round(entry.totalBreakTime * 60)} minutes`
          : " ",
        BreakStart: entry.breakStart,
        BreakEnd: entry.breakEnd,
        Notes: entry.notes,
      }));

      // Generate and download Excel file
      const worksheet = XLSX.utils.json_to_sheet(mappedData);

      // Adjust column widths
      worksheet["!cols"] = [
        { wch: 15 }, // date
        { wch: 20 }, // EmployeeName
        { wch: 10 }, // Shift
        { wch: 15 }, // TimeIn
        { wch: 15 }, // TimeOut
        { wch: 10 }, // TotalHours
        { wch: 10 }, // totalBreakTime
        { wch: 15 }, // breakStart
        { wch: 15 }, // breakEnd
        { wch: 30 }, // Notes
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Times");

      // Generate a filename with the current date
      const fileName = `Employee_Time_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Trigger the file download
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex justify-center p-3">
      <BackButton />
      <form className="mt-5 w-1/2" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-center">
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Export Time Tracker Data
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Please select the date range
          </p>
        </div>

        <Label htmlFor="startDate" className="text-base font-bold">
          <p>Start Date</p>
        </Label>
        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <Input {...field} type="date" required className="!mb-2" />
          )}
        />
        {errors.startDate && (
          <p className="text-red-500">{errors.startDate.message}</p>
        )}

        <Label htmlFor="endDate" className="text-base font-bold">
          <p>End Date</p>
        </Label>
        <Controller
          name="endDate"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <Input {...field} type="date" required className="!mb-2" />
          )}
        />
        {errors.endDate && (
          <p className="text-red-500">{errors.endDate.message}</p>
        )}

        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
          {isLoading ? "Exporting..." : "Export Data"}
        </Button>
      </form>
    </div>
  );
};

export default ExportDataTime;
