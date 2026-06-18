import { Container, Group, Text, Badge, Box, Stack, Button } from '@mantine/core';

import HeroSection from '../components/HeroSection';
import LoadingState from '../components/LoadingState';
import MetricsDashboard from '../components/MetricsDashboard';
import FindingsList from '../components/FindingsList';
import { HitlReviewBoard } from '../components/HitlReviewBoard';
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box className="dashboard-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <Box style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
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
          <Group justify="space-between" align="center" mb="xl">
            <Group gap="xs">
              <Text size="xl" fw={800} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 45 }} style={{ letterSpacing: '0.5px' }}>
                NEXUS
              </Text>
            </Group>
            <Group gap="md">
              <Text size="sm" c="dimmed">{user?.email}</Text>
              <Badge variant="outline" color={provider === 'openai' ? 'green' : 'cyan'} size="md" radius="sm">
                {model}
              </Badge>
              <Button variant="light" color="red" size="xs" onClick={logout}>
                Logout
              </Button>
            </Group>
          </Group>

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
    </Box>
  );
}
