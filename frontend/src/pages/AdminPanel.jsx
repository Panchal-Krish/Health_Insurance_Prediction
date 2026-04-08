import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Loader, AlertCircle, CheckCircle, UserPlus,
  Shield, Ticket, Users, RefreshCw, X, Mail, MailOpen, ChevronLeft, ChevronRight
} from "lucide-react";
import { fetchWithAuth } from "../utils/auth";
import "../styles/AdminPanel.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Tabs available in the admin panel
const TABS = { TICKETS: "tickets", MESSAGES: "messages" };

function AdminPanel() {
  const successTimerRef = useRef(null);   // FIX #8: cleanup setTimeout on unmount

  const [activeTab, setActiveTab] = useState(TABS.TICKETS);
  const [tickets, setTickets] = useState([]);
  const [managers, setManagers] = useState([]);
  const [messages, setMessages] = useState([]);   // Option 4: contact messages
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Manager creation
  const [newManager, setNewManager] = useState({ fullName: "", email: "", password: "" });
  const [creatingManager, setCreatingManager] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);

  // Ticket update
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Open");
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Assign dropdown state per ticket (controlled) — FIX #10
  const [assignSelections, setAssignSelections] = useState({});

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // FIX #8: Clear timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // FIX: Escape key closes any open modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showResponseModal) closeResponseModal();
        if (showManagerModal) setShowManagerModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showResponseModal, showManagerModal]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/all-tickets`);
      if (!response) return;
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      setTickets(await response.json());
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Unable to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Defined BEFORE useEffect so it can be safely referenced
  const fetchManagers = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/managers`);
      if (!response) return;
      if (!response.ok) throw new Error("Failed to fetch managers");
      setManagers(await response.json());
      // Removed tickets.forEach — select handles missing keys with || "" already
    } catch (err) {
      console.error("Error fetching managers:", err);
      setError("Unable to load managers list.");
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchManagers();
    fetchMessages();
  }, [fetchManagers]);

  // Option 4: fetch contact messages
  const fetchMessages = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/contacts`);
      if (!response) return;
      if (!response.ok) throw new Error("Failed to fetch messages");
      setMessages(await response.json());
    } catch (err) {
      console.error("Error fetching contact messages:", err);
    }
  };

  // FIX #10: Controlled assign dropdown — resets after assignment
  const handleAssignChange = (ticket_id, managerEmail) => {
    setAssignSelections(prev => ({ ...prev, [ticket_id]: managerEmail }));
  };

  const assignTicket = async (ticket_id) => {
    const managerEmail = assignSelections[ticket_id];
    if (!managerEmail) return;

    try {
      const response = await fetchWithAuth(`${API_URL}/admin/assign-ticket`, {
        method: "POST",
        body: JSON.stringify({ ticket_id, assigned_to: managerEmail, assigned_role: "manager" })
      });
      if (!response) return;
      if (!response.ok) throw new Error("Failed to assign ticket");

      showSuccess("Ticket assigned successfully");
      // Reset this ticket's dropdown
      setAssignSelections(prev => ({ ...prev, [ticket_id]: "" }));
      fetchTickets();
    } catch (err) {
      console.error("Error assigning ticket:", err);
      setError("Failed to assign ticket");
    }
  };

  const openResponseModal = useCallback((ticket) => {
    setCurrentTicket(ticket);
    setSelectedStatus(ticket.status);
    setAdminResponse(ticket.admin_response || "");
    setShowResponseModal(true);
  }, []);

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
        { method: "PUT", body: JSON.stringify({ status: selectedStatus, admin_response: adminResponse.trim() }) }
      );
      if (!response) return;
      if (!response.ok) throw new Error("Failed to update ticket");

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
      const response = await fetchWithAuth(`${API_URL}/admin/create-manager`, {
        method: "POST",
        body: JSON.stringify({
          fullName: newManager.fullName.trim(),
          email: newManager.email.trim().toLowerCase(),
          password: newManager.password
        })
      });
      if (!response) return;
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

  // Option 4: mark a contact message as read
  const markAsRead = async (messageId) => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/contacts/${messageId}/read`,
        { method: "PUT" }
      );
      if (!response) return;
      if (!response.ok) throw new Error("Failed to mark as read");
      setMessages(prev =>
        prev.map(m => m._id === messageId ? { ...m, status: "read" } : m)
      );
    } catch (err) {
      console.error("Error marking message read:", err);
      setError("Failed to mark message as read");
    }
  };

  // FIX #8: use ref to track timeout so it can be cleared on unmount
  const showSuccess = (message) => {
    setSuccessMessage(message);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMessage(""), 5000);
  };

  // FIX #29: useMemo for derived filter lists
  const filteredTickets = useMemo(() =>
    tickets.filter(ticket => {
      const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
      const priorityMatch = priorityFilter === "All" || ticket.priority === priorityFilter;
      return statusMatch && priorityMatch;
    }),
    [tickets, statusFilter, priorityFilter]
  );

  const statuses = useMemo(() => ["All", ...new Set(tickets.map(t => t.status))], [tickets]);
  const priorities = useMemo(() => ["All", ...new Set(tickets.map(t => t.priority))], [tickets]);

  // FIX #26: strict equality for resolved count
  const resolvedCount = useMemo(() =>
    tickets.filter(t => t.status === "Resolved").length,
    [tickets]
  );

  const unreadCount = useMemo(() =>
    messages.filter(m => m.status === "unread").length,
    [messages]
  );

  if (loading && tickets.length === 0) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="loading-state">
            <Loader className="spinner-large" />
            <p>Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <Shield className="header-icon" />
          <div>
            <h1>Admin Panel</h1>
            <p className="header-subtitle">Manage tickets, team, and contact messages</p>
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={() => { fetchTickets(); fetchManagers(); fetchMessages(); }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="success-message">
          <CheckCircle className="success-icon" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-btn"><X size={16} /></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-tickets">
            <Ticket className="stat-icon" size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{tickets.length}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-managers">
            <Users className="stat-icon" size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{managers.length}</div>
            <div className="stat-label">Managers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-resolved">
            <CheckCircle className="stat-icon" size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{resolvedCount}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-messages">
            <Mail className="stat-icon" size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{unreadCount}</div>
            <div className="stat-label">Unread Messages</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === TABS.TICKETS ? "active" : ""}`}
          onClick={() => setActiveTab(TABS.TICKETS)}
        >
          <Ticket size={16} />
          Tickets
        </button>
        <button
          className={`tab-btn ${activeTab === TABS.MESSAGES ? "active" : ""}`}
          onClick={() => setActiveTab(TABS.MESSAGES)}
        >
          <Mail size={16} />
          Messages
          {unreadCount > 0 && (
            <span className="tab-badge">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* ===================== TICKETS TAB ===================== */}
      {activeTab === TABS.TICKETS && (
        <>
          {/* Team Management */}
          <div className="section-header">
            <h2>Team Management</h2>
            <button className="primary-btn" onClick={() => setShowManagerModal(true)}>
              <UserPlus size={16} />
              Create Manager
            </button>
          </div>

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
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="filter-select">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="ticket-table">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
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
                  <tr><td colSpan="8" className="empty-row">No tickets match your filters</td></tr>
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
                      <td className="notes-cell">{ticket.manager_response || "—"}</td>
                      <td className="actions-cell">
                        <div className="actions-inner">
                          {/* Assign manager dropdown */}
                          <select
                            value={assignSelections[ticket.ticket_id] || ""}
                            onChange={(e) => handleAssignChange(ticket.ticket_id, e.target.value)}
                            className="assign-select"
                          >
                            <option value="">Assign...</option>
                            {managers.map((m) => (
                              <option key={m.email} value={m.email}>{m.fullName}</option>
                            ))}
                          </select>
                          <div className="actions-row">
                            <button
                              className="action-btn assign"
                              onClick={() => assignTicket(ticket.ticket_id)}
                              disabled={!assignSelections[ticket.ticket_id]}
                              title="Confirm assignment"
                            >
                              Assign
                            </button>
                            <button
                              className="action-btn update"
                              onClick={() => openResponseModal(ticket)}
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===================== MESSAGES TAB (Option 4) ===================== */}
      {activeTab === TABS.MESSAGES && (
        <>
          <div className="section-header">
            <h2>Contact Messages ({messages.length})</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>

          {(() => {
            const recordsPerPage = 5;
            const indexOfLastRecord = messagesPage * recordsPerPage;
            const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
            const currentMessages = messages.slice(indexOfFirstRecord, indexOfLastRecord);
            const totalPages = Math.ceil(messages.length / recordsPerPage);

            return messages.length === 0 ? (
              <div className="empty-state">
                <Mail className="empty-icon" />
                <p>No contact messages yet</p>
              </div>
            ) : (
              <>
                <div className="messages-list">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message-card ${msg.status === "unread" ? "unread" : "read"}`}
                    >
                      <div className="message-header">
                        <div className="message-meta">
                          <span className="message-name">{msg.name}</span>
                          <span className="message-email">{msg.email}</span>
                          <span className="message-date">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="message-actions">
                          {msg.status === "unread" ? (
                            <span className="unread-dot" title="Unread" />
                          ) : (
                            <MailOpen size={16} className="read-icon" title="Read" />
                          )}
                          {msg.status === "unread" && (
                            <button
                              className="action-btn small"
                              onClick={() => markAsRead(msg._id)}
                              title="Mark as read"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="message-subject">
                        <strong>{msg.subject}</strong>
                      </div>
                      <div className="message-body">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination-controls" style={{ marginTop: '20px' }}>
                    <button 
                      className="page-btn" 
                      onClick={() => setMessagesPage(p => Math.max(1, p - 1))}
                      disabled={messagesPage === 1}
                    >
                      <ChevronLeft size={18} />
                      Prev
                    </button>
                    <span className="page-info">
                      Page {messagesPage} of {totalPages}
                    </span>
                    <button 
                      className="page-btn" 
                      onClick={() => setMessagesPage(p => Math.min(totalPages, p + 1))}
                      disabled={messagesPage === totalPages}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}

      {/* ===================== CREATE MANAGER MODAL ===================== */}
      {showManagerModal && (
        <div className="modal-overlay" onClick={() => setShowManagerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Manager</h3>
              <button onClick={() => setShowManagerModal(false)} className="close-btn"><X size={20} /></button>
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
                <button type="button" className="secondary-btn" onClick={() => setShowManagerModal(false)} disabled={creatingManager}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={creatingManager}>
                  {creatingManager ? <><Loader className="spinner" /> Creating...</> : "Create Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== UPDATE TICKET MODAL ===================== */}
      {showResponseModal && currentTicket && (
        <div className="modal-overlay" onClick={closeResponseModal}>
          <div className="ut-modal" onClick={(e) => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="ut-header">
              <div className="ut-header-top">
                <div className="ut-title-group">
                  <div className="ut-icon-ring">
                    <Ticket size={20} />
                  </div>
                  <div>
                    <p className="ut-label">Update Ticket</p>
                    <h3 className="ut-title">{currentTicket.ticket_id}</h3>
                  </div>
                </div>
                <button onClick={closeResponseModal} className="ut-close-btn" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="ut-chips">
                <span className={`ut-chip priority-chip-${currentTicket.priority?.toLowerCase()}`}>
                  {currentTicket.priority}
                </span>
                <span className={`ut-chip status-chip-${currentTicket.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {currentTicket.status}
                </span>
                {currentTicket.assigned_to && (
                  <span className="ut-chip assigned-chip">
                    <Users size={11} />
                    {currentTicket.assigned_to}
                  </span>
                )}
              </div>
            </div>

            {/* ── Ticket Info ── */}
            <div className="ut-info-section">
              <div className="ut-info-row">
                <Mail size={14} className="ut-info-icon" />
                <span className="ut-info-key">User</span>
                <span className="ut-info-val">{currentTicket.email}</span>
              </div>
              <div className="ut-info-row">
                <Ticket size={14} className="ut-info-icon" />
                <span className="ut-info-key">Subject</span>
                <span className="ut-info-val">{currentTicket.subject}</span>
              </div>
              {currentTicket.description && (
                <div className="ut-info-row ut-info-desc">
                  <AlertCircle size={14} className="ut-info-icon" />
                  <span className="ut-info-key">Description</span>
                  <span className="ut-info-val ut-desc-text">{currentTicket.description}</span>
                </div>
              )}
            </div>

            {/* ── Form ── */}
            <form onSubmit={updateTicket} className="ut-form">

              {/* Status Picker */}
              <div className="ut-field-group">
                <label className="ut-field-label">
                  <Shield size={13} />
                  New Status
                </label>
                <div className="ut-status-pills">
                  {[
                    { value: "Open",        color: "yellow" },
                    { value: "In Progress", color: "purple" },
                    { value: "Resolved",    color: "green"  },
                    { value: "Closed",      color: "gray"   },
                  ].map(({ value, color }) => (
                    <button
                      key={value}
                      type="button"
                      disabled={updatingTicket}
                      className={`ut-status-pill ut-pill-${color} ${selectedStatus === value ? "ut-pill-active" : ""}`}
                      onClick={() => setSelectedStatus(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Textarea */}
              <div className="ut-field-group">
                <label className="ut-field-label">
                  <Mail size={13} />
                  Admin Response <span className="ut-required">*</span>
                </label>
                <div className="ut-textarea-wrap">
                  <textarea
                    className="ut-textarea"
                    placeholder="Write a detailed response to the user…"
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    disabled={updatingTicket}
                    rows={4}
                    required
                    minLength={10}
                  />
                  <div className="ut-char-counter">
                    <span className={adminResponse.length < 10 ? "ut-counter-warn" : "ut-counter-ok"}>
                      {adminResponse.length} chars
                    </span>
                    {adminResponse.length < 10 && (
                      <span className="ut-counter-hint">{' '}· min 10</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="ut-actions">
                <button
                  type="button"
                  className="ut-cancel-btn"
                  onClick={closeResponseModal}
                  disabled={updatingTicket}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ut-submit-btn"
                  disabled={updatingTicket || adminResponse.trim().length < 10}
                >
                  {updatingTicket
                    ? <><Loader className="spinner" size={16} /> Updating…</>
                    : <><CheckCircle size={16} /> Update Ticket</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AdminPanel;
