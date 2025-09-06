import React, { createContext, useContext, useState } from "react";

interface TreeContextType {
  expandSignal: number;
  collapseSignal: number;
  triggerExpand: () => void;
  triggerCollapse: () => void;
}

const TreeContext = createContext<TreeContextType | null>(null);

export const TreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandSignal, setExpandSignal] = useState(0);
  const [collapseSignal, setCollapseSignal] = useState(0);

  return (
    <TreeContext.Provider
      value={{
        expandSignal,
        collapseSignal,
        triggerExpand: () => setExpandSignal((n) => n + 1),
        triggerCollapse: () => setCollapseSignal((n) => n + 1),
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};

export const useTreeContext = () => {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error("useTreeContext must be used within TreeProvider");
  return ctx;
};
