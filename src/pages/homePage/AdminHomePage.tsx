import { ExportDatas } from "@/API/endpoint";
import Sidebar from "@/components/ui/Sidebar";
import Chart from "@/components/ui/charts";
import { useEffect, useState } from "react";

const AdminHome = () => {
  //   const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ExportDatas.getAllTicket();
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#eef4ff] to-white">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <header className="bg-white shadow-sm"></header>

        <main className="container mx-auto px-4 py-8">
          <section className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
              Welcome to Admin Dashboard
            </h2>
            <p className="text-2xl font-bold mt-2 text-gray-700">
              Please select an option
            </p>
          </section>

          <div className="">
            {/* {cards.map((card, index) => (
              <Card
                key={index}
                 className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff]  "
                onClick={() => navigate(card.path)}
              >
                <img src={card.image} alt={card.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="font-bold text-lg text-gray-800">{card.title}</p>
                </div>
              </Card>
            ))} */}
            <Chart tickets={tickets} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;
