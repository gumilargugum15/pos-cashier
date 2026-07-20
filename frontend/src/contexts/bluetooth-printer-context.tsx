import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// GATT service UUID used by most common cheap ESC/POS Bluetooth thermal printer
// clones (Xprinter/Goojprt/generic). No universal standard exists across brands —
// untested hardware may need this list extended once tried against real devices.
const KNOWN_PRINTER_SERVICE_UUIDS = ["000018f0-0000-1000-8000-00805f9b34fb"];

const LAST_DEVICE_NAME_KEY = "nova_pos_last_bt_printer_name";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

type BluetoothPrinterContextValue = {
  isSupported: boolean;
  status: ConnectionStatus;
  deviceName: string | null;
  error: string | null;
  isPrinting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  print: (bytes: Uint8Array) => Promise<void>;
};

export const BluetoothPrinterContext = createContext<BluetoothPrinterContextValue | null>(null);

export function BluetoothPrinterProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && !!navigator.bluetooth);
    setDeviceName(localStorage.getItem(LAST_DEVICE_NAME_KEY));
  }, []);

  const handleDisconnected = useCallback(() => {
    characteristicRef.current = null;
    setStatus("disconnected");
  }, []);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError(
        "Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome atau Edge di desktop/Android.",
      );
      return;
    }

    setError(null);
    setStatus("connecting");

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: KNOWN_PRINTER_SERVICE_UUIDS,
      });

      device.addEventListener("gattserverdisconnected", handleDisconnected);

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("Gagal terhubung ke GATT server perangkat.");
      }

      let writable: BluetoothRemoteGATTCharacteristic | null = null;

      for (const serviceUuid of KNOWN_PRINTER_SERVICE_UUIDS) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          writable =
            characteristics.find((c) => c.properties.write || c.properties.writeWithoutResponse) ??
            null;
          if (writable) break;
        } catch {
          // This device doesn't expose the service — try the next known UUID.
        }
      }

      if (!writable) {
        throw new Error(
          "Tidak ditemukan layanan printer yang cocok pada perangkat ini. Printer mungkin menggunakan protokol Bluetooth yang berbeda dan belum didukung.",
        );
      }

      deviceRef.current = device;
      characteristicRef.current = writable;
      const name = device.name ?? "Printer Bluetooth";
      setDeviceName(name);
      localStorage.setItem(LAST_DEVICE_NAME_KEY, name);
      setStatus("connected");
    } catch (err) {
      setStatus("disconnected");
      const message = err instanceof Error ? err.message : "Gagal terhubung ke printer.";
      if (!message.toLowerCase().includes("user cancelled")) {
        setError(message);
      }
    }
  }, [handleDisconnected]);

  const disconnect = useCallback(() => {
    deviceRef.current?.gatt?.disconnect();
    deviceRef.current = null;
    characteristicRef.current = null;
    setStatus("disconnected");
  }, []);

  const print = useCallback(async (bytes: Uint8Array) => {
    const characteristic = characteristicRef.current;
    if (!characteristic) {
      throw new Error("Printer Bluetooth tidak terhubung.");
    }

    setIsPrinting(true);
    setError(null);

    try {
      const chunkSize = 100;
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const chunk = bytes.slice(offset, offset + chunkSize);
        if (characteristic.properties.writeWithoutResponse) {
          await characteristic.writeValueWithoutResponse(chunk);
        } else {
          await characteristic.writeValue(chunk);
        }
        // Small delay between chunks — cheap BLE printer buffers are tiny.
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengirim data ke printer.";
      setError(message);
      throw err;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return (
    <BluetoothPrinterContext.Provider
      value={{ isSupported, status, deviceName, error, isPrinting, connect, disconnect, print }}
    >
      {children}
    </BluetoothPrinterContext.Provider>
  );
}
