import axios from 'axios';
import React, { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
      return {
        ...state,
        products: action.payload.products || [], // Ensure it's always an array
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function ProductListScreen() {
  const [{ loading, error, products = [], pages, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    products: [],  // Ensure products is initialized as an empty array
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/products/admin?page=${page}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);

  const deleteHandler = async (product) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Product deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  // Filter products based on search query
  const filteredProducts = products
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Generate PDF report
  const downloadPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Products Report', 105, 20, null, null, 'center'); // Title centered

    doc.setFontSize(12);
    const tableColumn = ['Name', 'Price', 'Category', 'Brand', 'Stock'];
    const tableRows = [];

    filteredProducts.forEach((product) => {
      const productData = [
        product.name,
        product.price,
        product.category,
        product.brand,
        product.countInStock,
      ];
      tableRows.push(productData);
    });

    // Auto table method from jsPDF to generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save('Products_Report.pdf');
  };

  const componentRef = useRef();

  return (
    <div>
      <div className="printalign">
        <ReactToPrint />
        <button onClick={downloadPdf} className="download-button">Download PDF</button>
      </div>
      <div ref={componentRef}>
        <h1><center><b>ICare</b></center></h1>
        <div>
          <Row>
            <Col>
              <h1>Products Report</h1>
            </Col>
            <Col className="col text-end">
              <div>
                <Button
                  type="button"
                  onClick={() => navigate('/admin/product/create')} // Navigate to ProductCreateScreen
                >
                  Create Product
                </Button>
              </div>
            </Col>
          </Row>

          {/* Search Bar */}
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search by name, category, or brand"
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
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>PRICE</th>
                    <th>CATEGORY</th>
                    <th>BRAND</th>
                    <th>STOCK</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>{product.countInStock}</td>
                      <td>
                        <Button
                          type="button"
                          variant="light"
                          onClick={() => navigate(`/admin/product/${product._id}`)}
                        >
                          Edit
                        </Button>
                        &nbsp;
                        <Button
                          type="button"
                          variant="light"
                          onClick={() => deleteHandler(product)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                {[...Array(pages).keys()].map((x) => (
                  <Link
                    className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                    key={x + 1}
                    to={`/admin/products?page=${x + 1}`}
                  >
                    {x + 1}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
