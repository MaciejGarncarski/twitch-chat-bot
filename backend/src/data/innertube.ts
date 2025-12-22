import { Innertube, UniversalCache } from 'youtubei.js'

import { env } from '@/config/env'

export const innertube = await Innertube.create({
  cache: new UniversalCache(true, '../yt-metadata-cache'),
  cookie: env.YT_COOKIE,
})
