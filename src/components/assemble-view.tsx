import React, { useState } from "react";
import type { CPU8085 } from "../lib/8085";

export interface AssemblyInstruction {
  address: string;
  label: string;
  mnemonic: string;
  hexCode: string;
  bytes: number;
  mCycles: number;
  tStates: number;
}

const AssemblerView: React.FC<{
  instructions: AssemblyInstruction[];
  cpu: CPU8085;
  triggerRerender: () => void;
}> = ({ instructions, cpu, triggerRerender }) => {
  const [startAddress, setStartAddress] = useState("0000");

  const handleAddressChange = (value: string) => {
    const hexPattern = /^[0-9A-Fa-f]*$/;
    if (hexPattern.test(value) && value.length <= 4) {
      setStartAddress(value.toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      {/* Assembler Table */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800">Assembler</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-100 border-b border-gray-300">
              <tr>
                <th className="text-left p-2 font-medium text-gray-800 text-xs">
                  Address
                </th>
                <th className="text-left p-2 font-medium text-gray-800 text-xs">
                  Label
                </th>
                <th className="text-left p-2 font-medium text-gray-800 text-xs">
                  Mnemonics
                </th>
                <th className="text-left p-2 font-medium text-gray-800 text-xs">
                  Hexcode
                </th>
                <th className="text-left p-2 font-medium text-gray-800 text-xs">
                  Bytes
                </th>
                <th className="text-left p-2 font-medium text-gray-800 text-xs">
                  M-Cycles
                </th>
                <th className="text-left p-2 font-medium text-gray-800 text-xs">
                  T-States
                </th>
              </tr>
            </thead>
            <tbody>
              {instructions.map((instruction, index) => (
                <tr
                  key={instruction.address}
                  className={`border-b border-gray-200 ${
                    index === cpu.registers["PC"]
                      ? "bg-blue-50"
                      : "bg-green-50 hover:bg-green-100"
                  } transition-colors`}
                >
                  <td className="p-2 text-xs font-mono">
                    {instruction.address}
                  </td>
                  <td className="p-2 text-xs">
                    <span className="font-mono">{instruction.label}</span>
                  </td>
                  <td className="p-2 text-xs font-mono">
                    {instruction.mnemonic}
                  </td>
                  <td className="p-2 text-xs font-mono">
                    {instruction.hexCode}
                  </td>
                  <td className="p-2 text-xs">{instruction.bytes}</td>
                  <td className="p-2 text-xs">{instruction.mCycles}</td>
                  <td className="p-2 text-xs">{instruction.tStates}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800">Simulate</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Start From Address */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Start From →
            </label>
            <input
              type="text"
              value={startAddress}
              onChange={(e) =>
                handleAddressChange((e.target as HTMLInputElement).value)
              }
              className="w-20 px-3 py-2 text-sm border border-gray-300 rounded font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0000"
              maxLength={4}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              className="px-6 py-3 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              onClick={() => {
                cpu.runProgram();
                triggerRerender();
              }}
            >
              Run All
            </button>

            <button
              className="px-6 py-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              onClick={() => {
                cpu.runSingleStep();
                triggerRerender();
              }}
            >
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssemblerView;
