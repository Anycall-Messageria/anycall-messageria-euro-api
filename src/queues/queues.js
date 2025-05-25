import { Queue, Worker } from 'bullmq';
import dotenv from 'dotenv'
import __dirname from './../../dirname.js'
dotenv.config({ path: __dirname + '/.env'})

import * as jobs from './jobs/index.js'

const redisConnection = {
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.PASSWORD_REDIS
};

const queues = Object.values(jobs).map(job => ({
  bull: new Queue(job.key, { connection: redisConnection }),
  worker: new Worker(job.key, job.handle, { connection: redisConnection }),
  name: job.key,
  handle: job.handle,
  options: job.options,
}))

export default {
  queues,
  add(name, data) {
    const queue = this.queues.find(queue => queue.name === name);
    
    return queue.bull.add(queue.name, data, queue.options);
  },
  process() {
    return this.queues.forEach(queue => {
      queue.worker.on('failed', (job, err) => {
        console.log('Job failed', queue.name, job.data);
        console.log(err);
      });
    })
  }
};