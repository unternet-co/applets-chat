import { html, render } from 'lit';
import '@web-applets/sdk/dist/web-components/applet-frame';
import { manifests } from '../features/applets';
import { AppletInstance, appletInstances } from '../features/applets';
import { liveQuery, Subscription } from 'dexie';
import './applet-view.css';

class AppletView extends HTMLElement {
  appletInstance?: AppletInstance;
  #instanceId?: number;
  #subscription?: Subscription;

  connectedCallback() {
    this.render();
  }

  set instanceId(instanceId: number) {
    this.#instanceId = instanceId;

    if (this.#subscription) this.#subscription.unsubscribe();

    this.#subscription = liveQuery(() =>
      appletInstances.get(instanceId)
    ).subscribe((instance) => {
      this.appletInstance = instance;
      this.render();
    });
  }

  get template() {
    if (!this.appletInstance || !this.appletInstance.url) return html``;
    const manifest = manifests[this.appletInstance.url];

    return html`
      <div class="applet-header ${manifest.frameless ? 'frameless' : ''}">
        <div class="applet-icon">
          <icon-elem .icon=${manifest.icon}></icon-elem>
        </div>
        <div class="applet-name">${manifest.name}</div>
      </div>
      <applet-frame
        .url=${this.appletInstance.url}
        .state=${this.appletInstance.state}
        @stateupdated=${(e: CustomEvent) => {
          appletInstances.setState(this.#instanceId!, e.detail);
        }}
      ></applet-frame>
    `;
  }

  render() {
    render(this.template, this);
  }
}

customElements.define('applet-view', AppletView);

// <div class="header">
//         <icon-elem .icon=${manifests[this.#url].icon}></icon-elem>
//         ${manifests[this.#url].name}
//       </div>
