import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Password } from "../services/password";
import { AppError } from "../utils/appError";
import { validationResult } from "express-validator";
import { Pool } from "pg";
import { PG_DB } from "../services/postgres-database";

const pool = new Pool({
  ...PG_DB,
  port: Number(PG_DB.port),
});

const issueToken = (id: number, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const manageCookieTokenSendResponse = (
  user: { id: number; email: string; password: undefined },
  statusCode: number,
  req: Request,
  res: Response
) => {
  // ussue jwt

  const cookieExpiry = Number(process.env.YOUR_COOKIE_EXPIRY) || 0;

  const token = issueToken(user.id, user.email);

  // issue cookie
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + cookieExpiry * 24 * 60 * 60 * 1000),
    sameSite: !"None",
    path: "/",
    httpOnly: true, // cookie not to be accessed or modified, will be sent automatically along with every request
    secure: req.secure || req.headers["x-forwarded-proto"] === "https", // cookie will only be sent when using https connection
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signinPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(`SELECT * FROM users where email=$1;`, [
      email,
    ]);

    res.status(200).json({ status: "success", data: rows });

    if (rows.length == 0) {
      return next(
        new AppError(
          "Accounts not found, please contact the administrator",
          403
        )
      );
    }

    const passwordsMatch = await Password.compare(rows[0].password, password);

    if (!passwordsMatch) {
      return next(new AppError("Email or password not matching", 403));
    }

    let user = rows[0];
    user.password = null;

    manageCookieTokenSendResponse(user, 200, req, res);
  } catch (error: any) {
    return next(new AppError(error.message, 422));
  }
};

export { signinPassword };
