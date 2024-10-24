import { html, render } from 'uhtml';
import './thread-view';
import './app-view.css';
import './applets-bar';

class AppView extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  get template() {
    return html`<applets-bar></applets-bar><thread-view></thread-view>`;
  }

  render() {
    render(this, this.template);
  }
}

customElements.define('app-view', AppView);
