import React, { useState, useEffect, useRef } from 'react';
import { Loader, AlertCircle, CheckCircle, Ticket as TicketIcon, User, Clock } from 'lucide-react';
import { fetchWithAuth } from '../utils/auth';
import './../styles/HelpDesk.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function HelpDesk() {
  const successTimerRef = useRef(null);   // FIX #8: cleanup on unmount

  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'Model Issue',
    priority: 'Medium'
  });

  const [tickets, setTickets] = useState([]);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // FIX #8: clear timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // ProtectedRoute already handles unauthenticated users — no duplicate check needed
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const submitTicket = async (e) => {
    e.preventDefault();

    if (form.subject.trim().length < 5) {
      setError('Subject must be at least 5 characters long');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetchWithAuth(`${API_URL}/create-ticket`, {
        method: 'POST',
        body: JSON.stringify({
          subject: form.subject.trim(),
          description: form.description.trim(),
          category: form.category,
          priority: form.priority
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit ticket');
      }

      const data = await response.json();
      setSuccessMessage(`Ticket ${data.ticket_id} created successfully!`);
      setForm({ subject: '', description: '', category: 'Model Issue', priority: 'Medium' });
      await fetchTickets();

      // FIX #8: tracked timeout so it clears on unmount
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessMessage(''), 5000);

    } catch (err) {
      console.error('Error submitting ticket:', err);
      setError(err.message || 'Unable to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX: No email in URL — backend reads it from JWT token
      const response = await fetchWithAuth(`${API_URL}/my-tickets`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      setTickets(await response.json());
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Unable to load your tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTicket = (id) => {
    setExpandedTicket(expandedTicket === id ? null : id);
  };

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('open')) return '#3b82f6';
    if (s.includes('progress')) return '#f59e0b';
    if (s.includes('resolved') || s.includes('closed')) return '#10b981';
    if (s.includes('waiting')) return '#8b5cf6';
    return '#6b7280';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#ef4444';
    if (priority === 'Medium') return '#f59e0b';
    return '#22c55e';
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="helpdesk-container">
        <div className="loading-state">
          <Loader className="spinner-large" />
          <p>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="helpdesk-container">
      <div className="helpdesk-header">
        <TicketIcon className="header-icon" />
        <div>
          <h1 className="page-title">Help Desk</h1>
          <p className="page-subtitle">Submit and track your support tickets</p>
        </div>
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
        </div>
      )}

      {/* Ticket Form */}
      <div className="ticket-form-card">
        <h3>Create Support Ticket</h3>
        <form onSubmit={submitTicket}>
          <div className="form-row">
            <div className="form-grouphelp">
              <label>Subject *</label>
              <input
                name="subject"
                placeholder="Brief summary of your issue"
                value={form.subject}
                onChange={handleChange}
                disabled={submitting}
                required
                maxLength={100}
              />
            </div>
            <div className="form-grouphelp">
              <label>Priority *</label>
              <select name="priority" value={form.priority} onChange={handleChange} disabled={submitting}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-grouphelp">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={handleChange}
              disabled={submitting}
              required
              rows={5}
              maxLength={1000}
            />
            <small className="char-count">{form.description.length}/1000 characters</small>
          </div>

          <div className="form-row">
            <div className="form-grouphelp">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} disabled={submitting}>
                <option value="Model Issue" classname="dropdown">Model Issue</option>
                <option value="Prediction Error" >Prediction Error</option>
                <option value="Technical Problem">Technical Problem</option>
                <option value="Account Problem">Account Problem</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? <><Loader className="spinner" />Submitting...</> : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>

      {/* Tickets List */}
      <div className="tickets-section">
        <h2 className="section-title">My Tickets ({tickets.length})</h2>
        <div className="tickets-grid">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <TicketIcon className="empty-icon" />
              <p>No tickets submitted yet</p>
              <small>Create a ticket above if you need help</small>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="ticket-card" onClick={() => toggleTicket(ticket.ticket_id)}>
                <div className="ticket-header">
                  <div className="ticket-info">
                    <div className="ticket-id"><TicketIcon size={16} />{ticket.ticket_id}</div>
                    <div className="ticket-subject">{ticket.subject}</div>
                  </div>
                  <span className="status-badge1" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                    {ticket.status}
                  </span>
                </div>

                <div className="ticket-meta">
                  <span className="priority-badge" style={{ color: getPriorityColor(ticket.priority) }}>
                    Priority: {ticket.priority}
                  </span>
                  <span className="category-badge">{ticket.category}</span>
                </div>

                {expandedTicket === ticket.ticket_id && (
                  <div className="ticket-details">
                    <div className="detail-section">
                      <Clock size={16} />
                      <div><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</div>
                    </div>

                    {ticket.assigned_to && (
                      <div className="detail-section assignment-info">
                        <User size={16} />
                        <div>
                          <strong>Assigned to:</strong> {ticket.assigned_to}
                          {ticket.assigned_role && (
                            <span className="role-badge">{ticket.assigned_role}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="detail-section">
                      <strong>Description:</strong>
                      <p className="ticket-description">{ticket.description}</p>
                    </div>

                    {ticket.admin_response && (
                      <div className="response-section admin-response">
                        <strong>Admin Response:</strong>
                        <p>{ticket.admin_response}</p>
                      </div>
                    )}

                    {ticket.manager_response && (
                      <div className="response-section manager-response">
                        <strong>Manager Response:</strong>
                        <p>{ticket.manager_response}</p>
                      </div>
                    )}

                    {!ticket.admin_response && !ticket.manager_response && (
                      <div className="response-section waiting">
                        <p>⏳ Waiting for response from support team...</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="expand-indicator">
                  {expandedTicket === ticket.ticket_id ? '▲ Click to collapse' : '▼ Click to expand'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HelpDesk;
