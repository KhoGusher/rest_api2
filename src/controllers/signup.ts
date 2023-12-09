import { Request, Response, NextFunction } from "express";
import { Password } from "../services/password";
import { Email } from "../services/sendgrid";
import { validationResult } from "express-validator";

import { Pool } from "pg";
import { PG_DB } from "../services/postgres-database";
import { AppError } from "../utils/appError";

const pool = new Pool({
  ...PG_DB,
  port: Number(PG_DB.port),
});

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    // hash our password before inserting to database
    const hashedPassword = await Password.toHash(password);

    const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      email,
    ]);

    if (rows.length != 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const q2 = await pool.query(
      `INSERT INTO users(first_name, last_name, phone_number, email, password)
               VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firstName, lastName, phoneNumber, email, hashedPassword]
    );

    let user = q2.rows[0];

    // generate token to compare with when user confirms email
    const emailOtp = Math.floor(Math.random() * 90000) + 10000;

    // after you open sendgrid account, uncmment this line,
    // await new Email(user, emailOtp.toString()).confirmEmail();

    res.status(201).json({
      status: "success",
      message: `Registration successfull, Token sent to ${email}`,
      data: {
        phone: phoneNumber,
      },
    });
  } catch (err: any) {
    console.log(err);
    return next(new AppError(err.message, 422));
  }
};

export { signUp };
