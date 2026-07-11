import { Box, Title, Paper, Text, Accordion, Group, Badge, Divider } from '@mantine/core';
import CodeDiffViewer from './CodeDiffViewer';
import { formatText, getSeverityDetails } from '../utils/formatters';

export default function FindingsList({ findings }) {
  return (
    <Box mt="xl">
      <Title order={4} c="gray.3" mb="md" fw={600}>Detailed Findings</Title>
      <Divider color="rgba(255,255,255,0.05)" mb="lg" />
      
      {!findings || findings.length === 0 ? (
        <Paper p="xl" withBorder radius="md" ta="center" bg="#1A1B1E" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Text size="lg" fw={600} c="teal.5">No issues found! The code looks great. 🎉</Text>
        </Paper>
      ) : (
        <Accordion 
          variant="separated" 
          radius="lg"
          styles={{
            item: {
              backgroundColor: '#1A1B1E',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden'
            },
            control: {
              padding: '16px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.02)'
              }
            },
            content: {
              padding: '0 16px 24px 16px',
            }
          }}
        >
          {findings.map((finding, idx) => {
            const sevDetails = getSeverityDetails(finding.severity);

            return (
              <Accordion.Item 
                key={idx} 
                value={idx.toString()} 
                style={{ borderLeft: `4px solid var(--mantine-color-${sevDetails.color})` }}
              >
                <Accordion.Control>
                  <Group wrap="nowrap" gap="md">
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
                    
                    {finding.confidence_score && (
                      <Badge variant="outline" color={finding.confidence_score > 85 ? 'teal.6' : finding.confidence_score > 60 ? 'yellow.6' : 'red.6'} size="sm" radius="sm">
                        {finding.confidence_score}% Certain
                      </Badge>
                    )}

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
                </Accordion.Control>
                <Accordion.Panel>
                  <Paper p="lg" bg="rgba(0,0,0,0.2)" radius="md" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                    <Text mb="xl" fw={400} c="gray.3" size="md" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {formatText(finding.comment)}
                    </Text>
                    <CodeDiffViewer 
                      originalCode={finding.original_code} 
                      suggestedCode={finding.suggested_code} 
                      language={finding.file?.split('.').pop() || 'javascript'} 
                    />
                  </Paper>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </Box>
  );
}
