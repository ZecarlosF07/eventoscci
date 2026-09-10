import "server-only";

export function shouldSkipRemoteBuildData(): boolean {
  return process.env.SKIP_REMOTE_BUILD_DATA?.trim().toLowerCase() === "true";
}
