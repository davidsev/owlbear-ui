// @ts-ignore - vanilla-colorful is an optional peer dependency
import 'vanilla-colorful/hex-alpha-color-picker.js';
import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import colorPickerStyle from './ColorPicker.css';

/**
 * Color picker component with swatch button and modal dialog.
 *
 * Uses `<hex-alpha-color-picker>` from vanilla-colorful inside a modal dialog.
 * The swatch button shows the current color+opacity and opens the picker on click.
 *
 * @fires input - Dispatched continuously as the color/opacity changes while the picker is open.
 * @fires change - Dispatched once when the picker dialog is closed.
 */
@customElement('obui-color-picker')
export class ObUIColorPicker extends BaseElement {
  static override styles = baseCSS(colorPickerStyle);

  private static _colorCtx: CanvasRenderingContext2D | null = null;

  @property({ type: String })
  accessor color = '#000000';

  @property({ type: Number })
  accessor opacity = 1;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = 'Color picker';

  @query('dialog', true)
  private accessor dialog!: HTMLDialogElement;

  @query('button.swatch', true)
  private accessor _swatchButton!: HTMLButtonElement;

  private _previousFocus: HTMLElement | null = null;

  /**
   * Normalizes any CSS color value to a 7-character hex string (#rrggbb).
   * Handles named colors, shorthand hex, rgb(), etc.
   */
  private _normalizeHex(color: string): string {
    if (!ObUIColorPicker._colorCtx) {
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');
      ObUIColorPicker._colorCtx = ctx;
    }
    ObUIColorPicker._colorCtx.fillStyle = color;
    return ObUIColorPicker._colorCtx.fillStyle;
  }

  /**
   * Returns the combined color + opacity as an 8-character hex string.
   * e.g. color "#ff0000" + opacity 0.5 => "#ff000080"
   */
  get hexa(): string {
    const normalized = this._normalizeHex(this.color);
    const alphaHex = Math.round(this.opacity * 255)
      .toString(16)
      .padStart(2, '0');
    return `${normalized}${alphaHex}`;
  }

  override render() {
    return html`
            <button
                class="swatch"
                style="background-color: ${this.hexa}"
                aria-label=${this.ariaLabel ?? 'Color picker'}
                aria-haspopup="dialog"
                @click=${this._showDialog}
            ></button>
            <dialog
              @click=${this._onDialogClick}
              @close=${this._onDialogClose}
              aria-label=${this.ariaLabel ?? 'Color picker'}
            >
                <hex-alpha-color-picker
                    .color=${this.hexa}
                    @color-changed=${this._onColorChanged}
                ></hex-alpha-color-picker>
            </dialog>
        `;
  }

  private _showDialog(): void {
    this._previousFocus = (this.getRootNode() as Document | ShadowRoot)
      .activeElement as HTMLElement | null;
    this.dialog.showModal();

    const picker = this.dialog.querySelector('hex-alpha-color-picker');
    if (picker instanceof HTMLElement) {
      picker.focus();
    }
  }

  private _onDialogClick(e: Event): void {
    // Clicks within the dialog content have target set to inner elements.
    // If the target is the dialog itself, the click was on the backdrop.
    if (e.target === this.dialog) {
      this.dialog.close();
    }
  }

  private _onDialogClose(): void {
    if (
      this._previousFocus &&
      typeof this._previousFocus.focus === 'function'
    ) {
      this._previousFocus.focus();
    } else {
      this._swatchButton.focus();
    }
    this._previousFocus = null;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  private _onColorChanged(e: CustomEvent<{ value: string }>): void {
    const hex = e.detail.value;
    // hex-alpha-color-picker returns 8-char hex like "#rrggbbaa"
    this.color = hex.slice(0, 7);
    this.opacity =
      Math.round((Number.parseInt(hex.slice(7, 9) || 'ff', 16) / 255) * 100) /
      100;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-color-picker': ObUIColorPicker;
  }
}
