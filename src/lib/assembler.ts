import type { AssemblyInstruction } from "../components/assemble-view";
import { opcodeLookup } from "./opcodes-lookup";
import { formatHex } from "./utils";

const findOpcode = (parts: string[]): number | null => {
  console.log("Finding opcode for parts:", parts);
  for (const opcodeIndexString of Object.keys(opcodeLookup)) {
    const index = Number(opcodeIndexString);
    const opcode = opcodeLookup[index];
    if (
      opcode.length === parts.length &&
      opcode.every((opcodePart, partIndex) => {
        if (
          partIndex != 0 &&
          opcodePart !== "D" &&
          opcodePart.startsWith("D")
        ) {
          return parts[partIndex] === "DATA";
        } else {
          return opcodePart === parts[partIndex];
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

  const labels: Record<
    string,
    {
      key: number;
      line: number;
      address?: number;
    }
  > = {};
  lines.forEach((line, lineIndex) => {
    line = line.trim().split(/\s+/)[0].toUpperCase().trim();
    if (line.endsWith(":")) {
      const label = line.slice(0, -1).trim();
      if (labels[label] !== undefined) {
        throw new Error(`Duplicate label found: ${label}`);
      }
      labels[label] = {
        key: 300 + Math.round(Math.random() * 100000),
        line: lineIndex,
      };
    }
  });
  let nextLabel: string | undefined;

  lines.forEach((currentLine, lineIndex) => {
    let line = currentLine;

    const labelEntry = Object.entries(labels).find(
      ([, label]) => label.line === lineIndex
    );

    if (labelEntry) {
      nextLabel = labelEntry[0];
      labels[labelEntry[0]].address = instructions.length;
      line = line.replace(labelEntry[0] + ":", "").trim();
      if (line.length === 0) {
        return;
      }
    }

    const mnemonic = line.split(/\s+/)[0].toUpperCase();

    const parts = line
      .split(/\s+/)
      .slice(1)
      .join(" ")
      .split(",")
      .map((part) => part.trim().toUpperCase());

    let isMemoryAddress = false;
    let address: number | undefined;
    if (typeof labels[parts[0]]?.key === "number") {
      isMemoryAddress = true;
      address = labels[parts[0]].key;
    }

    const normalizedParts = isMemoryAddress
      ? ["DATA"]
      : parts
          .map((part) => {
            if (part.length === 0) {
              return undefined;
            }
            if (mnemonic === "RST") {
              return part;
            }

            if (part.length !== 1 || !isNaN(Number(part[0]))) {
              if (part.endsWith("H")) {
                return "DATA";
              } else if (part.endsWith("B")) {
                return "DATA";
              } else if (part.endsWith("O")) {
                return "DATA";
              } else if (!isNaN(Number(part))) {
                return "DATA";
              }
            }

            return part;
          })
          .filter((part) => part !== undefined);

    const opcode = findOpcode([mnemonic, ...normalizedParts]);

    if (opcode === null) {
      throw new Error(`Unknown mnemonic or invalid syntax: ${line}`);
    }

    let operandSize = 0;
    if (opcodeLookup[opcode].includes("D8")) {
      operandSize = 1;
    } else if (opcodeLookup[opcode].includes("D16")) {
      operandSize = 2;
    }

    instructions.push(opcode);
    assemblyInstructions.push({
      address: formatHex(instructions.length - 1, 2),
      label: nextLabel || "",
      mnemonic: `${mnemonic} ${parts.join(",")}`,
      hexCode: formatHex(opcode),
      bytes: 1 + operandSize,
      mCycles: 0,
      tStates: 0,
    });
    nextLabel = undefined;
    if (operandSize > 0) {
      if (isMemoryAddress && address !== undefined) {
        for (const addressByte of [address, address + 1]) {
          assemblyInstructions.push({
            address: formatHex(instructions.length, 2),
            label: "",
            mnemonic: "",
            bytes: 0,
            hexCode: addressByte.toString(),
            mCycles: 0,
            tStates: 0,
          });
          instructions.push(addressByte);
        }
      } else {
        const data = extractData(parts[parts.length - 1], operandSize);
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
  });

  instructions.forEach((byte, byteIndex) => {
    const labelEntry = Object.entries(labels).find(
      ([, label]) => label.key === byte
    );

    if (labelEntry) {
      const bytes = extractBytes(labelEntry[1].address || 0, 2);
      instructions[byteIndex] = bytes[0];
      instructions[byteIndex + 1] = bytes[1];
      assemblyInstructions[byteIndex].hexCode = formatHex(bytes[0]);
      assemblyInstructions[byteIndex + 1].hexCode = formatHex(bytes[1]);
    }
  });

  return {
    instructions,
    assemblyInstructions,
  };
};

const extractData = (rawData: string, byteCount: number): number[] => {
  const data: number[] = [];
  let value: number;
  const numberType = rawData.slice(-1).toLowerCase();
  const numberValue = rawData.slice(0, -1);

  if (numberType === "h") {
    value = parseInt(numberValue, 16);
  } else if (numberType === "o") {
    value = parseInt(numberValue, 8);
  } else if (numberType === "b") {
    value = parseInt(numberValue, 2);
  } else {
    value = parseInt(rawData, 10);
  }

  for (let byteIndex = 0; byteIndex < byteCount; byteIndex++) {
    data.unshift((value >> (byteIndex * 8)) & 0xff);
  }

  return data.reverse();
};

const extractBytes = (value: number, byteCount: number): number[] => {
  const bytes: number[] = [];
  for (let byteIndex = 0; byteIndex < byteCount; byteIndex++) {
    bytes.unshift((value >> (byteIndex * 8)) & 0xff);
  }
  return bytes.reverse();
};
