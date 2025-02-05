import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button, Card, Container } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

export default function TicketEditScreen() {
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await axios.get(`/api/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setSubject(data.subject);
        setDescription(data.description);
        setPriority(data.priority);
        setStatus(data.status);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(getError(err));
      }
    };
    fetchTicket();
  }, [ticketId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/tickets/${ticketId}`,
        { subject, description, priority, status },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success('Ticket updated successfully');
      navigate('/admin/tickets');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h2>Edit Ticket</h2>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <LoadingBox />
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group className="mb-3" controlId="subject">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="priority">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button type="submit" variant="primary" size="lg">
                  Update Ticket
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
