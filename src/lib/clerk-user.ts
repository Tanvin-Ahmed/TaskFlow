import { clerkClient } from "@clerk/nextjs/server";
import { getUserColor } from "@/lib/utils";

export async function getClerkUsersByIds(userIds: string[]) {
  if (!userIds.length) return [];

  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const users = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        return await clerkClient.users.getUser(id);
      } catch {
        return null;
      }
    }),
  );

  return users.filter(Boolean).map((user) => {
    const email =
      user!.emailAddresses.find((e) => e.id === user!.primaryEmailAddressId)
        ?.emailAddress ??
      user!.emailAddresses[0]?.emailAddress ??
      "";

    const name =
      [user!.firstName, user!.lastName].filter(Boolean).join(" ") ||
      user!.username ||
      email;

    return {
      id: user!.id,
      $id: user!.id,
      name,
      email,
      imageUrl: user!.imageUrl,
      color: getUserColor(user!.id),
    };
  });
}

export async function getClerkUsersByEmails(emails: string[]) {
  if (!emails.length) return [];

  const uniqueEmails = Array.from(new Set(emails.filter(Boolean)));
  const results = await Promise.all(
    uniqueEmails.map(async (email) => {
      try {
        const list = await clerkClient.users.getUserList({
          emailAddress: [email],
          limit: 1,
        });
        return list.data[0] ?? null;
      } catch {
        return null;
      }
    }),
  );

  return uniqueEmails.map((email) => {
    const user = results.find(
      (u) =>
        u?.emailAddresses.some(
          (e) => e.emailAddress.toLowerCase() === email.toLowerCase(),
        ),
    );

    if (!user) return undefined;

    const resolvedEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      email;

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      resolvedEmail;

    return {
      id: user.id,
      name,
      email: resolvedEmail,
      color: getUserColor(user.id),
    };
  });
}
