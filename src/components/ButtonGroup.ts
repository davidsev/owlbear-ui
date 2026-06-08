import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import buttonGroupStyle from './ButtonGroup.css';
import { ObUIButtonGroupItem } from './ButtonGroupItem';

/**
 * A segmented control: a group of mutually-exclusive `<obui-button-group-item>`
 * children. Exactly one item is selected; the selected value is exposed on the
 * group via the `value` property. Follows the WAI-ARIA radio group pattern.
 *
 * @fires change - Dispatched when the selected value changes via user interaction.
 */
@customElement('obui-button-group')
export class ObUIButtonGroup extends BaseElement {
  static override styles = baseCSS(buttonGroupStyle);

  @property({ type: String })
  accessor value = '';

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: String, attribute: 'aria-label', reflect: true })
  accessor ariaLabel: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'radiogroup');
    }

    this.addEventListener('click', this._onClick, {
      signal: this.eventCleanupSignal,
    });
    this.addEventListener('keydown', this._onKeydown, {
      signal: this.eventCleanupSignal,
    });
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('disabled')) {
      if (this.disabled) {
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('aria-disabled');
      }
    }
    if (changedProperties.has('value') || changedProperties.has('disabled')) {
      this._syncState();
    }
  }

  /** Returns all slotted item children. */
  private _getItems(): ObUIButtonGroupItem[] {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return [];
    return slot
      .assignedElements({ flatten: true })
      .filter(
        (el): el is ObUIButtonGroupItem => el instanceof ObUIButtonGroupItem,
      );
  }

  private _onSlotChange = (): void => {
    this._syncState();
  };

  /** Reflects `value` onto item selection and manages the roving tabindex. */
  private _syncState(): void {
    const items = this._getItems();
    for (const item of items) {
      item.selected = this.value !== '' && item.value === this.value;
    }

    // A disabled group has no tabbable item, so Tab skips it entirely.
    const enabled = items.filter((item) => !item.disabled);
    const focusable = this.disabled
      ? null
      : (enabled.find((item) => item.selected) ??
        (enabled.length > 0 ? enabled[0] : null));
    for (const item of items) {
      item.tabbable = item === focusable;
    }
  }

  private _select(item: ObUIButtonGroupItem): void {
    if (item.disabled || item.value === this.value) return;
    this.value = item.value;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  private _onClick = (e: Event): void => {
    if (this.disabled) return;
    for (const el of e.composedPath()) {
      if (el instanceof ObUIButtonGroupItem) {
        this._select(el);
        return;
      }
    }
  };

  private _onKeydown = (e: KeyboardEvent): void => {
    if (this.disabled) return;

    const items = this._getItems().filter((item) => !item.disabled);
    if (items.length === 0) return;

    const currentIndex = items.findIndex((item) => item.value === this.value);
    let target: ObUIButtonGroupItem | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        target = items[currentIndex < items.length - 1 ? currentIndex + 1 : 0];
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        target = items[currentIndex > 0 ? currentIndex - 1 : items.length - 1];
        break;
      }
      case 'Home': {
        e.preventDefault();
        target = items[0];
        break;
      }
      case 'End': {
        e.preventDefault();
        target = items[items.length - 1];
        break;
      }
    }

    if (!target) return;
    this._select(target);
    target.shadowRoot?.querySelector('button')?.focus();
  };

  override render() {
    return html`<slot @slotchange=${this._onSlotChange}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-button-group': ObUIButtonGroup;
  }
}
