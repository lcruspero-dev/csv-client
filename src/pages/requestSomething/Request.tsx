/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, TicketAPi } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    department: "HR",
  });
  const [categories, setCatergories] = useState([]);
  const [isLeaveFormOpened, setIsLeaveFormOpened] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
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
    setIsLeaveFormOpened(false);
    setIsConfirmed(false);
  };

  const openLeaveForm = () => {
    window.open(
      "https://forms.clickup.com/9011215196/f/8chreuw-4371/UA7PRKOIVL9H5J9MHQ",
      "_blank"
    );
    setIsLeaveFormOpened(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (form.category === "Leave Request" && !isConfirmed) {
      toast({
        title: "Error",
        description: "Please confirm that you have submitted the ClickUp form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await TicketAPi.createTicket({
        ...form,
        description:
          form.category === "Leave Request"
            ? "[Automated Message] Leave request has been submitted via ClickUp form."
            : form.category === "Certificate of Employment"
            ? `Purpose: ${form.purpose}\nDetails: ${form.description}`
            : form.description,
      });

      toast({
        title: "Success",
        description: "Ticket created successfully",
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
      setCatergories(response.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const renderLeaveRequestContent = () => {
    if (!isLeaveFormOpened) {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-blue-800 mb-3">
            Guidelines for Filing Planned Leave
          </h2>

          <section>
            <h3 className="font-semibold text-blue-700 mb-2">
              Submission Process
            </h3>
            <ul className="list-disc list-inside text-blue-600">
              <li>Submit your leave request via the ClickUp Leave Form</li>
              <li>
                Select your Team Manager as the Immediate Head when completing
                the form
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-blue-700 mb-2">
              Submission Timeline
            </h3>
            <ul className="list-disc list-inside text-blue-600">
              <li>
                Vacation Leave (VL) must be filed at least 14 calendar days in
                advance
              </li>
              <li>
                Emergency Leave (EL) must be communicated to your Team Leader
                immediately, with the leave request filed within 24 hours of
                your absence
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-blue-700 mb-2">
              Required Documentation
            </h3>
            <ul className="list-disc list-inside text-blue-600">
              <li>
                Documentation must be submitted along with the leave form (e.g.,
                Medical Certificate for SL, proof of emergency for EL)
              </li>
              <li>
                Leave requests without proper documentation will not be approved
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-blue-700 mb-2">
              Approval Process
            </h3>
            <ul className="list-disc list-inside text-blue-600">
              <li>
                All leave requests are subject to approval by your Immediate
                Head and HR
              </li>
              <li>
                Do not finalize any personal arrangements until you receive
                confirmation
              </li>
            </ul>
          </section>

          <Button type="button" className="w-full mt-4" onClick={openLeaveForm}>
            Open Leave Form
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="confirmation"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
          />
          <Label
            htmlFor="confirmation"
            className="text-sm text-blue-800 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I confirm that I have completed and submitted the ClickUp leave form
          </Label>
        </div>

        <Button
          className="w-full mt-4"
          type="submit"
          disabled={isSubmitting || !isConfirmed}
        >
          {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
        </Button>
      </div>
    );
  };

  return (
    <div className="container flex justify-center p-3">
      <BackButton />
      <form className="mt-5 w-1/2" onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="mb-3"></div>
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create HR Request Ticket
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Please fill out the form below
          </p>
        </div>
        <Label
          htmlFor="attachment"
          className="text-base font-bold flex items-center mt-2"
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
        <Label htmlFor="name" className="text-base font-bold">
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
        <Label htmlFor="email" className="text-base font-bold">
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
        <Label htmlFor="category" className="text-base font-bold">
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
                <Label htmlFor="purpose" className="text-base font-bold">
                  Purpose
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
            <Label htmlFor="description" className="text-base font-bold">
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            {renderLeaveRequestContent()}
          </div>
        )}
      </form>
    </div>
  );
};

export default Request;
