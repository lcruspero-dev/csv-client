// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// const AdminViewMemo = () => {
//   return (
//     <div className="grid w-full max-w-sm items-center gap-1.5">
//       <Label htmlFor="picture">Picture</Label>
//       <Input id="picture" type="file" />
//     </div>
//   );
// };

// export default AdminViewMemo;
/* eslint-disable @typescript-eslint/no-explicit-any */

import { TicketAPi } from "@/API/endpoint";
import CreateMemo from "@/components/kit/CreateMemo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="container flex justify-center p-3">
      <BackButton />
      <form className="mt-5 w-1/2" onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="mb-3"></div>
          <h1 className="text-5xl font-bold py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create Memo
          </h1>
          <p className="text-4xl font-bold text-black">
            Please fill out the form below
          </p>
        </div>

        <Label htmlFor="description" className="text-base font-bold">
          Memo content
        </Label>
        <Textarea
          className="h-60"
          name="description"
          placeholder="Details"
          required
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Picture</Label>
          <Input id="picture" type="file" />{" "}
        </div>
        <CreateMemo />
      </form>
    </div>
  );
};

export default Request;
