import React, { useState } from 'react';
import { Paper, Title, Text, Group, Button, ActionIcon, Stack, Textarea, Badge, ThemeIcon, Transition, Box, Tooltip, Divider } from '@mantine/core';
import { IconTrash, IconCheck, IconRobot, IconEdit, IconCheck as IconCheckSmall, IconMessageCircle, IconMessageCode } from '@tabler/icons-react';
import { formatText, getSeverityDetails } from '../utils/formatters';

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

  const handleFeedback = (index, feedback) => {
    setFindings(prev => prev.map((f, i) => i === index ? { ...f, user_feedback: feedback } : f));
  };

  const handleSubmit = () => {
    onSubmit(findings);
  };

  return (
    <Paper shadow="xl" radius="lg" p="xl" withBorder mt="xl" bg="#141517" style={{ borderColor: 'rgba(255,255,255,0.08)', animation: 'fadeIn 0.5s ease-out' }}>
      <Group justify="space-between" mb="xl">
        <Group align="center">
          <ThemeIcon size="xl" radius="xl" variant="filled" color="indigo.6">
            <IconRobot size={24} />
          </ThemeIcon>
          <div>
            <Title order={3} fw={700} c="gray.1" letterSpacing="-0.5px">
              Agent Paused: Review Findings
            </Title>
            <Text size="sm" c="gray.5" mt={2}>
              Nexus discovered {findings.length} potential issues. Curate the data before the final synthesis.
            </Text>
          </div>
        </Group>
        <Button 
          variant="gradient" 
          gradient={{ from: 'indigo.6', to: 'cyan.5' }} 
          leftSection={<IconCheck size={18} />}
          onClick={handleSubmit}
          size="md"
          radius="md"
          style={{ boxShadow: '0 4px 15px rgba(51, 154, 240, 0.3)' }}
        >
          Approve & Resume
        </Button>
      </Group>

      <Stack gap="xl">
        {findings.length === 0 ? (
          <Paper p="xl" radius="md" bg="rgba(0,0,0,0.2)" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Text ta="center" c="dimmed">No findings remaining. The AI will synthesize a clean review.</Text>
          </Paper>
        ) : (
          findings.map((finding, idx) => {
            const sevDetails = getSeverityDetails(finding.severity);
            const isEditing = editingIndex === idx;

            return (
              <Transition mounted={true} transition="fade" duration={300} key={idx}>
                {(styles) => (
                  <Paper 
                    style={{ 
                      ...styles, 
                      borderColor: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden'
                    }} 
                    radius="lg" 
                    withBorder
                    bg="#1A1B1E"
                  >
                    <Box style={{ borderLeft: `4px solid var(--mantine-color-${sevDetails.color})` }} p="lg">
                      <Group justify="space-between" align="flex-start" mb="md">
                        <Group gap="sm">
                          <Badge 
                            color={sevDetails.color.split('.')[0]} 
                            variant="light"
                            size="md"
                            radius="sm"
                            leftSection={sevDetails.icon}
                            styles={{ root: { backgroundColor: sevDetails.bg } }}
                          >
                            {finding.severity?.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            color="gray.6" 
                            size="md" 
                            radius="sm"
                            styles={{ root: { textTransform: 'none', fontFamily: 'monospace' } }}
                          >
                            {finding.file} {finding.line ? `(L${finding.line})` : ''}
                          </Badge>
                        </Group>
                        
                        <Group gap="xs">
                          <Tooltip label={isEditing ? "Save changes" : "Edit AI Finding"}>
                            <ActionIcon 
                              variant="light" 
                              color={isEditing ? 'green.5' : 'blue.5'} 
                              size="lg"
                              radius="md"
                              onClick={() => setEditingIndex(isEditing ? null : idx)} 
                            >
                              {isEditing ? <IconCheckSmall size={20} /> : <IconEdit size={20} />}
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete false positive">
                            <ActionIcon variant="light" color="red.5" size="lg" radius="md" onClick={() => handleDelete(idx)}>
                              <IconTrash size={20} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                      
                      <Box mb="xl">
                        {isEditing ? (
                          <Textarea
                            value={finding.comment}
                            onChange={(e) => handleEdit(idx, e.target.value)}
                            autosize
                            minRows={3}
                            variant="filled"
                            size="sm"
                            radius="md"
                            styles={{ 
                              input: { 
                                backgroundColor: 'rgba(0,0,0,0.3)', 
                                color: 'var(--mantine-color-gray-2)', 
                                borderColor: 'var(--mantine-color-blue-8)',
                                fontSize: '15px',
                                lineHeight: 1.6
                              } 
                            }}
                            autoFocus
                          />
                        ) : (
                          <Text 
                            fw={400} 
                            size="md" 
                            style={{ 
                              whiteSpace: 'pre-wrap', 
                              lineHeight: 1.6, 
                              color: 'var(--mantine-color-gray-3)', 
                              cursor: 'pointer' 
                            }} 
                            onClick={() => setEditingIndex(idx)}
                          >
                            {formatText(finding.comment)}
                          </Text>
                        )}
                      </Box>

                      <Divider color="rgba(255,255,255,0.05)" mb="md" />

                      <Box bg="rgba(0,0,0,0.2)" p="md" radius="md" style={{ borderRadius: '8px' }}>
                        <Group gap="xs" mb="xs">
                          <IconMessageCode size={16} color="#4dabf7" />
                          <Text size="xs" fw={600} c="blue.4" tt="uppercase" letterSpacing="0.5px">
                            Add a Comment
                          </Text>
                        </Group>
                        <Textarea
                          placeholder="e.g., 'Ignore this finding, it is intentional' or 'Highlight this heavily in the final review'..."
                          value={finding.user_feedback || ''}
                          onChange={(e) => handleFeedback(idx, e.target.value)}
                          autosize
                          minRows={1}
                          size="sm"
                          variant="unstyled"
                          styles={{ 
                            input: { 
                              color: 'var(--mantine-color-gray-4)', 
                              padding: 0,
                              fontSize: '14px'
                            } 
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                )}
              </Transition>
            );
          })
        )}
      </Stack>
    </Paper>
  );
};
