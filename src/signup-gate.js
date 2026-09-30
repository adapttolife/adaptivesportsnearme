// Existing production route Worker, now built from the same signup code as preview.
// Intentionally no static-site deployment and no directory maintenance here.
import app from './index.js';
import { sweepIntake } from './intake.js';
export default {
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname !== '/api/subscribe') return new Response('Not found', {status:404});
    return app.fetch(request, env, ctx);
  },
  scheduled(controller, env, ctx) {
    if (controller.cron === '*/10 * * * *' && env.INTAKE) ctx.waitUntil(sweepIntake(env));
  },
};
