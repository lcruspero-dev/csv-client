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
    file: null,
    department: "HR",
  });
  const [categories, setCatergories] = useState([]);

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
      console.log("Upload response:", response.data);
      const newFilename = response.data.filename;
      setForm((prevForm) => ({ ...prevForm, file: newFilename })); // Update form state
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      if (form.category === "Leave Request") {
        // Redirect to Leave Request form
        window.open(
          "https://forms.clickup.com/9011215196/f/8chreuw-4371/UA7PRKOIVL9H5J9MHQ",
          "_blank"
        );
      } else {
        const response = await TicketAPi.createTicket(form);
        console.log(response.data);
        toast({
          title: "Success",
          description: "Ticket created successfully",
          variant: "default",
        });
        navigate("/view-ticket");
      }
    } catch (error) {
      toast({ title: "Failed to create ticket" });
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

  console.log("categories", categories);
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
          </>
        )}
        {form.category === "Leave Request" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h2 className="text-lg font-bold text-blue-800 mb-3">
              Guidelines for Filing Planned Leave
            </h2>

            <div className="space-y-4">
              <section>
                <h3 className="font-semibold text-blue-700 mb-2">
                  Submission Process
                </h3>
                <ul className="list-disc list-inside text-blue-600">
                  <li>Submit your leave request via the ClickUp Leave Form</li>
                  <li>
                    Select your Team Manager as the Immediate Head when
                    completing the form
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-blue-700 mb-2">
                  Submission Timeline
                </h3>
                <ul className="list-disc list-inside text-blue-600">
                  <li>
                    Vacation Leave (VL) must be filed at least 14 calendar days
                    in advance
                  </li>
                  <li>
                    Emergency Leave (EL) must be communicated to your Team
                    Leader immediately, with the leave request filed within 24
                    hours of your absence
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-blue-700 mb-2">
                  Required Documentation
                </h3>
                <ul className="list-disc list-inside text-blue-600">
                  <li>
                    Documentation must be submitted along with the leave form
                    (e.g., Medical Certificate for SL, proof of emergency for
                    EL)
                  </li>
                  <li>
                    Leave requests without proper documentation will not be
                    approved
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
            </div>
          </div>
        )}

        <Button className="w-full mt-2" type="submit" disabled={isSubmitting}>
          {form.category === "Leave Request"
            ? "Open Leave Form"
            : isSubmitting
            ? "Creating Ticket..."
            : "Create Ticket"}
        </Button>
      </form>
    </div>
  );
};

export default Request;
