import { useState } from "react";
import { Bluetooth, BluetoothConnected } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBluetoothPrinter } from "@/hooks/use-bluetooth-printer";
import { useSettings } from "@/hooks/use-settings";
import { buildTestPrintEscPos } from "@/lib/escpos";
import { cn } from "@/lib/utils";

export function BluetoothPrinterSection() {
  const { isSupported, status, deviceName, error, isPrinting, connect, disconnect, print } =
    useBluetoothPrinter();
  const { data: settings } = useSettings();
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleTestPrint() {
    try {
      await print(buildTestPrintEscPos(settings?.receipt_paper_size ?? "80mm"));
      toast.success("Test print terkirim ke printer");
    } catch {
      toast.error("Gagal mengirim test print");
    }
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">Printer Bluetooth Thermal</h4>
          <p className="text-xs text-muted-foreground">
            Hubungkan printer thermal Bluetooth untuk mencetak struk langsung dari kasir.
          </p>
        </div>
        <Badge
          className={cn(
            "rounded-md",
            status === "connected"
              ? "bg-success/10 text-success hover:bg-success/10"
              : status === "connecting"
                ? "bg-warning/10 text-warning hover:bg-warning/10"
                : "bg-muted text-muted-foreground hover:bg-muted",
          )}
        >
          {status === "connected"
            ? "Terhubung"
            : status === "connecting"
              ? "Menghubungkan…"
              : "Tidak Terhubung"}
        </Badge>
      </div>

      {!isSupported ? (
        <p className="text-xs text-warning">
          Browser ini tidak mendukung Web Bluetooth. Gunakan Google Chrome atau Microsoft Edge di
          desktop atau Android untuk fitur ini.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            {status === "connected" ? (
              <BluetoothConnected className="size-4 text-success" />
            ) : (
              <Bluetooth className="size-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">
              {status === "connected"
                ? deviceName
                : deviceName
                  ? `Terakhir terhubung: ${deviceName}`
                  : "Belum ada printer terhubung"}
            </span>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            {status === "connected" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={isPrinting}
                  onClick={handleTestPrint}
                >
                  {isPrinting ? "Mencetak…" : "Test Print"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl text-danger hover:text-danger"
                  onClick={disconnect}
                >
                  Putuskan
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="rounded-xl shadow-brand"
                disabled={isConnecting || status === "connecting"}
                onClick={handleConnect}
              >
                {isConnecting || status === "connecting" ? "Menghubungkan…" : "Hubungkan Printer"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
