const express = require('express');
const Redis = require('ioredis');
const amqp = require('amqplib');

const app = express();
const redis = new Redis(process.env.REDIS_HOST);

app.use(express.json());

// Status endpoint
app.get('/api/status', async (req, res) => {
  const status = {
    parser: await redis.get('parser_status'),
    jekyll: await redis.get('jekyll_status'),
    lastUpdate: await redis.get('last_update')
  };
  res.json(status);
});

// Trigger rebuild
app.post('/api/rebuild', async (req, res) => {
  const channel = await setupQueue();
  await channel.sendToQueue('vault_updates', Buffer.from(JSON.stringify({
    type: 'rebuild',
    timestamp: new Date().toISOString()
  })));
  res.json({ status: 'rebuild triggered' });
});

app.listen(3000, () => console.log('Admin UI running on port 3000')); 