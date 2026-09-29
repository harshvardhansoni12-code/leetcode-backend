import { prisma } from "../../lib/prisma.js";

export async function createUser({ username, email, password }) {
  return await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });
}

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email: email },
  });
}

export function comparePasswords(password, userPassword) {
  return bcrypt.compare(password, userPassword);
}
