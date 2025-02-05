import React, { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Form } from 'react-bootstrap';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, tickets: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function UserTicketListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, tickets = [] }, dispatch] = useReducer(reducer, {
    loading: true,
    tickets: [],
  });

  const [searchQuery, setSearchQuery] = useState(''); // For search functionality

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/tickets/mine', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    };

    fetchData();
  }, [userInfo]);

  // Filter tickets based on search query
  const filteredTickets = tickets?.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.priority.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>Your Tickets</h1>

      {/* Search Bar */}
      <Form.Control
        type="text"
        placeholder="Search by subject, status, or priority"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3"
      />

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>TICKET ID</th> {/* Added Ticket ID column */}
              <th>SUBJECT</th>
              <th>STATUS</th>
              <th>PRIORITY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>{ticket._id}</td> {/* Displaying ticket._id */}
                <td>{ticket.subject}</td>
                <td>{ticket.status}</td>
                <td>{ticket.priority}</td>
                <td>
                  <Button
                    variant="light"
                    onClick={() => navigate(`/ticket/${ticket._id}`)}  // Pass the correct ticket._id
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
