import { type FC } from "preact/compat";
import { useState } from "preact/hooks";
import type { CPU8085 } from "../lib/8085";
import { formatHex } from "../lib/utils";

const DevicesView: FC<{
  cpu: CPU8085;
  triggerRerender: () => void;
}> = ({ cpu, triggerRerender }) => {
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [inputAddress, setInputAddress] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleCellClick = (address: number) => {
    setInputAddress(formatHex(address));
    setInputValue(formatHex(cpu.ioPorts[address]));
    setSelectedAddress(address);
  };

  const addPortEntry = () => {
    const addr = parseInt(inputAddress, 16);
    const val = parseInt(inputValue, 16);
    if (
      !isNaN(addr) &&
      !isNaN(val) &&
      addr >= 0 &&
      addr <= 255 &&
      val >= 0 &&
      val <= 255
    ) {
      cpu.ioPorts[addr] = val;
      setInputAddress("");
      setInputValue("");
      triggerRerender();
    } else {
      alert("Invalid address (0-FF) or value (0-FF)");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header row with column numbers */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 border-b border-gray-200 grid grid-cols-17 text-xs">
          <div className="text-center font-medium text-gray-600"></div>
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className="text-center font-medium text-gray-600 font-mono border-l border-gray-200"
            >
              {i.toString(16).toUpperCase()}
            </div>
          ))}
        </div>

        {/* Memory grid */}
        {Array.from({ length: 16 }, (_, row) => (
          <div
            key={row}
            className="grid grid-cols-17 text-xs border-b border-gray-200 last:border-b-0"
          >
            {/* Row address */}
            <div className="bg-gray-100 text-center font-medium text-gray-800 font-mono border-r border-gray-200">
              {(row * 16).toString(16).toUpperCase().padStart(2, "0")}
            </div>

            {/* Port values */}
            {Array.from({ length: 16 }, (_, col) => {
              const address = row * 16 + col;
              const value = cpu.ioPorts[address];
              const isSelected = selectedAddress === address;
              const hasValue = value !== 0;

              return (
                <div
                  key={col}
                  className={`text-center font-mono cursor-pointer border-r border-gray-200 last:border-r-0 transition-colors ${
                    isSelected
                      ? "bg-blue-200 text-blue-900"
                      : hasValue
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleCellClick(address)}
                  title={`Port ${formatHex(address)}: ${formatHex(value)}`}
                >
                  {formatHex(value)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected address info */}
      {selectedAddress !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm">
            <strong>Selected Port:</strong> {formatHex(selectedAddress)}
            <span className="ml-4">
              <strong>Value:</strong> {formatHex(cpu.ioPorts[selectedAddress])}{" "}
              ({cpu.ioPorts[selectedAddress]})
            </span>
            <button
              className="ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                cpu.ioPorts[selectedAddress] = 0;
                triggerRerender();
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Add new port entry */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Port Address (HEX)
            </label>
            <input
              type="text"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="00"
              value={inputAddress}
              onChange={(e) =>
                setInputAddress((e.target as HTMLInputElement).value)
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Value (HEX)
            </label>
            <input
              type="text"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="00"
              value={inputValue}
              onChange={(e) =>
                setInputValue((e.target as HTMLInputElement).value)
              }
            />
          </div>
          <button
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 h-max mt-auto border"
            onClick={addPortEntry}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevicesView;
