/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, TicketAPi } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/kit/BackButton";

const Request = () => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);
  const [form, setForm] = useState({
    name: `${userLogin.name}`,
    email: `${userLogin.email}`,
    category: "",
    description: "",
    purpose: "",
    file: null,
    department: "HR", // Static HR value for backend
    leaveType: "",
    leaveCategory: "",
    leaveReason: "",
    startDate: "",
    endDate: "",
    delegatedTasks: "",
    formDepartment: "Marketing", // Department selected in form
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_UPLOADFILES_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newFilename = response.data.filename;
      setForm((prevForm) => ({ ...prevForm, file: newFilename }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value });
  };

  const formatDateToMMDDYYYY = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let description = "";

      if (form.category === "Leave Request") {
        description = `Leave Request Details:
• Leave Type: ${form.leaveType}
• Leave Category: ${form.leaveCategory}
• Department: ${form.formDepartment}
• Dates: ${formatDateToMMDDYYYY(form.startDate)} to ${formatDateToMMDDYYYY(
          form.endDate
        )}
• Reason: ${form.leaveReason}
• Tasks to be Delegated: ${form.delegatedTasks}`;
      } else if (form.category === "Certificate of Employment") {
        description = `Purpose: ${form.purpose}\nDetails: ${form.description}`;
      } else {
        description = form.description;
      }

      const response = await TicketAPi.createTicket({
        ...form,
        description,
        // department: "HR" is automatically included from form state
      });

      toast({
        title: "Ticket created successfully",
        description: `Ticket #${response.data.ticketNumber} has been created`,
        variant: "default",
      });
      navigate("/view-ticket");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategory = async () => {
    try {
      const response = await Category.getHrCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const renderLeaveRequestContent = () => {
    return (
      <div className="mt-4">
        <Label htmlFor="leaveType" className="text-sm font-bold">
          Leave Type <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) => setForm({ ...form, leaveType: value })}
          required
        >
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
              <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
              <SelectItem value="Vacation Leave">Vacation Leave</SelectItem>
              <SelectItem value="Sick Leave">Sick Leave</SelectItem>
              <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
              <SelectItem value="Bereavement Leave">
                Bereavement Leave
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Label htmlFor="leaveCategory" className="text-sm font-bold">
          Leave Category <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) => setForm({ ...form, leaveCategory: value })}
          required
        >
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select leave category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="AM Leave">AM Leave</SelectItem>
              <SelectItem value="PM Leave">PM Leave</SelectItem>
              <SelectItem value="Full-Day Leave">Full-Day Leave</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Label htmlFor="department" className="text-sm font-bold">
          Department <span className="text-red-500">*</span>
        </Label>
        <Select
          value={form.formDepartment}
          onValueChange={(value) => setForm({ ...form, formDepartment: value })}
          required
        >
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-bold">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              name="startDate"
              type="date"
              required
              className="!mb-2"
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-sm font-bold">
              End Date <span className="text-red-500">*</span>
            </Label>
            <Input
              name="endDate"
              type="date"
              required
              className="!mb-2"
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Label htmlFor="leaveReason" className="text-sm font-bold">
          Why are you requesting for a leave?{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          className="h-24 mb-2"
          name="leaveReason"
          placeholder="Please provide the reason for your leave"
          required
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <Label htmlFor="delegatedTasks" className="text-sm font-bold">
          Tasks to be delegated while out of office{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          className="h-24"
          name="delegatedTasks"
          placeholder="List tasks that need to be handled by others during your absence"
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <Button className="w-full mt-4" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Leave Request"}
        </Button>
      </div>
    );
  };

  return (
    <div className="container flex justify-center p-3">
      <div className="text-xs">
        <BackButton />
      </div>
      <form className="w-1/2" onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="mb-3"></div>
          <h1 className="text-xl sm:text-xl md:text-xl lg:text-2xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create HR Request Ticket
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-bold text-black">
            Please fill out the form below
          </p>
        </div>
        <Label
          htmlFor="attachment"
          className="text-sm font-bold flex items-center mt-2"
        >
          <Paperclip className="mr-2" size={20} />
          Attach File (Optional)
        </Label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          onChange={handleFileUpload}
          className="mt-1"
        />
        <Label htmlFor="name" className="text-sm font-bold">
          <p>Name</p>
        </Label>
        <Input
          name="name"
          placeholder="Name"
          type="text"
          required
          className="!mb-2"
          value={form.name}
          readOnly
        />
        <Label htmlFor="email" className="text-sm font-bold">
          Email
        </Label>
        <Input
          name="email"
          placeholder="Email"
          type="email"
          required
          className="!mb-2"
          value={form.email}
          readOnly
        />
        <Label htmlFor="category" className="text-sm font-bold">
          Category
        </Label>
        <Select onValueChange={handleCategoryChange} required>
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map((category: any) => (
                <SelectItem key={category.category} value={category.category}>
                  {category.category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {form.category !== "Leave Request" && (
          <>
            {form.category === "Certificate of Employment" && (
              <>
                <Label htmlFor="purpose" className="text-sm font-bold">
                  Purpose *
                </Label>
                <Input
                  name="purpose"
                  placeholder="Purpose for requesting Certificate of Employment"
                  type="text"
                  required
                  className="!mb-2"
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </>
            )}
            <Label htmlFor="description" className="text-sm font-bold">
              Description of the request
            </Label>
            <Textarea
              className="h-36"
              name="description"
              placeholder="Description"
              required
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <Button
              className="w-full mt-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
            </Button>
          </>
        )}

        {form.category === "Leave Request" && (
          <div>{renderLeaveRequestContent()}</div>
        )}
      </form>
    </div>
  );
};

export default Request;
