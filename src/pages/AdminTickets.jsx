import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/tickets");
    setTickets(res.data);
  };

  const updateTicket = async (id) => {
    const status = prompt("Enter Status (Open/In Progress/Resolved):");
    const admin_response = prompt("Enter Response:");

    await axios.put(`http://localhost:5000/api/admin/tickets/${id}`, {
      status,
      admin_response
    });

    fetchTickets();
  };

  return (
    <div className="container text-white mt-5">
      <h2 className="text-warning">Admin Ticket Dashboard</h2>

      {tickets.map((ticket, index) => (
        <div key={index} className="card bg-dark p-3 mb-2">
          <p><b>ID:</b> {ticket.ticket_id}</p>
          <p><b>Email:</b> {ticket.user_email}</p>
          <p><b>Issue:</b> {ticket.description}</p>
          <p><b>Status:</b> {ticket.status}</p>

          <button className="btn btn-warning"
            onClick={() => updateTicket(ticket.ticket_id)}>
            Update
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminTickets;