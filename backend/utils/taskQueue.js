const queues = new Map();

const defaultOptions = {
  retries: 3,
  retryDelayMs: 1000,
};

const getQueue = (name) => {
  if (!queues.has(name)) {
    queues.set(name, {
      items: [],
      running: false,
      processed: 0,
      failed: 0,
    });
  }
  return queues.get(name);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runQueue = async (name) => {
  const queue = getQueue(name);
  if (queue.running) return;
  queue.running = true;

  try {
    while (queue.items.length > 0) {
      const job = queue.items.shift();
      let attempt = 0;
      while (attempt <= job.options.retries) {
        try {
          await job.handler();
          queue.processed += 1;
          break;
        } catch (error) {
          attempt += 1;
          if (attempt > job.options.retries) {
            queue.failed += 1;
            console.error('[TASK-QUEUE-FAILED]', name, error.message);
            break;
          }
          await wait(job.options.retryDelayMs * attempt);
        }
      }
    }
  } finally {
    queue.running = false;
  }
};

const enqueueTask = (name, handler, options = {}) => {
  const queue = getQueue(name);
  queue.items.push({
    handler,
    options: { ...defaultOptions, ...options },
  });

  setImmediate(() => {
    void runQueue(name);
  });
};

const getQueueStats = () => {
  const stats = {};
  for (const [name, queue] of queues.entries()) {
    stats[name] = {
      queued: queue.items.length,
      running: queue.running,
      processed: queue.processed,
      failed: queue.failed,
    };
  }
  return stats;
};

module.exports = {
  enqueueTask,
  getQueueStats,
};
