import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DatePickerWithRange } from "@/components/ui/date-range-picker";
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
// import { addDays, format, startOfWeek } from "date-fns";
// import { Pencil, Trash2, UserPlus } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { DateRange } from "react-day-picker";

// interface TeamMember {
//   id: string;
//   name: string;
//   availability: {
//     [day: string]: boolean;
//   };
// }

// export const LeadTeamManagement: React.FC = () => {
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
//   const [newMember, setNewMember] = useState({
//     name: "",
//     availability: {
//       MON: false,
//       TUE: false,
//       WED: false,
//       THU: false,
//       FRI: false,
//       SAT: false,
//       SUN: false,
//     },
//   });
//   const [dateRange, setDateRange] = useState<DateRange | undefined>({
//     from: undefined,
//     to: undefined,
//   });
//   const [formattedDates, setFormattedDates] = useState({
//     MON: "",
//     TUE: "",
//     WED: "",
//     THU: "",
//     FRI: "",
//     SAT: "",
//     SUN: "",
//   });

//   const fetchTeamMembers = async () => {
//     try {
//       console.log("Fetching team members");
//     } catch (error) {
//       console.error("Error fetching team members:", error);
//     }
//   };

//   const handleAddMember = async () => {
//     try {
//       if (!newMember.name.trim()) return;

//       setTeamMembers([
//         ...teamMembers,
//         { ...newMember, id: Date.now().toString() },
//       ]);
//       setNewMember({
//         name: "",
//         availability: {
//           MON: false,
//           TUE: false,
//           WED: false,
//           THU: false,
//           FRI: false,
//           SAT: false,
//           SUN: false,
//         },
//       });
//     } catch (error) {
//       console.error("Error adding team member:", error);
//     }
//   };

//   const handleRemoveMember = async (memberId: string) => {
//     try {
//       setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
//     } catch (error) {
//       console.error("Error removing team member:", error);
//     }
//   };

//   const setAvailabilityForDay = (memberId: string, day: string) => {
//     const updatedMembers = teamMembers.map((member) => {
//       if (member.id === memberId) {
//         return {
//           ...member,
//           availability: {
//             ...member.availability,
//             [day]: !member.availability[day],
//           },
//         };
//       }
//       return member;
//     });
//     setTeamMembers(updatedMembers);
//   };

//   const setFormattedDatesForRange = () => {
//     if (dateRange?.from && dateRange?.to) {
//       const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 });
//       const dates = {
//         MON: format(weekStart, "MM/dd/yy"),
//         TUE: format(addDays(weekStart, 1), "MM/dd/yy"),
//         WED: format(addDays(weekStart, 2), "MM/dd/yy"),
//         THU: format(addDays(weekStart, 3), "MM/dd/yy"),
//         FRI: format(addDays(weekStart, 4), "MM/dd/yy"),
//         SAT: format(addDays(weekStart, 5), "MM/dd/yy"),
//         SUN: format(addDays(weekStart, 6), "MM/dd/yy"),
//       };
//       setFormattedDates(dates);
//     }
//   };

//   useEffect(() => {
//     fetchTeamMembers();
//     setFormattedDatesForRange();
//   }, [dateRange]);

//   return (
//     <Card className="w-full max-w-6xl mx-auto">
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           <div className="flex items-center">
//             <UserPlus className="mr-2" /> Team Management
//           </div>
//           <div className="flex gap-2">
//             <Dialog
//               open={isAddMemberDialogOpen}
//               onOpenChange={setIsAddMemberDialogOpen}
//             >
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsAddMemberDialogOpen(true)}
//                 >
//                   <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Add New Team Member</DialogTitle>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid grid-cols-4 items-center gap-4">
//                     <Label htmlFor="name" className="text-right">
//                       Name
//                     </Label>
//                     <Input
//                       id="name"
//                       value={newMember.name}
//                       onChange={(e) =>
//                         setNewMember({ ...newMember, name: e.target.value })
//                       }
//                       className="col-span-3"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end">
//                   <Button
//                     onClick={() => {
//                       handleAddMember();
//                       setIsAddMemberDialogOpen(false); // Close the dialog after adding
//                     }}
//                   >
//                     Add Member
//                   </Button>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <DatePickerWithRange
//           initialFocus
//           mode="range"
//           defaultMonth={new Date()}
//           selected={dateRange}
//           onSelect={setDateRange}
//           numberOfMonths={2}
//         />
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               {Object.keys(formattedDates).map((day) => (
//                 <TableHead key={day}>
//                   {day} {formattedDates[day] && `(${formattedDates[day]})`}
//                 </TableHead>
//               ))}
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {teamMembers.map((member) => (
//               <TableRow key={member.id}>
//                 <TableCell>{member.name}</TableCell>
//                 {Object.keys(member.availability).map((day) => (
//                   <TableCell key={day} className="text-center">
//                     <Button
//                       variant={member.availability[day] ? "default" : "outline"}
//                       onClick={() => setAvailabilityForDay(member.id, day)}
//                     >
//                       {member.availability[day] ? "+" : "-"}
//                     </Button>
//                   </TableCell>
//                 ))}
//                 <TableCell>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={() => {
//                         console.log("Edit action triggered for", member.name);
//                       }}
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       size="icon"
//                       onClick={() => handleRemoveMember(member.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// };
export const LeadTeamManagement: React.FC = () => {
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl gap-3">
          Team Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 space-y-4">
          <h2 className="text-xl font-semibold">System Under Maintenance</h2>
          <p className="text-gray-600">
            We are currently performing scheduled maintenance to improve your
            experience. The team management system will be back online shortly.
          </p>
          <p className="text-sm text-gray-500">
            Expected completion: Within 24 hours
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadTeamManagement;
