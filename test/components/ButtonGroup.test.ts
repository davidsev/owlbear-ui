import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/ButtonGroup.js';
import '../../dist/components/ButtonGroupItem.js';
import type { ObUIButtonGroup } from '../../dist/components/ButtonGroup.js';
import type { ObUIButtonGroupItem } from '../../dist/components/ButtonGroupItem.js';

function getItems(el: ObUIButtonGroup): ObUIButtonGroupItem[] {
  return [
    ...el.querySelectorAll('obui-button-group-item'),
  ] as ObUIButtonGroupItem[];
}

function clickItem(item: ObUIButtonGroupItem): void {
  item.shadowRoot!.querySelector('button')!.click();
}

function sendKey(el: ObUIButtonGroup, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('ObUIButtonGroup', () => {
  it('selects the item matching value on first render', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="b">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
        <obui-button-group-item value="c">C</obui-button-group-item>
      </obui-button-group>
    `);
    const items = getItems(el);
    expect(items[0].selected).to.be.false;
    expect(items[1].selected).to.be.true;
    expect(items[2].selected).to.be.false;
  });

  it('clicking an item selects it, updates value, and fires change', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
      </obui-button-group>
    `);
    const items = getItems(el);

    let changes = 0;
    el.addEventListener('change', () => changes++);

    clickItem(items[1]);
    await el.updateComplete;

    expect(el.value).to.equal('b');
    expect(items[1].selected).to.be.true;
    expect(items[0].selected).to.be.false;
    expect(changes).to.equal(1);
  });

  it('does not fire change when clicking the already-selected item', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
      </obui-button-group>
    `);
    let changes = 0;
    el.addEventListener('change', () => changes++);

    clickItem(getItems(el)[0]);
    expect(changes).to.equal(0);
  });

  it('setting value programmatically updates selection without firing change', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
      </obui-button-group>
    `);
    let changes = 0;
    el.addEventListener('change', () => changes++);

    el.value = 'b';
    await el.updateComplete;

    expect(changes).to.equal(0);
    expect(getItems(el)[1].selected).to.be.true;
  });

  it('ArrowRight moves selection and wraps around', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
        <obui-button-group-item value="c">C</obui-button-group-item>
      </obui-button-group>
    `);
    sendKey(el, 'ArrowRight');
    expect(el.value).to.equal('b');
    sendKey(el, 'ArrowRight');
    sendKey(el, 'ArrowRight');
    expect(el.value).to.equal('a');
  });

  it('ArrowLeft wraps from first to last', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
        <obui-button-group-item value="c">C</obui-button-group-item>
      </obui-button-group>
    `);
    sendKey(el, 'ArrowLeft');
    expect(el.value).to.equal('c');
  });

  it('Home selects the first item, End the last', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="b">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
        <obui-button-group-item value="c">C</obui-button-group-item>
      </obui-button-group>
    `);
    sendKey(el, 'End');
    expect(el.value).to.equal('c');
    sendKey(el, 'Home');
    expect(el.value).to.equal('a');
  });

  it('Home/End land on the first/last ENABLED item, skipping disabled edges', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="b">
        <obui-button-group-item value="a" disabled>A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
        <obui-button-group-item value="c">C</obui-button-group-item>
        <obui-button-group-item value="d" disabled>D</obui-button-group-item>
      </obui-button-group>
    `);
    sendKey(el, 'End');
    expect(el.value).to.equal('c');
    sendKey(el, 'Home');
    expect(el.value).to.equal('b');
  });

  it('skips disabled items during keyboard navigation', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b" disabled>B</obui-button-group-item>
        <obui-button-group-item value="c">C</obui-button-group-item>
      </obui-button-group>
    `);
    sendKey(el, 'ArrowRight');
    expect(el.value).to.equal('c');
  });

  it('ignores clicks on disabled items', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b" disabled>B</obui-button-group-item>
      </obui-button-group>
    `);
    let changes = 0;
    el.addEventListener('change', () => changes++);

    clickItem(getItems(el)[1]);
    expect(el.value).to.equal('a');
    expect(changes).to.equal(0);
  });

  it('disabled group is removed from the tab order and marked aria-disabled', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a" disabled>
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
      </obui-button-group>
    `);
    expect(el.getAttribute('aria-disabled')).to.equal('true');
    for (const item of getItems(el)) {
      await item.updateComplete;
      expect(item.shadowRoot!.querySelector('button')!.tabIndex).to.equal(-1);
    }
  });

  it('re-enabling the group restores a tabbable item and clears aria-disabled', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a" disabled>
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
      </obui-button-group>
    `);
    el.disabled = false;
    await el.updateComplete;
    const items = getItems(el);
    await items[0].updateComplete;
    expect(el.hasAttribute('aria-disabled')).to.be.false;
    expect(items[0].shadowRoot!.querySelector('button')!.tabIndex).to.equal(0);
  });

  it('fires a change event that is composed and bubbles', async () => {
    const el = await fixture<ObUIButtonGroup>(html`
      <obui-button-group value="a">
        <obui-button-group-item value="a">A</obui-button-group-item>
        <obui-button-group-item value="b">B</obui-button-group-item>
      </obui-button-group>
    `);
    let firedEvent: Event | null = null;
    el.addEventListener('change', (e) => {
      firedEvent = e;
    });

    clickItem(getItems(el)[1]);

    expect(firedEvent).to.exist;
    expect(firedEvent!.composed).to.be.true;
    expect(firedEvent!.bubbles).to.be.true;
  });
});
