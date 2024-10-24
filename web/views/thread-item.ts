import { html, render } from 'lit';
import { Block, ThreadItem } from '../features/thread';
import './thread-item.css';
import './markdown-text';
import './applet-view';

class ThreadItemElem extends HTMLElement {
  #threadItem?: ThreadItem;

  connectedCallback() {
    this.render();
  }

  set operation(threadItem: ThreadItem) {
    this.#threadItem = threadItem;
    this.render();
  }

  blockTemplate(block: Block) {
    if (block.type === 'applet')
      return html`
        <applet-view .instanceId=${block.appletInstanceId}></applet-view>
      `;

    return html`<div class="thread-item-output-text">
      <markdown-text>${block.text}</markdown-text>
    </div>`;
  }

  get template() {
    return html` <div class="thread-item-input">
        ${this.#threadItem?.input.text}
      </div>
      <div class="thread-item-outputs">
        ${this.#threadItem?.output?.blocks.map(this.blockTemplate)}
      </div>`;
  }

  render() {
    render(this.template, this);
  }
}

customElements.define('thread-item', ThreadItemElem);
