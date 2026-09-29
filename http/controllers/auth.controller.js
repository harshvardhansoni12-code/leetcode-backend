import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  comparePasswords,
  findUserById,
} from "../service/auth.service.js";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

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

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "user already exists" });
    }

    const userCreated = await createUser({
      username,
      email,
      password,
    });

    if (!userCreated) {
      return res.status(401).json({ message: "user registration failed" });
    }

    return res.status(201).json({
      message: "user registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "something went wrong",
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

    const isValidPassword = await comparePasswords(
      password,
      userFound.password,
    );

    if (!isValidPassword) {
      return res.status(400).json({ message: "wrong password" });
    }

    const payload = {
      id: userFound.id,
      email: userFound.email,
      username: userFound.username ?? userFound.name,
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      {
        id: userFound.id,
        email: userFound.email,
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      message: "login successful",
      accessToken,
      refreshToken,
      user: {
        id: userFound.id,
        email: userFound.email,
        username: userFound.username ?? userFound.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "failed to login" });
  }
}

async function RefreshToken(req, res) {
  const refreshToken = req.header.authorization;

  if (!refreshToken) {
    return res.status(401).json({ message: "refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userFound = await findUserById(decoded.id);

    if (!userFound) {
      return res.status(401).json({ message: "invalid refresh token" });
    }

    const accessToken = jwt.sign(
      {
        id: userFound.id,
        email: userFound.email,
        username: userFound.username ?? userFound.name,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(401)
      .json({ message: "invalid or expired refresh token" });
  }
}

export { Register, Login, RefreshToken };
