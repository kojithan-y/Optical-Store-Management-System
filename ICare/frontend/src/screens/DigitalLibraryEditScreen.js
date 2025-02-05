import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';

export default function DigitalLibraryEditScreen() {
  const { id: resourceId } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [resourceFile, setResourceFile] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/digital-library/${resourceId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setTitle(data.title);
        setDescription(data.description);
        setAuthor(data.author);
        setImage(data.image);
        setResourceFile(data.resourceFile);
        setDatePublished(data.datePublished.substring(0, 10)); // Pre-fill date from backend data
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error(getError(err));
      }
    };
    fetchResource();
  }, [resourceId, userInfo]);

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
    if (!datePublished) errors.datePublished = 'Date published is required';

    return errors;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoadingUpdate(true);
      await axios.put(
        `/api/digital-library/${resourceId}`,
        {
          title,
          description,
          author,
          image,
          resourceFile,
          datePublished,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoadingUpdate(false);
      toast.success('Resource updated successfully');
      navigate('/digital-library');
    } catch (err) {
      setLoadingUpdate(false);
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Edit Digital Library Resource</title>
      </Helmet>
      <h1>Edit Digital Library Resource</h1>
      {loading ? (
        <LoadingBox />
      ) : (
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
              <Alert variant="danger">{validationErrors.title}</Alert>
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
              <Alert variant="danger">{validationErrors.description}</Alert>
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
              <Alert variant="danger">{validationErrors.author}</Alert>
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
              <Alert variant="danger">{validationErrors.image}</Alert>
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
              <Alert variant="danger">{validationErrors.resourceFile}</Alert>
            )}
            {loading && <LoadingBox />}
          </Form.Group>

          <Form.Group className="mb-3" controlId="datePublished">
            <Form.Label>Date Published</Form.Label>
            <Form.Control
              type="date"
              value={datePublished}
              readOnly
            />
            {validationErrors.datePublished && (
              <Alert variant="danger">{validationErrors.datePublished}</Alert>
            )}
          </Form.Group>

          <div className="mb-3">
            <Button type="submit" disabled={loadingUpdate}>
              Update Resource
            </Button>
            {loadingUpdate && <LoadingBox />}
          </div>
        </Form>
      )}
    </div>
  );
}
