import type { PropertyValues } from 'lit';
import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { baseCSS } from '../core/baseCSS';
import { FormElement } from '../core/FormElement';
import inputStyle from './Input.css';

/**
 * @fires input - Dispatched on each keystroke.
 * @fires change - Dispatched when the value is committed (blur or Enter).
 */
@customElement('obui-input')
export class ObUIInput extends FormElement {
  static override styles = baseCSS(inputStyle);

  @property({ type: String })
  accessor type = 'text';

  @property({ type: String })
  accessor value = '';

  @property({ type: String })
  accessor placeholder = '';

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

  /** The value at first connection, restored by `form.reset()`. */
  private _defaultValue = '';
  private _defaultValueCaptured = false;

  protected override get _formValue(): string {
    return this.value;
  }

  protected override _restoreDefaultValue(): void {
    this.value = this._defaultValue;
    // A `badInput` value (e.g. "abc" in a number field) leaves `this.value`
    // empty, so the assignment above can be a no-op while the raw text is
    // still in the control — clear it by hand, as a reset natively would.
    // Checking `badInput` directly (rather than relying on `value` having
    // changed) matters because a *bad* number input's IDL `value` already
    // reads `''`, same as a typical empty default — the two are otherwise
    // indistinguishable here.
    if (
      this._input &&
      (this._input.value !== this._defaultValue ||
        this._input.validity.badInput)
    ) {
      this._input.value = this._defaultValue;
      this._syncValidity();
    }
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

  get valueAsNumber(): number {
    return this._input?.valueAsNumber ?? Number.NaN;
  }

  override focus(options?: FocusOptions): void {
    this._input?.focus(options);
  }

  /**
   * Mirror the inner control's constraint-validation state onto the host.
   *
   * A native control barred from validation (e.g. `disabled`) reports an empty
   * `validationMessage` while its validity flags stay set, but `setValidity()`
   * throws on an empty message with flags set — hence the fallback. The host is
   * barred too (it's a disabled form-associated element), so `checkValidity()`
   * still returns `true` and `validationMessage` still reads `''`, matching a
   * bare `<input>`.
   */
  private _syncValidity(): void {
    if (!this._input) return;
    this.internals.setValidity(
      this._input.validity,
      this._input.validationMessage || 'Invalid value.',
      this._input,
    );
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    this._syncValidity();
  }

  private _onInput(e: Event): void {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    // Sync directly: a `badInput` value (e.g. "abc" in a number field)
    // leaves `this.value` unchanged, so no re-render — and no `updated()`.
    this._syncValidity();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this._syncValidity();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
            <input
                .type=${this.type}
                .value=${this.value}
                .placeholder=${this.placeholder}
                ?disabled=${this._isDisabled}
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
