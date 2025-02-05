import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';

export default function DigitalLibraryCreateScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [resourceFile, setResourceFile] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  useEffect(() => {
    // Set the current date as the default datePublished field (read-only)
    const today = new Date().toISOString().split('T')[0];
    setDatePublished(today);
  }, []);

  const uploadFileHandler = async (e, setFile) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      setLoading(true);
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setFile(data);
      setLoading(false);
      toast.success('File uploaded successfully');
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!author.trim()) errors.author = 'Author is required';
    if (!image.trim()) errors.image = 'Image is required';
    if (!resourceFile.trim()) errors.resourceFile = 'Resource file is required';

    return errors;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setValidationErrors(formErrors);
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        '/api/digital-library',
        {
          title,
          description,
          author,
          image,
          resourceFile,
          datePublished, // The datePublished is fixed and sent here
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoading(false);
      toast.success('Resource created successfully');
      navigate('/digital-library');
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Add Digital Library Resource</title>
      </Helmet>
      <h1>Add Digital Library Resource</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            isInvalid={!!validationErrors.title}
          />
          {validationErrors.title && (
            <div style={{ color: 'red' }}>{validationErrors.title}</div>
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            isInvalid={!!validationErrors.description}
          />
          {validationErrors.description && (
            <div style={{ color: 'red' }}>{validationErrors.description}</div>
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="author">
          <Form.Label>Author</Form.Label>
          <Form.Control
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            isInvalid={!!validationErrors.author}
          />
          {validationErrors.author && (
            <div style={{ color: 'red' }}>{validationErrors.author}</div>
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="image">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            isInvalid={!!validationErrors.image}
          />
          <Form.Control
            type="file"
            onChange={(e) => uploadFileHandler(e, setImage)}
          />
          {validationErrors.image && (
            <div style={{ color: 'red' }}>{validationErrors.image}</div>
          )}
          {loading && <LoadingBox />}
        </Form.Group>
        <Form.Group className="mb-3" controlId="resourceFile">
          <Form.Label>Resource File</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter file URL"
            value={resourceFile}
            onChange={(e) => setResourceFile(e.target.value)}
            isInvalid={!!validationErrors.resourceFile}
          />
          <Form.Control
            type="file"
            onChange={(e) => uploadFileHandler(e, setResourceFile)}
          />
          {validationErrors.resourceFile && (
            <div style={{ color: 'red' }}>{validationErrors.resourceFile}</div>
          )}
          {loading && <LoadingBox />}
        </Form.Group>
        <Form.Group className="mb-3" controlId="datePublished">
          <Form.Label>Date Published</Form.Label>
          <Form.Control
            type="date"
            value={datePublished}
            readOnly // Set the date field as readOnly so the user cannot change it
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit" disabled={loading}>
            Add Resource
          </Button>
          {loading && <LoadingBox />}
        </div>
      </Form>
    </div>
  );
}
