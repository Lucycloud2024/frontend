import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, TextField, Typography, Alert, CircularProgress, Link } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import api from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setField = field => e => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    if (form.username.length < 3 || form.username.length > 50) return 'Username must be 3 to 50 characters.';
    if (!EMAIL_RE.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1929 0%, #1B447A 50%, #0d47a1 100%)',
      px: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 480, boxShadow: '0 8px 40px rgba(0,0,0,0.3)', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            <MedicationIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h5" color="primary" fontWeight={700}>ZenPharma</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Create your account
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Username" value={form.username} onChange={setField('username')}
              margin="normal" required autoFocus />
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={setField('email')}
              margin="normal" required />
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={setField('password')}
              margin="normal" required helperText="At least 8 characters" />
            <TextField fullWidth label="Confirm password" type="password" value={form.confirm} onChange={setField('confirm')}
              margin="normal" required />
            <Button type="submit" fullWidth variant="contained" size="large"
              sx={{ mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}
              disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Already have an account? <Link component={RouterLink} to="/login">Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
