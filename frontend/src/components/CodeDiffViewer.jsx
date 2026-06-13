import { SimpleGrid, Box, Text } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';

export default function CodeDiffViewer({ originalCode, suggestedCode, language = 'javascript' }) {
  if (!originalCode && !suggestedCode) return null;

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
      {originalCode && (
        <Box>
          <Text size="sm" fw={700} c="red" mb="xs">Original Code</Text>
          <CodeHighlight
            code={originalCode}
            language={language}
            withCopyButton={false}
            styles={{ root: { border: '1px solid var(--mantine-color-red-9)', borderRadius: '8px' } }}
          />
        </Box>
      )}
      {suggestedCode && (
        <Box>
          <Text size="sm" fw={700} c="teal" mb="xs">Suggested Fix</Text>
          <CodeHighlight
            code={suggestedCode}
            language={language}
            withCopyButton={true}
            styles={{ root: { border: '1px solid var(--mantine-color-teal-9)', borderRadius: '8px' } }}
          />
        </Box>
      )}
    </SimpleGrid>
  );
}
