/**
 * Portfolio Module
 * Main export file for portfolio-related functionality
 */

// Types
export * from './types';

// Blocks
export * from './blocks/registry';
export * from './blocks/schemas';

// Services (re-export from services)
export { PortfolioService } from '../services/portfolio';
export type {
  PortfolioSite,
  PortfolioPage,
  PortfolioBlock,
  PortfolioTemplate,
} from '../services/portfolio';
