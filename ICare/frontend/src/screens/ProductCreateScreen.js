import React, { useContext, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
};

export default function ProductCreateScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, loadingUpload }, dispatch] = useReducer(reducer, {
    loading: false,
    error: '',
  });

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const formErrors = {};
    if (!name) formErrors.name = 'Name is required';
    if (!slug) formErrors.slug = 'Slug is required';
    if (!price) formErrors.price = 'Price is required. Least value can be 1';
    if (!image) formErrors.image = 'Image is required';
    if (!category) formErrors.category = 'Category is required';
    if (!brand) formErrors.brand = 'Brand is required';
    if (!countInStock) formErrors.countInStock = 'Count in Stock is required';
    if (!description) formErrors.description = 'Description is required';
    return formErrors;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors); // Set form errors if validation fails
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        '/api/products',
        {
          name,
          slug,
          price,
          image,
          images,
          category,
          brand,
          countInStock,
          description,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };

  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });

      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Create Product</title>
      </Helmet>
      <h1>Create Product</h1>
      {loading ? (
        <LoadingBox />
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="slug">
            <Form.Label>Slug</Form.Label>
            <Form.Control
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              isInvalid={!!errors.slug}
            />
            <Form.Control.Feedback type="invalid">{errors.slug}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              isInvalid={!!errors.price}
            />
            <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image File</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              isInvalid={!!errors.image}
            />
            <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
            <Form.Control type="file" onChange={(e) => uploadFileHandler(e)} />
            {loadingUpload && <LoadingBox />}
          </Form.Group>
          <Form.Group className="mb-3" controlId="additionalImage">
            <Form.Label>Additional Images</Form.Label>
            {images.length === 0 && <div>No additional images</div>}
            <Form.Control type="file" onChange={(e) => uploadFileHandler(e, true)} />
            {loadingUpload && <LoadingBox />}
          </Form.Group>
          <Form.Group className="mb-3" controlId="category">
  <Form.Label>Category</Form.Label>
  <Form.Select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    
    isInvalid={!!errors.category}
  >
    <option value="">Select a category</option>
    <option value="Prescription Eyeglasses">Prescription Eyeglasses</option>
    <option value="Contact Lenses">Contact Lenses</option>
    <option value="Sunglasses">Sunglasses</option>
    <option value="Eyeglass Frames">Eyeglass Frames</option>
    <option value="Blue Light Glasses">Blue Light Glasses</option>
    <option value="Reading Glasses">Reading Glasses</option>
    <option value="Safety Glasses">Safety Glasses</option>
    <option value="Lens Cleaning Solutions">Lens Cleaning Solutions</option>
    <option value="Eye Drops">Eye Drops</option>
    <option value="Optical Accessories">Optical Accessories</option>
    {/* Add more options as needed */}
  </Form.Select>
  <Form.Control.Feedback type="invalid">
    {errors.category}
  </Form.Control.Feedback>
</Form.Group>

          <Form.Group className="mb-3" controlId="brand">
            <Form.Label>Brand</Form.Label>
            <Form.Control
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              isInvalid={!!errors.brand}
            />
            <Form.Control.Feedback type="invalid">{errors.brand}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="countInStock">
            <Form.Label>Count In Stock</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              isInvalid={!!errors.countInStock}
            />
            <Form.Control.Feedback type="invalid">{errors.countInStock}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
          </Form.Group>
          <div className="mb-3">
            <Button type="submit">Create Product</Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
