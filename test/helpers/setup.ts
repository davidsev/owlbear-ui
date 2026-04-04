import { ThemeManager } from '../../dist/core/ThemeManager.js';

/**
 * Clean up ThemeManager singleton between tests.
 * Call in afterEach() for any test that uses ThemeManager.
 */
export function cleanupThemeManager(): void {
  try {
    ThemeManager.getInstance().destroy();
  } catch {
    // Already destroyed or never created
  }
}
