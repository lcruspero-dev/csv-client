/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/kit/BackButton";

const CreateTicket = () => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);
  const [form, setForm] = useState({
    name: `${userLogin.name}`,
    email: `${userLogin.email}`,
    category: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      const response = await TicketAPi.createTicket(form);
      console.log(response.data);
      toast({ title: "Ticket created successfully" });
      navigate("/view-ticket");
    } catch (error) {
      toast({ title: "Failed to create ticket" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex justify-center">
      <form className="mt-5 w-1/2" onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="mb-3">
            <BackButton />
          </div>
          <h1 className="text-5xl font-bold py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create IT Support Ticket
          </h1>
          <p className="text-4xl font-bold text-black">
            Please fill out the form below
          </p>
        </div>
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
          disabled
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
          disabled
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
          Description of the issue
        </Label>
        <Textarea
          name="description"
          placeholder="Description"
          required
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Button className="w-full mt-2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
        </Button>
      </form>
    </div>
  );
};

export default CreateTicket;
