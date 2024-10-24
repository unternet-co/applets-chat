import { AppletAction, AppletManifestDict } from '@web-applets/sdk';

export function actionParamsPrompt(query: string, action: AppletAction) {
  return `Please fill the following tool schema to gather more information in order to answer the user's query. The tool is called "${action.id}" and its description is "${action.description}".

    Query:

    ${query}

    Schema:

    ${action.params}`;
}

export function appletSelectPrompt(
  prompt: string,
  manifests: AppletManifestDict
) {
  const choices = formatAppletManifests(manifests);

  return `
  Choose a tool, based on the url, if it would be helpful to answer the user's query. If a tool isn't needed, respond with only the word "None". Respond with only "None" or the full url of the chosen tool (including hash symbol).
  
  If you decide to use a tool, observe the descriptions here and find the one which is most likely to assist the user based on their query.

  ## Tools

  ${choices}

  ## User query

  ${prompt}
  `;
}

/* Helpers */

export function formatAppletManifests(
  manifestDict: AppletManifestDict
): string {
  let result = '';

  for (const [url, manifest] of Object.entries(manifestDict)) {
    result += `${manifest.name}\n`;
    result += `${manifest.description || ''}\n`;

    if (manifest.actions) {
      for (const action of manifest.actions) {
        result += `- ${url}#${action.id}: ${
          action.description || action.name || ''
        }\n`;
      }
    }

    result += '\n';
  }

  return result.trim();
}
