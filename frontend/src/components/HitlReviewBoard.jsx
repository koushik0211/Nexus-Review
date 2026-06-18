import React, { useState } from 'react';
import { Paper, Title, Text, Group, Button, ActionIcon, Stack, Textarea, Badge, ThemeIcon, Transition, Code } from '@mantine/core';
import { IconTrash, IconCheck, IconRobot, IconEdit, IconCheck as IconCheckSmall } from '@tabler/icons-react';

const formatText = (text) => {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <Code key={index} fz="sm" c="cyan.4" bg="dark.7">{part.slice(1, -1)}</Code>;
    }
    if (part.includes('*')) {
      const boldParts = part.split(/(\*[^*]+\*)/g);
      return boldParts.map((bp, i) => {
        if (bp.startsWith('*') && bp.endsWith('*')) {
          return <span key={`${index}-${i}`} style={{ fontWeight: 'bold' }}>{bp.slice(1, -1)}</span>;
        }
        return <span key={`${index}-${i}`}>{bp}</span>;
      });
    }
    return <span key={index}>{part}</span>;
  });
};

export const HitlReviewBoard = ({ initialFindings, onSubmit }) => {
  const [findings, setFindings] = useState(initialFindings || []);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleDelete = (index) => {
    setFindings(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleEdit = (index, newComment) => {
    setFindings(prev => prev.map((f, i) => i === index ? { ...f, comment: newComment } : f));
  };

  const handleSubmit = () => {
    onSubmit(findings);
  };

  return (
    <Paper className="glass-panel" shadow="xl" radius="lg" p="xl" withBorder mt="xl" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Group justify="space-between" mb="lg">
        <Group>
          <ThemeIcon size="xl" radius="md" variant="light" color="yellow">
            <IconRobot size={24} />
          </ThemeIcon>
          <div>
            <Title order={3} variant="gradient" gradient={{ from: 'yellow', to: 'orange', deg: 45 }}>
              Agent Paused: Review Findings
            </Title>
            <Text size="sm" c="dimmed">
              Nexus has discovered {findings.length} potential issues. Curate the data before synthesis.
            </Text>
          </div>
        </Group>
        <Button 
          variant="gradient" 
          gradient={{ from: 'indigo', to: 'cyan' }} 
          leftSection={<IconCheck size={18} />}
          onClick={handleSubmit}
          className="glow-button"
        >
          Approve & Resume
        </Button>
      </Group>

      <Stack gap="md">
        {findings.length === 0 ? (
          <Paper p="xl" radius="md" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Text ta="center" c="dimmed">No findings remaining. The AI will synthesize a clean review.</Text>
          </Paper>
        ) : (
          findings.map((finding, idx) => (
            <Transition mounted={true} transition="fade" duration={300} key={idx}>
              {(styles) => (
                <Paper 
                  style={{ ...styles, backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.05)' }} 
                  p="md" 
                  radius="md" 
                  withBorder
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <Group gap="xs">
                      <Badge 
                        color={['critical', 'high', 'error'].includes(finding.severity?.toLowerCase()) ? 'red' : ['warning', 'medium'].includes(finding.severity?.toLowerCase()) ? 'yellow' : 'cyan'} 
                        variant="light"
                      >
                        {finding.severity}
                      </Badge>
                      <Text size="sm" fw={600} style={{ fontFamily: 'monospace', color: 'var(--mantine-color-blue-3)' }}>
                        {finding.file} {finding.line ? `(L${finding.line})` : ''}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color={editingIndex === idx ? 'green' : 'blue'} 
                        onClick={() => setEditingIndex(editingIndex === idx ? null : idx)} 
                        title={editingIndex === idx ? "Save" : "Edit Comment"}
                      >
                        {editingIndex === idx ? <IconCheckSmall size={16} /> : <IconEdit size={16} />}
                      </ActionIcon>
                      <ActionIcon variant="light" color="red" onClick={() => handleDelete(idx)} title="Delete false positive">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  
                  {editingIndex === idx ? (
                    <Textarea
                      value={finding.comment}
                      onChange={(e) => handleEdit(idx, e.target.value)}
                      autosize
                      minRows={2}
                      variant="filled"
                      size="sm"
                      styles={{ input: { backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', borderColor: 'var(--mantine-color-blue-9)' } }}
                      autoFocus
                    />
                  ) : (
                    <Text fw={400} size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--mantine-color-gray-4)' }} onClick={() => setEditingIndex(idx)} style={{ cursor: 'pointer' }}>
                      {formatText(finding.comment)}
                    </Text>
                  )}
                </Paper>
              )}
            </Transition>
          ))
        )}
      </Stack>
    </Paper>
  );
};
