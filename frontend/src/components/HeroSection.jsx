import { Stack, Title, Text, Paper, Group, TextInput, Button, Center, Badge, Accordion, Select, PasswordInput } from '@mantine/core';
import '../styles/HeroSection.css';

export default function HeroSection({ url, setUrl, provider, setProvider, model, setModel, apiKey, setApiKey, onAnalyze, error }) {
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

            <Accordion 
              variant="transparent" 
              mt="sm" 
              styles={{ 
                control: { 
                  padding: '8px 4px', 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  '&:hover': { backgroundColor: 'transparent', color: '#fff' } 
                },
                content: { padding: '8px 0 0 0' }
              }}
            >
              <Accordion.Item value="advanced" style={{ border: 'none' }}>
                <Accordion.Control icon={<Text size="sm">⚙️</Text>}>
                  <Text size="sm" fw={500}>Use Custom AI Engine (Optional)</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Group grow align="flex-end">
                    <Select
                      label="AI Provider"
                      data={[
                        { value: 'gemini', label: 'Google Gemini' },
                        { value: 'openai', label: 'OpenAI' }
                      ]}
                      value={provider}
                      onChange={(val) => {
                        setProvider(val);
                        setModel(val === 'openai' ? 'gpt-4o' : 'gemini-2.5-flash');
                      }}
                      radius="md"
                      size="sm"
                      styles={{ 
                        label: { fontSize: '12px', fontWeight: 500, color: 'var(--mantine-color-dimmed)', marginBottom: '4px' },
                        input: { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' } 
                      }}
                    />
                    <Select
                      label="Model"
                      data={provider === 'openai' ? 
                        ['o1-preview', 'o1-mini', 'gpt-4o', 'gpt-4-turbo'] : 
                        ['gemini-3.5-pro', 'gemini-2.5-pro', 'gemini-2.5-flash']
                      }
                      value={model}
                      onChange={setModel}
                      radius="md"
                      size="sm"
                      styles={{ 
                        label: { fontSize: '12px', fontWeight: 500, color: 'var(--mantine-color-dimmed)', marginBottom: '4px' },
                        input: { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' } 
                      }}
                    />
                    <PasswordInput
                      label="Custom API Key"
                      placeholder="Add API Key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      radius="md"
                      size="sm"
                      styles={{ 
                        label: { fontSize: '12px', fontWeight: 500, color: 'var(--mantine-color-dimmed)', marginBottom: '4px' },
                        input: { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' } 
                      }}
                    />
                  </Group>
                  <Text size="xs" c="dimmed" mt="md" ta="center">
                    * If you leave the Api key field empty, Nexus will securely analyze using our Enterprise Google Gemini 2.5 Flash API Keys.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
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
