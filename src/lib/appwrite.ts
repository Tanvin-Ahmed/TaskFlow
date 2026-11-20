"use server";

import dns from "node:dns";
import { AUTH_COOKIE } from "@/features/auth/constant";
import { cookies } from "next/headers";
import { Client, Account, Databases, Users } from "node-appwrite";

// Vercel/Node 20+ undici often times out on Appwrite when IPv6 is preferred.
dns.setDefaultResultOrder("ipv4first");

const getAppwriteConfig = () => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT?.trim();
  const key = process.env.NEXT_APPWRITE_KEY?.trim();

  if (!endpoint || !project) {
    throw new Error(
      `Missing Appwrite env vars (endpoint=${Boolean(endpoint)}, project=${Boolean(project)}). Set them in Vercel Project Settings → Environment Variables.`,
    );
  }

  return { endpoint, project, key };
};

export const createAdminClient = async () => {
  const { endpoint, project, key } = getAppwriteConfig();

  if (!key) {
    throw new Error(
      "Missing NEXT_APPWRITE_KEY. Set it in Vercel Project Settings → Environment Variables.",
    );
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(key);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
};

export const createSessionClient = async () => {
  const { endpoint, project } = getAppwriteConfig();

  const client = new Client().setEndpoint(endpoint).setProject(project);

  const session = cookies().get(AUTH_COOKIE);

  if (!session || !session.value) {
    throw new Error("Unauthorized");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
};
