import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { baseCSS } from '../core/baseCSS';
import { BaseSelect } from './BaseSelect';
import baseSelectStyle from './BaseSelect.css';
import multiSelectStyle from './MultiSelect.css';

/**
 * @fires change - Dispatched when the selected values change.
 */
@customElement('obui-multi-select')
export class ObUIMultiSelect extends BaseSelect {
  static override styles = baseCSS(baseSelectStyle, multiSelectStyle);

  @property({ type: Array })
  accessor value: string[] = [];

  @property({ type: String })
  accessor placeholder = 'None';

  protected override get _displayText(): string {
    if (this.value.length > 0) {
      return this.value
        .filter((v) => v in this.options)
        .map((v) => this.options[v])
        .join(', ');
    }
    return this.placeholder;
  }

  protected override get _showPlaceholder(): boolean {
    return this.value.length === 0;
  }

  protected override _onSelectKey(key: string): void {
    this._toggleItem(key);
  }

  private _toggleItem(key: string): void {
    if (this.value.includes(key)) {
      this.value = this.value.filter((v) => v !== key);
    } else {
      this.value = [...this.value, key];
    }
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  @queryAll('input[type="checkbox"]')
  private accessor _checkboxes!: NodeListOf<HTMLInputElement>;

  private _onCheckboxChange(): void {
    this.value = [...this._checkboxes]
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  protected override renderItems(keys: string[]): TemplateResult {
    return html`${keys.map(
      (key, index) => html`
        <label
            id=${this._optionId(index)}
            role="option"
            aria-selected=${this.value.includes(key)}
            class=${classMap({
              focused: index === this._focusedIndex,
            })}
            @mousedown=${this._onItemMouseDown}
            @click=${this._onItemClick}
        >
            <input
                type="checkbox"
                value=${key}
                .checked=${this.value.includes(key)}
                @change=${this._onCheckboxChange}
                tabindex="-1"
            />
            ${this.options[key]}
        </label>
      `,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-multi-select': ObUIMultiSelect;
  }
}
