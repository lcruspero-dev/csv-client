// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Pencil, Trash2, UserPlus } from "lucide-react";
// import { useState } from "react";

// type AttendanceStatus =
//   | "Present"
//   | "NCNS"
//   | "Call In"
//   | "Rest Day"
//   | "Tardy"
//   | "RDOT"
//   | "Suspended"
//   | "Attrition"
//   | "LOA"
//   | "OT"
//   | "VL"
//   | "Half Day"
//   | "Early Log Out"
//   | "VTO"
//   | "TB";

// interface TeamMember {
//   id: string;
//   name: string;
//   attendance: {
//     [date: string]: AttendanceStatus;
//   };
// }

// const LeadTeamManagement = () => {
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
//   const [newMember, setNewMember] = useState({ name: "" });

//   // Generate dates for the last 30 days
//   const generateDates = () => {
//     const dates = [];
//     const today = new Date();
//     for (let i = 30; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(today.getDate() - i);
//       dates.push(date.toISOString().split("T")[0]);
//     }
//     return dates;
//   };

//   const dates = generateDates();

//   const handleAddMember = () => {
//     if (!newMember.name.trim()) return;

//     const attendance = {};
//     dates.forEach((date) => {
//       attendance[date] = "Not Taken";
//     });

//     const newTeamMember = {
//       id: Date.now().toString(),
//       name: newMember.name,
//       attendance,
//     };

//     setTeamMembers([...teamMembers, newTeamMember]);
//     setNewMember({ name: "" });
//     setIsAddMemberDialogOpen(false);
//   };

//   const handleRemoveMember = (memberId: string) => {
//     setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
//   };

//   const updateAttendance = (
//     memberId: string,
//     date: string,
//     status: AttendanceStatus
//   ) => {
//     setTeamMembers(
//       teamMembers.map((member) => {
//         if (member.id === memberId) {
//           return {
//             ...member,
//             attendance: {
//               ...member.attendance,
//               [date]: status,
//             },
//           };
//         }
//         return member;
//       })
//     );
//   };

//   const getStatusColor = (status: AttendanceStatus) => {
//     const colors = {
//       Present: "bg-emerald-100 text-emerald-800",
//       NCNS: "bg-red-600 text-white",
//       "Call In": "bg-purple-200 text-purple-800",
//       "Rest Day": "bg-blue-100 text-blue-800",
//       Tardy: "bg-red-100 text-red-800",
//       RDOT: "bg-blue-500 text-white",
//       Suspended: "bg-orange-500 text-white",
//       Attrition: "bg-red-300 text-red-800",
//       LOA: "bg-blue-200 text-blue-800",
//       OT: "bg-gray-600 text-white",
//       VL: "bg-blue-600 text-white",
//       "Half Day": "bg-yellow-300 text-yellow-800",
//       "Early Log Out": "bg-gray-300 text-gray-800",
//       VTO: "bg-purple-600 text-white",
//       TB: "bg-teal-600 text-white",
//     };
//     return colors[status] || "bg-gray-100 text-gray-800";
//   };

//   return (
//     <Card className="w-full max-w-6xl mx-auto">
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           <div className="flex items-center">
//             <UserPlus className="mr-2" /> Team Management
//           </div>
//           <Dialog
//             open={isAddMemberDialogOpen}
//             onOpenChange={setIsAddMemberDialogOpen}
//           >
//             <DialogTrigger asChild>
//               <Button variant="outline">
//                 <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Add New Team Member</DialogTitle>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="name" className="text-right">
//                     Name
//                   </Label>
//                   <Input
//                     id="name"
//                     value={newMember.name}
//                     onChange={(e) => setNewMember({ name: e.target.value })}
//                     className="col-span-3"
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end">
//                 <Button onClick={handleAddMember}>Add Member</Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="attendance" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="attendance">Attendance</TabsTrigger>
//             <TabsTrigger value="schedule">Schedule</TabsTrigger>
//           </TabsList>
//           <TabsContent value="attendance">
//             <div className="overflow-x-auto">
//               <div className="min-w-max">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="sticky left-0 bg-background">
//                         Name
//                       </TableHead>
//                       {dates.map((date) => (
//                         <TableHead
//                           key={date}
//                           className="text-center min-w-[100px]"
//                         >
//                           {new Date(date).toLocaleDateString()}
//                         </TableHead>
//                       ))}
//                       <TableHead className="sticky right-0 bg-background">
//                         Actions
//                       </TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {teamMembers.map((member) => (
//                       <TableRow key={member.id}>
//                         <TableCell className="sticky left-0 bg-background font-medium">
//                           {member.name}
//                         </TableCell>
//                         {dates.map((date) => (
//                           <TableCell key={date} className="text-center">
//                             <select
//                               value={member.attendance[date]}
//                               onChange={(e) =>
//                                 updateAttendance(
//                                   member.id,
//                                   date,
//                                   e.target.value as AttendanceStatus
//                                 )
//                               }
//                               className={`w-24 px-2 py-1 rounded text-sm font-medium border-0 ${getStatusColor(
//                                 member.attendance[date] as AttendanceStatus
//                               )}`}
//                             >
//                               <option value="Present">Present</option>
//                               <option value="NCNS">NCNS</option>
//                               <option value="Call In">Call In</option>
//                               <option value="Rest Day">Rest Day</option>
//                               <option value="Tardy">Tardy</option>
//                               <option value="RDOT">RDOT</option>
//                               <option value="Suspended">Suspended</option>
//                               <option value="Attrition">Attrition</option>
//                               <option value="LOA">LOA</option>
//                               <option value="OT">OT</option>
//                               <option value="VL">VL</option>
//                               <option value="Half Day">Half Day</option>
//                               <option value="Early Log Out">
//                                 Early Log Out
//                               </option>
//                               <option value="VTO">VTO</option>
//                               <option value="TB">TB</option>
//                             </select>
//                           </TableCell>
//                         ))}
//                         <TableCell className="sticky right-0 bg-background">
//                           <div className="flex gap-2">
//                             <Button
//                               variant="outline"
//                               size="icon"
//                               onClick={() => {
//                                 console.log(
//                                   "Edit action triggered for",
//                                   member.name
//                                 );
//                               }}
//                             >
//                               <Pencil className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="destructive"
//                               size="icon"
//                               onClick={() => handleRemoveMember(member.id)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           </TabsContent>
//           <TabsContent value="schedule">
//             {/* Schedule content remains the same */}
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// };

