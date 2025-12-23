import { CurrentSongCommandHandler } from '@/commands/current-song-command-handler'
import { GithubCommandHandler } from '@/commands/github-commang-handler'
import { HelpCommandHandler } from '@/commands/help-command-handler'
import { NextInfoCommandHandler } from '@/commands/next-info-command-handler'
import { PauseCommandHandler } from '@/commands/pause-command-handler'
import { PlayCommandHandler } from '@/commands/play-command-handler'
import { QueueCommandHandler } from '@/commands/queue-command-handler'
import { SkipCommandHandler } from '@/commands/skip-command-handler'
import { YoutubeSrHandler } from '@/commands/sr-command-handler'
import { VolumeCommandHandler } from '@/commands/volume-command-handler'
import { VoteSkipCommandHandler } from '@/commands/vote-skip-command-handler'
import { WrongSongCommandHandler } from '@/commands/wrong-song-command-handler'

export const commandHandlers = [
  new YoutubeSrHandler(),
  new SkipCommandHandler(),
  new CurrentSongCommandHandler(),
  new QueueCommandHandler(),
  new VolumeCommandHandler(),
  new WrongSongCommandHandler(),
  new GithubCommandHandler(),
  new PlayCommandHandler(),
  new PauseCommandHandler(),
  new VoteSkipCommandHandler(),
  new NextInfoCommandHandler(),
  new HelpCommandHandler(),
]
