import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import jsPDF from 'jspdf';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, ticket: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_RESPONSE_REQUEST':
      return { ...state, loadingAddResponse: true };
    case 'ADD_RESPONSE_SUCCESS':
      return { ...state, loadingAddResponse: false };
    case 'ADD_RESPONSE_FAIL':
      return { ...state, loadingAddResponse: false, errorAddResponse: action.payload };
    default:
      return state;
  }
};

export default function TicketDetailScreen() {
  const { id: ticketId } = useParams();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, ticket, loadingAddResponse }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchTicket();
  }, [ticketId, userInfo]);

  const addResponseHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'ADD_RESPONSE_REQUEST' });
      await axios.post(
        `/api/tickets/${ticketId}/responses`,
        { message: responseMessage },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setResponseMessage('');
      dispatch({ type: 'ADD_RESPONSE_SUCCESS' });
      toast.success('Response added successfully');
    } catch (err) {
      dispatch({ type: 'ADD_RESPONSE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const filteredResponses = ticket?.responses?.filter((response) =>
    response.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadPdf = () => {
    const doc = new jsPDF();
  
    // Header Section
    doc.setFontSize(18);
    doc.setTextColor(40, 116, 166); // Set a color for the title
    doc.text('Ticket Summary Report', 105, 20, null, null, 'center'); // Title centered
  
    // Add a line under the title for a clean look
    doc.setDrawColor(0, 116, 166); // Line color
    doc.line(15, 25, 195, 25); // Draw a line
  
    // Ticket Information Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Reset text color
  
    const leftMargin = 20;
    const lineSpacing = 10;
    const startY = 35; // Start after the header
  
    doc.text(`Subject:`, leftMargin, startY);
    doc.setFont('Helvetica', 'bold'); // Bold for the actual data
    doc.text(ticket.subject, leftMargin + 35, startY);
    doc.setFont('Helvetica', 'normal');
  
    doc.text(`Description:`, leftMargin, startY + lineSpacing);
    doc.text(ticket.description, leftMargin + 35, startY + lineSpacing);
  
    doc.text(`Status:`, leftMargin, startY + lineSpacing * 2);
    doc.text(ticket.status, leftMargin + 35, startY + lineSpacing * 2);
  
    doc.text(`Priority:`, leftMargin, startY + lineSpacing * 3);
    doc.text(ticket.priority, leftMargin + 35, startY + lineSpacing * 3);
  
    doc.text(`Created By:`, leftMargin, startY + lineSpacing * 4);
    doc.text(ticket.user.name || ticket.user, leftMargin + 35, startY + lineSpacing * 4);
  
    // Responses Section
    doc.setFontSize(16);
    doc.setTextColor(40, 116, 166);
    doc.text('Responses:', leftMargin, startY + lineSpacing * 6);
  
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Reset text color
  
    const responseStartY = startY + lineSpacing * 7;
    let currentY = responseStartY;
  
    // If there are no responses
    if (filteredResponses.length === 0) {
      doc.text('No responses yet.', leftMargin, currentY);
    }
  
    // Add each response
    filteredResponses?.forEach((response, index) => {
      const responderLine = `${index + 1}. ${response.responder}:`;
      const messageLine = response.message;
  
      // Check if we need a new page for space
      if (currentY > 270) {
        doc.addPage();
        currentY = 20; // Reset Y for new page
      }
  
      // Render response responder and message
      doc.setFont('Helvetica', 'bold');
      doc.text(responderLine, leftMargin, currentY);
      currentY += 7;
  
      doc.setFont('Helvetica', 'normal');
      doc.text(messageLine, leftMargin + 10, currentY);
      currentY += lineSpacing;
    });
  
    // Save the document with a meaningful name
    doc.save(`ticket_${ticketId}_summary.pdf`);
  };
  

  return (
    <div>
      <Helmet>
        <title>Ticket Details</title>
      </Helmet>
      <h1 className="my-3">Ticket Details</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Card className="mb-3">
            <Card.Header as="h4">{ticket.subject}</Card.Header>
            <Card.Body>
              <Card.Text><strong>Description: </strong>{ticket.description}</Card.Text>
              <Card.Text><strong>Status: </strong>{ticket.status}</Card.Text>
              <Card.Text><strong>Priority: </strong>{ticket.priority}</Card.Text>
              <Card.Text><strong>Created By: </strong>{ticket.user.name || ticket.user}</Card.Text>
            </Card.Body>
          </Card>

          <h3 className="my-3">Responses</h3>
          <Form.Control
            type="text"
            placeholder="Search responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          {filteredResponses?.length === 0 ? (
            <Alert variant="info">No responses found</Alert>
          ) : (
            <ListGroup className="mb-3">
              {filteredResponses?.map((response) => (
                <ListGroup.Item key={response._id}>
                  <strong>{response.responder}: </strong>{response.message} <br />
                  <small className="text-muted">{new Date(response.createdAt).toLocaleString()}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {userInfo.isAdmin && (
            <Card className="my-3">
              <Card.Body>
                <Card.Title>Add a Response</Card.Title>
                <Form onSubmit={addResponseHandler}>
                  <Form.Group className="mb-3" controlId="response">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      required
                      placeholder="Enter your response here"
                    />
                  </Form.Group>
                  <Button type="submit" disabled={loadingAddResponse}>
                    Submit Response
                  </Button>
                  {loadingAddResponse && <LoadingBox />}
                </Form>
              </Card.Body>
            </Card>
          )}

          <Button variant="primary" className="mt-3" onClick={downloadPdf}>
            Download Ticket Summary
          </Button>
        </>
      )}
    </div>
  );
}
