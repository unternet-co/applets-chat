import { html, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { liveQuery } from 'dexie';
import { ThreadItem, threadItems } from '../features/thread';
import './command-bar';
import './thread-view.css';
import './thread-item';

class ThreadView extends HTMLElement {
  threadItems: ThreadItem[] = [];

  connectedCallback() {
    // TODO: Unsubscribe on disconnect
    liveQuery(() => threadItems.all()).subscribe((threadItems) => {
      this.threadItems = threadItems;
      this.render();
    });

    this.render();
  }

  get template() {
    const reversedItems = [...this.threadItems].reverse();

    return html`<thread-content>
        ${repeat(
          reversedItems,
          (op) => op.id,
          (op) => html`<thread-item .operation=${op}></thread-item>`
        )}</thread-content
      ><command-bar></command-bar>`;
  }

  render() {
    render(this.template, this);
  }
}

customElements.define('thread-view', ThreadView);
