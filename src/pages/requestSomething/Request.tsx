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

const Request = () => {
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
            Create HR Request Ticket
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black">
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
              <SelectItem value="Request for Documents">
                Request for Documents
              </SelectItem>
              <SelectItem value="Request for Meeting">
                Request for Meeting
              </SelectItem>
              <SelectItem value="Certificate of Employment">
                Certificate of Employment
              </SelectItem>
              <SelectItem value="Onboarding Request">
                Onboarding Request
              </SelectItem>
              <SelectItem value="Employee Benefits">
                Employee Benefits
              </SelectItem>
              <SelectItem value="Payroll">Payroll</SelectItem>
              <SelectItem value="Loan Request">Loan Request</SelectItem>
              <SelectItem value="Leave Request">Leave Request</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
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
        <Button className="w-full mt-2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
        </Button>
      </form>
    </div>
  );
};

export default Request;
