import axios from 'axios';
import React, { useContext, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false, errorCreate: action.payload };
    default:
      return state;
  }
};

export default function TicketCreateScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loadingCreate }, dispatch] = useReducer(reducer, {
    loadingCreate: false,
  });

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        '/api/tickets',
        {
          subject,
          description,
          priority,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Ticket created successfully');
      navigate('/tickets'); // Redirect to /tickets after creation
    } catch (err) {
      dispatch({
        type: 'CREATE_FAIL',
        payload: getError(err),
      });
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Create Ticket</title>
      </Helmet>
      <h1>Create Ticket</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="subject">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
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

        <div className="mb-3">
          <Button type="submit" disabled={loadingCreate}>
            Create Ticket
          </Button>
          {loadingCreate && <LoadingBox />}
        </div>
      </Form>
    </div>
  );
}
