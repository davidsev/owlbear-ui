import type { PropertyValues, TemplateResult } from 'lit';
import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { FormElement } from '../core/FormElement';

export abstract class BaseSelect extends FormElement {
  @property({ type: Object })
  accessor options: Record<string, string> = {};

  @property({ type: String })
  accessor placeholder = '';

  @property({ type: Boolean, reflect: true })
  accessor required = false;

  @property({ type: String, attribute: 'aria-label' })
  accessor ariaLabel: string | null = null;

  @query('.select-trigger')
  private accessor _trigger!: HTMLElement;

  @state()
  protected accessor _open = false;

  @state()
  protected accessor _focusedIndex = -1;

  /**
   * Whether the user has interacted with the control (blurred it, or
   * triggered a validity check). Mirrors the native `:user-invalid`
   * convention `<obui-input>` gets for free — don't flag a required field
   * as invalid before the user has had a chance to fill it in.
   */
  @state()
  private accessor _touched = false;

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
    // Fires when the browser blocks form submission (or `reportValidity()`)
    // on this control — the one path that doesn't go through our own
    // `reportValidity()` override below, since the browser calls the native
    // constraint-validation machinery directly.
    this.addEventListener('invalid', this._onInvalid, {
      signal: this.eventCleanupSignal,
    });
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    this.setAttribute('aria-expanded', String(this._open));
    this.setAttribute('aria-controls', this._listboxId);
    if (this._activeDescendantId) {
      this.setAttribute('aria-activedescendant', this._activeDescendantId);
    } else {
      this.removeAttribute('aria-activedescendant');
    }
    if (this._isDisabled) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
    if (this.required) {
      this.setAttribute('aria-required', 'true');
    } else {
      this.removeAttribute('aria-required');
    }
    // The disabled check mirrors a bare `<input required disabled>`, whose
    // `valueMissing` flag is false because a disabled control isn't mutable.
    const invalid = this.required && this._showPlaceholder && !this._isDisabled;
    if (invalid) {
      this.internals.setValidity(
        { valueMissing: true },
        'Please select an option.',
        // Anchor the native validation bubble, as `<obui-input>` does — without
        // it `reportValidity()` and form submission block with no visible cue.
        this._trigger ?? undefined,
      );
    } else {
      this.internals.setValidity({});
    }
    // Only flag it visually once the user has interacted with the control
    // (blurred it, or triggered a validity check) — same convention as
    // `<obui-input>`'s native `:user-invalid` styling. `internals.validity`
    // above always reflects the true state, regardless of `_touched`.
    const showInvalid = invalid && this._touched;
    if (showInvalid) {
      this.setAttribute('aria-invalid', 'true');
    } else {
      this.removeAttribute('aria-invalid');
    }
    // Set directly rather than via a CSS class/attribute selector: Chrome
    // (observed in headless test runs) can fail to re-invalidate a
    // `border-*-color` longhand that depends on a CSS custom property when
    // it's overridden by a class/attribute-selector rule elsewhere.
    if (this._trigger) {
      this._trigger.style.borderBottomColor = showInvalid ? 'red' : '';
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
    if (this._isDisabled) return;
    this._focusedIndex = -1;
  };

  private _onBlur = (): void => {
    this._open = false;
    this._focusedIndex = -1;
    this._touched = true;
  };

  private _onInvalid = (): void => {
    this._touched = true;
  };

  override reportValidity(): boolean {
    this._touched = true;
    return super.reportValidity();
  }

  override formResetCallback(): void {
    super.formResetCallback();
    // The native reset algorithm clears user-invalidation state along with
    // the value — match it, or the field stays painted red after reset.
    this._touched = false;
  }

  private _onClick = (): void => {
    if (this._isDisabled) return;
    this._open = !this._open;
    this._focusedIndex = -1;
  };

  private _onKeydown = (e: KeyboardEvent): void => {
    if (this._isDisabled) return;
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
