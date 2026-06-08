import type { TemplateResult } from 'lit';
import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseElement } from '../core/BaseElement';

export abstract class BaseSelect extends BaseElement {
  @property({ type: Object })
  accessor options: Record<string, string> = {};

  @property({ type: String })
  accessor placeholder = '';

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  @state()
  protected accessor _open = false;

  @state()
  protected accessor _focusedIndex = -1;

  protected get _listboxId(): string {
    return `${this._uniqueId}-listbox`;
  }

  protected _optionId(index: number): string {
    return `${this._uniqueId}-option-${index}`;
  }

  protected get _activeDescendantId(): string | undefined {
    if (this._focusedIndex >= 0 && this._focusedIndex < this._keys.length) {
      return this._optionId(this._focusedIndex);
    }
    return undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }

    this.setAttribute('role', 'combobox');
    this.setAttribute('aria-haspopup', 'listbox');

    this.addEventListener('focus', this._onFocus, {
      signal: this.eventCleanupSignal,
    });
    this.addEventListener('blur', this._onBlur, {
      signal: this.eventCleanupSignal,
    });
    this.addEventListener('keydown', this._onKeydown, {
      signal: this.eventCleanupSignal,
    });
    this.addEventListener('click', this._onClick, {
      signal: this.eventCleanupSignal,
    });
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    this.setAttribute('aria-expanded', String(this._open));
    this.setAttribute('aria-controls', this._listboxId);
    if (this._activeDescendantId) {
      this.setAttribute('aria-activedescendant', this._activeDescendantId);
    } else {
      this.removeAttribute('aria-activedescendant');
    }
    if (this.disabled) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
  }

  /** The list of option keys in order. */
  protected get _keys(): string[] {
    return Object.keys(this.options);
  }

  /** Display text for the current value(s), or placeholder. */
  protected abstract get _displayText(): string;

  /** Whether to show the placeholder styling. */
  protected abstract get _showPlaceholder(): boolean;

  /** Called when the user activates a focused item (Enter or Space). */
  protected abstract _onSelectKey(key: string): void;

  /** Render the dropdown items. */
  protected abstract renderItems(keys: string[]): TemplateResult;

  private _onFocus = (): void => {
    if (this.disabled) return;
    this._focusedIndex = -1;
  };

  private _onBlur = (): void => {
    this._open = false;
    this._focusedIndex = -1;
  };

  private _onClick = (): void => {
    if (this.disabled) return;
    this._open = !this._open;
    this._focusedIndex = -1;
  };

  private _onKeydown = (e: KeyboardEvent): void => {
    if (this.disabled) return;
    const keys = this._keys;
    if (keys.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!this._open) {
          this._open = true;
          this._focusedIndex = 0;
        } else {
          this._focusedIndex = Math.min(
            this._focusedIndex + 1,
            keys.length - 1,
          );
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (this._open) {
          this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (this._open) {
          this._focusedIndex = 0;
        }
        break;
      }
      case 'End': {
        e.preventDefault();
        if (this._open) {
          this._focusedIndex = keys.length - 1;
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (
          this._open &&
          this._focusedIndex >= 0 &&
          this._focusedIndex < keys.length
        ) {
          this._onSelectKey(keys[this._focusedIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        this._open = false;
        this._focusedIndex = -1;
        break;
      }
    }
  };

  protected _onItemMouseDown(e: MouseEvent): void {
    e.preventDefault();
  }

  protected _onItemClick(e: MouseEvent): void {
    e.stopPropagation();
  }

  override render() {
    return html`
            <div class=${classMap({ 'select-trigger': true, placeholder: this._showPlaceholder })}>
                ${this._displayText || nothing}
            </div>
            <div
              class=${classMap({ dropdown: true, open: this._open })}
              role="listbox"
              id=${this._listboxId}
              aria-label=${ifDefined(this.ariaLabel ?? undefined)}
            >
                ${this.renderItems(this._keys)}
            </div>
        `;
  }
}
