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
