import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, User } from "lucide-react";

interface ViewProfileProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData?: any; // Make it optional to prevent errors
  onEdit: () => void;
}

interface UserType {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="py-1">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value?.trim() || "—"}</p>
  </div>
);

// Utility function to format date as mm/dd/yyyy
const formatDate = (dateString?: string): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—"; // Handle invalid dates
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth?: string): string => {
  if (!dateOfBirth) return "—";
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return "—"; // Handle invalid dates
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age.toString();
};

export default function ViewProfile({
  userData = {},
  onEdit,
}: ViewProfileProps) {
  const storedUser = localStorage.getItem("user");
  const user: UserType | null = storedUser ? JSON.parse(storedUser) : null;

  // Format date of birth and compute age
  const formattedDateOfBirth = formatDate(userData?.dateOfBirth);
  const computedAge = calculateAge(userData?.dateOfBirth);

  // Construct the avatar URL if it exists
  const avatarUrl = userData?.avatar
    ? `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${userData.avatar}`
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* Profile Photo Card */}
      <Card className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3">
          <CardTitle className="text-sm font-bold">Profile Picture</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            Your professional picture
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 flex flex-col items-center justify-center">
          <div className="absolute left-8 top-24 text-xs mt-3">
            <BackButton />
          </div>
          <div className="mb-3 flex flex-col items-center space-y-2">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="text-center">
              <h3 className="font-medium text-gray-800 text-sm mb-1">
                {userData?.firstName || "—"} {userData?.lastName || "—"}
              </h3>
              <p className="text-gray-500 text-sm">{user?.email || "—"}</p>
            </div>

            <Button
              onClick={onEdit}
              className="inline-flex items-center gap-2 mt-2 text-sm py-2 px-4 h-10"
            >
              <Edit className="h-3 w-3" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Card */}
      <Card className="w-full md:w-2/3 lg:w-3/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3">
          <CardTitle className="text-sm font-bold">My Profile</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            Your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-4">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-sm font-bold flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm text-bold">
                  01
                </span>
                Personal Information
              </h3>
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0 text-sm">
                <InfoItem label="First Name" value={userData?.firstName} />
                <InfoItem label="Last Name" value={userData?.lastName} />
                <InfoItem label="Middle Name" value={userData?.middleName} />
                <InfoItem label="Gender" value={userData?.gender} />
                <InfoItem label="Date of Birth" value={formattedDateOfBirth} />
                <InfoItem label="Age" value={computedAge} />
                <InfoItem label="Civil Status" value={userData?.civilStatus} />
                <InfoItem
                  label="Personal Email"
                  value={userData?.personalEmail}
                />
                <InfoItem
                  label="Contact Number"
                  value={userData?.contactNumber}
                />
                <InfoItem
                  label="Street Address"
                  value={userData?.streetAddress}
                />
                <InfoItem label="Barangay" value={userData?.barangay} />
                <InfoItem
                  label="City/Municipality"
                  value={userData?.cityMunicipality}
                />
                <InfoItem label="Province" value={userData?.province} />
                <InfoItem label="ZIP Code" value={userData?.zipCode} />
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
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0">
                <InfoItem label="PAGIBIG No." value={userData?.pagibigNo} />
                <InfoItem
                  label="PhilHealth No."
                  value={userData?.philhealthNo}
                />
                <InfoItem label="SSS No." value={userData?.sssNo} />
                <InfoItem label="TIN No." value={userData?.tinNo} />
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
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0">
                <InfoItem
                  label="Emergency Contact Person"
                  value={userData?.emergencyContactPerson}
                />
                <InfoItem label="Relationship" value={userData?.relationship} />
                <InfoItem
                  label="Emergency Contact Number"
                  value={userData?.emergencyContactNumber}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
