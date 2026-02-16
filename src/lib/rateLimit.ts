const buckets = new Map<string, { count: number; ts: number }>();

export function rateLimit(ip: string, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { count: 0, ts: now };
  if (now - b.ts > windowMs) { 
    b.count = 0; 
    b.ts = now; 
  }
  b.count++;
  buckets.set(ip, b);
  return b.count <= max;
}
