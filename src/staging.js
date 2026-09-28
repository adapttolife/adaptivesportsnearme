// Full application functionality with the staging database and live external services.
// Export HTTP only: scheduled maintenance belongs to production.
import application from './index.js';

export default {
  fetch(request, env, ctx) {
    return application.fetch(request, env, ctx);
  },
};
