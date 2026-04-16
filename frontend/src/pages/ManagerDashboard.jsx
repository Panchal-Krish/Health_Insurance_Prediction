import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Loader, AlertCircle, CheckCircle, Shield,
  Briefcase, Ticket, RefreshCw, X, Clock, Mail, MailOpen, ChevronLeft, ChevronRight, Users, Tag
} from 'lucide-react';
import { fetchWithAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/ManagerDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

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
      const response = await fetchWithAuth(`${API_URL}/contacts`);
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
        `${API_URL}/contacts/${messageId}/read`,
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
                          <div className="actions-inner">
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
                                setSelectedStatus('Waiting Admin');
                                setManagerResponse(ticket.manager_response || '');
                                setShowResponseModal(true);
                              }}
                              disabled={ticket.status === 'Resolved' || ticket.status === 'Closed'}
                              title={ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'Ticket is already closed' : ''}
                            >
                              Escalate
                            </button>
                          </div>
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

        {/* ===================== UPDATE TICKET MODAL ===================== */}
        {showResponseModal && currentTicket && (
          <div className="modal-overlay" onClick={closeResponseModal}>
            <div className="ut-modal" onClick={(e) => e.stopPropagation()}>

              {/* ── Header ── */}
              <div className="ut-header">
                <div className="ut-header-top">
                  <div className="ut-title-group">
                    <div className="ut-icon-ring">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="ut-label">
                        {selectedStatus === 'Waiting Admin' ? 'Escalate Ticket' : 'Update Ticket'}
                      </p>
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
                  {currentTicket.category && (
                    <span className="ut-chip assigned-chip">
                      <Tag size={11} />
                      {currentTicket.category}
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
                {currentTicket.admin_response && (
                  <div className="ut-info-row ut-info-desc ut-admin-note-row">
                    <Shield size={14} className="ut-info-icon" />
                    <span className="ut-info-key">Admin Note</span>
                    <span className="ut-info-val ut-desc-text ut-admin-note">{currentTicket.admin_response}</span>
                  </div>
                )}
              </div>

              {/* ── Form ── */}
              <form onSubmit={updateTicket} className="ut-form">

                {/* Status Picker */}
                <div className="ut-field-group">
                  <label className="ut-field-label">
                    <Shield size={13} />
                    Set Status
                  </label>
                  <div className="ut-status-pills">
                    {[
                      { value: 'In Progress',   color: 'purple', label: 'In Progress'   },
                      { value: 'Waiting Admin', color: 'red',    label: 'Escalate to Admin' },
                    ].map(({ value, color, label }) => (
                      <button
                        key={value}
                        type="button"
                        disabled={updatingTicket}
                        className={`ut-status-pill ut-pill-${color} ${selectedStatus === value ? 'ut-pill-active' : ''}`}
                        onClick={() => setSelectedStatus(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Textarea */}
                <div className="ut-field-group">
                  <label className="ut-field-label">
                    <Mail size={13} />
                    Your Response <span className="ut-required">*</span>
                  </label>
                  <div className="ut-textarea-wrap">
                    <textarea
                      className="ut-textarea"
                      placeholder={
                        selectedStatus === 'Waiting Admin'
                          ? 'Describe the issue and what you need from the admin…'
                          : 'Write your investigation notes or response to the user…'
                      }
                      value={managerResponse}
                      onChange={(e) => setManagerResponse(e.target.value)}
                      disabled={updatingTicket}
                      rows={4}
                      required
                      minLength={10}
                    />
                    <div className="ut-char-counter">
                      <span className={managerResponse.length < 10 ? 'ut-counter-warn' : 'ut-counter-ok'}>
                        {managerResponse.length} chars
                      </span>
                      {managerResponse.length < 10 && (
                        <span className="ut-counter-hint">{' '}· min 10</span>
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
                    className={`ut-submit-btn ${selectedStatus === 'Waiting Admin' ? 'ut-submit-escalate' : ''}`}
                    disabled={updatingTicket || managerResponse.trim().length < 10}
                  >
                    {updatingTicket
                      ? <><Loader className="spinner" size={16} /> Updating…</>
                      : selectedStatus === 'Waiting Admin'
                        ? <><Users size={16} /> Escalate to Admin</>
                        : <><CheckCircle size={16} /> Submit Update</>}
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
