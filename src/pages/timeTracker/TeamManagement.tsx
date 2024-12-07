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
import { Calendar, Pencil, Trash2, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";

// Interfaces for type safety
interface TeamMember {
  id: string;
  name: string;
  availability: {
    [day: string]: boolean; // Only track availability
  };
}

export const LeadTeamManagement: React.FC = () => {
  // State management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Dialog and form states
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isSetDatesDialogOpen, setIsSetDatesDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    availability: {
      MON: false,
      TUE: false,
      WED: false,
      THU: false,
      FRI: false,
      SAT: false,
      SUN: false,
    },
  });

  // Default dates state
  const [defaultDates, setDefaultDates] = useState({
    MON: "",
    TUE: "",
    WED: "",
    THU: "",
    FRI: "",
    SAT: "",
    SUN: "",
  });

  // Fetch team members (placeholder for actual API call)
  const fetchTeamMembers = async () => {
    try {
      console.log("Fetching team members");
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  // Add team member
  const handleAddMember = async () => {
    try {
      setTeamMembers([
        ...teamMembers,
        { ...newMember, id: Date.now().toString() },
      ]);
      setIsAddMemberDialogOpen(false);
      setNewMember({
        name: "",
        availability: {
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

  // Remove team member
  const handleRemoveMember = async (memberId: string) => {
    try {
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error("Error removing team member:", error);
    }
  };

  // Toggle availability
  const toggleAvailability = (memberId: string, day: string) => {
    setTeamMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              availability: {
                ...member.availability,
                [day]: !member.availability[day],
              },
            }
          : member
      )
    );
  };

  // Set default dates for the header
  const handleSetDefaultDates = () => {
    setIsSetDatesDialogOpen(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <UserPlus className="mr-2" /> Team Management
          </div>
          <div className="flex gap-2">
            {/* Set Dates Button */}
            <Button
              variant="outline"
              onClick={() => setIsSetDatesDialogOpen(true)}
            >
              <Calendar className="mr-2 h-4 w-4" /> Set Dates
            </Button>
            {/* Add Team Member Button */}
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
                      onChange={(e) =>
                        setNewMember({ ...newMember, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddMember}>Add Member</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Set Dates Dialog */}
        <Dialog
          open={isSetDatesDialogOpen}
          onOpenChange={setIsSetDatesDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Default Dates</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div key={day} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`date-${day}`} className="text-right">
                    {day} Date
                  </Label>
                  <Input
                    id={`date-${day}`}
                    type="text"
                    placeholder="MM/DD/YY"
                    value={defaultDates[day as keyof typeof defaultDates]}
                    onChange={(e) =>
                      setDefaultDates((prev) => ({
                        ...prev,
                        [day]: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSetDefaultDates}>Set Dates</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Members Section */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <TableHead key={day}>
                  {day} {defaultDates[day] && `(${defaultDates[day]})`}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                  (day) => (
                    <TableCell key={day} className="text-center">
                      <Button
                        variant={
                          member.availability[day] ? "default" : "outline"
                        }
                        onClick={() => toggleAvailability(member.id, day)}
                      >
                        {member.availability[day] ? "✔️" : "✖️"}
                      </Button>
                    </TableCell>
                  )
                )}
                <TableCell>
                  <div className="flex gap-2">
                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        console.log("Edit action triggered for", member.name);
                        // Add your edit logic here
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* Delete Button */}
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
      </CardContent>
    </Card>
  );
};

export default LeadTeamManagement;
