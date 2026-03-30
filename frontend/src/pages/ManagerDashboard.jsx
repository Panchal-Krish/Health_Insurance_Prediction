import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Loader, AlertCircle, CheckCircle,
  Briefcase, Ticket, RefreshCw, X, Clock, Mail, MailOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { fetchWithAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/ManagerDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TABS = { TICKETS: "tickets", MESSAGES: "messages" };

function ManagerDashboard() {
  const { isLoggedIn } = useAuth();
  const successTimerRef = useRef(null);

  const [activeTab, setActiveTab] = useState(TABS.TICKETS);
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [managerResponse, setManagerResponse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Open');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showResponseModal) closeResponseModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showResponseModal]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchTickets();
    fetchMessages();
  }, [isLoggedIn]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_URL}/manager/my-tickets`);
      if (!response) return;
      if (!response.ok) throw new Error('Failed to fetch tickets');
      setTickets(await response.json());
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Unable to load your tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setCurrentTicket(null);
    setManagerResponse('');
    setSelectedStatus('Open');
  };

  const updateTicket = async (e) => {
    e.preventDefault();
    if (!currentTicket) return;

    if (managerResponse.trim().length < 10) {
      setError('Response must be at least 10 characters long');
      return;
    }

    setUpdatingTicket(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${API_URL}/manager/update-ticket/${currentTicket.ticket_id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: selectedStatus, manager_response: managerResponse.trim() })
        }
      );
      if (!response) return;
      if (!response.ok) throw new Error('Failed to update ticket');

      showSuccess('Ticket updated successfully');
      closeResponseModal();
      fetchTickets();
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError('Failed to update ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMessage(''), 5000);
  };

  const filteredTickets = useMemo(() =>
    tickets.filter(t => {
      const statusMatch = statusFilter === 'All' || t.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
      return statusMatch && priorityMatch;
    }),
    [tickets, statusFilter, priorityFilter]
  );

  const statuses = useMemo(() => ['All', ...new Set(tickets.map(t => t.status))], [tickets]);
  const priorities = useMemo(() => ['All', ...new Set(tickets.map(t => t.priority))], [tickets]);

  const openTickets = useMemo(() => tickets.filter(t => t.status === 'Open').length, [tickets]);
  const inProgressTickets = useMemo(() => tickets.filter(t => t.status === 'In Progress').length, [tickets]);

  const unreadCount = useMemo(() =>
    messages.filter(m => m.status === "unread").length,
    [messages]
  );

  if (loading && tickets.length === 0) {
    return (
      <div className="manager-page">
        <div className="manager-container">
          <div className="loading-state">
            <Loader className="spinner-large" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-page">
      <div className="manager-container">
        {/* Header */}
        <div className="manager-header">
          <div className="header-left">
            <Briefcase className="header-icon" />
            <div>
              <h1>Manager Dashboard</h1>
              <p className="header-subtitle">Manage your assigned tickets and contact messages</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={() => { fetchTickets(); fetchMessages(); }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

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

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-tickets">
              <Ticket className="stat-icon" size={28} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{tickets.length}</div>
              <div className="stat-label">Total Assigned</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-managers">
              <Clock className="stat-icon pending" size={28} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{openTickets}</div>
              <div className="stat-label">Open</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-resolved">
              <RefreshCw className="stat-icon progress" size={28} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{inProgressTickets}</div>
              <div className="stat-label">In Progress</div>
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
            <div className="section-header">
              <h2>My Assigned Tickets ({filteredTickets.length})</h2>
              <div className="filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="filter-select">
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className="empty-state">
                <Ticket className="empty-icon" />
                <h3>No Tickets Assigned Yet</h3>
                <p>You don't have any tickets assigned to you at the moment.</p>
                <p className="empty-subtitle">Check back later or contact your admin.</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state">
                <Ticket className="empty-icon" />
                <h3>No Matching Tickets</h3>
                <p>No tickets match your current filters.</p>
              </div>
            ) : (
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
                          <span className="category-badge">{ticket.category}</span>
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
                        <td className="date-cell">{new Date(ticket.created_at).toLocaleDateString()}</td>
                        <td className="actions-cell">
                          <button
                            className="action-btn start"
                            onClick={() => {
                              setCurrentTicket(ticket);
                              setSelectedStatus('In Progress');
                              setManagerResponse(ticket.manager_response || '');
                              setShowResponseModal(true);
                            }}
                            disabled={ticket.status === 'Resolved' || ticket.status === 'Closed'}
                            title={ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'Ticket is closed' : ''}
                          >
                            {ticket.status === 'Open' ? 'Start Work' : 'Update'}
                          </button>
                          <button
                            className="action-btn resolve"
                            onClick={() => {
                              setCurrentTicket(ticket);
                              setSelectedStatus('Resolved');
                              setManagerResponse(ticket.manager_response || '');
                              setShowResponseModal(true);
                            }}
                            disabled={ticket.status === 'Resolved' || ticket.status === 'Closed'}
                            title={ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'Ticket is already closed' : ''}
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
          </>
        )}

        {/* ===================== MESSAGES TAB ===================== */}
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

        {/* Update Ticket Modal */}
        {showResponseModal && currentTicket && (
          <div className="modal-overlay" onClick={closeResponseModal}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update Ticket: {currentTicket.ticket_id}</h3>
                <button onClick={closeResponseModal} className="close-btn"><X size={20} /></button>
              </div>
              <div className="ticket-info-box">
                <p><strong>User:</strong>        {currentTicket.email}</p>
                <p><strong>Subject:</strong>     {currentTicket.subject}</p>
                <p><strong>Category:</strong>    {currentTicket.category}</p>
                <p><strong>Priority:</strong>    {currentTicket.priority}</p>
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
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} disabled={updatingTicket}>
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
                  <small className="char-count">{managerResponse.length} characters</small>
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeResponseModal} disabled={updatingTicket}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={updatingTicket}>
                    {updatingTicket ? <><Loader className="spinner" />Updating...</> : 'Update Ticket'}
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

export default ManagerDashboard;