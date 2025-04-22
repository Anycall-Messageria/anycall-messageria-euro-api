import { Queue } from 'bullmq';
import dotenv from 'dotenv'
import __dirname from './../../dirname.js'
dotenv.config({ path: __dirname + '/.env'})

import * as jobs from './jobs/index.js'

const queues = Object.values(jobs).map(job => ({
  bull: new Queue(job.key, { connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.PASSWORD_REDIS
  } }),
  name: job.key,
  handle: job.handle,
  options: job.options,
}))

export default {
  queues,
  add(name, data) {
    const queue = this.queues.find(queue => queue.name === name);
    
    return queue.bull.add(data, queue.options);
  },
  process() {
    return this.queues.forEach(queue => {
      queue.bull.process(queue.handle);

      queue.bull.on('failed', (job, err) => {
        console.log('Job failed', queue.key, job.data);
        console.log(err);
      });
    })
  }
};