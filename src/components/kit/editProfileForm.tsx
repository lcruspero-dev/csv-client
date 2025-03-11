import { UserProfileAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Camera, Upload, User } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  streetAddress: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipCode: string;
  personalEmail: string;
  contactNumber: string;
  dateOfBirth: string;
  emergencyContactPerson: string;
  emergencyContactNumber: string;
  relationship: string;
  civilStatus: string;
  gender: string;
  pagibigNo: string;
  philhealthNo: string;
  sssNo: string;
  tinNo: string;
}

interface EditProfileFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData?: any;
  onCancel?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave?: (updatedData: any) => void;
}

export default function EditProfileForm({
  userData,
  onCancel,
  onSave,
}: EditProfileFormProps) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(
    userData?.dateOfBirth ? new Date(userData.dateOfBirth) : null
  );

  const handleBirthdateChange = (date: Date | null) => {
    setBirthdate(date);
    if (date) {
      form.setValue("dateOfBirth", date.toISOString().split("T")[0]);
    } else {
      form.setValue("dateOfBirth", "");
    }
  };

  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: userData?.firstName ?? "",
      lastName: userData?.lastName ?? "",
      middleName: userData?.middleName ?? "",
      streetAddress: userData?.streetAddress ?? "",
      barangay: userData?.barangay ?? "",
      cityMunicipality: userData?.cityMunicipality ?? "",
      province: userData?.province ?? "",
      zipCode: userData?.zipCode ?? "",
      personalEmail: userData?.personalEmail ?? "",
      contactNumber: userData?.contactNumber ?? "",
      dateOfBirth: userData?.dateOfBirth ?? "",
      emergencyContactPerson: userData?.emergencyContactPerson ?? "",
      emergencyContactNumber: userData?.emergencyContactNumber ?? "",
      relationship: userData?.relationship ?? "",
      civilStatus: userData?.civilStatus?.toLowerCase() ?? "",
      gender: userData?.gender?.toLowerCase() ?? "",
      pagibigNo: userData?.pagibigNo ?? "",
      philhealthNo: userData?.philhealthNo ?? "",
      sssNo: userData?.sssNo ?? "",
      tinNo: userData?.tinNo ?? "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      console.log("Submitting data:", data);
      console.log("Avatar:", avatar);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const response = await UserProfileAPI.createProfile(formData);
      console.log("Profile created successfully:", response.data);

      if (onSave) onSave(response.data);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* Avatar Upload Section */}
      <Card className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3">
          <CardTitle className="text-sm font-bold">Profile Photo</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            Update your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 flex flex-col items-center justify-center">
          <div className="mb-3 flex flex-col items-center space-y-2">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </label>
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="text-center">
              <h3 className="font-medium text-gray-800 text-sm mb-1">
                {form.watch("firstName") || "Your"}{" "}
                {form.watch("lastName") || "Profile"}
              </h3>
              <p className="text-gray-500 text-sm">
                {form.watch("personalEmail") || "Upload a professional photo"}
              </p>
            </div>

            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100 transition-colors h-10"
            >
              <Upload className="h-3 w-3" />
              Upload New Photo
            </label>
          </div>

          <div className="w-full mt-2 space-y-1">
            <h4 className="font-medium text-gray-700 text-sm">
              Photo Guidelines:
            </h4>
            <ul className="text-sm text-gray-600 space-y-0">
              <li className="flex items-start gap-1">
                <span className="block w-1 h-1 mt-1 rounded-full bg-blue-600"></span>
                Professional appearance
              </li>
              <li className="flex items-start gap-1">
                <span className="block w-1 h-1 mt-1 rounded-full bg-blue-600"></span>
                Clear face visibility
              </li>
              <li className="flex items-start gap-1">
                <span className="block w-1 h-1 mt-1 rounded-full bg-blue-600"></span>
                Neutral background
              </li>
              <li className="flex items-start gap-1">
                <span className="block w-1 h-1 mt-1 rounded-full bg-blue-600"></span>
                Square format recommended
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="w-full md:w-2/3 lg:w-3/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3">
          <CardTitle className="text-sm font-bold">Edit Profile</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            Update your personal information and documents
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-3">
              <div className="space-y-4">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      01
                    </span>
                    Personal Information
                  </h3>
                  <Separator className="mb-2" />
                  <div className="space-y-2">
                    {/* Basic Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              First Name<span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="First Name"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Last Name<span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Last Name"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Middle Name
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Middle Name"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={() => (
                          <FormItem className="space-y-1 mt-6">
                            <FormLabel className="text-sm ml-2 mr-4">
                              Date of Birth
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <DatePicker
                                selected={birthdate}
                                onChange={handleBirthdateChange}
                                dateFormat="MM/dd/yyyy"
                                placeholderText="mm/dd/yyyy"
                                className="rounded-md h-10 text-sm py-2 border border-gray-300 px-3"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Gender <span className="text-red-500"> *</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-md h-10 text-sm">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="civilStatus"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Civil Status{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-md h-10 text-sm">
                                  <SelectValue placeholder="Select civil status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="divorced">
                                  Divorced
                                </SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="personalEmail"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Personal Email{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Contact Number{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Contact Number"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="streetAddress"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Street Address{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="House/Building Number, Street"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="barangay"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Barangay <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Barangay"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="cityMunicipality"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              City/Municipality{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City/Municipality"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Province <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Province"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm">
                            ZIP Code <span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ZIP Code"
                              {...field}
                              className="rounded-md h-10 text-sm py-2 w-1/2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Government Benefits Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      02
                    </span>
                    Government Benefits
                  </h3>
                  <Separator className="mb-2" />
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="pagibigNo"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              PAGIBIG No.{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="PAGIBIG Number"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="philhealthNo"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              PhilHealth No.{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="PhilHealth Number"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="sssNo"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              SSS No. <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="SSS Number"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tinNo"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              TIN No.<span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="TIN Number"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      03
                    </span>
                    Emergency Contact
                  </h3>
                  <Separator className="mb-2" />
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="emergencyContactPerson"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm">
                            Emergency Contact Person{" "}
                            <span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Emergency Contact Person"
                              {...field}
                              className="rounded-md h-10 text-sm py-2 w-1/2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="emergencyContactNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Emergency Contact Number{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Emergency Contact Number"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="relationship"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm">
                              Relationship{" "}
                              <span className="text-red-500"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Relationship"
                                {...field}
                                className="rounded-md h-10 text-sm py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-3 py-2 bg-gray-50 flex justify-end space-x-2 mr-4 my-8">
              <Button
                type="button"
                variant="destructive"
                onClick={onCancel}
                className="rounded-md text-sm h-10 py-2 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-md text-sm h-10 py-2 px-4"
              >
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
