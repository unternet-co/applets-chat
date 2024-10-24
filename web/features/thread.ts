import db from '../lib/db';

/* Models */

// Operations

export interface ThreadItem {
  id?: number;
  timestamp: number;
  input: UserInput;
  output?: BlockOutput;
}

// Operation inputs

export type ThreadItemInput = UserInput;

export interface UserInput {
  type: 'user';
  text: string;
  appletUrls?: string[];
}

// Operation outputs

export type ThreadItemOutput = BlockOutput;

export interface BlockOutput {
  type: 'block';
  blocks: Block[];
}

// Blocks

export type Block = AppletBlock | TextBlock;

export interface AppletBlock {
  type: 'applet';
  appletInstanceId: number;
}

export interface TextBlock {
  type: 'text';
  text: string;
}

/* Actions */

function fromUserInput(input: UserInput) {
  return db.threadItems.add({
    timestamp: Date.now(),
    input,
  });
}

async function getWithOutput(id: number) {
  const item = await db.threadItems.get(id);
  if (!item) throw new Error(`No matching operation for id '${id}'`);

  if (!item.output) {
    item.output = { type: 'block', blocks: [] };
  }

  return item as ThreadItem & { output: NonNullable<ThreadItem['output']> };
}

async function createTextBlock(id: number, text?: '') {
  if (!text) text = '';

  const item = await getWithOutput(id);
  item.output.blocks.push({
    type: 'text',
    text,
  });
  const index = item.output.blocks.length - 1;

  await db.threadItems.update(id, { ...item });
  return index;
}

async function createAppletBlock(id: number, appletInstanceId: number) {
  const item = await getWithOutput(id);

  item.output.blocks.push({
    type: 'applet',
    appletInstanceId,
  });
  const index = item.output.blocks.length - 1;

  await db.threadItems.update(id, { ...item });
  return index;
}

async function updateBlockText(
  threadItemId: number,
  blockIndex: number,
  text: string
) {
  const threadItem = await db.threadItems.get(threadItemId);

  if (!threadItem || !threadItem.output) {
    throw new Error(
      `Operation with ID '${threadItemId}' hasn't been initialized yet`
    );
  }

  if (threadItem.output.blocks[blockIndex].type !== 'text') {
    throw new Error(
      `Operation with ID '${threadItemId}' block '${blockIndex}' is not of text type`
    );
  }

  threadItem.output.blocks[blockIndex].text = text;
  await db.threadItems.update(threadItem, { ...threadItem });
}

/* Exports */

export const threadItems = {
  fromUserInput,
  createTextBlock,
  updateBlockText,
  createAppletBlock,
  clear: db.threadItems.clear.bind(db.threadItems),
  all: db.threadItems.toArray.bind(db.threadItems),
};
