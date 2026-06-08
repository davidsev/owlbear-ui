import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/Slider.js';
import type { ObUISlider } from '../../dist/components/Slider.js';

function getInput(el: ObUISlider): HTMLInputElement {
  return el.shadowRoot!.querySelector('input')!;
}

describe('ObUISlider', () => {
  it('reflects value/min/max/step onto the native range input', async () => {
    const el = await fixture<ObUISlider>(
      html`<obui-slider min="0" max="10" step="2" value="4"></obui-slider>`,
    );
    const input = getInput(el);
    expect(input.min).to.equal('0');
    expect(input.max).to.equal('10');
    expect(input.step).to.equal('2');
    expect(input.value).to.equal('4');
  });

  it('dispatches a composed "input" event and updates value', async () => {
    const el = await fixture<ObUISlider>(
      html`<obui-slider min="0" max="10" value="0"></obui-slider>`,
    );
    const input = getInput(el);

    let firedEvent: Event | null = null;
    el.addEventListener('input', (e) => {
      firedEvent = e;
    });

    input.value = '7';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(firedEvent).to.exist;
    expect(firedEvent!.composed).to.be.true;
    expect(el.value).to.equal(7);
  });

  it('dispatches a composed "change" event and updates value', async () => {
    const el = await fixture<ObUISlider>(html`<obui-slider></obui-slider>`);
    const input = getInput(el);

    let firedEvent: Event | null = null;
    el.addEventListener('change', (e) => {
      firedEvent = e;
    });

    input.value = '42';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(firedEvent).to.exist;
    expect(firedEvent!.composed).to.be.true;
    expect(el.value).to.equal(42);
  });

  it('exposes the fill percentage via the --pct custom property', async () => {
    const el = await fixture<ObUISlider>(
      html`<obui-slider min="0" max="100" value="25"></obui-slider>`,
    );
    const slider = el.shadowRoot!.querySelector('.slider') as HTMLElement;
    expect(slider.style.getPropertyValue('--pct')).to.equal('25%');
  });

  it('clamps the fill percentage to 0–100 for out-of-range values', async () => {
    const el = await fixture<ObUISlider>(
      html`<obui-slider min="0" max="10" value="50"></obui-slider>`,
    );
    const slider = el.shadowRoot!.querySelector('.slider') as HTMLElement;
    expect(slider.style.getPropertyValue('--pct')).to.equal('100%');
  });

  it('renders tick marks only when ticks > 0', async () => {
    const plain = await fixture<ObUISlider>(html`<obui-slider></obui-slider>`);
    expect(plain.shadowRoot!.querySelectorAll('.tick')).to.have.lengthOf(0);

    const ticked = await fixture<ObUISlider>(
      html`<obui-slider ticks="5"></obui-slider>`,
    );
    expect(ticked.shadowRoot!.querySelectorAll('.tick')).to.have.lengthOf(5);
  });

  it('disables the native input when disabled', async () => {
    const el = await fixture<ObUISlider>(
      html`<obui-slider disabled></obui-slider>`,
    );
    expect(getInput(el).disabled).to.be.true;
  });
});
