import { Center, Loader, Title, Text } from '@mantine/core';

export default function LoadingState() {
  return (
    <Center style={{ height: '40vh', flexDirection: 'column' }}>
      <Loader size="xl" variant="bars" mb="md" />
      <Title order={3}>Analyzing Codebase...</Title>
      <Text c="blue" mt="sm">Fetching PR data ➔ Chunking diffs ➔ Running LLM ➔ Synthesizing</Text>
      <Text c="dimmed" size="sm" mt="xs">This may take up to a minute depending on the PR size.</Text>
    </Center>
  );
}
