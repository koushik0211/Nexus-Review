import { Stack, Title, Text, Paper, Group, TextInput, Button, Center, Badge } from '@mantine/core';
import '../styles/HeroSection.css';

export default function HeroSection({ url, setUrl, onAnalyze, error }) {
  return (
    <Center className="hero-center">
      <Stack align="center" gap="lg">
        <Badge variant="light" color="blue" size="lg" radius="xl" mb="xs">
          Autonomous AI Code Review
        </Badge>
        
        <Title 
          order={1} 
          ta="center" 
          variant="gradient" 
          gradient={{ from: 'blue', to: 'cyan', deg: 45 }} 
          className="hero-title"
        >
          NEXUS
        </Title>
        
        <Text c="dimmed" size="xl" ta="center" maw={600} mt="sm">
          Paste your GitHub Pull Request URL below. Our AI agent autonomously analyzes diffs for vulnerabilities, bugs, and style issues instantly.
        </Text>

        <Paper 
          className="glass-panel"
          shadow="xl" 
          radius="lg" 
          p="xl" 
          withBorder 
          w="100%" 
          maw={700} 
          mt="xl"
        >
          <form onSubmit={onAnalyze}>
            <Group align="flex-start" wrap="nowrap">
              <TextInput
                flex={1}
                size="lg"
                placeholder="https://github.com/facebook/react/pull/12345"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                error={error}
                radius="md"
                classNames={{ input: 'input-glass' }}
              />
              <Button type="submit" size="lg" disabled={!url} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                Analyze PR
              </Button>
            </Group>
          </form>
        </Paper>

        <Group mt="xl" gap="lg">
          <Badge variant="dot" color="red" size="md">Security Flaws</Badge>
          <Badge variant="dot" color="yellow" size="md">Logic Bugs</Badge>
          <Badge variant="dot" color="green" size="md">Performance</Badge>
          <Badge variant="dot" color="cyan" size="md">Style Guidelines</Badge>
        </Group>
      </Stack>
    </Center>
  );
}
