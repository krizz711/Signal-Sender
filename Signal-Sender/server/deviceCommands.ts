export type DeviceAction = "none" | "buzz_on" | "buzz_off";

export interface DeviceCommand {
  action: DeviceAction;
  createdAt: number;
}

const store = new Map<string, DeviceCommand>();

export function setDeviceCommand(deviceId: string, cmd: DeviceCommand) {
  store.set(deviceId, cmd);
}

/**
 * Get the current command for a device. This returns the command and clears it
 * so commands are treated as one-shot (consumed by the device when it polls).
 */
export function consumeDeviceCommand(deviceId: string): DeviceCommand {
  const existing = store.get(deviceId);
  if (!existing) return { action: "none", createdAt: 0 };
  store.delete(deviceId);
  return existing;
}

export function peekDeviceCommand(deviceId: string): DeviceCommand {
  return store.get(deviceId) ?? { action: "none", createdAt: 0 };
}
