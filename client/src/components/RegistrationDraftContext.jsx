import { createContext, useContext, useState } from "react";

const RegistrationDraftContext = createContext(null);

const initialDraft = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export function RegistrationDraftProvider({ children }) {
  const [draft, setDraft] = useState(initialDraft);

  const resetDraft = () => {
    setDraft({ ...initialDraft });
  };

  return (
    <RegistrationDraftContext.Provider
      value={{ draft, setDraft, resetDraft }}
    >
      {children}
    </RegistrationDraftContext.Provider>
  );
}

export function useRegistrationDraft() {
  const context = useContext(RegistrationDraftContext);

  if (!context) {
    throw new Error(
      "useRegistrationDraft must be used inside RegistrationDraftProvider"
    );
  }

  return context;
}