/* eslint-disable @typescript-eslint/no-unused-vars */
import { NteAPI, UserAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  position: string;
}

const OFFENSE_TYPES = [
  "Tardy",
  "Behavior at Work",
  "Record Keeping",
  "Unexcused Absence",
  "Destruction of Property",
  "Safety and Security",
  "No Call No Show",
  "Insubordination",
  "Others",
];

const CreateNTE = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const form = useForm({
    defaultValues: {
      employeeId: "",
      name: "",
      position: "",
      dateIssued: "",
      issuedBy: "",
      offenseType: "",
      otherOffenseType: "",
      offenseDescription: "",
    },
  });

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await UserAPI.searchUser(searchQuery);
          setUsers(response.data);
        } catch (error) {
          console.error("Error searching users:", error);
        }
      } else {
        setUsers([]);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const onSubmit = async (data: {
    offenseType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    otherOffenseType: any;
  }) => {
    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an employee",
      });
      return;
    }

    const finalOffenseType =
      data.offenseType === "Others" ? data.otherOffenseType : data.offenseType;

    setLoading(true);
    try {
      await NteAPI.createNte({
        nte: {
          ...data,
          employeeId: selectedUser._id,
          offenseType: finalOffenseType,
        },
      });
      toast({
        title: "Success",
        description: "NTE created successfully",
      });
      navigate("/nte");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create NTE",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-5">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold text-center py-4">
          Create Notice to Explain
        </h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-3xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow"
        >
          <div className="space-y-4">
            <FormItem>
              {/* <FormLabel>Search Employee</FormLabel> */}
              <Command className="border rounded-md">
                <CommandInput
                  placeholder="Search employee..."
                  value={searchQuery}
                  onValueChange={(value) => {
                    setSearchQuery(value);
                    if (selectedUser) setSelectedUser(null);
                  }}
                />
                <CommandList>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <CommandItem
                        key={user._id}
                        onSelect={() => {
                          setSelectedUser(user);
                          form.setValue("employeeId", user._id);
                          form.setValue("name", user.name);
                          form.setValue("position", user.position);
                          setSearchQuery("");
                        }}
                      >
                        {user.name}
                      </CommandItem>
                    ))
                  ) : searchQuery.trim() ? (
                    <CommandEmpty className="text-xs text-muted-foreground p-2 text-center">
                      No users found.
                    </CommandEmpty>
                  ) : null}
                </CommandList>
              </Command>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateIssued"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Issued</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issued By</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offenseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowOtherInput(value === "Others");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select policy type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OFFENSE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {showOtherInput && (
            <FormField
              control={form.control}
              name="otherOffenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specify Other Policy Type</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="offenseDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description of Offense/s</FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[100px]" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create NTE"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateNTE;
