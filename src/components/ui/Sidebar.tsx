import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
  }
const Sidebar: React.FC<SidebarProps> =({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    
    const navItems = [
      { title: "Memo", path: "/all-memo" },
      { title: "HR Support Request", path: "/request-something" },
      { title: "IT Support Request", path: "/create-ticket" },
      // { title: "View My Tickets", path: "/view-ticket" },
      { title: "Manage Tickets", path: "/all-tickets" },
      { title: "Add Category", path: "/addcategory" },
      { title: "Add Assignee", path: "/addassign" },
      { title: "Export Data", path: "/exportdata" },
    ];
  
    return (
      <>
        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <Button key={index} variant="ghost" onClick={() => navigate(item.path)}>
                  {item.title}
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
  
        {/* Desktop Sidebar */}
        <div className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'} bg-white shadow-lg`}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="self-end m-2"
            onClick={toggleSidebar}
          >
            {isOpen ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </Button>
          <nav className="flex flex-col space-y-4 p-4">
            {navItems.map((item, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                onClick={() => navigate(item.path)}
                className={`justify-start ${isOpen ? '' : 'px-2'}`}
              >
                {isOpen ? item.title : item.title[0]}
              </Button>
            ))}
          </nav>
        </div>
      </>
    );
  }; export default Sidebar;