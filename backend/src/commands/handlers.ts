import { ClearAllCommandHandler } from '@/commands/clear-all-command-handler'
import { CurrentSongCommandHandler } from '@/commands/current-song-command-handler'
import { FillCommandHandler } from '@/commands/fill-command-handler'
import { GithubCommandHandler } from '@/commands/github-commang-handler'
import { HelpCommandHandler } from '@/commands/help-command-handler'
import { NextInfoCommandHandler } from '@/commands/next-info-command-handler'
import { PauseCommandHandler } from '@/commands/pause-command-handler'
import { PlayCommandHandler } from '@/commands/play-command-handler'
import { PlaylistCommandHandler } from '@/commands/playlist-command-handler'
import { QueueCommandHandler } from '@/commands/queue-command-handler'
import { RemoveCommandHandler } from '@/commands/remove-command-handler'
import { SeekCommandHandler } from '@/commands/seek-command-handler'
import { ShuffleCommandHandler } from '@/commands/shuffle-command-handler'
import { SkipCommandHandler } from '@/commands/skip-command-handler'
import { YoutubeSrHandler } from '@/commands/sr-command-handler'
import { VolumeCommandHandler } from '@/commands/volume-command-handler'
import { VoteSkipCommandHandler } from '@/commands/vote-skip-command-handler'
import { WrongSongAllCommandHandler } from '@/commands/wrong-song-all-command-handler'
import { WrongSongCommandHandler } from '@/commands/wrong-song-command-handler'

export const commandHandlers = [
  new YoutubeSrHandler(),
  new SkipCommandHandler(),
  new CurrentSongCommandHandler(),
  new QueueCommandHandler(),
  new VolumeCommandHandler(),
  new WrongSongCommandHandler(),
  new WrongSongAllCommandHandler(),
  new GithubCommandHandler(),
  new PlayCommandHandler(),
  new PauseCommandHandler(),
  new SeekCommandHandler(),
  new ShuffleCommandHandler(),
  new RemoveCommandHandler(),
  new VoteSkipCommandHandler(),
  new NextInfoCommandHandler(),
  new PlaylistCommandHandler(),
  new FillCommandHandler(),
  new ClearAllCommandHandler(),
  new HelpCommandHandler(),
]
