import { Button } from "@/components/ui/button";
import axios from "axios";

import { TicketAPi } from "@/API/endpoint";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import "quill/dist/quill.core.css";
import { useState } from "react";
import { Textarea } from "../../components/ui/textarea";
const CreateMemo = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [filename, setFilename] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
  };
  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple submissions

    setIsSaving(true);
    try {
      const body = {
        subject: subject,
        description: description,
        file: filename,
      };
      console.log(body);
      const response = await TicketAPi.createMemo(body);
      console.log(response.data);
      toast({ title: "Memo created " });
      setSubject("");
      setDescription("");
      setFilename("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Please add all required fields",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false); // Set loading to false regardless of success or failure
    }
  };
  console.log(filename);
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
        "http://120.28.169.95:4000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload response:", response.data);
      setFilename(response.data.filename);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Compose</Button>
      </DialogTrigger>
      <DialogContent className="w-[600px] h-[600px] max-w-none bg-[#eef4ff]">
        <DialogHeader>
          <DialogTitle className="text-2xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create Memo
          </DialogTitle>
          <DialogDescription>
            Input details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 h-full max-w-lg pl-4">
          <Label htmlFor="subject" className="text-base font-bold">
            <p>Subject</p>
          </Label>
          <Input
            name="subject"
            placeholder="subject"
            type="text"
            required
            className="!mb-2"
            value={subject}
            onChange={handleSubjectChange}
          />
          <Textarea
            className="h-60"
            name="description"
            placeholder="Details"
            required
            value={description}
            onChange={handleDescriptionChange}
          />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="picture"
              className="text-sm font-medium text-gray-700 w-1/2"
            >
              Upload file
            </Label>
            <Input
              id="picture"
              type="file"
              className="block w-1/2 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="mr-10 px-10"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemo;
