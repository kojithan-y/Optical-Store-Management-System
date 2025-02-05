import React, { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Table, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, appointments: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function UserAppointmentScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, appointments = [] }, dispatch] = useReducer(reducer, {
    loading: true,
    appointments: [],
  });

  const [searchQuery, setSearchQuery] = useState(''); // For search functionality

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/appointments/mine', {
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

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appointment.optometrist?.name && appointment.optometrist.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      appointment.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>Your Appointments</h1>

      {/* Search Bar */}
      <Form.Control
        type="text"
        placeholder="Search by subject, optometrist, or status"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3"
      />

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : filteredAppointments.length === 0 ? (
        <MessageBox>No Appointments Found</MessageBox>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>SUBJECT</th>
              <th>OPTOMETRIST</th>
              <th>DATE</th>
              <th>TIME SLOT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{appointment.subject}</td>
                <td>{appointment.optometrist?.name || 'N/A'}</td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.timeSlot}</td>
                <td>{appointment.status}</td>
                <td>
                  <Button
                    variant="light"
                    onClick={() => navigate(`/appointment/${appointment._id}`)} // Go to appointment details
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
