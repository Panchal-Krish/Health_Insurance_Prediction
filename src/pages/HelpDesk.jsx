import React, { useState, useEffect } from "react";
import axios from "axios";
import "./../styles/HelpDesk.css";

function HelpDesk() {
  const email = localStorage.getItem("userEmail");

  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "Model Issue",
    priority: "Medium"
  });

  const [tickets, setTickets] = useState([]);
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    if (email) {
      fetchTickets();
    }
  }, [email]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitTicket = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://127.0.0.1:5000/create-ticket", {
        ...form,
        email: email
      });

      alert("Ticket Submitted Successfully!");
      fetchTickets();

      setForm({
        subject: "",
        description: "",
        category: "Model Issue",
        priority: "Medium"
      });

    } catch (error) {
      console.error(error);
      alert("Error submitting ticket");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/my-tickets/${email}`
      );
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTicket = (id) => {
    setExpandedTicket(expandedTicket === id ? null : id);
  };

  return (
    <div className="helpdesk-container">
      <h1 className="page-title">Help Desk</h1>

      {/* Ticket Form */}
      <div className="ticket-form-card">
        <h3>Create Support Ticket</h3>

        <form onSubmit={submitTicket}>
          <div className="form-row">
            <input
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              required
            />

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <textarea
            name="description"
            placeholder="Describe your issue..."
            value={form.description}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option>Model Issue</option>
              <option>Prediction Error</option>
              <option>Technical Problem</option>
              <option>Account Problem</option>
            </select>

            <button type="submit" className="primary-btn">
              Submit Ticket
            </button>
          </div>
        </form>
      </div>

      {/* Tickets Section */}
      <h2 className="section-title">My Tickets</h2>

      <div className="tickets-grid">
        {tickets.length === 0 ? (
          <p className="no-ticket">No tickets submitted yet.</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              className="ticket-card"
              onClick={() => toggleTicket(ticket.ticket_id)}
            >
              <div className="ticket-header">
                <div>
                  <div className="ticket-id">{ticket.ticket_id}</div>
                  <div className="ticket-subject">{ticket.subject}</div>
                </div>

                <span
                  className={`status-badge ${ticket.status.toLowerCase()}`}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="priority">
                Priority: <span>{ticket.priority}</span>
              </p>

              {/* Expandable Section */}
              {expandedTicket === ticket.ticket_id && (
                <div className="ticket-details">
                  <div>
                    <strong>Category:</strong> {ticket.category}
                  </div>

                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>

                  <div className="ticket-description">
                    <strong>Description:</strong>
                    <p>{ticket.description}</p>
                  </div>

                  <div className="admin-response">
                    <strong>Admin Response:</strong>
                    <p>
                      {ticket.admin_response || "Waiting for response..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HelpDesk;