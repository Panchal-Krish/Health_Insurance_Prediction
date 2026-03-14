import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ManagerDashboard.css";

function ManagerDashboard() {

  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [tickets, setTickets] = useState([]);

  useEffect(() => {

    const role = localStorage.getItem("role");

    if (role !== "manager") {
      navigate("/");
      return;
    }

    fetchTickets();

  }, []);

  const fetchTickets = async () => {

    try {

      const res = await axios.get(
        `http://127.0.0.1:5000/manager/my-tickets/${email}`
      );

      setTickets(res.data);

    } catch (err) {
      console.error(err);
    }

  };

  const updateTicket = async (ticket_id, status) => {

    const response = prompt("Enter manager notes:");

    try {

      await axios.put(
        `http://127.0.0.1:5000/manager/update-ticket/${ticket_id}`,
        {
          status: status,
          manager_response: response
        }
      );

      fetchTickets();

    } catch (err) {
      console.error(err);
    }

  };

  return (

    <div className="manager-container">

      <h1>Manager Dashboard</h1>

      <table className="ticket-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Subject</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>

        <tbody>

          {tickets.map((ticket) => (

            <tr key={ticket.ticket_id}>

              <td>{ticket.ticket_id}</td>
              <td>{ticket.email}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.priority}</td>
              <td>{ticket.status}</td>

              <td>

                <button
                  onClick={() =>
                    updateTicket(ticket.ticket_id, "In Progress")
                  }
                >
                  Start Work
                </button>

                <button
                  onClick={() =>
                    updateTicket(ticket.ticket_id, "Waiting Admin")
                  }
                >
                  Send to Admin
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}

export default ManagerDashboard;