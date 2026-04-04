import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import toggleStyle from './Toggle.css';

/**
 * @fires change - Dispatched when the toggle is clicked.
 */
@customElement('obui-toggle')
export class ObUIToggle extends BaseElement {
  static override styles = baseCSS(toggleStyle);

  @property({ type: Boolean, reflect: true })
  accessor checked = false;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  private _onClick(): void {
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <button
        role="switch"
        aria-checked=${this.checked}
        aria-label=${ifDefined(this.ariaLabel ?? undefined)}
        ?disabled=${this.disabled}
        @click=${this._onClick}
        part="button"
      >
        <span class="thumb"></span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-toggle': ObUIToggle;
  }
}
