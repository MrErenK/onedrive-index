import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export const prisma = new PrismaClient();

interface SessionData {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date | string | null;
  userData: any;
  createdAt: Date;
  updatedAt: Date;
}

export async function createSession(data: {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date | string;
  userData: any;
}) {
  const id = uuidv4();
  const expiresAt =
    typeof data.expiresAt === "string"
      ? new Date(data.expiresAt)
      : data.expiresAt;

  const session = await prisma.session.create({
    data: {
      id,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt,
      userData: data.userData,
    },
  });

  return session;
}

export async function getSession(): Promise<SessionData | null> {
  const session = await prisma.session.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!session) return null;

  if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
    await deleteSession(session.id);
    return null;
  }

  return session;
}

export async function updateSession(
  id: string,
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }
) {
  const session = await prisma.session.update({
    where: { id },
    data: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      updatedAt: new Date(),
    },
  });

  return session;
}

export async function deleteSession(id: string) {
  await prisma.session.delete({
    where: { id },
  });
}

export async function deleteAllSessions() {
  await prisma.session.deleteMany({});
}
