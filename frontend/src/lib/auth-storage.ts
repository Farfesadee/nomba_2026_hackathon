const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export function checkIdleTimeout(): boolean {
  const lastActivity = localStorage.getItem("last_activity");
  if (!lastActivity) return false;
  const elapsed = Date.now() - parseInt(lastActivity, 10);
  return elapsed > IDLE_TIMEOUT_MS;
}

export function touchActivity() {
  localStorage.setItem("last_activity", String(Date.now()));
}
