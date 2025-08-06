import { opcodeLookup } from "./opcodes-lookup";

export class CPU8085 {
  constructor(cpu?: CPU8085) {
    if (cpu) {
      this.registers = cpu.registers;
      this.memory = new Uint8Array(cpu.memory);
      this.isHalted = cpu.isHalted;
    }
  }

  registers: { [key: string]: number } = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    H: 0,
    L: 0,
    SP: 0,
    PC: 0,
    FLAG: 0,
  };
  memory: Uint8Array = new Uint8Array(2 ** 16);
  isHalted: boolean = true;

  reset() {
    this.registers = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      H: 0,
      L: 0,
      SP: 0x0000,
      PC: 0,
      FLAG: 0,
    };
    this.memory.fill(0);
    this.isHalted = true;
  }

  loadProgram(program: number[]) {
    this.memory.set(program, 0);
  }

  setMemory(address: number, value: number) {
    if (address < 0 || address >= 65536) {
      throw new Error("Memory address out of bounds");
    }
    this.memory[address] = this.fb(value);
  }

  runProgram() {
    this.isHalted = false;
    this.registers.PC = 0;
    while (this.registers.PC < this.memory.length) {
      if (this.isHalted) {
        break;
      }
      const opcode = this.memory[this.registers.PC];
      this.executeOpcode(opcode);
      this.registers.PC++;
    }
  }

  runSingleStep() {
    const opcode = this.memory[this.registers.PC];
    this.executeOpcode(opcode);
    this.registers.PC++;
    console.log(
      `Executed opcode: ${opcode.toString(
        16
      )} at PC: ${this.registers.PC.toString(16)}`
    );
  }

  executeOpcode(opcode: number) {
    const mnemonic = opcodeLookup[opcode];
    if (!mnemonic) {
      throw new Error(`Unknown opcode: ${opcode.toString(16)}`);
    }

    let value: number;
    switch (mnemonic[0]) {
      case "NOP":
        // No operation
        break;

      case "MOV":
        const dest = mnemonic[1];
        const src = mnemonic[2];
        if (src === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(src);
        }
        if (dest === "M") {
          this.setMemory(this.getMemoryPointer(), value);
        } else {
          this.setRegisterValue(dest, value);
        }
        break;

      case "MVI":
        const reg = mnemonic[1];
        const immediateValue = this.memory[this.registers.PC + 1];
        if (reg === "M") {
          this.setMemory(this.getMemoryPointer(), immediateValue);
        } else {
          this.setRegisterValue(reg, immediateValue);
        }
        this.registers.PC++;
        break;

      case "LDA":
        const address = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.registers.A = this.getAddressValue(address);
        this.registers.PC += 2;
        break;
      case "LDAX":
        // TODO: Implement LDAX
        break;

      case "LXI":
        const regPair = mnemonic[1];
        const lowByte = this.memory[this.registers.PC + 1];
        const highByte = this.memory[this.registers.PC + 2];
        if (regPair === "B") {
          this.registers.B = highByte;
          this.registers.C = lowByte;
        } else if (regPair === "D") {
          this.registers.D = highByte;
          this.registers.E = lowByte;
        } else if (regPair === "H") {
          this.registers.H = highByte;
          this.registers.L = lowByte;
        } else if (regPair === "SP") {
          this.registers.SP = this.concat2Bytes(highByte, lowByte);
        }
        this.registers.PC += 2;
        break;

      case "LHLD":
        const addr = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.registers.L = this.getAddressValue(addr);
        this.registers.H = this.getAddressValue(addr + 1);
        this.registers.PC += 2;
        break;

      case "STA":
        const staAddress = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.setAddressValue(staAddress, this.registers.A);
        this.registers.PC += 2;
        break;

      case "STAX":
        // TODO: Implement STAX
        break;

      case "SHLD":
        const shldAddress = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.setAddressValue(shldAddress, this.registers.L);
        this.setAddressValue(shldAddress + 1, this.registers.H);
        this.registers.PC += 2;
        break;

      case "XCHG":
        // Exchange H and L with D and E
        const tempH = this.registers.H;
        const tempL = this.registers.L;
        this.registers.H = this.registers.D;
        this.registers.L = this.registers.E;
        this.registers.D = tempH;
        this.registers.E = tempL;
        break;

      case "SPHL":
        // Set Stack Pointer to HL
        this.registers.SP = this.concat2Bytes(
          this.registers.H,
          this.registers.L
        );
        break;

      case "XTHL":
        // TODO: Implement XTHL
        break;

      case "PUSH":
        // TODO: Implement PUSH
        break;

      case "POP":
        // TODO: Implement POP
        break;

      case "OUT":
        // TODO: Implement OUT
        break;

      case "IN":
        // TODO: Implement IN
        break;

      case "ADD":
        const register = mnemonic[1];
        if (register === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(mnemonic[1]);
        }
        this.registers.A = this.addBytes(this.registers.A, value);
        break;

      case "ADC":
        const adcRegister = mnemonic[1];
        if (adcRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(adcRegister);
        }
        this.registers.A = this.addBytes(this.registers.A, value, true);
        break;

      case "ADI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.addBytes(this.registers.A, value);
        this.registers.PC++;
        break;

      case "ACI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.addBytes(this.registers.A, value, true);
        this.registers.PC++;
        break;

      case "DAD":
        // TODO: Implement DAD
        break;

      case "SUB":
        const subRegister = mnemonic[1];
        if (subRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(subRegister);
        }
        this.registers.A = this.subBytes(this.registers.A, value);
        break;

      case "SBB":
        const sbbRegister = mnemonic[1];
        if (sbbRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(sbbRegister);
        }
        this.registers.A = this.subBytes(this.registers.A, value, true);
        break;

      case "SUI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.subBytes(this.registers.A, value);
        this.registers.PC++;
        break;

      case "SBI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.subBytes(this.registers.A, value, true);
        this.registers.PC++;
        break;

      case "INR":
        const incRegister = mnemonic[1];
        if (incRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
          value = this.addBytes(value, 1);
          this.setAddressValue(this.getMemoryPointer(), value);
        } else {
          value = this.getRegisterValue(incRegister);
          value = this.addBytes(value, 1);
          this.setRegisterValue(incRegister, value);
        }
        break;

      case "INX":
        const incRegPair = mnemonic[1];
        const currentValue = this.getRegisterPairValue(incRegPair);
        this.setRegisterPairValue(incRegPair, currentValue + 1);
        break;

      case "DCR":
        const decRegister = mnemonic[1];
        if (decRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
          value = this.subBytes(value, 1);
          this.setAddressValue(this.getMemoryPointer(), value);
        } else {
          value = this.getRegisterValue(decRegister);
          value = this.subBytes(value, 1);
          this.setRegisterValue(decRegister, value);
        }
        break;

      case "DCX":
        const decRegPair = mnemonic[1];
        const currentDecValue = this.getRegisterPairValue(decRegPair);
        this.setRegisterPairValue(decRegPair, currentDecValue - 1);
        break;

      case "DAA":
        // TODO: Implement DAA
        break;

      case "HLT":
        this.isHalted = true;
        break;
    }
  }

  getMemoryPointer(): number {
    return this.concat2Bytes(this.registers.H, this.registers.L);
  }

  getAddressValue(address: number): number {
    if (address < 0 || address >= 65536) {
      throw new Error("Memory address out of bounds");
    }
    return this.memory[address];
  }

  setAddressValue(address: number, value: number) {
    if (address < 0 || address >= 65536) {
      throw new Error("Memory address out of bounds");
    }
    this.memory[address] = this.fb(value);
  }

  getRegisterValue(register: string): number {
    if (register in this.registers) {
      return this.registers[register];
    }
    throw new Error(`Invalid register: ${register}`);
  }

  setRegisterValue(register: string, value: number) {
    if (register in this.registers) {
      this.registers[register] = this.fb(value);
    } else {
      throw new Error(`Invalid register: ${register}`);
    }
  }

  getRegisterPairValue(pair: string): number {
    if (pair === "B") {
      return this.concat2Bytes(this.registers.B, this.registers.C);
    } else if (pair === "D") {
      return this.concat2Bytes(this.registers.D, this.registers.E);
    } else if (pair === "H") {
      return this.concat2Bytes(this.registers.H, this.registers.L);
    } else if (pair === "SP") {
      return this.registers.SP;
    }
    throw new Error(`Invalid register pair: ${pair}`);
  }

  setRegisterPairValue(pair: string, value: number) {
    if (pair === "B") {
      this.registers.B = (value >> 8) & 0xff;
      this.registers.C = value & 0xff;
    } else if (pair === "D") {
      this.registers.D = (value >> 8) & 0xff;
      this.registers.E = value & 0xff;
    } else if (pair === "H") {
      this.registers.H = (value >> 8) & 0xff;
      this.registers.L = value & 0xff;
    } else if (pair === "SP") {
      this.registers.SP = value & 0xffff;
    } else {
      throw new Error(`Invalid register pair: ${pair}`);
    }
  }

  // compare(val: number): void {
  //   const a = this.registers.A;

  //   const result = this.subBytes(a, val);
  //   this.flags.Z = result === 0 ? 1 : 0; // Zero flag
  //   this.flags.S = (result & 0x80) !== 0 ? 1 : 0; // Sign flag
  //   this.flags.P = this.isParity(result) ? 1 : 0; // Parity flag
  //   this.flags.CY = a < val ? 1 : 0; // Carry flag
  //   this.flags.AC = ((a & 0x0f) < (val & 0x0f)) ? 1 : 0; // Auxiliary carry flag
  // }

  fb(val: number): number {
    return val & 0xff;
  }

  concat2Bytes(high: number, low: number): number {
    return (high << 8) | low;
  }

  addBytes(a: number, b: number, useCarry: boolean = false): number {
    let result = a + b;
    if (useCarry) {
      result += this.getFlagBit(7);
    }
    this.setFlagBit(result > 0xff, 7);
    return this.fb(result);
  }

  subBytes(a: number, b: number, useBorrow: boolean = false): number {
    let result = a - b;
    if (useBorrow) {
      result -= this.getFlagBit(7);
    }
    this.setFlagBit(result < 0, 7);
    return this.fb(result);
  }

  setFlagBit(value: boolean, bit: number): void {
    if (bit < 0 || bit > 7) {
      throw new Error("Bit index out of bounds");
    }
    if (value) {
      this.registers.FLAG |= 1 << bit;
    } else {
      this.registers.FLAG &= ~(1 << bit);
    }
  }

  getFlagBit(bit: number): number {
    if (bit < 0 || bit > 7) {
      throw new Error("Bit index out of bounds");
    }
    return (this.registers.FLAG & (1 << bit)) !== 0 ? 1 : 0;
  }
}
