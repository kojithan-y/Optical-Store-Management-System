import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const validateForm = () => {
    const formErrors = {};

    if (!name) formErrors.name = 'Name is required';
    if (!email) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email is invalid';
    }

    if (!nic) {
      formErrors.nic = 'NIC is required';
    } else if (nic.length < 9 || nic.length > 12) {
      formErrors.nic = 'NIC must be between 9 and 12 characters';
    }

    if (!phone) {
      formErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      formErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!address) formErrors.address = 'Address is required';
    if (!password) {
      formErrors.password = 'Password is required';
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      formErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }

    return formErrors;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const { data } = await Axios.post('/api/users/signup', {
        name,
        email,
        nic,
        phone,
        address,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            isInvalid={!!errors.name}
          />
          {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!errors.email}
          />
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="nic">
          <Form.Label>NIC</Form.Label>
          <Form.Control
            value={nic}
            onChange={(e) => setNic(e.target.value)}
            isInvalid={!!errors.nic}
          />
          {errors.nic && <div style={{ color: 'red' }}>{errors.nic}</div>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="phone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            isInvalid={!!errors.phone}
          />
          {errors.phone && <div style={{ color: 'red' }}>{errors.phone}</div>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            isInvalid={!!errors.address}
          />
          {errors.address && <div style={{ color: 'red' }}>{errors.address}</div>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!!errors.password}
          />
          {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isInvalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <div style={{ color: 'red' }}>{errors.confirmPassword}</div>
          )}
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
        </div>
      </Form>
    </Container>
  );
}
