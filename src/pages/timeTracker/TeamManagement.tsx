import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

type AttendanceStatus =
  | "Present"
  | "NCNS"
  | "Call In"
  | "Rest Day"
  | "Tardy"
  | "RDOT"
  | "Suspended"
  | "Attrition"
  | "LOA"
  | "OT"
  | "VL"
  | "Half Day"
  | "Early Log Out"
  | "VTO"
  | "TB";

interface TeamMember {
  id: string;
  name: string;
  attendance: {
    [date: string]: AttendanceStatus;
  };
}

const LeadTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "" });

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const dates = generateDates();

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;

    const attendance = {};
    dates.forEach((date) => {
      attendance[date] = "Not Taken";
    });

    const newTeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      attendance,
    };

    setTeamMembers([...teamMembers, newTeamMember]);
    setNewMember({ name: "" });
    setIsAddMemberDialogOpen(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
  };

  const updateAttendance = (
    memberId: string,
    date: string,
    status: AttendanceStatus
  ) => {
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === memberId) {
          return {
            ...member,
            attendance: {
              ...member.attendance,
              [date]: status,
            },
          };
        }
        return member;
      })
    );
  };

  const getStatusColor = (status: AttendanceStatus) => {
    const colors = {
      Present: "bg-emerald-100 text-emerald-800",
      NCNS: "bg-red-600 text-white",
      "Call In": "bg-purple-200 text-purple-800",
      "Rest Day": "bg-blue-100 text-blue-800",
      Tardy: "bg-red-100 text-red-800",
      RDOT: "bg-blue-500 text-white",
      Suspended: "bg-orange-500 text-white",
      Attrition: "bg-red-300 text-red-800",
      LOA: "bg-blue-200 text-blue-800",
      OT: "bg-gray-600 text-white",
      VL: "bg-blue-600 text-white",
      "Half Day": "bg-yellow-300 text-yellow-800",
      "Early Log Out": "bg-gray-300 text-gray-800",
      VTO: "bg-purple-600 text-white",
      TB: "bg-teal-600 text-white",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className=" h-screen flex flex-col p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <UserPlus className="mr-2" /> Team Management
        </div>
        <Dialog
          open={isAddMemberDialogOpen}
          onOpenChange={setIsAddMemberDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ name: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddMember}>Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <Tabs defaultValue="attendance" className="flex-grow">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="overflow-auto flex-grow">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">
                      Name
                    </TableHead>
                    {dates.map((date) => (
                      <TableHead
                        key={date}
                        className="text-center min-w-[100px]"
                      >
                        {new Date(date).toLocaleDateString()}
                      </TableHead>
                    ))}
                    <TableHead className="sticky right-0 bg-background">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="sticky left-0 bg-background font-medium">
                        {member.name}
                      </TableCell>
                      {dates.map((date) => (
                        <TableCell key={date} className="text-center">
                          <select
                            value={member.attendance[date]}
                            onChange={(e) =>
                              updateAttendance(
                                member.id,
                                date,
                                e.target.value as AttendanceStatus
                              )
                            }
                            className={`w-24 px-2 py-1 rounded text-sm font-medium border-0 ${getStatusColor(
                              member.attendance[date] as AttendanceStatus
                            )}`}
                          >
                            <option value="Present">Present</option>
                            <option value="NCNS">NCNS</option>
                            <option value="Call In">Call In</option>
                            <option value="Rest Day">Rest Day</option>
                            <option value="Tardy">Tardy</option>
                            <option value="RDOT">RDOT</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Attrition">Attrition</option>
                            <option value="LOA">LOA</option>
                            <option value="OT">OT</option>
                            <option value="VL">VL</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Early Log Out">Early Log Out</option>
                            <option value="VTO">VTO</option>
                            <option value="TB">TB</option>
                          </select>
                        </TableCell>
                      ))}
                      <TableCell className="sticky right-0 bg-background">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              console.log(
                                "Edit action triggered for",
                                member.name
                              );
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="schedule">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">December</h2>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <select className="border rounded-md p-2">
              <option>Month by Team member</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-[auto_repeat(31,_minmax(40px,_1fr))]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background w-48">
                      Name
                    </TableHead>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <TableHead key={day} className="text-center">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {
                              ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
                                new Date(2024, 11, day).getDay()
                              ]
                            }
                          </span>
                          <span>{day}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="sticky left-0 bg-background w-48">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              7h 30m · ₱0.00
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <TableCell
                            key={day}
                            className="relative p-0 h-24 border group hover:bg-accent text-center"
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Placeholder for shift blocks */}
                            {day === 1 && (
                              <div className="absolute top-2 left-2 right-2 bg-primary/10 rounded p-2">
                                <div className="text-xs">9am - 5pm</div>
                                <div className="text-xs font-medium">Sales</div>
                              </div>
                            )}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadTeamManagement;
