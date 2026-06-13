import { useEffect } from 'react';
import { Title, Text, Box, Stack, Flex, Center, Container, ThemeIcon } from '@mantine/core';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconShieldCheck, IconBolt, IconCode, IconCodeAsterix } from '@tabler/icons-react';
import '../styles/AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <Flex h="100vh" w="100vw">
      <Box flex={1} className="auth-split-left" p={60}>
        <Box className="auth-glow-1" />
        <Box className="auth-glow-2" />
        
        <Box className="auth-relative-z1">
          <Text size="xl" fw={900} variant="gradient" gradient={{ from: 'cyan', to: 'blue', deg: 45 }} style={{ letterSpacing: '2px' }}>
            NEXUS
          </Text>
        </Box>

        <Box className="auth-relative-z1" maw={500} mt="auto" mb="auto">
          <Title order={1} size="4rem" fw={900} lh={1.1} mb="md" c="white">
            Ship code faster. <br />
            <Text span variant="gradient" gradient={{ from: '#228be6', to: '#1c7ed6', deg: 45 }}>
              Break nothing.
            </Text>
          </Title>
          <Text size="xl" c="dimmed" mb={40} lh={1.6}>
            Autonomous AI code review that catches vulnerabilities, performance bottlenecks, and logic flaws before they hit production.
          </Text>

          <Stack gap="lg">
            <Flex gap="md" align="flex-start">
              <ThemeIcon size={40} radius="md" variant="light" color="cyan" className="auth-icon-box">
                <IconShieldCheck size={24} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="lg" c="white">Zero-day Vulnerability Detection</Text>
                <Text size="sm" c="dimmed">Identifies OWASP top 10 risks within diffs.</Text>
              </Box>
            </Flex>

            <Flex gap="md" align="flex-start">
              <ThemeIcon size={40} radius="md" variant="light" color="blue" className="auth-icon-box">
                <IconBolt size={24} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="lg" c="white">Lightning Fast Analysis</Text>
                <Text size="sm" c="dimmed">Get actionable insights in seconds, not hours.</Text>
              </Box>
            </Flex>

            <Flex gap="md" align="flex-start">
              <ThemeIcon size={40} radius="md" variant="light" color="grape" className="auth-icon-box">
                <IconCode size={24} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="lg" c="white">Automated Code Diffs</Text>
                <Text size="sm" c="dimmed">Reviews code directly via suggested modifications.</Text>
              </Box>
            </Flex>
          </Stack>
        </Box>

        <Box className="auth-relative-z1">
          <Text size="sm" c="dimmed">
            © 2026 Nexus AI. All rights reserved.
          </Text>
        </Box>
      </Box>

      <Box w={{ base: '100%', md: '500px' }} className="auth-split-right" p="xl">
        <Container size="xs" w="100%" maw={380}>
          <Title order={2} ta="center" mb="xs" c="white">Welcome back</Title>
          <Text c="dimmed" size="sm" ta="center" mb={40}>
            Please enter your details to sign in.
          </Text>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#228be6',
                    brandAccent: '#1c7ed6',
                    messageText: '#fff',
                    inputBackground: '#1A1B1E',
                    inputBorder: '#373A40',
                    inputBorderHover: '#228be6',
                    inputBorderFocus: '#228be6',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              }
            }}
            theme="dark"
            providers={['google']}
            redirectTo={window.location.origin}
          />
        </Container>
      </Box>
    </Flex>
  );
}
