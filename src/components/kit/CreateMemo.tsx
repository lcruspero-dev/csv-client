import { Button } from "@/components/ui/button";
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
import { Textarea } from "../ui/textarea";

const CreateMemo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Compose</Button>
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
          />
          <Textarea
            className="h-60"
            name="description"
            placeholder="Details"
            required
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="mr-10 px-10">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemo;
