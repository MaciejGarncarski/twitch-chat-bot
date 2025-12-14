import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { logOnStart } from '@/utils/log-on-start';
import { wrap } from '@bogeychan/elysia-logger';
import { logger } from '@/lib/logger';
import { env } from '@/config/env';

const app = new Elysia()
  .use(
    wrap(logger)
  )
.use(cors({
    origin: env.APP_ORIGIN
}))
    .get('/', () => 'Hi Elysia 12322s')
    .get('/id/:id', ({ params: { id } }) => id)
    .post('/mirror', ({ body }) => body, {
        body: t.Object({
            id: t.Number(),
            name: t.String()
        })
    })
    
    .listen(env.PORT)

logOnStart()

export type App = typeof app;