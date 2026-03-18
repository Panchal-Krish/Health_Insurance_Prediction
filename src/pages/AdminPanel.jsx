import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader, AlertCircle, CheckCircle, UserPlus,
  Shield, Ticket, Users, RefreshCw, X
} from "lucide-react";
import { getToken, fetchWithAuth, getCurrentUser } from "../utils/auth";
import "../styles/AdminPanel.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AdminPanel() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Manager creation
  const [newManager, setNewManager] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [creatingManager, setCreatingManager] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);

  // Ticket update
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Open");
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    // Check authentication and role
    const token = getToken();
    const user = getCurrentUser();

    if (!token || user.role !== "admin") {
      navigate("/signin");
      return;
    }

    fetchTickets();
    fetchManagers();
  }, [navigate]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_URL}/admin/all-tickets`);

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Unable to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/managers`);

      if (!response.ok) {
        throw new Error("Failed to fetch managers");
      }

      const data = await response.json();
      setManagers(data);
    } catch (err) {
      console.error("Error fetching managers:", err);
    }
  };

  const assignTicket = async (ticket_id, managerEmail) => {
    if (!managerEmail) return;

    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/assign-ticket`,
        {
          method: "POST",
          body: JSON.stringify({
            ticket_id,
            assigned_to: managerEmail,
            assigned_role: "manager"
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign ticket");
      }

      showSuccess("Ticket assigned successfully");
      fetchTickets();
    } catch (err) {
      console.error("Error assigning ticket:", err);
      setError("Failed to assign ticket");
    }
  };

  const openResponseModal = (ticket) => {
    setCurrentTicket(ticket);
    setSelectedStatus(ticket.status);
    setAdminResponse(ticket.admin_response || "");
    setShowResponseModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setCurrentTicket(null);
    setAdminResponse("");
    setSelectedStatus("Open");
  };

  const updateTicket = async (e) => {
    e.preventDefault();

    if (!currentTicket) return;

    if (adminResponse.trim().length < 10) {
      setError("Response must be at least 10 characters long");
      return;
    }

    setUpdatingTicket(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/update-ticket/${currentTicket.ticket_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: selectedStatus,
            admin_response: adminResponse.trim()
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

  const createManager = async (e) => {
    e.preventDefault();

    // Validation
    if (newManager.fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters");
      return;
    }

    if (newManager.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setCreatingManager(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/create-manager`,
        {
          method: "POST",
          body: JSON.stringify({
            fullName: newManager.fullName.trim(),
            email: newManager.email.trim().toLowerCase(),
            password: newManager.password
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create manager");
      }

      showSuccess("Manager created successfully");
      setNewManager({ fullName: "", email: "", password: "" });
      setShowManagerModal(false);
      fetchManagers();
    } catch (err) {
      console.error("Error creating manager:", err);
      setError(err.message || "Failed to create manager");
    } finally {
      setCreatingManager(false);
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

  if (loading && tickets.length === 0) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <Loader className="spinner-large" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <Shield className="header-icon" />
          <div>
            <h1>Admin Panel</h1>
            <p className="header-subtitle">Manage tickets and team members</p>
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={() => { fetchTickets(); fetchManagers(); }}
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
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-info">
            <div className="stat-value">{managers.length}</div>
            <div className="stat-label">Managers</div>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon success" />
          <div className="stat-info">
            <div className="stat-value">
              {tickets.filter(t => t.status.toLowerCase().includes("resolved")).length}
            </div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Create Manager Button */}
      <div className="section-header">
        <h2>Team Management</h2>
        <button
          className="primary-btn"
          onClick={() => setShowManagerModal(true)}
        >
          <UserPlus size={16} />
          Create Manager
        </button>
      </div>

      {/* Managers List */}
      {managers.length > 0 && (
        <div className="managers-list">
          {managers.map((manager) => (
            <div key={manager.email} className="manager-card">
              <Users className="manager-icon" />
              <div className="manager-info">
                <div className="manager-name">{manager.fullName}</div>
                <div className="manager-email">{manager.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tickets Section */}
      <div className="section-header">
        <h2>Support Tickets ({filteredTickets.length})</h2>
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

      {/* Tickets Table */}
      <div className="table-container">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  No tickets match your filters
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.ticket_id}>
                  <td className="ticket-id-cell">{ticket.ticket_id}</td>
                  <td>{ticket.email}</td>
                  <td className="subject-cell">{ticket.subject}</td>
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
                  <td>{ticket.assigned_to || "Unassigned"}</td>
                  <td className="notes-cell">
                    {ticket.manager_response || "—"}
                  </td>
                  <td className="actions-cell">
                    <select
                      defaultValue=""
                      onChange={(e) => assignTicket(ticket.ticket_id, e.target.value)}
                      className="assign-select"
                    >
                      <option value="">Assign...</option>
                      {managers.map((m) => (
                        <option key={m.email} value={m.email}>
                          {m.fullName}
                        </option>
                      ))}
                    </select>
                    <button
                      className="action-btn"
                      onClick={() => openResponseModal(ticket)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Manager Modal */}
      {showManagerModal && (
        <div className="modal-overlay" onClick={() => setShowManagerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Manager</h3>
              <button onClick={() => setShowManagerModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createManager}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newManager.fullName}
                  onChange={(e) => setNewManager({ ...newManager, fullName: e.target.value })}
                  disabled={creatingManager}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="manager@example.com"
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  disabled={creatingManager}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newManager.password}
                  onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                  disabled={creatingManager}
                  required
                  minLength={6}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowManagerModal(false)}
                  disabled={creatingManager}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={creatingManager}
                >
                  {creatingManager ? (
                    <>
                      <Loader className="spinner" />
                      Creating...
                    </>
                  ) : (
                    "Create Manager"
                  )}
                </button>
              </div>
            </form>
          </div>
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
              <p><strong>Description:</strong> {currentTicket.description}</p>
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
                  <option value="Waiting Admin">Waiting Admin</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Admin Response *</label>
                <textarea
                  placeholder="Enter your response to the user..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  disabled={updatingTicket}
                  rows={6}
                  required
                  minLength={10}
                />
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

export default AdminPanel;