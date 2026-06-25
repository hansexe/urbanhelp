/**
 * TypeORM DataSource Configuration
 * 
 * This file provides a single reusable DataSource that is shared across:
 * 1. NestJS TypeOrmModule (runtime)
 * 2. TypeORM CLI (migrations)
 * 
 * Features:
 * - Environment-based configuration
 * - Automatic entity discovery
 * - Migration path configuration
 * - SSL/TLS support
 * - Development vs Production settings
 * 
 * Note: This file must export ONLY the AppDataSource as default
 * for TypeORM CLI to work correctly.
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Detect whether DataSource is executing from src or dist
 * This works for both:
 * - NestJS runtime (runs from dist, __filename resolves to dist)
 * - TypeORM CLI (runs from dist when using -d dist/database.js)
 * 
 * Mechanism:
 * 1. Get the current file's absolute path (__filename)
 * 2. Check if 'dist' appears in the path
 * 3. If in dist, load compiled JavaScript; if in src, load TypeScript
 * 
 * This is more reliable than NODE_ENV because:
 * - Works with CLI override of NODE_ENV
 * - Works with ts-node (loads from src)
 * - Works with compiled/built code (loads from dist)
 */
const isRunningFromDist = __filename.includes('/dist/') || __filename.includes('\\dist\\');

// Entity paths - auto-detect based on execution location
const entityPath = isRunningFromDist
  ? 'dist/entities/**/*.entity.js'
  : 'src/entities/**/*.entity.ts';

// Migration paths - auto-detect based on execution location
const migrationsPath = isRunningFromDist
  ? 'dist/database/migrations/**/*.js'
  : 'src/database/migrations/**/*.ts';

/**
 * Determine if running in production mode
 * Used for runtime configuration (sync, logging, pool size)
 * NOT used for entity/migration path detection
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Shared DataSource configuration
 * Used by both NestJS and TypeORM CLI
 */
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Entities - auto-detected based on execution location (__filename)
  entities: [entityPath],
  
  // Migrations - auto-detected based on execution location (__filename)
  migrations: [migrationsPath],
  migrationsTableName: 'typeorm_migrations', // Custom table name for tracking
  
  // Configuration - based on NODE_ENV for runtime behavior
  synchronize: false, // Auto-sync only in development
  logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  logger: process.env.DB_LOGGING === 'true' ? 'advanced-console' : 'simple-console',
  
  // SSL/TLS Configuration
  ssl: process.env.DB_SSL === 'true' 
    ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      }
    : false,
  
  // Connection Pool Configuration - based on NODE_ENV for runtime behavior
  poolSize: isProduction ? 20 : 5,
  maxQueryExecutionTime: isProduction ? 30000 : undefined, // Log slow queries in prod
  
  // Migration configuration
  migrationsRun: false, // Don't auto-run migrations (manual control)
  dropSchema: false, // Never drop schema automatically
};

/**
 * AppDataSource instance
 * Used for both NestJS runtime and TypeORM CLI
 * This is the ONLY export and must be default for TypeORM CLI compatibility
 */
const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
