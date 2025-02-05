import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, tickets: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function TicketListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, tickets = [], loadingDelete, successDelete }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
      tickets: [],
    }
  );

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const isAdmin = userInfo && userInfo.isAdmin;
        const endpoint = isAdmin ? '/api/tickets' : '/api/tickets/mine';
        const { data } = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (ticket) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/tickets/${ticket._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Ticket deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  // PDF Download function (only includes the table, not actions)
  const downloadPdf = () => {
    const doc = new jsPDF();

    // Set the title of the PDF
    doc.setFontSize(16);
    doc.text('Tickets', 14, 22);

    // Define the table columns and rows
    const columns = ['Ticket ID', 'Subject', 'Status', 'Priority', 'User', 'Date Created'];
    const rows = tickets.map((ticket, index) => [
      index + 1,
      ticket.subject,
      ticket.status,
      ticket.priority,
      ticket.user.name || ticket.user,
      ticket.createdAt.substring(0, 10),
    ]);

    // Add the table to the PDF
    doc.autoTable({
      startY: 30,
      head: [columns],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 10 },
    });

    // Save the generated PDF
    doc.save('tickets_summary.pdf');
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.user.name && ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <Helmet>
        <title>Tickets</title>
      </Helmet>
      <h1>Tickets Report</h1>

      {/* Search Bar */}
      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by subject, status, priority, or user"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Download PDF Button */}
      <div className="mb-3">
        <Button variant="light" onClick={downloadPdf}>
          Download Ticket Summary
        </Button>
      </div>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>User</th>
              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <tr key={ticket._id}>
                <td>{index + 1}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.status}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.user.name || ticket.user}</td>
                <td>{ticket.createdAt.substring(0, 10)}</td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/ticket/${ticket._id}`)}
                  >
                    Details
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/admin/ticket/${ticket._id}/edit`)}
                  >
                    Update
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(ticket)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
