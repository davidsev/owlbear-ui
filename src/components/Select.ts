import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { baseCSS } from '../core/baseCSS';
import { BaseSelect } from './BaseSelect';
import baseSelectStyle from './BaseSelect.css';
import selectStyle from './Select.css';

/**
 * @fires change - Dispatched when the selected value changes.
 */
@customElement('obui-select')
export class ObUISelect extends BaseSelect {
  static override styles = baseCSS(baseSelectStyle, selectStyle);

  @property({ type: String })
  accessor value = '';

  /** The value at first connection, restored by `form.reset()`. */
  private _defaultValue = '';
  private _defaultValueCaptured = false;

  protected override get _formValue(): string | null {
    // A value that isn't one of the options reads as nothing selected
    // everywhere else (display, validity) — don't submit it either.
    return this._showPlaceholder ? null : this.value;
  }

  protected override _restoreDefaultValue(): void {
    this.value = this._defaultValue;
  }

  // Captured here rather than in `firstUpdated()`: `formResetCallback()` can
  // fire synchronously (e.g. `form.reset()` right after `form.appendChild()`)
  // before Lit's first, async render — `connectedCallback()` is synchronous
  // and runs before that's possible.
  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._defaultValueCaptured) {
      this._defaultValueCaptured = true;
      this._defaultValue = this.value;
    }
  }

  protected override get _displayText(): string {
    if (this.value && this.value in this.options) {
      return this.options[this.value];
    }
    return this.placeholder;
  }

  protected override get _showPlaceholder(): boolean {
    return !this.value || !(this.value in this.options);
  }

  protected override _onSelectKey(key: string): void {
    this._selectItem(key);
  }

  private _selectItem(key: string): void {
    this.value = key;
    this._open = false;
    this._focusedIndex = -1;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  private _onItemClicked(key: string, e: MouseEvent): void {
    this._onItemClick(e);
    this._selectItem(key);
  }

  protected override renderItems(keys: string[]): TemplateResult {
    return html`${keys.map(
      (key, index) => html`
        <div
            id=${this._optionId(index)}
            role="option"
            aria-selected=${key === this.value}
            class=${classMap({
              item: true,
              active: key === this.value,
              focused: index === this._focusedIndex,
            })}
            @mousedown=${this._onItemMouseDown}
            @click=${(e: MouseEvent) => this._onItemClicked(key, e)}
        >
            ${this.options[key]}
        </div>
      `,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-select': ObUISelect;
  }
}
