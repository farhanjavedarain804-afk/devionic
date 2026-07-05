const { getQueueStats } = require('../utils/taskQueue');

const startTaskWorker = () => {
  const intervalMs = Number(process.env.TASK_WORKER_HEARTBEAT_MS || 15000);
  const heartbeat = setInterval(() => {
    const stats = getQueueStats();
    console.log('[TASK-WORKER]', JSON.stringify(stats));
  }, intervalMs);

  heartbeat.unref?.();
};

if (require.main === module) {
  startTaskWorker();
}

module.exports = { startTaskWorker };
