const amqp = require('amqplib');
const Redis = require('ioredis');
const chokidar = require('chokidar');
const { processVault } = require('./handlers/vault');
const { processMedia } = require('./handlers/media');
const { updateHierarchy } = require('./utils/hierarchy');
const { logToFile } = require('./utils/logger');

// Initialize Redis for pub/sub
const redisSub = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379
});

// Initialize Redis for data operations
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379
});

// Initialize RabbitMQ
async function setupQueue() {
  const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'rabbitmq'}`);
  const channel = await connection.createChannel();
  
  await channel.assertQueue('vault_updates');
  await channel.assertQueue('media_updates');
  
  return { connection, channel };
}

// Watch for vault changes
function setupWatcher() {
  const watcher = chokidar.watch('/vault', {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  return watcher;
}

async function setupSubscriptions() {
  // Subscribe to hierarchy updates
  redisSub.subscribe('hierarchy_update', (err) => {
    if (err) {
      logToFile(`Error subscribing to hierarchy updates: ${err.message}`);
      return;
    }
    logToFile('Subscribed to hierarchy updates');
  });

  // Handle hierarchy update messages
  redisSub.on('message', async (channel, message) => {
    if (channel === 'hierarchy_update') {
      logToFile('Received hierarchy update request');
      try {
        await updateHierarchy(redis);
        logToFile('Hierarchy update completed');
      } catch (error) {
        logToFile(`Error updating hierarchy: ${error.message}`);
      }
    }
  });
}

async function main() {
  const { channel } = await setupQueue();
  const watcher = setupWatcher();
  await setupSubscriptions();

  // Watch for changes
  watcher
    .on('add', path => handleFileChange('add', path, channel))
    .on('change', path => handleFileChange('change', path, channel))
    .on('unlink', path => handleFileChange('unlink', path, channel));

  // Process queue messages
  channel.consume('vault_updates', async msg => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      await processVault(data, redis);
      channel.ack(msg);
    }
  });

  channel.consume('media_updates', async msg => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      await processMedia(data, redis);
      channel.ack(msg);
    }
  });

  logToFile('Parser service started');
}

main().catch(error => {
  logToFile(`Fatal error: ${error.message}`);
  process.exit(1);
}); 