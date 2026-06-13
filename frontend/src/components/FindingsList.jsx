import { Box, Title, Paper, Text, Accordion, Group, Badge, Code } from '@mantine/core';
import CodeDiffViewer from './CodeDiffViewer';

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

export default function FindingsList({ findings }) {
  return (
    <Box>
      <Title order={3} mb="md">Detailed Findings</Title>
      {!findings || findings.length === 0 ? (
        <Paper p="xl" withBorder radius="md" ta="center">
          <Text size="lg" fw={500} c="teal">No issues found! The code looks great. 🎉</Text>
        </Paper>
      ) : (
        <Accordion variant="separated" radius="md">
          {findings.map((finding, idx) => {
            const sev = finding.severity?.toLowerCase() || 'info';
            let color = 'blue';
            if (sev === 'critical') { color = 'red'; }
            else if (sev === 'warning') { color = 'yellow'; }

            return (
              <Accordion.Item key={idx} value={idx.toString()} className="glass-panel">
                <Accordion.Control>
                  <Group wrap="nowrap">
                    <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: `var(--mantine-color-${color}-6)` }} />
                    <Badge color={color} variant="dot" size="md">{sev.toUpperCase()}</Badge>
                    <Text ff="monospace" size="sm" fw={500} ml="sm">{finding.file}</Text>
                    <Text size="xs" c="dimmed">Line {finding.line}</Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Paper p="md" bg="rgba(0,0,0,0.3)">
                    <Text mb="md" fw={400} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
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
