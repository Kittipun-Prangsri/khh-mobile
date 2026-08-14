/**
 * Silent Background Agent Daemon Runner
 * Manages periodic automatic execution of Silent Push Agent (e.g. every 15-30 minutes)
 * Ensures minimal CPU footprint and zero-lock execution
 */

import { runSilentDeltaPush } from './silentPushAgent';

let daemonTimer: NodeJS.Timeout | null = null;
let isDaemonRunning = false;
let syncIntervalMs = 15 * 60 * 1000; // Default 15 minutes

/**
 * Start Silent Push Agent Background Daemon
 */
export function startSilentPushDaemon(intervalMinutes = 15) {
  if (isDaemonRunning) {
    return { isRunning: true, intervalMinutes, message: 'Silent Push Daemon is already running.' };
  }

  syncIntervalMs = intervalMinutes * 60 * 1000;
  isDaemonRunning = true;

  // Run initial push silently
  runSilentDeltaPush().catch((err) => {
    console.warn('⚠️ Initial Silent Delta Push notice:', err.message);
  });

  // Schedule periodic push
  daemonTimer = setInterval(() => {
    runSilentDeltaPush().catch((err) => {
      console.warn('⚠️ Periodic Silent Delta Push notice:', err.message);
    });
  }, syncIntervalMs);

  return {
    isRunning: true,
    intervalMinutes,
    message: `⚡ Silent Push Daemon เริ่มทำงานสำเร็จ! รันอัตโนมัติทุกๆ ${intervalMinutes} นาที`,
  };
}

/**
 * Stop Silent Push Agent Background Daemon
 */
export function stopSilentPushDaemon() {
  if (daemonTimer) {
    clearInterval(daemonTimer);
    daemonTimer = null;
  }
  isDaemonRunning = false;
  return { isRunning: false, message: 'Silent Push Daemon stopped.' };
}

/**
 * Get Daemon Status
 */
export function getSilentPushDaemonStatus() {
  return {
    isRunning: isDaemonRunning,
    intervalMinutes: Math.round(syncIntervalMs / 60000),
  };
}
