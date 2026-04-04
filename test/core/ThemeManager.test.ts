import { expect } from '@open-wc/testing';
import { ThemeManager } from '../../dist/core/ThemeManager.js';
import { cleanupThemeManager } from '../helpers/setup';

describe('ThemeManager', () => {
  afterEach(() => {
    cleanupThemeManager();
  });

  it('returns the same instance on repeated calls (singleton)', () => {
    const tm1 = ThemeManager.getInstance();
    const tm2 = ThemeManager.getInstance();
    expect(tm1).to.equal(tm2);
  });

  it('injects a <style> element into document.head', () => {
    ThemeManager.getInstance();
    const styles = document.head.querySelectorAll('style');
    const themeStyle = Array.from(styles).find((s) =>
      s.textContent?.includes('--text-rgb'),
    );
    expect(themeStyle).to.exist;
  });

  it('setTheme() updates data-theme and darkMode', () => {
    const tm = ThemeManager.getInstance();
    expect(tm.darkMode).to.be.true;

    tm.setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).to.equal(
      'light',
    );
    expect(tm.darkMode).to.be.false;

    tm.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).to.equal(
      'dark',
    );
    expect(tm.darkMode).to.be.true;
  });

  it('dispatches a "change" event on setTheme()', () => {
    const tm = ThemeManager.getInstance();
    let fired = false;
    tm.addEventListener('change', () => {
      fired = true;
    });
    tm.setTheme('light');
    expect(fired).to.be.true;
  });

  it('destroy() allows a new instance to be created', () => {
    const tm1 = ThemeManager.getInstance();
    tm1.destroy();
    const tm2 = ThemeManager.getInstance();
    expect(tm2).to.not.equal(tm1);
  });
});
