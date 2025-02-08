import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string, date: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [date, setDate] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleSave = () => {
    if (!date) {
      setError(true);
      return;
    }

    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL("image/png");
      onSave(dataUrl, date);
      onClose();
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>
        <div className="border p-2 bg-white">
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{ width: 375, height: 150, className: "border" }}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Input
              type="date"
              value={date}
              onChange={handleDateChange}
              required
              className={`w-full ${error ? "border-red-500" : ""}`}
            />
            {error && (
              <p className="text-sm text-red-500">Please select a date</p>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="destructive" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
