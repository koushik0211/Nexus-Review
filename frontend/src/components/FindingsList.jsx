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
            if (['critical', 'high', 'error'].includes(sev)) { color = 'red'; }
            else if (['warning', 'medium'].includes(sev)) { color = 'yellow'; }
            else if (['suggestion', 'low', 'info'].includes(sev)) { color = 'cyan'; }

            return (
              <Accordion.Item key={idx} value={idx.toString()} className="glass-panel" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <Accordion.Control>
                  <Group wrap="nowrap">
                    <Badge color={color} variant="light">{finding.severity}</Badge>
                    
                    {finding.confidence_score && (
                      <Badge variant="light" color={finding.confidence_score > 85 ? 'teal' : finding.confidence_score > 60 ? 'yellow' : 'red'} size="xs">
                        {finding.confidence_score}% Certain
                      </Badge>
                    )}

                    <Text size="sm" fw={600} style={{ fontFamily: 'monospace', color: 'var(--mantine-color-blue-3)' }} ml="sm">
                      {finding.file} {finding.line ? `(L${finding.line})` : ''}
                    </Text>
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
