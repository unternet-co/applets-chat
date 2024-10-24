import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { manifests } from '../features/applets';

@customElement('applets-bar')
export class AppletsToolbar extends LitElement {
  render() {
    const appletManifests = Object.values(manifests);
    return html`
      ${appletManifests.map((manifest) => {
        return html`<li>
          <icon-elem .icon=${manifest.icon} .size=${1}></icon-elem>
          ${manifest.name}
        </li>`;
      })}
    `;
  }

  static styles = css`
    :host {
      display: flex;
      padding: 6px 4px;
      gap: 4px;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #ddd;
    }

    li {
      list-style: none;
      display: flex;
      align-items: center;
      color: #333;
      cursor: default;
    }

    li.active {
      color: black;
      background: #eee;
      padding-right: 3px;
      border-radius: 3px;
    }

    svg {
      height: 15px;
      margin-bottom: -2px;
    }
  `;
}
