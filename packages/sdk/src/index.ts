/**
 * Skills Guard SDK
 * Agent Skills Security Scanner Client
 */

// Export types
export * from './types.js';

// Export client
export {
  SkillsGuardClient,
  getClient,
  scan,
  validate,
  checkTools,
  quickCheck,
} from './client.js';
