import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader, AlertCircle, CheckCircle,
  Briefcase, Ticket, RefreshCw, X, Clock
} from "lucide-react";
import { getToken, fetchWithAuth, getCurrentUser } from "../utils/auth";
import "../styles/ManagerDashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManagerDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Ticket update
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [managerResponse, setManagerResponse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Open");
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    // Check authentication and role
    const token = getToken();

    if (!token || user.role !== "manager") {
      navigate("/signin");
      return;
    }

    fetchTickets();
  }, [navigate, user.role]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      const email = storage.getItem('userEmail');

      if (!email) {
        throw new Error("User email not found");
      }

      const response = await fetchWithAuth(
        `${API_URL}/manager/my-tickets/${email}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Unable to load your tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openResponseModal = (ticket) => {
    setCurrentTicket(ticket);
    setSelectedStatus(ticket.status);
    setManagerResponse(ticket.manager_response || "");
    setShowResponseModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setCurrentTicket(null);
    setManagerResponse("");
    setSelectedStatus("Open");
  };

  const updateTicket = async (e) => {
    e.preventDefault();

    if (!currentTicket) return;

    if (managerResponse.trim().length < 10) {
      setError("Response must be at least 10 characters long");
      return;
    }

    setUpdatingTicket(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${API_URL}/manager/update-ticket/${currentTicket.ticket_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: selectedStatus,
            manager_response: managerResponse.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }

      showSuccess("Ticket updated successfully");
      closeResponseModal();
      fetchTickets();
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket");
    } finally {
      setUpdatingTicket(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
    const priorityMatch = priorityFilter === "All" || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Get unique statuses and priorities
  const statuses = ["All", ...new Set(tickets.map(t => t.status))];
  const priorities = ["All", ...new Set(tickets.map(t => t.priority))];

  // Stats
  const openTickets = tickets.filter(t => t.status === "Open").length;
  const inProgressTickets = tickets.filter(t => t.status === "In Progress").length;
  const resolvedTickets = tickets.filter(t =>
    t.status.toLowerCase().includes("resolved") || t.status.toLowerCase().includes("closed")
  ).length;

  if (loading && tickets.length === 0) {
    return (
      <div className="manager-container">
        <div className="loading-state">
          <Loader className="spinner-large" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      {/* Header */}
      <div className="manager-header">
        <div className="header-left">
          <Briefcase className="header-icon" />
          <div>
            <h1>Manager Dashboard</h1>
            <p className="header-subtitle">Manage your assigned tickets</p>
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={fetchTickets}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <CheckCircle className="success-icon" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-btn">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <Ticket className="stat-icon" />
          <div className="stat-info">
            <div className="stat-value">{tickets.length}</div>
            <div className="stat-label">Total Assigned</div>
          </div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon pending" />
          <div className="stat-info">
            <div className="stat-value">{openTickets}</div>
            <div className="stat-label">Open</div>
          </div>
        </div>
        <div className="stat-card">
          <RefreshCw className="stat-icon progress" />
          <div className="stat-info">
            <div className="stat-value">{inProgressTickets}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon success" />
          <div className="stat-info">
            <div className="stat-value">{resolvedTickets}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="section-header">
        <h2>My Assigned Tickets ({filteredTickets.length})</h2>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {tickets.length === 0 ? (
        <div className="empty-state">
          <Ticket className="empty-icon" />
          <h3>No Tickets Assigned Yet</h3>
          <p>You don't have any tickets assigned to you at the moment.</p>
          <p className="empty-subtitle">
            Check back later or contact your admin if you think this is an error.
          </p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="empty-state">
          <Ticket className="empty-icon" />
          <h3>No Matching Tickets</h3>
          <p>No tickets match your current filters.</p>
        </div>
      ) : (
        /* Tickets Table */
        <div className="table-container">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.ticket_id}>
                  <td className="ticket-id-cell">{ticket.ticket_id}</td>
                  <td>{ticket.email}</td>
                  <td className="subject-cell">{ticket.subject}</td>
                  <td>
                    <span className="category-badge">
                      {ticket.category}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn start"
                      onClick={() => {
                        setCurrentTicket(ticket);
                        setSelectedStatus("In Progress");
                        setManagerResponse(ticket.manager_response || "");
                        setShowResponseModal(true);
                      }}
                      disabled={ticket.status === "Resolved" || ticket.status === "Closed"}
                    >
                      {ticket.status === "Open" ? "Start Work" : "Update"}
                    </button>
                    <button
                      className="action-btn resolve"
                      onClick={() => {
                        setCurrentTicket(ticket);
                        setSelectedStatus("Resolved");
                        setManagerResponse(ticket.manager_response || "");
                        setShowResponseModal(true);
                      }}
                      disabled={ticket.status === "Resolved" || ticket.status === "Closed"}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Ticket Modal */}
      {showResponseModal && currentTicket && (
        <div className="modal-overlay" onClick={closeResponseModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Ticket: {currentTicket.ticket_id}</h3>
              <button onClick={closeResponseModal} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="ticket-info-box">
              <p><strong>User:</strong> {currentTicket.email}</p>
              <p><strong>Subject:</strong> {currentTicket.subject}</p>
              <p><strong>Category:</strong> {currentTicket.category}</p>
              <p><strong>Priority:</strong> {currentTicket.priority}</p>
              <p><strong>Description:</strong></p>
              <p className="ticket-description">{currentTicket.description}</p>
              {currentTicket.admin_response && (
                <>
                  <p><strong>Admin Note:</strong></p>
                  <p className="admin-note">{currentTicket.admin_response}</p>
                </>
              )}
            </div>
            <form onSubmit={updateTicket}>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={updatingTicket}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting Admin">Escalate to Admin</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label>Your Response *</label>
                <textarea
                  placeholder="Enter your response or notes for the user..."
                  value={managerResponse}
                  onChange={(e) => setManagerResponse(e.target.value)}
                  disabled={updatingTicket}
                  rows={6}
                  required
                  minLength={10}
                />
                <small className="char-count">
                  {managerResponse.length} characters
                </small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeResponseModal}
                  disabled={updatingTicket}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={updatingTicket}
                >
                  {updatingTicket ? (
                    <>
                      <Loader className="spinner" />
                      Updating...
                    </>
                  ) : (
                    "Update Ticket"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;