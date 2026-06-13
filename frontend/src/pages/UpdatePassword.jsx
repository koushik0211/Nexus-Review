import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Container, Title, PasswordInput, Button, Box, Stack, Text } from '@mantine/core';
import '../styles/Dashboard.css';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      navigate('/');
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <Box className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box className="dashboard-static-glow-1" />
      <Box className="dashboard-static-glow-2" />
      
      <Container size="xs" w="100%" style={{ position: 'relative', zIndex: 2 }}>
        <Box className="glass-panel" p={40} style={{ borderRadius: '16px' }}>
          <Title order={2} ta="center" mb="xs" c="white">Update Password</Title>
          <Text c="dimmed" size="sm" ta="center" mb={30}>
            Please enter your new password below.
          </Text>
          <form onSubmit={handleUpdate}>
            <Stack>
              <PasswordInput
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="md"
                classNames={{ input: 'input-glass' }}
              />
              <Button type="submit" loading={loading} fullWidth size="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                Save Password
              </Button>
            </Stack>
          </form>
        </Box>
      </Container>
    </Box>
  );
}
