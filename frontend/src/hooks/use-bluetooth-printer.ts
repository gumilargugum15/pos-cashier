import { useContext } from "react";
import { BluetoothPrinterContext } from "@/contexts/bluetooth-printer-context";

export function useBluetoothPrinter() {
  const context = useContext(BluetoothPrinterContext);

  if (!context) {
    throw new Error("useBluetoothPrinter must be used within a BluetoothPrinterProvider");
  }

  return context;
}
