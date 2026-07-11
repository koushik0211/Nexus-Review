import { Container, Group, Text, Badge, Box, Stack, Button, ThemeIcon, Avatar, ActionIcon, Tooltip, Divider, Affix, Transition } from '@mantine/core';
import { IconRobot, IconLogout, IconMessageChatbot } from '@tabler/icons-react';

import HeroSection from '../components/HeroSection';
import LoadingState from '../components/LoadingState';
import MetricsDashboard from '../components/MetricsDashboard';
import FindingsList from '../components/FindingsList';
import { HitlReviewBoard } from '../components/HitlReviewBoard';
import AIChatDrawer from '../components/AIChatDrawer';
import DotField from '../components/react-bits/DotField';
import { useAnalyzePR } from '../hooks/useAnalyzePR';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { 
    url, setUrl, 
    provider, setProvider,
    model, setModel,
    apiKey, setApiKey,
    loading: prLoading, result, error, logs, 
    hitlPending, hitlData, 
    executeAnalysis, submitHitlFeedback, reset 
  } = useAnalyzePR();
  const { user, logout } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [chatOpened, setChatOpened] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box className="dashboard-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <Box style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <DotField
          dotRadius={1.5}
          dotSpacing={12}
          cursorRadius={450}
          cursorForce={0.15}
          bulgeOnly
          bulgeStrength={67}
          glowRadius={150}
          sparkle
          waveAmplitude={0}
          gradientFrom="rgba(56, 189, 248, 0.5)"
          gradientTo="rgba(37, 99, 235, 0.4)"
          glowColor="#050A1F"
        />
      </Box>

      <Box className="dashboard-content" style={{ position: 'relative', zIndex: 10 }}>
        <Container size="lg" py="xl">
          <Box 
            mb="xl" 
            style={{ 
              position: 'sticky', 
              top: '20px', 
              zIndex: 100,
              backgroundColor: 'rgba(20, 21, 23, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '50px',
              padding: '12px 24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <ThemeIcon size="md" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 45 }}>
                  <IconRobot size={18} />
                </ThemeIcon>
                <Text size="xl" fw={800} c="white" style={{ letterSpacing: '1px' }}>
                  NEXUS
                </Text>
              </Group>
              
              <Group gap="md">
                <Badge 
                  variant="dot" 
                  color={provider === 'openai' ? 'teal' : 'cyan'} 
                  size="md" 
                  radius="sm"
                  style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {model}
                </Badge>
                
                <Group gap="xs" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Avatar size="sm" radius="xl" color="blue" src={null}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Avatar>
                  <Text size="sm" c="gray.3" fw={500}>{user?.email}</Text>
                </Group>
                
                <Tooltip label="Logout" position="bottom">
                  <ActionIcon variant="light" color="red.5" size="lg" radius="md" onClick={logout}>
                    <IconLogout size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Box>

          <Box py="xl">
            {!result && !prLoading && !hitlPending && (
              <HeroSection 
                url={url} 
                setUrl={setUrl} 
                provider={provider}
                setProvider={setProvider}
                model={model}
                setModel={setModel}
                apiKey={apiKey}
                setApiKey={setApiKey}
                onAnalyze={executeAnalysis} 
                error={error} 
              />
            )}

            {prLoading && !hitlPending && <LoadingState logs={logs} />}

            {hitlPending && (
              <HitlReviewBoard 
                initialFindings={hitlData} 
                onSubmit={submitHitlFeedback} 
              />
            )}

            {result && !prLoading && !hitlPending && (
              <Stack gap="xl">
                <MetricsDashboard result={result} onReset={reset} />
                <FindingsList findings={result.findings} />
              </Stack>
            )}
          </Box>
        </Container>
      </Box>

      {/* Ask AI FAB Button */}
      {result && !prLoading && !hitlPending && (
        <Affix position={{ bottom: 30, right: 30 }} zIndex={50}>
          <Transition transition="slide-up" mounted={!chatOpened}>
            {(transitionStyles) => (
              <ActionIcon
                size={60}
                radius="100%"
                variant="gradient"
                gradient={{ from: 'violet', to: 'blue', deg: 45 }}
                onClick={() => setChatOpened(true)}
                style={{ ...transitionStyles, boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)' }}
              >
                <IconMessageChatbot size={28} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      )}

      {/* AI Chat Drawer */}
      <AIChatDrawer
        opened={chatOpened}
        onClose={() => setChatOpened(false)}
        findings={result?.findings || []}
        provider={provider}
        model={model}
        apiKey={apiKey}
      />
    </Box>
  );
}
