import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPanel.css";

function AdminPanel() {

  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [managers, setManagers] = useState([]);

  const [newManager, setNewManager] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  // 🔐 Protect Admin Route
  useEffect(() => {

    const role = localStorage.getItem("role");

    if (role !== "admin") {
      navigate("/");
      return;
    }

    fetchTickets();
    fetchManagers();

  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/admin/all-tickets");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/admin/managers");
      setManagers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const assignTicket = async (ticket_id, managerEmail) => {

    if (!managerEmail) return;

    try {

      await axios.post("http://127.0.0.1:5000/admin/assign-ticket", {
        ticket_id: ticket_id,
        assigned_to: managerEmail,
        assigned_role: "manager"
      });

      fetchTickets();

    } catch (err) {
      console.error(err);
    }
  };

  const updateTicket = async (ticket_id, status) => {

    const response = prompt("Enter admin response:");

    try {

      await axios.put(`http://127.0.0.1:5000/admin/update-ticket/${ticket_id}`, {
        status: status,
        admin_response: response
      });

      fetchTickets();

    } catch (err) {
      console.error(err);
    }
  };

  const createManager = async (e) => {

    e.preventDefault();

    try {

      await axios.post("http://127.0.0.1:5000/admin/create-manager", newManager);

      alert("Manager created successfully");

      setNewManager({
        fullName: "",
        email: "",
        password: ""
      });

      fetchManagers();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-container">

      <h1>Admin Panel</h1>

      {/* CREATE MANAGER */}

      <div className="manager-form">

        <h2>Create Manager</h2>

        <form onSubmit={createManager}>

          <input
            placeholder="Full Name"
            value={newManager.fullName}
            onChange={(e) =>
              setNewManager({ ...newManager, fullName: e.target.value })
            }
            required
          />

          <input
            placeholder="Email"
            value={newManager.email}
            onChange={(e) =>
              setNewManager({ ...newManager, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={newManager.password}
            onChange={(e) =>
              setNewManager({ ...newManager, password: e.target.value })
            }
            required
          />

          <button type="submit">Create Manager</button>

        </form>

      </div>

      {/* TICKETS */}

      <h2>All Support Tickets</h2>

      <table className="ticket-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Subject</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Manager Notes</th>
            <th>Assign</th>
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
              <td>{ticket.assigned_to || "Unassigned"}</td>
              <td>{ticket.manager_response || "No notes yet"}</td>

              <td>

                <select
                  defaultValue=""
                  onChange={(e) =>
                    assignTicket(ticket.ticket_id, e.target.value)
                  }
                >

                  <option value="">Assign</option>

                  {managers.map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.fullName}
                    </option>
                  ))}

                </select>

              </td>

              <td>

                <button
                  onClick={() =>
                    updateTicket(ticket.ticket_id, "Resolved")
                  }
                >
                  Resolve
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AdminPanel;