// export default LeadTeamManagement;
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  attendance: {
    [day: string]: boolean;
  };
  schedule: {
    [day: string]: boolean;
  };
}

export const LeadTeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    attendance: {
      MON: false,
      TUE: false,
      WED: false,
      THU: false,
      FRI: false,
      SAT: false,
      SUN: false,
    },
    schedule: {
      MON: false,
      TUE: false,
      WED: false,
      THU: false,
      FRI: false,
      SAT: false,
      SUN: false,
    },
  });

  const fetchTeamMembers = async () => {
    try {
      console.log("Fetching team members");
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleAddMember = async () => {
    try {
      if (!newMember.name.trim()) return;

      setTeamMembers([
        ...teamMembers,
        { ...newMember, id: Date.now().toString() },
      ]);
      setNewMember({
        name: "",
        attendance: {
          MON: false,
          TUE: false,
          WED: false,
          THU: false,
          FRI: false,
          SAT: false,
          SUN: false,
        },
        schedule: {
          MON: false,
          TUE: false,
          WED: false,
          THU: false,
          FRI: false,
          SAT: false,
          SUN: false,
        },
      });
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error("Error removing team member:", error);
    }
  };

  const setAttendanceForDay = (memberId: string, day: string) => {
    const updatedMembers = teamMembers.map((member) => {
      if (member.id === memberId) {
        return {
          ...member,
          attendance: {
            ...member.attendance,
            [day]: !member.attendance[day],
          },
        };
      }
      return member;
    });
    setTeamMembers(updatedMembers);
  };

  const setScheduleForDay = (memberId: string, day: string) => {
    const updatedMembers = teamMembers.map((member) => {
      if (member.id === memberId) {
        return {
          ...member,
          schedule: {
            ...member.schedule,
            [day]: !member.schedule[day],
          },
        };
      }
      return member;
    });
    setTeamMembers(updatedMembers);
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const renderTable = (type: "attendance" | "schedule") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>MON</TableHead>
          <TableHead>TUE</TableHead>
          <TableHead>WED</TableHead>
          <TableHead>THU</TableHead>
          <TableHead>FRI</TableHead>
          <TableHead>SAT</TableHead>
          <TableHead>SUN</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamMembers.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.name}</TableCell>
            {Object.keys(member[type]).map((day) => (
              <TableCell key={day} className="text-center">
                <Button
                  variant={member[type][day] ? "default" : "outline"}
                  onClick={() =>
                    type === "attendance"
                      ? setAttendanceForDay(member.id, day)
                      : setScheduleForDay(member.id, day)
                  }
                >
                  {member[type][day] ? "+" : "-"}
                </Button>
              </TableCell>
            ))}
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    console.log("Edit action triggered for", member.name);
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
  );

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <UserPlus className="mr-2" /> Team Management
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isAddMemberDialogOpen}
              onOpenChange={setIsAddMemberDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberDialogOpen(true)}
                >
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
                      onChange={(e) =>
                        setNewMember({ ...newMember, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      handleAddMember();
                      setIsAddMemberDialogOpen(false);
                    }}
                  >
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance">
            {renderTable("attendance")}
          </TabsContent>
          <TabsContent value="schedule">{renderTable("schedule")}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeadTeamManagement;
