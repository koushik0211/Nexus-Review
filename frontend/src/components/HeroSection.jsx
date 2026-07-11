import { Stack, Title, Text, Paper, Group, TextInput, Button, Center, Badge, Accordion, Select, PasswordInput, ThemeIcon, Box } from '@mantine/core';
import { IconSettings, IconRocket, IconShieldCheck, IconBug, IconGauge, IconPalette, IconBrandGithub, IconBrandGitlab } from '@tabler/icons-react';
import '../styles/HeroSection.css';

export default function HeroSection({ url, setUrl, provider, setProvider, model, setModel, apiKey, setApiKey, onAnalyze, error }) {
  return (
    <Center className="hero-center" px="md">
      <Stack align="center" gap="xl" w="100%">
        <Badge 
          variant="filled" 
          color="blue" 
          size="xl" 
          radius="xl" 
          mb="sm"
          className="pulse-badge"
          styles={{
            root: { textTransform: 'none', padding: '12px 24px' },
            label: { fontSize: '14px', fontWeight: 600 }
          }}
        >
          ✨ Autonomous AI Code Review
        </Badge>
        
        <Box pos="relative">
          <Title 
            order={1} 
            ta="center" 
            variant="gradient" 
            gradient={{ from: '#4facfe', to: '#00f2fe', deg: 45 }} 
            className="hero-title"
          >
            NEXUS
          </Title>
        </Box>
        
        <Text c="dimmed" size="xl" ta="center" maw={650} mt="xs" lh={1.6}>
          Paste your GitHub Pull Request or GitLab Merge Request URL below. Our AI agent autonomously analyzes diffs for vulnerabilities, bugs, and style issues instantly.
        </Text>
        <Group justify="center" gap="xl" mt="xs" mb="xs">
          <IconBrandGithub size={36} color="#e9ecef" opacity={0.7} />
          <IconBrandGitlab size={36} color="#fc6d26" opacity={0.7} />
        </Group>

        <Paper 
          className="glass-panel"
          radius="xs" 
          p="md" 
          w="100%" 
          maw={750} 
          mt="md"
        >
          <form onSubmit={onAnalyze}>
            <Group align="flex-start" wrap="nowrap" gap="md">
              <TextInput
                flex={1}
                size="lg"
                placeholder="https://github.com/facebook/react/pull/123 or GitLab MR"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                error={error}
                radius="xs"
                classNames={{ input: 'input-glass' }}
                styles={{
                  input: { fontSize: '16px', paddingLeft: '20px' }
                }}
              />
              <Button 
                type="submit" 
                size="lg" 
                disabled={!url} 
                radius="xs" 
                variant="gradient" 
                gradient={{ from: '#4facfe', to: '#00f2fe' }}
                className="analyze-btn"
                rightSection={<IconRocket size={20} />}
              >
                Analyze PR
              </Button>
            </Group>

            <Accordion 
              variant="separated"
              mt="md" 
              radius="xs"
              styles={{
                item: {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  '&[data-active]': {
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }
                },
                control: {
                  padding: '12px 16px',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  }
                },
                content: {
                  padding: '0 16px 16px 16px',
                }
              }}
            >
              <Accordion.Item value="advanced">
                <Accordion.Control icon={
                  <ThemeIcon variant="light" size="md" color="blue" radius="xl" style={{ backgroundColor: 'rgba(51, 154, 240, 0.15)' }}>
                    <IconSettings size={18} stroke={1.5} color="#4dabf7" />
                  </ThemeIcon>
                }>
                  <Text size="sm" fw={600} c="gray.3" letterSpacing="0.3px">Use Custom AI Engine (Optional)</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Paper 
                    bg="rgba(10, 11, 15, 0.5)" 
                    p="md" 
                    radius="xs" 
                    withBorder 
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.06)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Group grow align="flex-end" gap="xl">
                      <Select
                        label="AI Provider"
                        data={[
                          { value: 'gemini', label: 'Google Gemini' },
                          { value: 'openai', label: 'OpenAI' }
                        ]}
                        value={provider}
                        onChange={(val) => {
                          setProvider(val);
                          if (val === 'openai') setModel('gpt-4o');
                          else setModel('gemini-2.5-flash');
                        }}
                        radius="xs"
                        size="md"
                        comboboxProps={{ width: 'max-content' }}
                        styles={{ 
                          label: { fontSize: '13px', fontWeight: 600, color: '#ced4da', marginBottom: '8px' },
                          input: { 
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                            borderColor: 'rgba(255, 255, 255, 0.08)', 
                            color: 'white',
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                            '&:focus': { borderColor: '#4facfe' },
                            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                          },
                          dropdown: { backgroundColor: '#1a1b1e', borderColor: 'rgba(255,255,255,0.1)' },
                          item: { whiteSpace: 'nowrap', fontSize: '14px', '&[data-selected]': { backgroundColor: 'rgba(79, 172, 254, 0.2)' }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }
                        }}
                      />
                      <Select
                        label="Model"
                        data={
                          provider === 'openai' ? 
                            ['o1-preview', 'o1-mini', 'gpt-4o', 'gpt-4-turbo'] : 
                            ['gemini-3.5-pro', 'gemini-2.5-pro', 'gemini-2.5-flash']
                        }
                        value={model}
                        onChange={setModel}
                        radius="xs"
                        size="md"
                        comboboxProps={{ width: 'max-content' }}
                        styles={{ 
                          label: { fontSize: '13px', fontWeight: 600, color: '#ced4da', marginBottom: '8px' },
                          input: { 
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                            borderColor: 'rgba(255, 255, 255, 0.08)', 
                            color: 'white',
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                            '&:focus': { borderColor: '#4facfe' },
                            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                          },
                          dropdown: { backgroundColor: '#1a1b1e', borderColor: 'rgba(255,255,255,0.1)' },
                          item: { whiteSpace: 'nowrap', fontSize: '14px', '&[data-selected]': { backgroundColor: 'rgba(79, 172, 254, 0.2)' }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }
                        }}
                      />
                      <PasswordInput
                        label="Custom API Key"
                        placeholder="Add API Key..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        radius="xs"
                        size="md"
                        styles={{ 
                          label: { fontSize: '13px', fontWeight: 600, color: '#ced4da', marginBottom: '8px' },
                          input: { 
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                            borderColor: 'rgba(255, 255, 255, 0.08)', 
                            color: 'white',
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                            '&:focus': { borderColor: '#4facfe' },
                            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                          },
                          innerInput: { color: 'white', fontSize: '14px' }
                        }}
                      />
                    </Group>
                    <Text size="sm" c="dimmed" mt="xl" ta="center" lh={1.5}>
                      * If you leave the API key field empty, Nexus will securely analyze using our Enterprise Google Gemini 2.5 Flash API Keys.
                    </Text>
                  </Paper>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </form>
        </Paper>

        <Group mt="xl" gap="lg" wrap="wrap" justify="center">
          <Badge 
            className="badge-animated" 
            size="lg" 
            radius="md" 
            leftSection={<IconShieldCheck size={16} color="#ff6b6b" />}
            styles={{ 
              root: { backgroundColor: 'rgba(26, 27, 30, 0.8)', borderColor: 'rgba(255,255,255,0.08)', height: '36px', padding: '0 16px', borderWidth: '1px', borderStyle: 'solid' }, 
              label: { textTransform: 'uppercase', color: '#e9ecef', fontWeight: 500, letterSpacing: '0.3px', marginLeft: '6px' } 
            }}
          >
            SECURITY FLAWS
          </Badge>
          <Badge 
            className="badge-animated" 
            size="lg" 
            radius="md" 
            leftSection={<IconBug size={16} color="#fcc419" />}
            styles={{ 
              root: { backgroundColor: 'rgba(26, 27, 30, 0.8)', borderColor: 'rgba(255,255,255,0.08)', height: '36px', padding: '0 16px', borderWidth: '1px', borderStyle: 'solid' }, 
              label: { textTransform: 'uppercase', color: '#e9ecef', fontWeight: 500, letterSpacing: '0.3px', marginLeft: '6px' } 
            }}
          >
            LOGIC BUGS
          </Badge>
          <Badge 
            className="badge-animated" 
            size="lg" 
            radius="md" 
            leftSection={<IconGauge size={16} color="#51cf66" />}
            styles={{ 
              root: { backgroundColor: 'rgba(26, 27, 30, 0.8)', borderColor: 'rgba(255,255,255,0.08)', height: '36px', padding: '0 16px', borderWidth: '1px', borderStyle: 'solid' }, 
              label: { textTransform: 'uppercase', color: '#e9ecef', fontWeight: 500, letterSpacing: '0.3px', marginLeft: '6px' } 
            }}
          >
            PERFORMANCE
          </Badge>
          <Badge 
            className="badge-animated" 
            size="lg" 
            radius="md" 
            leftSection={<IconPalette size={16} color="#339af0" />}
            styles={{ 
              root: { backgroundColor: 'rgba(26, 27, 30, 0.8)', borderColor: 'rgba(255,255,255,0.08)', height: '36px', padding: '0 16px', borderWidth: '1px', borderStyle: 'solid' }, 
              label: { textTransform: 'uppercase', color: '#e9ecef', fontWeight: 500, letterSpacing: '0.3px', marginLeft: '6px' } 
            }}
          >
            STYLE GUIDELINES
          </Badge>
        </Group>
      </Stack>
    </Center>
  );
}
