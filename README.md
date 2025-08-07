# Intel 8085 Microprocessor Simulator

A web-based Intel 8085 microprocessor simulator built with TypeScript, Preact, and TailwindCSS. This simulator provides a complete environment for writing, assembling, and executing 8085 assembly language programs.

## 🚀 Features

### ✅ Completed Features

- **Full 8085 CPU Emulation**

  - Complete register set (A, B, C, D, E, H, L, SP, PC, FLAG)
  - 64KB memory addressing
  - Flag register with all status bits (Carry, Zero, Sign, Parity, Auxiliary Carry)

- **Assembly Editor**

  - Syntax highlighting-ready code editor
  - Real-time assembly to machine code
  - Label support for jump instructions
  - Multi-format number support (Hex, Decimal, Binary, Octal)

- **Assembler View**

  - Complete instruction breakdown
  - Address, mnemonic, and hex code display
  - Step-by-step execution capability
  - Visual program counter tracking

- **Register Monitoring**

  - Real-time register value display
  - Binary representation of register contents
  - System information panel (SP, PC, HL pointer)

- **Memory Management**

  - Memory viewer with hex display
  - Manual memory editing capability
  - Non-zero memory filtering

- **Number Converter Tool**

  - Real-time conversion between Hex, Decimal, and Binary
  - Integrated utility for assembly programming

- **Instruction Set Support**
  - **Data Transfer**: MOV, MVI, LDA, STA, LXI, LHLD, SHLD, XCHG, SPHL
  - **Arithmetic**: ADD, ADC, ADI, ACI, SUB, SBB, SUI, SBI, INR, DCR, INX, DCX
  - **Jump Instructions**: JMP, JC, JNC, JP, JM, JZ, JNZ, JPE, JPO
  - **Control**: NOP, HLT

### 🔄 Partially Implemented

- **Flag Operations**: Basic flag setting for arithmetic operations
- **Interrupt Handling**: UI components ready but logic not implemented

### ❌ Not Yet Implemented

The following instructions are marked as TODO in the codebase:

- **Data Transfer**: LDAX, STAX, XTHL, PUSH, POP
- **Arithmetic**: DAD (Double Add), DAA (Decimal Adjust Accumulator)
- **Logical**: RLC, RRC, RAL, RAR, CMA, STC, CMC, AND, OR, XOR, CMP
- **I/O Operations**: IN, OUT
- **Advanced Features**:
  - Stack operations (PUSH/POP)
  - Subroutine calls (CALL, RET variants)
  - Interrupt handling (RST, RIM, SIM)
  - Device simulation panel

## 🛠️ Technology Stack

- **Frontend**: Preact (React alternative)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Architecture**: Component-based with clean separation of CPU logic and UI

## 📁 Project Structure

```
src/
├── lib/
│   ├── 8085.ts           # Core CPU emulation logic
│   ├── assembler.ts      # Assembly language parser
│   ├── opcodes-lookup.ts # Complete opcode mapping
│   └── utils.ts          # Utility functions
├── components/
│   ├── editor-panel.tsx  # Code editor and assembler
│   ├── right-panel.tsx   # Register/memory/device tabs
│   ├── assemble-view.tsx # Assembly instruction viewer
│   ├── registers-table.tsx # Register display
│   ├── memory-view.tsx   # Memory editor/viewer
│   ├── system-info.tsx   # System state information
│   └── number-converter.tsx # Number base converter
└── app.tsx               # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/theSa1/8085-simulator.git
cd 8085-simulator
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 💻 Usage

1. **Write Assembly Code**: Use the editor panel to write 8085 assembly language programs
2. **Assemble**: Click the "Assemble" button to convert your code to machine language
3. **Execute**: Use the step-by-step execution controls in the assembler view
4. **Monitor**: Watch registers and memory change in real-time during execution
5. **Debug**: Use the number converter and memory editor for debugging

### Example Program

```assembly
MVI A, 05H    ; Load 5 into accumulator
MVI B, 03H    ; Load 3 into register B
ADD B         ; Add B to A
STA 2050H     ; Store result at memory location 2050H
HLT           ; Halt the program
```

## 🤝 Contributing

Contributions are welcome! Here are some areas that need work:

### High Priority

- Implement missing arithmetic instructions (DAD, DAA)
- Add logical operations (AND, OR, XOR, CMP)
- Implement stack operations (PUSH, POP)
- Add rotate and shift instructions (RLC, RRC, RAL, RAR)

### Medium Priority

- Complete I/O operations (IN, OUT)
- Implement subroutine calls (CALL, RET variants)
- Add interrupt handling logic
- Create device simulation panel

### Enhancement Ideas

- Add syntax highlighting
- Implement breakpoints
- Create example programs library
- Add execution timing simulation
- Implement assembler error reporting

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## 📚 8085 Reference

The Intel 8085 is an 8-bit microprocessor with:

- 8-bit data bus and 16-bit address bus
- 64KB memory addressing capability
- 74 instructions in its instruction set
- 5 interrupt inputs
- Built-in clock generator

## 👥 Credits

- **Inspired by**: Jubin Mitra

## 🐛 Known Issues

- Some complex flag operations may not be perfectly accurate
- Interrupt timing simulation is not implemented
- Device I/O simulation is placeholder only

## 📞 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include code samples and steps to reproduce

---

**Note**: This simulator is designed for educational purposes and may not perfectly replicate all aspects of the physical Intel 8085 microprocessor.

(I know this is AI generated slope but i am lazy)
