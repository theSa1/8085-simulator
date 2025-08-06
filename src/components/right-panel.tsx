import React, { useState } from "react";
import RegistersTable from "./registers-table";
import SystemInfo from "./system-info";
import NumberConverter from "./number-converter";
import type { CPU8085 } from "../lib/8085";
import MemoryView from "./memory-view";
// import MemoryView from "./MemoryView";

const RightPanel: React.FC<{
  cpu: CPU8085;
  triggerRerender: () => void;
}> = ({ cpu, triggerRerender }) => {
  const [activeTab, setActiveTab] = useState("registers");

  const tabs = [
    { id: "registers", label: "Registers" },
    { id: "memory", label: "Memory" },
    { id: "devices", label: "Devices" },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      {/* <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">Registers :</h2>
      </div> */}

      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "bg-gray-50 text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === "registers" && (
          <>
            <RegistersTable cpu={cpu} />
            <SystemInfo cpu={cpu} />
            <NumberConverter />
          </>
        )}
        {activeTab === "memory" && (
          <MemoryView cpu={cpu} triggerRerender={triggerRerender} />
        )}
        {activeTab === "devices" && (
          <div className="text-center text-gray-500 py-8">
            Devices view will be implemented here
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
