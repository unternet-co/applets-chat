import { appletInstances } from '../features/applets';
import { TextBlock, ThreadItem } from '../features/thread';
import type { Message } from '@unternet/sdk';

export async function convertThreadItemsToMessages(
  threadItems: ThreadItem[]
): Promise<Message[]> {
  const messages: Message[] = [];
  const filteredItems = threadItems.slice(-10);

  for (let item of filteredItems) {
    messages.push({
      role: 'user',
      content: item.input.text,
    });
    messages.push({
      role: 'assistant',
      content: await formatThreadItemOutput(item.output),
    });
  }
  return messages;
}

async function formatThreadItemOutput(
  output: ThreadItem['output'] | undefined
): Promise<string> {
  if (!output) return '';
  if (!output.blocks.length) return '';
  const formatted = await Promise.all(
    output.blocks.map(async (block) => {
      if (block.type === 'text') return block.text;
      if (block.type === 'applet') {
        const instance = await appletInstances.get(block.appletInstanceId);
        return instance ? JSON.stringify(instance?.state) : '';
      }
    })
  );
  return formatted.join('\n\n');
}

// }

//   return threadItems.flatMap((item): Message[] => {
//     const userMessage: Message = {
//       role: 'user',
//       content: item.input.text,
//     };

//     const assistantMessage: Message | null = item.output
//       ? {
//           role: 'assistant',
//           content: item.output.blocks
//             .filter((block) => block.type === 'text')
//             .map((block) => block.text)
//             .join('\n'),
//         }
//       : null;

//     return assistantMessage ? [userMessage, assistantMessage] : [userMessage];
//   });
// }

// async function contextMessagesForTab(tabId: number): Promise<Message[]> {
//   const queries = await getQueriesForTab(tabId);
//   const filteredQueries = queries.slice(-5);
//   const messages: Message[] = [];
//   for (let query of filteredQueries) {
//     messages.push({
//       role: 'user',
//       content: query.input.text,
//     });
//     messages.push({
//       role: 'assistant',
//       content: query.output.text || '',
//     });
//   }
//   return messages;
// }
