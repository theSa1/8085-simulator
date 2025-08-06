import React from "react";
import type { CPU8085 } from "../lib/8085";
import { formatHex, numberToBits } from "../lib/utils";

interface Register {
  name: string;
  value: string;
  bits: string[];
}

const RegistersTable: React.FC<{
  cpu: CPU8085;
}> = ({ cpu }) => {
  const registers: Register[] = [
    {
      name: "Accumulator",
      value: formatHex(cpu.registers["A"]),
      bits: numberToBits(cpu.registers["A"]),
    },
    {
      name: "Register B",
      value: formatHex(cpu.registers["B"]),
      bits: numberToBits(cpu.registers["B"]),
    },
    {
      name: "Register C",
      value: formatHex(cpu.registers["C"]),
      bits: numberToBits(cpu.registers["C"]),
    },
    {
      name: "Register D",
      value: formatHex(cpu.registers["D"]),
      bits: numberToBits(cpu.registers["D"]),
    },
    {
      name: "Register E",
      value: formatHex(cpu.registers["E"]),
      bits: numberToBits(cpu.registers["E"]),
    },
    {
      name: "Register H",
      value: formatHex(cpu.registers["H"]),
      bits: numberToBits(cpu.registers["H"]),
    },
    {
      name: "Register L",
      value: formatHex(cpu.registers["L"]),
      bits: numberToBits(cpu.registers["L"]),
    },
    {
      name: "Memory(M)",
      value: formatHex(
        cpu.getAddressValue(
          cpu.addBytes(cpu.registers["H"], cpu.registers["L"])
        )
      ),
      bits: numberToBits(
        cpu.getAddressValue(
          cpu.addBytes(cpu.registers["H"], cpu.registers["L"])
        )
      ),
    },
  ];

  const flagBits = numberToBits(cpu.registers["FLAG"]);

  const flagRegister = {
    name: "Flag Register",
    value: formatHex(cpu.registers["FLAG"]),
    flags: [
      { name: "S", value: flagBits[0] },
      { name: "Z", value: flagBits[1] },
      { name: "*", value: flagBits[2] },
      { name: "AC", value: flagBits[3] },
      { name: "*", value: flagBits[4] },
      { name: "P", value: flagBits[5] },
      { name: "*", value: flagBits[6] },
      { name: "CY", value: flagBits[7] },
    ],
  };

  return (
    <div className="space-y-4">
      {/* Main Registers */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="text-left p-2 font-medium">Register</th>
              <th className="text-center p-2 font-medium">Value</th>
              <th className="text-center p-2 font-medium">7</th>
              <th className="text-center p-2 font-medium">6</th>
              <th className="text-center p-2 font-medium">5</th>
              <th className="text-center p-2 font-medium">4</th>
              <th className="text-center p-2 font-medium">3</th>
              <th className="text-center p-2 font-medium">2</th>
              <th className="text-center p-2 font-medium">1</th>
              <th className="text-center p-2 font-medium">0</th>
            </tr>
          </thead>
          <tbody>
            {registers.map((register, index) => (
              <tr
                key={register.name}
                className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}
              >
                <td className="p-2 font-medium text-gray-800">
                  {register.name}
                </td>
                <td className="p-2 text-center font-mono">{register.value}</td>
                {register.bits.map((bit, bitIndex) => (
                  <td key={bitIndex} className="p-2 text-center font-mono">
                    {bit}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flag Register */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="text-left p-2 font-medium">Register</th>
              <th className="text-center p-2 font-medium">Value</th>
              {flagRegister.flags.map((flag, index) => (
                <th key={index} className="text-center p-2 font-medium">
                  {flag.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-pink-100">
              <td className="p-2 font-medium text-gray-800">
                {flagRegister.name}
              </td>
              <td className="p-2 text-center font-mono">
                {flagRegister.value}
              </td>
              {flagRegister.flags.map((flag, index) => (
                <td key={index} className="p-2 text-center font-mono">
                  {flag.value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistersTable;
