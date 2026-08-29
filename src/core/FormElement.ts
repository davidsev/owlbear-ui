import type { PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { BaseElement } from './BaseElement';

/**
 * Base class for form-associated owlbear-ui components.
 *
 * Attaches `ElementInternals` so constraint validation state set by a
 * subclass (via `this.internals.setValidity(...)`) is exposed on the host
 * element itself — `validity`, `validationMessage`, `checkValidity()`,
 * `reportValidity()` — instead of requiring callers to reach into the
 * shadow root to find the underlying native control.
 *
 * Also handles the rest of the form-control contract: the value is submitted
 * with the containing `<form>` under `name`, `form.reset()` restores it, and
 * an ancestor `<fieldset disabled>` disables the control.
 *
 * Element-level constraint validation (`checkValidity()`, `validity`, ...) is
 * synchronous — see `_flushValidity()`. Form-level reads are not: `new
 * FormData(form)` and `form.requestSubmit()`/`form.reportValidity()` go
 * through the browser, which only sees whatever was last passed to
 * `internals.setFormValue()`/`setValidity()` in `updated()`. A property
 * write is reflected there once rendering catches up, so callers doing both
 * in the same tick (`el.value = 'x'; form.requestSubmit()`) should `await
 * el.updateComplete` in between.
 */
export abstract class FormElement extends BaseElement {
  static formAssociated = true;

  protected readonly internals: ElementInternals = this.attachInternals();

  /**
   * Name the value is submitted under. Backed by the `name` attribute rather
   * than a reactive property because form submission reads the attribute — a
   * property-only name would never make it into the `FormData`.
   */
  get name(): string {
    return this.getAttribute('name') ?? '';
  }

  set name(value: string) {
    this.setAttribute('name', value);
    this.requestUpdate();
  }

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /** Tracks `formDisabledCallback`, which also covers `<fieldset disabled>`. */
  @state()
  private accessor _formDisabled = false;

  /**
   * Whether the control is disabled, by its own `disabled` or by an ancestor
   * `<fieldset disabled>`. Subclasses must use this rather than `disabled`
   * for rendering and interaction guards.
   */
  protected get _isDisabled(): boolean {
    return this.disabled || this._formDisabled;
  }

  /**
   * Value submitted with the form, or `null` for nothing. Return a `FormData`
   * to submit several entries (as `<select multiple>` does). The browser skips
   * disabled and unnamed controls, so neither needs handling here.
   */
  protected abstract get _formValue(): string | FormData | null;

  /** Restore the value the control had at its first render. */
  protected abstract _restoreDefaultValue(): void;

  formDisabledCallback(disabled: boolean): void {
    this._formDisabled = disabled;
  }

  formResetCallback(): void {
    this._restoreDefaultValue();
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    this.internals.setFormValue(this._formValue);
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /**
   * Subclasses compute validity in `updated()`, but the constraint-validation
   * API is synchronous — a caller doing `el.required = true; el.checkValidity()`
   * must not see stale state. Flush any pending render first. Guarded on
   * `isUpdatePending` so re-entering from within `updated()` is a no-op.
   */
  private _flushValidity(): void {
    if (this.isUpdatePending) this.performUpdate();
  }

  get validity(): ValidityState {
    this._flushValidity();
    return this.internals.validity;
  }

  get validationMessage(): string {
    this._flushValidity();
    // A native control barred from constraint validation reports an empty
    // message even while its validity flags stay set (e.g. a disabled
    // `type="email"` still has `typeMismatch`). `ElementInternals` keeps
    // whatever message was set, so hide it here to mirror the native shape.
    return this.willValidate ? this.internals.validationMessage : '';
  }

  get willValidate(): boolean {
    this._flushValidity();
    return this.internals.willValidate;
  }

  checkValidity(): boolean {
    this._flushValidity();
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    this._flushValidity();
    return this.internals.reportValidity();
  }
}
