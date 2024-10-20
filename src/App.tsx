import { Route, Routes } from "react-router-dom";
import Header from "./components/kit/Header";

import { Toaster } from "./components/ui/toaster";
import "./index.css";
import Layout from "./pages/authentication/Layout";
import Login from "./pages/authentication/Login";
import Registration from "./pages/authentication/Registration";
import ViewMemo from "./pages/memo/ViewMemo";

import ViewAllRaisedTickets from "./pages/allTicket/AdminViewAllTicket";
import ViewAllTicket from "./pages/allTicket/ViewAllTicket";
import ViewIndividualTicket from "./pages/allTicket/ViewIndividualTicket";
import CreateTicket from "./pages/getHelp/CreateTicket";
import Homepage from "./pages/homePage/Homepage";
import ViewIndividualMemo from "./pages/memo/ViewIndividualMemo";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import Request from "./pages/requestSomething/Request";
import CreateCategory from "./pages/createCategory/CreateCatergory";
import CreateAssign from "./pages/assigns/CreateAssigns";
import ExportData from "./pages/exportData/ExportData";

function App() {
  return (
    <>
      <Header />
      <div className="bg-gradient-to-b from-[#eef4ff] to-white">
        <Routes>
          {/* Public Routes */}

          <Route element={<Layout />}>
            <Route path="/sign-in" element={<Login />} />
            <Route path="/sign-up" element={<Registration />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute requiresAdmin={false} />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/view-ticket" element={<ViewAllTicket />} />
            <Route path="/request-something" element={<Request />} />
            <Route path="/ticket/:id" element={<ViewIndividualTicket />} />
            <Route path="/all-tickets" element={<ViewAllRaisedTickets />} />
            <Route path="/all-memo" element={<ViewMemo />} />
            <Route path="/memo/:id" element={<ViewIndividualMemo />} />
            <Route path="/addcategory" element={<CreateCategory />} />
            <Route path="/addassign" element={<CreateAssign />} />
            <Route path="/exportdata" element={<ExportData />} />

            {/* Admin Routes */}
            {/* <Route element={<ProtectedRoute requiresAdmin={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route> */}
          </Route>
        </Routes>
      </div>
      <Toaster />
    </>
  );
}

export default App;
