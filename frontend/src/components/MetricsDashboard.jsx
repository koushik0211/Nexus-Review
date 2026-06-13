import { SimpleGrid, Card, Text, Group, Button, Title, Code } from '@mantine/core';

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

export default function MetricsDashboard({ result, onReset }) {
  const getVerdictProps = (rec) => {
    if (!rec) return { color: 'gray', title: 'Unknown' };
    if (rec.includes('Approve')) return { color: 'teal', title: 'Approved' };
    if (rec.includes('Request Changes')) return { color: 'red', title: 'Changes Requested' };
    return { color: 'yellow', title: 'Needs Discussion' };
  };

  const findings = result.findings || [];
  const critical = findings.filter(f => f.severity?.toLowerCase() === 'critical').length;
  const warnings = findings.filter(f => f.severity?.toLowerCase() === 'warning').length;
  const suggestions = findings.filter(f => f.severity?.toLowerCase() === 'suggestion').length;

  return (
    <>
      <Group justify="space-between" align="center" mb="xl">
        <Button variant="default" onClick={onReset} className="glass-panel">
          ← New Analysis
        </Button>
        <Title order={2}>Analysis Complete</Title>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder className="glass-panel">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
            Verdict
          </Text>
          <Text size="xl" fw={900} c={getVerdictProps(result.recommendation).color}>
            {result.recommendation}
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
            Summary
          </Text>
          <Text style={{ lineHeight: 1.6 }}>{formatText(result.summary)}</Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
        <Card shadow="sm" p="lg" radius="md" withBorder ta="center" className="glass-panel">
          <Text size="xl" fw={900}>{findings.length}</Text>
          <Text size="sm" c="dimmed" fw={500}>Total Findings</Text>
        </Card>
        <Card shadow="sm" p="lg" radius="md" withBorder ta="center" className="glass-panel" style={{ borderColor: 'rgba(250, 82, 82, 0.3)' }}>
          <Text size="xl" fw={900} c="red">{critical}</Text>
          <Text size="sm" c="dimmed" fw={500}>Critical</Text>
        </Card>
        <Card shadow="sm" p="lg" radius="md" withBorder ta="center" className="glass-panel" style={{ borderColor: 'rgba(252, 196, 25, 0.3)' }}>
          <Text size="xl" fw={900} c="yellow">{warnings}</Text>
          <Text size="sm" c="dimmed" fw={500}>Warnings</Text>
        </Card>
        <Card shadow="sm" p="lg" radius="md" withBorder ta="center" className="glass-panel" style={{ borderColor: 'rgba(34, 139, 230, 0.3)' }}>
          <Text size="xl" fw={900} c="blue">{suggestions}</Text>
          <Text size="sm" c="dimmed" fw={500}>Suggestions</Text>
        </Card>
      </SimpleGrid>
    </>
  );
}
