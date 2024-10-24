import { html, render } from 'uhtml';
import { handleCommandInput } from '../features/router';
import './command-options';
import type { CommandOption } from './command-options';
import './command-bar.css';

class CommandBar extends HTMLElement {
  focused: boolean = false;
  value: string = '';
  selection?: CommandOption;

  connectedCallback() {
    this.render();
  }

  handleSubmit(e: SubmitEvent) {
    e.preventDefault();
  }

  handleBlur() {
    this.focused = false;
    this.render();
  }

  handleFocus() {
    this.focused = true;
    this.render();
  }

  handleInput(e: InputEvent) {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;
    this.render();
  }

  handleActionSelection(e: CustomEvent) {
    this.selection = e.detail;
  }

  handleKeyDown(e: KeyboardEvent) {
    // if (!this.selection || this.value === '') return;
    if (this.value === '') return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      handleCommandInput({
        type: 'user',
        text: this.value,
      });

      const target = e.target as HTMLTextAreaElement;
      target.value = this.value = '';
      this.render();
    }
  }

  get template() {
    // const commandOptions = html`<command-options
    //   .input=${this.value}
    //   @selection=${this.handleActionSelection.bind(this)}
    // ></command-options>`;
    // ${this.focused && this.value !== '' ? commandOptions : '' }

    return html`<div class="inner">
      <textarea
        placeholder="Search or type a command..."
        data-focused=${this.focused && this.value !== ''}
        @input=${this.handleInput.bind(this)}
        @focus=${this.handleFocus.bind(this)}
        @blur=${this.handleBlur.bind(this)}
        @keydown=${this.handleKeyDown.bind(this)}
      ></textarea>
    </div>`;
  }

  render() {
    render(this, this.template);
  }
}

customElements.define('command-bar', CommandBar);
