import { registerRootComponent } from 'expo';
import { LogBox, Platform } from 'react-native';

// Aggressive suppression of development/deprecation noise in the console
if (Platform.OS === 'web') {
  const silentPatterns = [
    'Download the React DevTools',
    'props.pointerEvents is deprecated',
    '"shadow*" style props are deprecated',
    'Running application "main" with appParams',
    'Development-level warnings',
    'Performance optimizations'
  ];

  const originalConsoleInfo = console.info;
  console.info = (...args) => {
    if (args[0] && typeof args[0] === 'string' && silentPatterns.some(p => args[0].includes(p))) {
      return;
    }
    originalConsoleInfo(...args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && silentPatterns.some(p => args[0].includes(p))) {
      return;
    }
    originalConsoleWarn(...args);
  };

  const originalConsoleLog = console.log;
  console.log = (...args) => {
    if (args[0] && typeof args[0] === 'string' && silentPatterns.some(p => args[0].includes(p))) {
      return;
    }
    originalConsoleLog(...args);
  };
}

// Ignore specific LogBox warnings for native platforms
LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
]);

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
