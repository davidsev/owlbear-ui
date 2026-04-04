import { expect, fixture, html } from '@open-wc/testing';
import { BaseElement } from '../../dist/core/BaseElement.js';

class TestBaseElement extends BaseElement {
  get testSignal(): AbortSignal {
    return this.eventCleanupSignal;
  }
}
customElements.define('test-base-element', TestBaseElement);

describe('BaseElement', () => {
  it('aborts the signal when disconnected', async () => {
    const el = await fixture<TestBaseElement>(
      html`<test-base-element></test-base-element>`,
    );
    const signal = el.testSignal;
    expect(signal.aborted).to.be.false;

    el.remove();

    expect(signal.aborted).to.be.true;
  });

  it('provides a new signal after reconnection', async () => {
    const el = await fixture<TestBaseElement>(
      html`<test-base-element></test-base-element>`,
    );
    const oldSignal = el.testSignal;

    el.remove();
    document.body.appendChild(el);
    await el.updateComplete;

    const newSignal = el.testSignal;
    expect(newSignal).to.not.equal(oldSignal);
    expect(newSignal.aborted).to.be.false;
  });

  it('cleans up event listeners on disconnect', async () => {
    const el = await fixture<TestBaseElement>(
      html`<test-base-element></test-base-element>`,
    );

    let callCount = 0;
    window.addEventListener('test-event', () => callCount++, {
      signal: el.testSignal,
    });

    window.dispatchEvent(new Event('test-event'));
    expect(callCount).to.equal(1);

    el.remove();

    window.dispatchEvent(new Event('test-event'));
    expect(callCount).to.equal(1);
  });
});
