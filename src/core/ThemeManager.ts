import themeCSS from './theme.css';

declare global {
  // eslint-disable-next-line no-var
  var __obui_theme_manager: ThemeManager | undefined;
}

/**
 * Singleton that syncs OBR theme to the document.
 *
 * - Lazily instantiated on first getInstance() call
 * - Call connectOBR() to sync with the OBR theme automatically
 * - Call setTheme() to manually set the theme
 * - Call destroy() to clean up (style tag, OBR listeners)
 * - Sets data-theme="dark"|"light" on document.documentElement
 * - Injects a global <style> into <head> containing theme.css content
 * - Exposes darkMode getter
 * - Extends EventTarget, dispatches 'change' event
 * - HMR-safe: previous instance is destroyed when a new one is created
 *
 * @fires change - Dispatched when the theme mode changes.
 */
export class ThemeManager extends EventTarget {
  private static instance: ThemeManager | null = null;

  private _darkMode = true;
  private _styleEl: HTMLStyleElement;
  private _abortController = new AbortController();
  private _obrUnsubscribe: (() => void) | null = null;

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      // Destroy any previous instance left over from HMR
      globalThis.__obui_theme_manager?.destroy();

      ThemeManager.instance = new ThemeManager();
      globalThis.__obui_theme_manager = ThemeManager.instance;
    }
    return ThemeManager.instance;
  }

  private constructor() {
    super();

    // Inject the global theme stylesheet into <head>
    this._styleEl = document.createElement('style');
    this._styleEl.textContent = themeCSS;
    document.head.appendChild(this._styleEl);

    // Default to dark theme
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  get darkMode(): boolean {
    return this._darkMode;
  }

  /**
   * Manually set the theme mode.
   */
  setTheme(mode: 'dark' | 'light'): void {
    this._applyTheme(mode === 'dark' ? 'DARK' : 'LIGHT');
  }

  /**
   * Connect to OBR theme sync.
   * Call this in your extension's setup to automatically follow the OBR theme.
   */
  async connectOBR(): Promise<void> {
    const { default: OBR } = await import('@owlbear-rodeo/sdk');
    const signal = this._abortController.signal;
    if (signal.aborted) return;

    OBR.onReady(() => {
      if (signal.aborted) return;
      OBR.theme.getTheme().then((theme) => {
        if (signal.aborted) return;
        this._applyTheme(theme.mode);
      });
      this._obrUnsubscribe = OBR.theme.onChange((theme) => {
        if (signal.aborted) return;
        this._applyTheme(theme.mode);
      });
    });
  }

  /**
   * Tears down this instance: removes the injected style tag and
   * aborts any OBR listeners. Called automatically during HMR when
   * a new instance replaces this one.
   */
  destroy(): void {
    this._abortController.abort();
    this._obrUnsubscribe?.();
    this._obrUnsubscribe = null;
    this._styleEl.remove();
    if (ThemeManager.instance === this) {
      ThemeManager.instance = null;
    }
    if (globalThis.__obui_theme_manager === this) {
      globalThis.__obui_theme_manager = undefined;
    }
  }

  private _applyTheme(mode: string): void {
    const isDark = mode === 'DARK';
    this._darkMode = isDark;
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light',
    );
    this.dispatchEvent(new Event('change'));
  }
}
