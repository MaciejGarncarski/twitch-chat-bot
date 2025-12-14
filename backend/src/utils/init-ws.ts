let bunServer: Bun.Server<unknown> | null = null;

export function setBunServer(server: Bun.Server<unknown> | null) {
  bunServer = server;
}

export function getBunServer(): Bun.Server<unknown> | null {
  return bunServer;
}
