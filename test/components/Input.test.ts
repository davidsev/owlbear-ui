import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/Input.js';
import type { ObUIInput } from '../../dist/components/Input.js';

function getInput(el: ObUIInput): HTMLInputElement {
  return el.shadowRoot!.querySelector('input')!;
}

describe('ObUIInput', () => {
  it('dispatches composed "input" event on typing', async () => {
    const el = await fixture<ObUIInput>(html`<obui-input></obui-input>`);
    const input = getInput(el);

    let firedEvent: Event | null = null;
    el.addEventListener('input', (e) => {
      firedEvent = e;
    });

    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(firedEvent).to.exist;
    expect(firedEvent!.composed).to.be.true;
    expect(el.value).to.equal('a');
  });

  it('dispatches composed "change" event', async () => {
    const el = await fixture<ObUIInput>(html`<obui-input></obui-input>`);
    const input = getInput(el);

    let firedEvent: Event | null = null;
    el.addEventListener('change', (e) => {
      firedEvent = e;
    });

    input.value = 'done';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(firedEvent).to.exist;
    expect(firedEvent!.composed).to.be.true;
    expect(el.value).to.equal('done');
  });

  it('does not double-fire events', async () => {
    const el = await fixture<ObUIInput>(html`<obui-input></obui-input>`);
    const input = getInput(el);

    let inputCount = 0;
    let changeCount = 0;
    el.addEventListener('input', () => inputCount++);
    el.addEventListener('change', () => changeCount++);

    input.value = 'x';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(inputCount).to.equal(1);
    expect(changeCount).to.equal(1);
  });

  it('delegates focus() to shadow input', async () => {
    const el = await fixture<ObUIInput>(html`<obui-input></obui-input>`);
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(getInput(el));
  });

  it('exposes validity mirrored from the inner input, without shadow DOM access', async () => {
    const el = await fixture<ObUIInput>(
      html`<obui-input required></obui-input>`,
    );

    expect(el.validity.valueMissing).to.be.true;
    expect(el.checkValidity()).to.be.false;

    el.value = 'x';
    await el.updateComplete;

    expect(el.validity.valueMissing).to.be.false;
    expect(el.checkValidity()).to.be.true;
  });

  it('reflects validity synchronously, without awaiting updateComplete', async () => {
    const el = await fixture<ObUIInput>(html`<obui-input></obui-input>`);

    el.required = true;

    expect(el.validity.valueMissing).to.be.true;
    expect(el.checkValidity()).to.be.false;
  });

  it('matches a bare <input> when disabled: barred from constraint validation', async () => {
    const el = await fixture<ObUIInput>(
      html`<obui-input type="email" value="notanemail" disabled></obui-input>`,
    );

    // A disabled native input keeps its validity flags but is barred from
    // validation: checkValidity() passes and the message is empty.
    expect(el.validity.typeMismatch).to.be.true;
    expect(el.willValidate).to.be.false;
    expect(el.checkValidity()).to.be.true;
    expect(el.validationMessage).to.equal('');

    // ...and, like a bare <input required disabled>, no valueMissing.
    el.type = 'text';
    el.value = '';
    el.required = true;
    await el.updateComplete;

    expect(el.validity.valueMissing).to.be.false;
    expect(el.checkValidity()).to.be.true;
  });

  it('mirrors validity set programmatically after render', async () => {
    const el = await fixture<ObUIInput>(
      html`<obui-input type="email" value="notanemail"></obui-input>`,
    );

    expect(el.checkValidity()).to.be.false;

    el.disabled = true;
    await el.updateComplete;

    expect(el.checkValidity()).to.be.true;
    expect(el.validationMessage).to.equal('');
  });

  it('mirrors badInput without a value change', async () => {
    const el = await fixture<ObUIInput>(
      html`<obui-input type="number"></obui-input>`,
    );
    const input = getInput(el);

    // Typing "abc" into a number field leaves input.value === '', so nothing
    // on the host changes and no re-render is queued — validity must still
    // follow the inner control.
    input.value = 'abc';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(el.validity.badInput).to.equal(input.validity.badInput);
  });
});
