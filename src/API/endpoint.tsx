/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
 

export const baseURL = import.meta.env.VITE_BASE_URL;

const apiHelper = async (endpoint: string, method: string, body?: object) => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userLogin.token}`,
  };

  try {
    const response = await axios({
      method: method,
      url: `${baseURL}${endpoint}`,
      headers: headers,
      data: body,
    });

    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};

export const TicketAPi = {
  createTicket: (body: object) => apiHelper("/api/tickets/", "POST", body),
  getAllTicket: () => apiHelper("/api/tickets/", "GET"),
  getIndividualTicket: (id: any) => apiHelper(`/api/tickets/${id}`, "GET"),
  getNotes: (id: any) => apiHelper(`/api/tickets/${id}/notes`, "GET"),
  createNote: (id: any, body: object) =>
    apiHelper(`/api/tickets/${id}/notes`, "POST", body),

  // admin routes
  getAllRaisedTickets: () => apiHelper("/api/tickets/viewAll", "GET"),
  getAllOpenTickets: () => apiHelper("/api/tickets/viewOpen", "GET"),
  getAllClosedTickets: () => apiHelper("/api/tickets/viewClosed", "GET"),
  updateTicket: (id: any, body: object) =>
    apiHelper(`/api/tickets/${id}`, "PUT", body),
  deleteTicket: (id: any, body: object) =>
    apiHelper(`/api/tickets/${id}`, "DELETE", body),

  // MEMO
  createMemo : (body: object) => apiHelper("/api/memos/create", "POST", body),
  getAllMemo : () => apiHelper("/api/memos/", "GET"),
  getIndividualMemo : (id: any) => apiHelper(`/api/memos/${id}`, "GET"),
  acknowledgement : (id: any) => apiHelper(`/api/memos/${id}/acknowledged`, "PUT"),
};

export const Category = {
  CreateCategory: (body: object) => apiHelper("/api/categories/", "POST", body),
  getCategory: () => apiHelper("/api/categories/", "GET"),
  updateCategory: (id: any, body: object) =>
    apiHelper(`/api/categories/${id}`, "PUT", body),
  DeleteCatergory: (id: any) =>
    apiHelper(`/api/categories/${id}`, "DELETE")
}

export const Assigns = {
  CreateAssign: (body: object) => apiHelper("/api/assigns/", "POST", body),
  getAssign: () => apiHelper("/api/assigns/", "GET"),
  updateAssign: (id: any, body: object) =>
    apiHelper(`/api/assigns/${id}`, "PUT", body),
  DeleteAssign: (id: any) =>
    apiHelper(`/api/assigns/${id}`, "DELETE")
}