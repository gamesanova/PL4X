/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

import 'phaser';

/**
 * Global augmentation to ensure Phaser.Scene includes
 * RexUI and RexBoard plugin properties.
 */
declare global {
  namespace Phaser {
    interface Scene {
      rexUI: any;
      rexBoard: any;
    }
  }

  // Define namespaces for internal plugin structures
  namespace RexUI {
    interface Sizer extends Phaser.GameObjects.Container {
      [key: string]: any;
    }

    interface Label extends Phaser.GameObjects.Container {
      [key: string]: any;
    }
  }

  namespace RexPlugins {
    namespace Board {
      class Board {
        [key: string]: any;
      }
      interface PathFinder {
        findPath(target: { x: number; y: number }, distance: number): { x: number; y: number }[] | null;
        destroy(): void;
      }
    }
    namespace UI {
      class Sizer {
        [key: string]: any;
      }
    }
  }
}

// Ensure this file is treated as a module
export {};
