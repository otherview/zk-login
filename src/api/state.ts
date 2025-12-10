import type { ZkLoginConfig } from '../types/index.js';
import { ZkLoginNotInitializedError } from '../errors/index.js';

interface ZkLoginState {
  initialized: boolean;
  config: ZkLoginConfig | null;
}

const state: ZkLoginState = {
  initialized: false,
  config: null
};

export function initializeZkLogin(config: ZkLoginConfig): void {
  state.config = config;
  state.initialized = true;
}

export function getZkLoginConfig(): ZkLoginConfig {
  if (!state.initialized || !state.config) {
    throw new ZkLoginNotInitializedError();
  }
  return state.config;
}

export function isInitialized(): boolean {
  return state.initialized;
}