import { SimpleGrid, Card, Text, Group, Button, Title, Box, ThemeIcon, Badge, Divider } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconX, IconMessageCircle, IconBug, IconAlertTriangle, IconInfoCircle, IconListCheck } from '@tabler/icons-react';
import { formatText } from '../utils/formatters';

export default function MetricsDashboard({ result, onReset }) {
  const getVerdictProps = (rec) => {
    if (!rec) return { color: 'gray.5', title: 'Unknown', icon: <IconMessageCircle size={24} /> };
    if (rec.includes('Approve')) return { color: 'teal.5', bg: 'rgba(18, 184, 134, 0.1)', title: 'Approved', icon: <IconCheck size={28} /> };
    if (rec.includes('Request Changes')) return { color: 'red.5', bg: 'rgba(250, 82, 82, 0.1)', title: 'Changes Requested', icon: <IconX size={28} /> };
    return { color: 'yellow.5', bg: 'rgba(252, 196, 25, 0.1)', title: 'Needs Discussion', icon: <IconMessageCircle size={28} /> };
  };

  const findings = result.findings || [];
  const critical = findings.filter(f => f.severity?.toLowerCase() === 'critical' || f.severity?.toLowerCase() === 'error').length;
  const warnings = findings.filter(f => f.severity?.toLowerCase() === 'warning').length;
  const suggestions = findings.filter(f => f.severity?.toLowerCase() === 'suggestion' || f.severity?.toLowerCase() === 'info').length;

  const verdictProps = getVerdictProps(result.recommendation);

  return (
    <Box mt="xl">
      <Group justify="space-between" align="center" mb="xl">
        <Button 
          variant="filled" 
          size="md"
          radius="md"
          onClick={onReset} 
          leftSection={<IconArrowLeft size={20} />}
          styles={{ 
            root: { 
              backgroundColor: '#25262B', 
              color: '#C1C2C5', 
              border: '1px solid rgba(255,255,255,0.05)',
              fontWeight: 500,
              fontSize: '15px',
              padding: '0 20px',
              '&:hover': { backgroundColor: '#2C2E33', color: '#fff' } 
            } 
          }}
        >
          New Analysis
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
        {/* Verdict Card */}
        <Card 
          padding="xl" 
          radius="lg" 
          withBorder 
          bg="#1A1B1E"
          style={{ borderColor: 'rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >
          <Text size="sm" c="gray.5" tt="uppercase" fw={600} letterSpacing="1px" mb="md">
            Final Verdict
          </Text>
          <ThemeIcon 
            size={64} 
            radius="100%" 
            variant="light" 
            color={verdictProps.color.split('.')[0]} 
            style={{ backgroundColor: verdictProps.bg }}
            mb="md"
          >
            {verdictProps.icon}
          </ThemeIcon>
          <Text size="xl" fw={800} c={verdictProps.color} ta="center">
            {result.recommendation}
          </Text>
        </Card>

        {/* Summary Card */}
        <Card 
          padding="xl" 
          radius="lg" 
          withBorder 
          bg="#1A1B1E"
          style={{ gridColumn: 'span 2', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Group gap="xs" mb="lg">
            <IconListCheck size={20} color="#4dabf7" />
            <Text size="sm" c="gray.4" tt="uppercase" fw={600} letterSpacing="1px">
              Synthesis Summary
            </Text>
          </Group>
          <Text size="md" fw={400} c="gray.2" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {formatText(result.summary)}
          </Text>
        </Card>
      </SimpleGrid>

      <Title order={4} c="gray.3" mb="md" mt="xl" fw={600}>Identified Issues Breakdown</Title>
      <Divider color="rgba(255,255,255,0.05)" mb="lg" />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
        {/* Total Stats */}
        <Card p="lg" radius="md" withBorder bg="#1A1B1E" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="gray.5" fw={600} tt="uppercase">Total</Text>
            <IconBug size={18} color="var(--mantine-color-gray-6)" />
          </Group>
          <Text size="2.5rem" fw={900} c="gray.2">{findings.length}</Text>
        </Card>

        {/* Critical Stats */}
        <Card p="lg" radius="md" withBorder bg="#1A1B1E" style={{ borderColor: 'rgba(250, 82, 82, 0.3)', borderLeft: '4px solid var(--mantine-color-red-6)' }}>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="red.3" fw={600} tt="uppercase">Critical</Text>
            <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" />
          </Group>
          <Text size="2.5rem" fw={900} c="red.4">{critical}</Text>
        </Card>

        {/* Warning Stats */}
        <Card p="lg" radius="md" withBorder bg="#1A1B1E" style={{ borderColor: 'rgba(252, 196, 25, 0.3)', borderLeft: '4px solid var(--mantine-color-yellow-5)' }}>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="yellow.3" fw={600} tt="uppercase">Warnings</Text>
            <IconAlertTriangle size={18} color="var(--mantine-color-yellow-5)" />
          </Group>
          <Text size="2.5rem" fw={900} c="yellow.4">{warnings}</Text>
        </Card>

        {/* Suggestion Stats */}
        <Card p="lg" radius="md" withBorder bg="#1A1B1E" style={{ borderColor: 'rgba(34, 139, 230, 0.3)', borderLeft: '4px solid var(--mantine-color-blue-5)' }}>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="blue.3" fw={600} tt="uppercase">Suggestions</Text>
            <IconInfoCircle size={18} color="var(--mantine-color-blue-5)" />
          </Group>
          <Text size="2.5rem" fw={900} c="blue.4">{suggestions}</Text>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
