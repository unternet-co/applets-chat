import { ActionParams, applets } from '@web-applets/sdk';
import db from '../lib/db';
import { liveQuery } from 'dexie';
import { threadItems } from './thread';

export const manifests = await applets.list('/applets');
console.log('[Operator] Loaded manifests', manifests);

/* Models */

export interface AppletInstance {
  id?: number;
  url: string;
  state?: Record<string, unknown>;
}

/* Actions */

interface CreateAppletInstanceOpts {
  actionId: string;
  actionParams: any;
}
export async function createAppletInstance(
  url: string,
  opts?: CreateAppletInstanceOpts
) {
  const id = await db.appletInstances.add({ url });
  if (opts) {
    dispatchAction(id, opts.actionId, opts.actionParams);
  }
  return id;
}

async function dispatchAction(
  instanceId: number,
  actionId: string,
  params: ActionParams
) {
  const instance = await appletInstances.get(instanceId);
  if (!instance) {
    throw new Error(`Applet instance with ID ${instanceId} doesn't exist!`);
  }

  const applet = await applets.load(instance.url);
  applet.state = instance.state;
  await applet.dispatchAction(actionId, params);
  appletInstances.setState(instanceId, applet.state);
}

async function setState(instanceId: number, state: any) {
  db.appletInstances.update(instanceId, { state });
}

/* Exports */

export const appletInstances = {
  create: createAppletInstance,
  get: db.appletInstances.get.bind(db.appletInstances),
  dispatchAction,
  setState,
  clear: db.appletInstances.clear.bind(db.appletInstances),
};

// const boundMethods = Object.fromEntries(
//   Object.entries(db.appletInstances).map(([key, value]) => [
//     key,
//     typeof value === 'function' ? value.bind(db.appletInstances) : value,
//   ])
// );

// export const appletInstances = {
//   ...boundMethods,
//   create: createAppletInstance,
// };

// if (opts && opts.threadItemId) {
//   await threadItems.setOutput(opts.threadItemId, {
//     type: 'applet',
//     appletInstanceId: id,
//     appletIcon: applet.manifest.icon,
//     appletName: applet.manifest.name,
//   });
// }
