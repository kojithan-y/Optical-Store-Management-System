import axios from 'axios';
import React, { useContext, useEffect, useReducer, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import ReactToPrint from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For creating tables in the PDF

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, users: action.payload, loading: false };
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

export default function UserListScreen() {
  const navigate = useNavigate();
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [searchQuery, setSearchQuery] = useState(''); // Search term state

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (user) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('User deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (error) {
        toast.error(getError(error));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  // Filter users based on search query and sort alphabetically by name
  const filteredUsers = users
    ?.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Generate PDF report
  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('User Report', 105, 20, null, null, 'center');
    doc.setFontSize(12);

    const tableColumn = ['Name', 'Email', 'NIC', 'Address', 'Phone Number', 'Is Admin'];
    const tableRows = [];

    filteredUsers.forEach((user) => {
      const userData = [
        user.name,
        user.email,
        user.nic,
        user.address,
        user.phone,
        user.isAdmin ? 'Yes' : 'No',
      ];
      tableRows.push(userData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save('User_Report.pdf');
  };

  const componentRef = useRef();

  return (
    <div>
      <div className="printalign">
        
        <button onClick={downloadPdf} className="download-button">
          Download User Report
        </button>
      </div>

      <div ref={componentRef}>
        <Helmet>
          <title>Users</title>
        </Helmet>
        <h1><center><b>ICare</b></center></h1>
        <h1>User Details Report</h1>

        {/* Search Bar */}
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loadingDelete && <LoadingBox />}
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <table className="table">
            <thead bgcolor="grey">
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>NIC</th>
                <th>ADDRESS</th>
                <th>PHONE NUMBER</th>
                <th>IS ADMIN</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.nic}</td>
                  <td>{user.address}</td>
                  <td>{user.phone}</td>
                  <td>{user.isAdmin ? 'YES' : 'NO'}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => navigate(`/admin/user/${user._id}`)}
                    >
                      Edit
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(user)}
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
    </div>
  );
}
