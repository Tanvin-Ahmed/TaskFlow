"use server";

import { cookies } from "next/headers";

export const getCookiesValue = (key: string) => {
  const cookieInfo = cookies().get(key);
  return cookieInfo?.value;
};
