import { useState } from "react";
import type { CPU8085 } from "../lib/8085";
import { formatHex } from "../lib/utils";

const MemoryView: React.FC<{
  cpu: CPU8085;
  triggerRerender: () => void;
}> = ({ cpu, triggerRerender }) => {
  const [address, setAddress] = useState("");
  const [value, setValue] = useState("");

  const addMemoryEntry = () => {
    const addr = parseInt(address, 16);
    const val = parseInt(value, 16);
    if (!isNaN(addr) && !isNaN(val)) {
      cpu.memory[addr] = val;
      setAddress("");
      setValue("");
      triggerRerender();
    } else {
      alert("Invalid address or value");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="text-left p-2 font-medium">Location</th>
              <th className="text-center p-2 font-medium">Value</th>
              <th className="text-center p-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(cpu.memory)
              .map((byte, index) => ({ byte, index }))
              .filter(({ byte }) => byte !== 0)
              .map(({ byte, index }, displayIndex) => (
                <tr
                  key={index}
                  className={displayIndex % 2 === 0 ? "bg-blue-50" : "bg-white"}
                >
                  <td className="p-2 font-mono font-medium text-gray-800">
                    {formatHex(index, 2)}
                  </td>
                  <td className="p-2 text-center font-mono">
                    {formatHex(byte)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => {
                        cpu.memory[index] = 0;
                        triggerRerender();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* option to add new memory entry */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Address (HEX)
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                placeholder="0"
                value={address}
                onChange={(e) =>
                  setAddress((e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Value (Hex)
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                placeholder="0"
                value={value}
                onChange={(e) => setValue((e.target as HTMLInputElement).value)}
              />
            </div>
            <button
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 h-max mt-auto border"
              onClick={addMemoryEntry}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryView;
