/**
 * Database Initialization Script
 * Runs schema creation and seed data
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');
const logger = require('../utils/logger');

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database initialization...');

    // Read and execute schema
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    
    logger.info('Creating database schema...');
    await client.query(schemaSQL);
    logger.info('✓ Schema created successfully');

    // Read and execute seed data
    const seedSQL = fs.readFileSync(
      path.join(__dirname, 'seed.sql'),
      'utf8'
    );
    
    logger.info('Inserting seed data...');
    await client.query(seedSQL);
    logger.info('✓ Seed data inserted successfully');

    logger.info('✓ Database initialization complete!');
    logger.info('');
    logger.info('Default admin user created:');
    logger.info('  Username: admin');
    logger.info('  Password: d0cm@n5y5');
    logger.info('');

  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logger.info('Exiting...');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
