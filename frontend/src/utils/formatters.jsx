import { Box, Text, Code } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';

// ─────────────────────────────────────────────
// Severity Helpers
// ─────────────────────────────────────────────

export const getSeverityColor = (severity) => {
  const sev = (severity || '').toLowerCase();
  if (['critical', 'error', 'high'].includes(sev)) return 'red';
  if (['warning', 'medium'].includes(sev)) return 'yellow';
  return 'cyan';
};

export const getSeverityDetails = (severity) => {
  const sev = (severity || '').toLowerCase();
  if (['critical', 'error', 'high'].includes(sev)) {
    return { color: 'red.6', bg: 'rgba(250, 82, 82, 0.1)', icon: <IconAlertTriangle size={16} /> };
  }
  if (['warning', 'medium'].includes(sev)) {
    return { color: 'yellow.5', bg: 'rgba(252, 196, 25, 0.1)', icon: <IconAlertTriangle size={16} /> };
  }
  return { color: 'cyan.5', bg: 'rgba(34, 184, 207, 0.1)', icon: <IconInfoCircle size={16} /> };
};

export const getSeverityIcon = (severity, size = 12) => {
  const sev = (severity || '').toLowerCase();
  if (['critical', 'error', 'high', 'warning', 'medium'].includes(sev)) {
    return <IconAlertTriangle size={size} />;
  }
  return <IconInfoCircle size={size} />;
};

// ─────────────────────────────────────────────
// Text Formatting (simple: bold + inline code)
// ─────────────────────────────────────────────

export const formatText = (text) => {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <Code key={index} fz="sm" c="blue.3" bg="rgba(0,0,0,0.4)" px={6} py={2} style={{ borderRadius: '4px' }}>{part.slice(1, -1)}</Code>;
    }
    if (part.includes('*')) {
      const boldParts = part.split(/(\*[^*]+\*)/g);
      return boldParts.map((bp, i) => {
        if (bp.startsWith('*') && bp.endsWith('*')) {
          return <span key={`${index}-${i}`} style={{ fontWeight: '600', color: '#e9ecef' }}>{bp.slice(1, -1)}</span>;
        }
        return <span key={`${index}-${i}`}>{bp}</span>;
      });
    }
    return <span key={index}>{part}</span>;
  });
};

// ─────────────────────────────────────────────
// Rich Markdown Formatting (code blocks, lists, bold, inline code)
// Used by the AI Chat Drawer for rendering AI responses
// ─────────────────────────────────────────────

/** Handles bold (**text**) and inline code (`code`) */
const formatInlineParts = (text) => {
  if (!text) return null;
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = text.split(regex);
  
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Code key={idx} fz="xs" c="blue.3" bg="rgba(79, 172, 254, 0.1)" px={6} py={2} style={{ borderRadius: '4px', border: '1px solid rgba(79, 172, 254, 0.15)' }}>
          {part.slice(1, -1)}
        </Code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={idx} style={{ fontWeight: 600, color: '#e9ecef' }}>{part.slice(2, -2)}</span>;
    }
    return <span key={idx}>{part}</span>;
  });
};

/** Handles inline formatting: bold, inline code, lists */
const formatInlineText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      return (
        <Box key={lineIdx} pl="xs" py={2} style={{ display: 'flex', gap: '8px' }}>
          <Text size="sm" c="blue.4" fw={600} style={{ flexShrink: 0, minWidth: '18px' }}>{numberedMatch[1]}.</Text>
          <Text size="sm" c="gray.2" style={{ lineHeight: 1.6 }}>{formatInlineParts(numberedMatch[2])}</Text>
        </Box>
      );
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <Box key={lineIdx} pl="xs" py={2} style={{ display: 'flex', gap: '8px' }}>
          <Text size="sm" c="blue.4" fw={600} style={{ flexShrink: 0 }}>•</Text>
          <Text size="sm" c="gray.2" style={{ lineHeight: 1.6 }}>{formatInlineParts(trimmed.slice(2))}</Text>
        </Box>
      );
    }

    if (trimmed === '') return <Box key={lineIdx} h={8} />;

    return (
      <Text key={lineIdx} size="sm" c="gray.2" style={{ lineHeight: 1.7 }}>
        {formatInlineParts(line)}
      </Text>
    );
  });
};

/** Full markdown renderer: fenced code blocks + inline formatting */
export const formatChatMessage = (text) => {
  if (!text) return null;

  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || 'text', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.map((part, idx) => {
    if (part.type === 'code') {
      return (
        <Box key={idx} my="xs">
          <Box style={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
            {part.lang && part.lang !== 'text' && (
              <Box px="sm" py={4} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Text size="xs" c="gray.5" ff="monospace">{part.lang}</Text>
              </Box>
            )}
            <Box px="md" py="sm">
              <Text size="xs" c="gray.2" ff="monospace" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {part.content}
              </Text>
            </Box>
          </Box>
        </Box>
      );
    }
    return <span key={idx}>{formatInlineText(part.content)}</span>;
  });
};
