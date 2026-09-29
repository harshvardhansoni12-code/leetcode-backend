import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function createUser({ username, email, password }) {
  const hashedPassword = await hashPassword(password);

  return await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });
}

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export function comparePasswords(password, userPassword) {
  return bcrypt.compare(password, userPassword);
}
