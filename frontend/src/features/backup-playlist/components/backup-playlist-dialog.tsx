import { useState } from "react"
import { Loader, Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  useBackupStatus,
  useClearBackupPlaylist,
  useRefillBackupPlaylist,
  useReshuffleBackupPlaylist,
  useSetBackupPlaylist,
} from "@/features/backup-playlist/hooks/use-backup-playlist"
import { useTranslate } from "@/features/i18n/hooks/use-translate"

export function BackupPlaylistDialog() {
  const { t } = useTranslate()
  const { data: status, isLoading } = useBackupStatus()
  const setMutation = useSetBackupPlaylist()
  const clearMutation = useClearBackupPlaylist()
  const refillMutation = useRefillBackupPlaylist()
  const reshuffleMutation = useReshuffleBackupPlaylist()

  const [url, setUrl] = useState("")
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    const finalUrl = url.trim() || status?.playlistUrl || ""
    if (!finalUrl) return
    setMutation.mutate(finalUrl)
  }

  const handleClear = () => {
    clearMutation.mutate(undefined)
  }

  const handleRefill = () => {
    refillMutation.mutate()
  }

  const isPending =
    setMutation.isPending ||
    clearMutation.isPending ||
    refillMutation.isPending ||
    reshuffleMutation.isPending
  const statusNotEmpty = status && status.playlistUrl

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="default" />}>
        <span>{t("player.backup.title")}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("player.backup.title")}</DialogTitle>
          <DialogDescription>
            {statusNotEmpty
              ? t("player.backup.songsRemaining", {
                  remaining: status.remaining,
                  total: status.videoIds.length,
                })
              : t("player.backup.notSet")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="animation-duration-[2s] animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={url || status?.playlistUrl || ""}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("player.backup.urlPlaceholder")}
              className="focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border bg-clip-padding px-3 py-2 text-sm outline-none"
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          {statusNotEmpty && (
            <Button variant="outline" onClick={handleRefill} disabled={isPending}>
              {refillMutation.isPending ? (
                <Loader className="animation-duration-[2s] animate-spin" />
              ) : null}
              {t("player.backup.refill")}
            </Button>
          )}
          {statusNotEmpty && (
            <Button
              variant="outline"
              onClick={() => reshuffleMutation.mutate()}
              disabled={isPending}
            >
              {reshuffleMutation.isPending ? (
                <Loader className="animation-duration-[2s] animate-spin" />
              ) : (
                <Shuffle />
              )}
              {t("player.backup.reshuffle")}
            </Button>
          )}
          {statusNotEmpty && (
            <Button variant="destructive" onClick={handleClear} disabled={isPending}>
              {clearMutation.isPending ? (
                <Loader className="animation-duration-[2s] animate-spin" />
              ) : null}
              {t("player.backup.clear")}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isPending || (!url.trim() && !status?.playlistUrl)}
          >
            {setMutation.isPending ? (
              <Loader className="animation-duration-[2s] animate-spin" />
            ) : null}
            {t("player.backup.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
