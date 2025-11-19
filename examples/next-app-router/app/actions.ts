"use server";

import { cookies } from "next/headers";
import { headerFlag } from "./flags";

export type BetaAccessFormState = {
  message: string;
};

const initialState: BetaAccessFormState = {
  message: "",
};

export const betaAccessInitialState = initialState;

export async function requestBetaAccess(
  _prevState: BetaAccessFormState,
  formData: FormData
): Promise<BetaAccessFormState> {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    return { message: "Please provide a work email so we can reach you." };
  }

  const newHeader = await headerFlag();

  if (!newHeader) {
    return {
      message: "The new header flag is closed.",
    };
  }

  (await cookies()).set("demo-user-id", email, {
    httpOnly: true,
    path: "/",
  });

  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    message: `Invite request received for ${email}.`,
  };
}
