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
import { DataSource } from 'typeorm';
/**
 * AppDataSource instance
 * Used for both NestJS runtime and TypeORM CLI
 * This is the ONLY export and must be default for TypeORM CLI compatibility
 */
declare const AppDataSource: DataSource;
export default AppDataSource;
