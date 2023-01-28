import React, { ReactNode } from "react";

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-blue-500">
      {children}
    </div>
  );
};
