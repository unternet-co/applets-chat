import { html, render } from 'uhtml';
import './command-options.css';
import './icon-elem';

import { manifests } from '../features/applets';

export interface CommandOption {
  type: 'chat' | 'applet';
  name: string;
  appletUrl?: string;
  actionId?: string;
  icon?: string;
  color?: string;
}

const options: CommandOption[] = [
  {
    type: 'chat',
    name: 'Ask Operator',
    icon: 'plus',
  },
];

// const options: CommandOption[] = [];

for (let appletUrl in manifests) {
  if (!manifests[appletUrl].actions) continue;
  for (let action of manifests[appletUrl].actions) {
    options.push({
      type: 'applet',
      name: action.name as string,
      appletUrl,
      actionId: action.id,
      icon: `${manifests[appletUrl].icon ?? ''}`,
    });
  }
}

// options.sort((a, b) =>
//   a.name === 'Text response' ? -1 : b.name === 'Text response' ? 1 : 0
// );

class CommandOptions extends HTMLElement {
  #input: string = '';
  selected: number = 0;

  connectedCallback() {
    this.render();
    this.emitSelection();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  emitSelection() {
    const event = new CustomEvent('selection', {
      detail: options[this.selected],
    });
    this.dispatchEvent(event);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.selected =
        e.key === 'ArrowUp'
          ? Math.min(this.selected + 1, options.length - 1)
          : Math.max(0, this.selected - 1);
      this.emitSelection();
      this.render();
    }
  };

  set input(value: string) {
    this.#input = value;
    this.render();
  }

  optionTemplate(option: any, selected: boolean) {
    return html`
      <li data-selected=${selected}>
        ${option.icon === ''
          ? ''
          : option.icon.startsWith('/')
          ? html`<img src=${option.icon} />`
          : html`<icon-elem .icon=${option.icon} .size=${1}></icon-elem>`}

        <span class="title">${option.name}</span>
        ${selected ? html`<span class="input">${this.#input}</span>` : ''}
      </li>
    `;
  }

  get template() {
    return html`${options.map((opt, index) =>
      this.optionTemplate(opt, index === this.selected)
    )}`;
  }

  render() {
    render(this, this.template);
  }
}
customElements.define('command-options', CommandOptions);
