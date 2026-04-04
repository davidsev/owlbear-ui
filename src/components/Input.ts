import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import inputStyle from './Input.css';

/**
 * @fires input - Dispatched on each keystroke.
 * @fires change - Dispatched when the value is committed (blur or Enter).
 */
@customElement('obui-input')
export class ObUIInput extends BaseElement {
  static override styles = baseCSS(inputStyle);

  @property({ type: String })
  accessor type = 'text';

  @property({ type: String })
  accessor value = '';

  @property({ type: String })
  accessor placeholder = '';

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: String })
  accessor min: string | undefined;

  @property({ type: String })
  accessor max: string | undefined;

  @property({ type: String })
  accessor step: string | undefined;

  @property({ type: Boolean })
  accessor required = false;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  @query('input')
  private accessor _input!: HTMLInputElement;

  get valueAsNumber(): number {
    return this._input?.valueAsNumber ?? Number.NaN;
  }

  override focus(options?: FocusOptions): void {
    this._input?.focus(options);
  }

  private _onInput(e: Event): void {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
            <input
                .type=${this.type}
                .value=${this.value}
                .placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                ?required=${this.required}
                min=${ifDefined(this.min)}
                max=${ifDefined(this.max)}
                step=${ifDefined(this.step)}
                aria-label=${ifDefined(this.ariaLabel ?? undefined)}
                @input=${this._onInput}
                @change=${this._onChange}
                part="input"
            />
        `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-input': ObUIInput;
  }
}
