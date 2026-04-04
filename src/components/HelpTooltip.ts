import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import helpTooltipStyle from './HelpTooltip.css';

@customElement('obui-help-tooltip')
export class ObUIHelpTooltip extends BaseElement {
  static override styles = baseCSS(helpTooltipStyle);

  @query('dialog', true)
  private accessor dialog!: HTMLDialogElement;

  @query('button', true)
  private accessor _triggerButton!: HTMLButtonElement;

  private _previousFocus: HTMLElement | null = null;

  override render() {
    return html`
            <button
              aria-label="Help"
              aria-haspopup="dialog"
              @click=${this._showDialog}
            >?</button>
            <dialog @click=${this._hideDialog} @close=${this._onDialogClose}>
                <div>
                    <slot></slot>
                </div>
            </dialog>
        `;
  }

  private _showDialog(): void {
    this._previousFocus = (this.getRootNode() as Document | ShadowRoot)
      .activeElement as HTMLElement | null;

    const ourRect = this.getBoundingClientRect();
    this.dialog.showModal();
    this.dialog.style.top = `${ourRect.bottom}px`;

    // If the bottom of the dialog is off the screen, flip it above.
    const dialogRect = this.dialog.getBoundingClientRect();
    if (dialogRect.bottom + 25 > window.innerHeight) {
      this.dialog.style.top = 'auto';
      this.dialog.style.bottom = '1em';
    }

    // Focus the dialog content for screen readers.
    const contentDiv = this.dialog.querySelector('div');
    if (contentDiv) {
      contentDiv.setAttribute('tabindex', '-1');
      contentDiv.focus();
    }
  }

  private _hideDialog(e: Event): void {
    // Clicks within the dialog content have target set to the div or its children.
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
      this._triggerButton.focus();
    }
    this._previousFocus = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-help-tooltip': ObUIHelpTooltip;
  }
}
