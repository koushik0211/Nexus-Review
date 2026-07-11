import { useState, useRef, useEffect } from 'react';
import { Drawer, Box, Text, Group, Badge, TextInput, ActionIcon, ScrollArea, Paper, Stack, ThemeIcon, CloseButton, Menu, Checkbox, Loader } from '@mantine/core';
import { IconSend, IconRobot, IconUser, IconPlus, IconSparkles } from '@tabler/icons-react';
import { chatWithAI } from '../services/api';
import { getSeverityColor, getSeverityIcon, formatChatMessage } from '../utils/formatters';

export default function AIChatDrawer({ opened, onClose, findings, provider, model, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFindings, setSelectedFindings] = useState([]);
  const viewport = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!opened) {
      setMessages([]);
      setInput('');
      setSelectedFindings([]);
    }
  }, [opened]);

  const toggleFinding = (idx) => {
    setSelectedFindings(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (selectedFindings.length === 0) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const contextFindings = selectedFindings.map(idx => findings[idx]);
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const reply = await chatWithAI(
        userMessage, 
        contextFindings, 
        history, 
        { provider, model, api_key: apiKey }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      padding={0}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      styles={{
        content: {
          backgroundColor: '#111113',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }
      }}
    >
      {/* Header */}
      <Box px="lg" py="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size="md" radius="md" variant="gradient" gradient={{ from: 'violet', to: 'blue', deg: 45 }}>
              <IconSparkles size={16} />
            </ThemeIcon>
            <Text size="lg" fw={700} c="white">Ask AI</Text>
          </Group>
          <CloseButton onClick={onClose} variant="subtle" c="gray.5" />
        </Group>
      </Box>

      {/* Context Tags */}
      <Box px="lg" py="sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <Text size="xs" c="gray.5" tt="uppercase" fw={600} mb="xs" style={{ letterSpacing: '0.5px' }}>
          Context ({selectedFindings.length} findings tagged)
        </Text>
        <Group gap="xs" wrap="wrap">
          {selectedFindings.map(idx => {
            const f = findings[idx];
            return (
              <Badge
                key={idx}
                size="md"
                radius="sm"
                color={getSeverityColor(f.severity)}
                variant="light"
                leftSection={getSeverityIcon(f.severity)}
                rightSection={
                  <CloseButton size="xs" variant="transparent" c="inherit" onClick={() => toggleFinding(idx)} />
                }
                styles={{
                  root: { paddingRight: '4px', cursor: 'default' },
                  label: { textTransform: 'none', fontWeight: 500, fontSize: '12px' }
                }}
              >
                {f.file?.split('/').pop()} (L{f.line})
              </Badge>
            );
          })}

          <Menu shadow="md" width={320} position="bottom-start" withinPortal>
            <Menu.Target>
              <Badge
                size="md"
                radius="sm"
                variant="outline"
                color="gray.6"
                leftSection={<IconPlus size={12} />}
                style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                styles={{ label: { textTransform: 'none', fontWeight: 500, fontSize: '12px' } }}
              >
                Add Finding
              </Badge>
            </Menu.Target>
            <Menu.Dropdown style={{ backgroundColor: '#1A1B1E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Menu.Label>Select findings as context</Menu.Label>
              {findings?.map((f, idx) => (
                <Menu.Item
                  key={idx}
                  onClick={() => toggleFinding(idx)}
                  leftSection={
                    <Checkbox
                      checked={selectedFindings.includes(idx)}
                      onChange={() => {}}
                      size="xs"
                      color="blue"
                      styles={{ input: { cursor: 'pointer' } }}
                    />
                  }
                  rightSection={
                    <Badge size="xs" color={getSeverityColor(f.severity)} variant="light">
                      {f.severity}
                    </Badge>
                  }
                  styles={{
                    item: { 
                      fontSize: '13px', 
                      color: '#C1C2C5',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' }
                    }
                  }}
                >
                  {f.file?.split('/').pop()} (L{f.line})
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Box>

      {/* Chat Messages */}
      <ScrollArea 
        viewportRef={viewport} 
        style={{ flex: 1 }}
        styles={{ 
          viewport: { padding: '16px' },
          scrollbar: { '&[data-orientation="vertical"]': { width: 6 } }
        }}
      >
        {messages.length === 0 ? (
          <Box ta="center" py={80}>
            <ThemeIcon size={48} radius="100%" variant="light" color="gray" mb="md" mx="auto">
              <IconRobot size={24} />
            </ThemeIcon>
            <Text size="md" c="gray.4" fw={500}>No messages yet</Text>
            <Text size="sm" c="gray.6" mt="xs" maw={280} mx="auto" lh={1.5}>
              Tag findings above and ask questions about the code review results.
            </Text>
          </Box>
        ) : (
          <Stack gap="md">
            {messages.map((msg, idx) => (
              <Group 
                key={idx} 
                align="flex-start" 
                gap="sm" 
                justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                wrap="nowrap"
              >
                {msg.role === 'assistant' && (
                  <ThemeIcon size="sm" radius="xl" variant="gradient" gradient={{ from: 'violet', to: 'blue' }} mt={4} style={{ flexShrink: 0 }}>
                    <IconRobot size={12} />
                  </ThemeIcon>
                )}
                <Paper 
                  p="sm" 
                  radius="md"
                  maw="85%"
                  style={{
                    backgroundColor: msg.role === 'user' ? 'rgba(79, 172, 254, 0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(79, 172, 254, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <Box>{formatChatMessage(msg.content)}</Box>
                  ) : (
                    <Text size="sm" c="gray.2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {msg.content}
                    </Text>
                  )}
                </Paper>
                {msg.role === 'user' && (
                  <ThemeIcon size="sm" radius="xl" variant="light" color="blue" mt={4} style={{ flexShrink: 0 }}>
                    <IconUser size={12} />
                  </ThemeIcon>
                )}
              </Group>
            ))}
            {loading && (
              <Group align="flex-start" gap="sm" wrap="nowrap">
                <ThemeIcon size="sm" radius="xl" variant="gradient" gradient={{ from: 'violet', to: 'blue' }} mt={4} style={{ flexShrink: 0 }}>
                  <IconRobot size={12} />
                </ThemeIcon>
                <Paper 
                  p="sm" 
                  radius="md" 
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.06)' 
                  }}
                >
                  <Group gap="xs">
                    <Loader size="xs" color="blue" type="dots" />
                    <Text size="sm" c="gray.5">Thinking...</Text>
                  </Group>
                </Paper>
              </Group>
            )}
          </Stack>
        )}
      </ScrollArea>

      {/* Input Bar */}
      <Box px="lg" py="md" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {selectedFindings.length === 0 && (
          <Text size="xs" c="yellow.5" mb="xs" ta="center">
            ⚠️ Tag at least one finding above to start chatting.
          </Text>
        )}
        <Group gap="sm" wrap="nowrap">
          <TextInput
            placeholder={selectedFindings.length > 0 ? "Ask about the selected findings..." : "Select findings first..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={selectedFindings.length === 0 || loading}
            flex={1}
            radius="lg"
            size="md"
            styles={{
              input: {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '14px',
                '&:focus': { borderColor: '#4facfe' },
                '&::placeholder': { color: '#5c5f66' },
              }
            }}
          />
          <ActionIcon 
            size="lg" 
            radius="lg" 
            variant="gradient" 
            gradient={{ from: 'blue', to: 'cyan' }}
            onClick={handleSend}
            disabled={!input.trim() || selectedFindings.length === 0 || loading}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Box>
    </Drawer>
  );
}
