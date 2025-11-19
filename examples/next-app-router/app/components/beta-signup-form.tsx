"use client";

import { useFormState, useFormStatus } from "react-dom";
import { betaAccessInitialState, requestBetaAccess } from "../actions";

export function BetaSignupForm() {
  const [state, formAction] = useFormState(requestBetaAccess, betaAccessInitialState);

  return (
    <form action={formAction} className="beta-form">
      <label htmlFor="email">Request early access</label>
      <input
        id="email"
        name="email"
        required
        placeholder="dev@example.com"
        type="email"
        autoComplete="email"
      />
      <SubmitButton />
      {state.message ? <p className="status">{state.message}</p> : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Request invite"}
    </button>
  );
}
