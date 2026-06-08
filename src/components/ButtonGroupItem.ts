import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import buttonGroupItemStyle from './ButtonGroupItem.css';

/**
 * A single segment within an `<obui-button-group>`. Carries a `value` and shows
 * its selected state. Slot content can be plain text, an icon, or both.
 */
@customElement('obui-button-group-item')
export class ObUIButtonGroupItem extends BaseElement {
  static override styles = baseCSS(buttonGroupItemStyle);

  @property({ type: String })
  accessor value = '';

  @property({ type: Boolean, reflect: true })
  accessor selected = false;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /** Roving-tabindex flag, managed by the parent `<obui-button-group>`. */
  @property({ type: Boolean, attribute: false })
  accessor tabbable = false;

  /** Accessible name for the radio — required for icon-only segments. */
  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  override render() {
    return html`
      <button
        role="radio"
        aria-checked=${this.selected}
        aria-label=${ifDefined(this.ariaLabel ?? undefined)}
        tabindex=${this.tabbable ? 0 : -1}
        ?disabled=${this.disabled}
        part="button"
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-button-group-item': ObUIButtonGroupItem;
  }
}
