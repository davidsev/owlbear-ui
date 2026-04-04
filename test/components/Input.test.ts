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
});
