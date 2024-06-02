import React from "react";
import { StateContext } from "../contexts/store-context";

export const useAppState = () => {
  const context = React.useContext(StateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within a StateProvider");
  }
  return context;
};
