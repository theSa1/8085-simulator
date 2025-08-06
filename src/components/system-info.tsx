import React from "react";
import type { CPU8085 } from "../lib/8085";
import { formatHex } from "../lib/utils";

const SystemInfo: React.FC<{
  cpu: CPU8085;
}> = ({ cpu }) => {
  const systemValues = [
    { name: "Stack Pointer(SP)", value: formatHex(cpu.registers["SP"], 2) },
    {
      name: "Memory Pointer (HL)",
      value: formatHex(cpu.addBytes(cpu.registers["H"], cpu.registers["L"]), 2),
    },
    { name: "Program Status Word(PSW)", value: "" },
    { name: "Program Counter(PC)", value: formatHex(cpu.registers["PC"], 2) },
    { name: "Clock Cycle Counter", value: "" },
    { name: "Instruction Counter", value: "" },
  ];

  const interruptValues = [
    { name: "SOD", value: "0" },
    { name: "SID", value: "0" },
    { name: "INTR", value: "0" },
    { name: "TRAP", value: "0" },
    { name: "R7.5", value: "0" },
    { name: "R6.5", value: "0" },
    { name: "R5.5", value: "0" },
  ];

  const simInstruction = [
    { name: "SOD", value: "0" },
    { name: "SDE", value: "0" },
    { name: "*", value: "0" },
    { name: "R7.5", value: "0" },
    { name: "MSE", value: "0" },
    { name: "M7.5", value: "0" },
    { name: "M6.5", value: "0" },
    { name: "M5.5", value: "0" },
  ];

  const rimInstruction = [
    { name: "SID", value: "0" },
    { name: "I7.5", value: "0" },
    { name: "I6.5", value: "0" },
    { name: "I5.5", value: "0" },
    { name: "IE", value: "0" },
    { name: "M7.5", value: "0" },
    { name: "M6.5", value: "0" },
    { name: "M5.5", value: "0" },
  ];

  return (
    <div className="space-y-4">
      {/* System Values */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-800">System Status</h3>
        </div>
        <div className="p-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-2 font-medium">Type</th>
                <th className="text-right pb-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {systemValues.map((item, index) => (
                <tr key={item.name}>
                  <td className="py-1 text-gray-800">{item.name}</td>
                  <td className="py-1 text-right font-mono">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interrupt Status */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-1 p-2">
          {interruptValues.map((item) => (
            <div key={item.name} className="text-center">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {item.name}
              </div>
              <div className="bg-cyan-200 rounded px-2 py-1 text-xs font-mono">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIM Instruction */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-blue-600">
            For SIM instruction
          </h4>
        </div>
        <div className="grid grid-cols-8 gap-1 p-2">
          {simInstruction.map((item, index) => (
            <div key={`sim-${index}`} className="text-center">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {item.name}
              </div>
              <div className="bg-gray-200 rounded px-1 py-1 text-xs font-mono">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIM Instruction */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-blue-600">
            For RIM instruction
          </h4>
        </div>
        <div className="grid grid-cols-8 gap-1 p-2">
          {rimInstruction.map((item, index) => (
            <div key={`rim-${index}`} className="text-center">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {item.name}
              </div>
              <div className="bg-gray-200 rounded px-1 py-1 text-xs font-mono">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
