import type { PropertyValues } from 'lit';
import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { baseCSS } from '../core/baseCSS';
import { FormElement } from '../core/FormElement';
import sliderStyle from './Slider.css';

/**
 * A range slider with a filled track and circular thumb, styled to match
 * Owlbear Rodeo's UI. Built on a native `<input type="range">`, so keyboard,
 * touch and screen-reader support come for free.
 *
 * @fires input - Dispatched continuously while dragging or on each keyboard step.
 * @fires change - Dispatched when the value is committed (pointer release / keyboard).
 */
@customElement('obui-slider')
export class ObUISlider extends FormElement {
  static override styles = baseCSS(sliderStyle);

  @property({ type: Number })
  accessor value = 0;

  @property({ type: Number })
  accessor min = 0;

  @property({ type: Number })
  accessor max = 100;

  @property({ type: Number })
  accessor step = 1;

  /**
   * Number of decorative tick marks to render (0 = none). Ticks divide the track
   * into `ticks + 1` equal segments — e.g. `ticks=3` marks the quarter points.
   */
  @property({ type: Number })
  accessor ticks = 0;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  @query('input')
  private accessor _input!: HTMLInputElement;

  /** The value at first connection, restored by `form.reset()`. */
  private _defaultValue = 0;
  private _defaultValueCaptured = false;

  protected override get _formValue(): string {
    return String(this.value);
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

  /** Position of the thumb along the track, clamped to 0–100. */
  private get _percent(): number {
    const range = this.max - this.min;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(100, ((this.value - this.min) / range) * 100));
  }

  private _onInput(e: Event): void {
    e.stopPropagation();
    this.value = (e.target as HTMLInputElement).valueAsNumber;
    // Sync directly: if `this.value` is unchanged there's no re-render, and
    // so no `updated()` to mirror validity from.
    this._syncValidity();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    this.value = (e.target as HTMLInputElement).valueAsNumber;
    this._syncValidity();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  override render() {
    const tickCount = Math.max(0, Math.floor(this.ticks));
    return html`
      <div class="slider" style=${styleMap({ '--pct': `${this._percent}%` })}>
        <div class="track"></div>
        ${
          tickCount > 0
            ? html`<div class="ticks" aria-hidden="true">
              ${Array.from({ length: tickCount }, () => html`<span class="tick"></span>`)}
            </div>`
            : null
        }
        <input
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          ?disabled=${this._isDisabled}
          aria-label=${ifDefined(this.ariaLabel ?? undefined)}
          .value=${String(this.value)}
          @input=${this._onInput}
          @change=${this._onChange}
          part="input"
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-slider': ObUISlider;
  }
}
