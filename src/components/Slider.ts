import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
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
export class ObUISlider extends BaseElement {
  static override styles = baseCSS(sliderStyle);

  @property({ type: Number })
  accessor value = 0;

  @property({ type: Number })
  accessor min = 0;

  @property({ type: Number })
  accessor max = 100;

  @property({ type: Number })
  accessor step = 1;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /**
   * Number of decorative tick marks to render (0 = none). Ticks divide the track
   * into `ticks + 1` equal segments — e.g. `ticks=3` marks the quarter points.
   */
  @property({ type: Number })
  accessor ticks = 0;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  /** Position of the thumb along the track, clamped to 0–100. */
  private get _percent(): number {
    const range = this.max - this.min;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(100, ((this.value - this.min) / range) * 100));
  }

  private _onInput(e: Event): void {
    e.stopPropagation();
    this.value = (e.target as HTMLInputElement).valueAsNumber;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    this.value = (e.target as HTMLInputElement).valueAsNumber;
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
          ?disabled=${this.disabled}
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
