// components/AbsenteeismAnalytics.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface AbsenteeismAnalyticsProps {
  employees: {
    id: string;
    name: string;
    department: string;
  }[];
  attendance: {
    employeeId: string;
    date: Date;
    status: string;
  }[];
  schedule: {
    employeeId: string;
    date: string;
    shiftType: {
      type: string;
    };
  }[];
  viewMode: "weekly" | "monthly";
  currentDate: Date;
}

export const AbsenteeismAnalytics: React.FC<AbsenteeismAnalyticsProps> = ({
  employees,
  attendance,
  schedule,
  viewMode,
  currentDate,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [displayMode, setDisplayMode] = React.useState<"chart" | "list">(
    "chart"
  );
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");

  // Calculate absenteeism for each employee
  const getDateRange = () => {
    const start =
      viewMode === "weekly"
        ? startOfWeek(currentDate)
        : startOfMonth(currentDate);
    const end =
      viewMode === "weekly" ? endOfWeek(currentDate) : endOfMonth(currentDate);
    return { start, end };
  };

  // Calculate absenteeism for each employee - updated to filter by date range
  const calculateAbsenteeism = () => {
    const { start, end } = getDateRange();

    return employees.map((employee) => {
      // Filter scheduled days for this employee within date range
      const scheduledDays = schedule.filter(
        (entry) =>
          entry.employeeId === employee.id &&
          entry.shiftType.type !== "restday" && // Exclude rest days from total count
          new Date(entry.date) >= start &&
          new Date(entry.date) <= end
      );

      // Filter attendance records for this employee within date range
      const attendanceRecords = attendance.filter(
        (record) =>
          record.employeeId === employee.id &&
          record.date >= start &&
          record.date <= end
      );

      // Count absences (NCNS, Call In, etc.)
      const absences = attendanceRecords.filter((record) =>
        ["NCNS", "Call In"].includes(record.status)
      ).length;

      const totalScheduledDays = scheduledDays.length;
      const absenteeismRate =
        totalScheduledDays > 0 ? (absences / totalScheduledDays) * 100 : 0;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        totalScheduledDays,
        absences,
        absenteeismRate,
      };
    });
  };

  const absenteeismData = calculateAbsenteeism();

  // Filter data by department if needed
  const filteredData =
    departmentFilter === "all"
      ? absenteeismData
      : absenteeismData.filter((data) => data.department === departmentFilter);

  // Prepare data for chart (top 10 employees by rate)
  const chartData = [...filteredData]
    .sort((a, b) => b.absenteeismRate - a.absenteeismRate)
    .slice(0, 10);

  // Calculate overall absenteeism rate
  const totalAbsences = filteredData.reduce(
    (sum, data) => sum + data.absences,
    0
  );
  const totalScheduledDays = filteredData.reduce(
    (sum, data) => sum + data.totalScheduledDays,
    0
  );
  const overallAbsenteeismRate =
    totalScheduledDays > 0 ? (totalAbsences / totalScheduledDays) * 100 : 0;

  // Get unique departments for filter
  const departments = [...new Set(employees.map((emp) => emp.department))];

  return (
    <Card className="w-full mb-4 border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Absenteeism Analytics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isExpanded && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="pt-0">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Overall Absenteeism Rate
                </h3>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-xl px-4 py-2 rounded-lg ${
                      overallAbsenteeismRate > 5
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-green-50 text-green-700 border-green-100"
                    }`}
                  >
                    {overallAbsenteeismRate.toFixed(2)}%
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p className="text-sm">
                          Absenteeism is calculated as (Number of Absences /
                          Total Programmed Days) × 100. Programmed days exclude
                          rest days.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-xs border">
                  <p className="text-xs text-gray-500">Total Absences</p>
                  <p className="text-lg font-semibold">{totalAbsences}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-xs border">
                  <p className="text-xs text-gray-500">Programmed Days</p>
                  <p className="text-lg font-semibold">{totalScheduledDays}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Employee Analytics
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDisplayMode("chart")}
                className={`px-3 py-1 text-sm rounded-md ${
                  displayMode === "chart"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Chart View
              </button>
              <button
                onClick={() => setDisplayMode("list")}
                className={`px-3 py-1 text-sm rounded-md ${
                  displayMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {displayMode === "chart" ? (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="employeeName"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)}%`,
                      "Absenteeism Rate",
                    ]}
                    labelFormatter={(label) => `Employee: ${label}`}
                  />
                  <Bar dataKey="absenteeismRate" name="Absenteeism Rate">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.absenteeismRate > 5 ? "#ef4444" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((data) => (
                  <div
                    key={data.employeeId}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          {data.employeeName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {data.department}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`rounded-md ${
                          data.absenteeismRate > 5
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-green-50 text-green-700 border-green-100"
                        }`}
                      >
                        {data.absenteeismRate.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Absences:</span>
                        <span className="font-medium">{data.absences}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Scheduled Days:</span>
                        <span className="font-medium">
                          {data.totalScheduledDays}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent className="pt-0">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Summary
                </h3>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-xl px-4 py-2 rounded-lg ${
                      overallAbsenteeismRate > 5
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-green-50 text-green-700 border-green-100"
                    }`}
                  >
                    {overallAbsenteeismRate.toFixed(2)}%
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {totalAbsences} absences across {filteredData.length}{" "}
                    employees
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-xs border">
                  <p className="text-xs text-gray-500">Top Absentee</p>
                  <p className="text-sm font-semibold">
                    {chartData[0]?.employeeName || "N/A"} (
                    {chartData[0]?.absenteeismRate.toFixed(2) || "0"}%)
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-xs border">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-semibold">
                    {departmentFilter === "all" ? "All" : departmentFilter}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
