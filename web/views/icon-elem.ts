import { icons } from 'feather-icons';
import './icon-elem.css';

type IconSize = 1 | 2 | 3;
type IconName = keyof typeof icons | undefined;

class IconElement extends HTMLElement {
  #size: IconSize = 1;
  #icon: IconName | string;

  connectedCallback() {
    this.render();
  }

  set size(size: IconSize) {
    this.#size = size;
    this.render();
  }

  set icon(icon: IconName | string) {
    this.#icon = icon;
    this.render();
  }

  render() {
    if (!this.#icon) return;
    //@ts-ignore
    if (!icons[this.#icon]) return;

    //@ts-ignore
    this.innerHTML = icons[this.#icon].toSvg();
    this.querySelector('svg')?.classList.add(`size-${this.#size}`);
  }
}

customElements.define('icon-elem', IconElement);
