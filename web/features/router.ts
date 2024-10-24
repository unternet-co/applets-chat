import { AppletAction, applets } from '@web-applets/sdk';
import { convertThreadItemsToMessages } from '../lib/utils';
import { threadItems, UserInput } from './thread';
import { openai } from '../lib/openai';
import { getJson } from '../lib/openai';
import { actionParamsPrompt, appletSelectPrompt } from '../lib/prompts';
import { createAppletInstance, appletInstances, manifests } from './applets';

/* Actions */

export async function handleCommandInput(input: UserInput) {
  if (input.text === 'clear') {
    threadItems.clear();
    appletInstances.clear();
    return;
  }
  const threadItemId = await threadItems.fromUserInput(input);
  const appletChoice = await chooseApplet(input);

  if (!appletChoice) {
    await streamChatOutput(threadItemId);
  } else {
    const params = await getAppletParams(
      input,
      appletChoice.actionId,
      appletChoice.url
    );
    const appletInstanceId = await createAppletInstance(appletChoice.url, {
      actionId: appletChoice.actionId,
      actionParams: params,
    });
    threadItems.createAppletBlock(threadItemId, appletInstanceId);
  }
}

export async function chooseApplet(input: UserInput) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: appletSelectPrompt(input.text, manifests) },
    ],
  });
  const text = completion.choices[0].message.content ?? '';

  console.log('[Router] Chose applet:', text);
  if (text === 'None') return;

  const parts = text.split('#');
  if (parts.length <= 1) {
    throw new Error(
      `Model didn't give the right format for applet URL & action choice.`
    );
  }
  return {
    url: parts[0],
    actionId: parts[1],
  };
}

async function streamChatOutput(threadItemId: number) {
  const allItems = await threadItems.all();
  const messages = await convertThreadItemsToMessages(allItems);

  const blockIndex = await threadItems.createTextBlock(threadItemId);

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    stream: true,
  });

  let totalText = '';
  for await (const part of stream) {
    const textPart = part.choices[0].delta.content ?? '';
    totalText += textPart;
    threadItems.updateBlockText(threadItemId, blockIndex, totalText);
  }
}

export async function getAppletParams(
  input: UserInput,
  actionId: string,
  appletUrl: string
) {
  const manifest = await applets.loadManifest(appletUrl);
  if (!manifest.actions) throw new Error(`Applet ${appletUrl} has no actions.`);

  const action = manifest.actions.find((action) => action.id === actionId);

  if (!action) {
    throw new Error(`Can't find action ${actionId} on applet ${appletUrl}.`);
  }

  const allItems = await threadItems.all();
  const historyMessages = await convertThreadItemsToMessages(allItems);

  const json = getJson({
    messages: [
      ...historyMessages,
      {
        role: 'user',
        content: actionParamsPrompt(input.text, action),
      },
    ],
    schema: convertActionToSchema(action),
  });

  return json;
}

/* Helpers */

export function convertActionToSchema(action: AppletAction) {
  return {
    strict: true,
    name: 'params_schema',
    schema: {
      type: 'object',
      required: Object.keys(action.params!),
      properties: action.params!,
      additionalProperties: false,
    },
  };
}
