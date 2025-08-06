import type { AssemblyInstruction } from "../components/assemble-view";
import { opcodeLookup } from "./opcodes-lookup";
import { formatHex } from "./utils";

const findOpcode = (parts: string[]): number | null => {
  for (const indexStr of Object.keys(opcodeLookup)) {
    const index = Number(indexStr);
    const opcode = opcodeLookup[index];
    if (
      opcode.length === parts.length &&
      opcode.every((part, i) => {
        if (part !== "D" && part.startsWith("D")) {
          return parts[i] === "DATA";
        } else {
          return part === parts[i];
        }
      })
    ) {
      return index;
    }
  }
  return null;
};

export const assembler = (
  code: string
): {
  instructions: number[];
  assemblyInstructions: AssemblyInstruction[];
} => {
  const lines = code
    .split("\n")
    .map((line) => line.trim().split(";")[0].trim())
    .filter((line) => line.length > 0);

  const instructions: number[] = [];
  const assemblyInstructions: AssemblyInstruction[] = [];

  for (const line of lines) {
    const mnemonic = line.split(/\s+/)[0].toUpperCase();
    const parts = line
      .split(/\s+/)
      .slice(1)
      .join(" ")
      .split(",")
      .map((part) => part.trim().toUpperCase());

    const normalizedParts = parts
      .map((part) => {
        if (part.length === 0) {
          return undefined;
        }
        if (mnemonic === "RST") {
          return part;
        }
        if (part.length === 1) {
          return part;
        }

        if (part.endsWith("H")) {
          return "DATA";
        } else if (part.endsWith("B")) {
          return "DATA";
        } else if (part.endsWith("O")) {
          return "DATA";
        } else if (!isNaN(Number(part))) {
          return "DATA";
        }
      })
      .filter((part) => part !== undefined);

    const opcode = findOpcode([mnemonic, ...normalizedParts]);

    console.log(mnemonic, normalizedParts, opcode);

    if (opcode === null) {
      throw new Error(`Unknown mnemonic or invalid syntax: ${line}`);
    }

    let oprandSize = 0;
    if (opcodeLookup[opcode].includes("D8")) {
      oprandSize = 1;
    } else if (opcodeLookup[opcode].includes("D16")) {
      oprandSize = 2;
    }

    instructions.push(opcode);
    assemblyInstructions.push({
      address: formatHex(instructions.length - 1, 2),
      label: "",
      mnemonic: `${mnemonic} ${parts.join(",")}`,
      hexCode: formatHex(opcode),
      bytes: 1 + oprandSize,
      mCycles: 0,
      tStates: 0,
    });
    if (oprandSize > 0) {
      const data = extractData(parts[parts.length - 1], oprandSize);
      for (const byte of data) {
        assemblyInstructions.push({
          address: formatHex(instructions.length, 2),
          label: "",
          mnemonic: "",
          bytes: 0,
          hexCode: formatHex(byte),
          mCycles: 0,
          tStates: 0,
        });
        instructions.push(byte);
      }
    }
  }

  return {
    instructions,
    assemblyInstructions,
  };
};

export const extractData = (rawData: string, bytes: number): number[] => {
  const data: number[] = [];
  let value: number;
  const type = rawData.slice(-1).toLowerCase();
  const rawValue = rawData.slice(0, -1);

  if (type === "h") {
    value = parseInt(rawValue, 16);
  } else if (type === "o") {
    value = parseInt(rawValue, 8);
  } else if (type === "b") {
    value = parseInt(rawValue, 2);
  } else {
    value = parseInt(rawData, 10);
  }

  for (let i = 0; i < bytes; i++) {
    data.unshift((value >> (i * 8)) & 0xff);
  }

  return data.reverse();
};
