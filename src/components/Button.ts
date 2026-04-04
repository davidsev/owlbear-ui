import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import buttonStyle from './Button.css';

@customElement('obui-button')
export class ObUIButton extends BaseElement {
  static override styles = baseCSS(buttonStyle);

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  override render() {
    return html`
            <button
              ?disabled=${this.disabled}
              aria-label=${ifDefined(this.ariaLabel ?? undefined)}
              part="button"
            >
                <slot></slot>
            </button>
        `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-button': ObUIButton;
  }
}
