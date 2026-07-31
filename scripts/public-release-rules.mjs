const absoluteUserPathPatterns = [
  /(?:^|[^A-Za-z0-9_])[A-Za-z]:[\\/]+Users[\\/]+[^\\/\r\n"'`<>]+(?:[\\/]|$)/iu,
  /(?:^|[\s"'`(=])\/(?:Users|home)\/[^/\s"'`<>]+(?:\/|$)/u,
];

const sensitiveFileNamePatterns = [
  /^\.env(?:\..+)?$/iu,
  /\.(?:key|p12|pem|pfx)$/iu,
  /^(?:id_dsa|id_ecdsa|id_ed25519|id_rsa)$/iu,
];

const allowedEnvironmentTemplates = new Set([
  ".env.example",
  ".env.sample",
  ".env.template",
]);

export function containsAbsoluteUserPath(text) {
  return absoluteUserPathPatterns.some((pattern) => pattern.test(text));
}

export function isSensitiveFilePath(filePath) {
  const fileName = filePath.split(/[\\/]/u).at(-1)?.toLowerCase() ?? "";
  if (allowedEnvironmentTemplates.has(fileName)) return false;
  return sensitiveFileNamePatterns.some((pattern) => pattern.test(fileName));
}
