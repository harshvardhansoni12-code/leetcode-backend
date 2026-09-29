import { prisma } from "../../lib/prisma.js";
import { createUser, findUserByEmail } from "../service/auth.service.js";
async function Register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "invalid credentials" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "password must be at least 6 characters" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    return res.status(409).json({ message: "user already exists" });
  }

  try {
    const userCreated = await createUser({
      username,
      email,
      password,
    });

    if (!userCreated) {
      return res.status(401).json({ message: "" });
    }
    return res.status(201).json({
      message: "user registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "something went worng",
    });
  }
}

async function Login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "invalid credentials" });
  }

  try {
    const userFound = await findUserByEmail(email);

    if (!userFound) {
      return res.status(401).json({ message: "user not found" });
    }

    const userPassword = userFound.password;

    return res.status(201).json({
      message: "user registered successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "failed to login" });
  }
}

export { Register, Login };
