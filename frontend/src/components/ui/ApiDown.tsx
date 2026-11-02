import { ServerCrash } from "lucide-react";

export default function ApiDown({ message }: { message?: string | null }) {
  return (
    <div className="wrap py-10">
      <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
        <ServerCrash className="h-10 w-10 text-red-500" />
        <h2 className="mt-3 text-lg font-bold text-red-800">Serwer bilen baglanyşyk ýok</h2>
        <p className="mt-1 max-w-md text-sm text-red-700">{message || "Backend API işlemeýär. Go serwerini işlediň we sahypany täzeläň."}</p>
        <code className="mt-4 rounded-lg bg-white px-3 py-1.5 text-xs text-red-800">cd backend &amp;&amp; go run ./cmd/server</code>
      </div>
    </div>
  );
}
