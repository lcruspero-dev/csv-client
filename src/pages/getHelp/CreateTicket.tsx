import { TicketAPi } from "@/API/endpoint";
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
import { Paperclip } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/kit/BackButton";

const CreateTicket = () => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);
  const [form, setForm] = useState({
    name: `${userLogin.name}`,
    email: `${userLogin.email}`,
    category: "",
    description: "",
    attachment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, attachment: e.target.files[0] });
    }
  };

  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (const key in form) {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      }

      const response = await TicketAPi.createTicket(formData);
      console.log(response.data);
      toast({
        title: "Success",
        description: "Ticket created successfully",
        variant: "default",
      });
      navigate("/view-ticket");
    } catch (error) {
      toast({ title: "Failed to create ticket" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex justify-center p-3">
      <BackButton />
      <form className="mt-5 w-1/2" onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="mb-3"></div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold py-1 sm:py-2 md:py-3 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create IT Support Ticket
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black">
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
          onChange={handleFileChange}
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
              <SelectItem value="General IT Support">
                General IT Support
              </SelectItem>
              <SelectItem value="Hardware Issue">Hardware Issue</SelectItem>
              <SelectItem value="Software Issue">Software Issue</SelectItem>
              <SelectItem value="Network & Connectivity">
                Network & Connectivity
              </SelectItem>
              <SelectItem value="Account & Access Management">
                Account & Access Management
              </SelectItem>
              <SelectItem value="Email & Communication">
                Email & Communication
              </SelectItem>
              <SelectItem value="Project & Change Management">
                Project & Change Management
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Label htmlFor="description" className="text-base font-bold">
          Description of the issue / request
        </Label>
        <Textarea
          className="h-36"
          name="description"
          placeholder="Description"
          required
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <Button className="w-full mt-4" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
        </Button>
      </form>
    </div>
  );
};

export default CreateTicket;
