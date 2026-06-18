import { Center, Paper, Title, Text, Stack, ScrollArea, Loader, Group } from '@mantine/core';
import { useEffect, useRef } from 'react';

export default function LoadingState({ logs = [] }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <Center style={{ height: '60vh', flexDirection: 'column' }}>
      <Group mb="lg">
        <Loader size="sm" variant="dots" color="cyan" />
        <Title order={3} variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>Analyzing Codebase</Title>
      </Group>
      
      <Paper 
        radius="md" 
        p="md" 
        withBorder 
        style={{ 
          width: '100%', 
          maxWidth: '800px', 
          backgroundColor: '#0A0A0A', 
          borderColor: '#333',
          boxShadow: '0 0 40px rgba(0, 255, 65, 0.05)'
        }}
      >
        <Group justify="space-between" mb="xs" pb="xs" style={{ borderBottom: '1px solid #333' }}>
          <Text size="xs" c="dimmed" ff="monospace">nexus-terminal ~ zsh</Text>
          <Group gap={4}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </Group>
        </Group>

        <ScrollArea h={300} viewportRef={scrollRef} type="auto" offsetScrollbars>
          <Stack gap={4}>
            {logs.length === 0 && (
              <Text c="dimmed" size="sm" ff="monospace">Initializing secure connection to Nexus Engine...</Text>
            )}
            {logs.map((log, i) => {
              let color = '#00FF41'; // Hacker green
              if (log.includes('Error') || log.includes('failed')) color = '#ff6b6b';
              else if (log.includes('Validation passed')) color = '#51cf66';
              else if (log.includes('Node 4')) color = '#fcc419';
              else if (log.includes('Langchain Batching')) color = '#339af0';
              else if (log.includes('Node 1')) color = '#cc5de8';
              
              return (
                <Text 
                  key={i} 
                  size="sm" 
                  ff="monospace"
                  c={color}
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    lineHeight: 1.4
                  }}
                >
                  {log}
                </Text>
              )
            })}
          </Stack>
        </ScrollArea>
      </Paper>
    </Center>
  );
}
