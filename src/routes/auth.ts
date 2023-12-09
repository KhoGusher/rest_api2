import express from "express";
import { signinPassword } from "../controllers/signin";
import { forgotPassword } from "../controllers/forgotPassword";
import { resetPassword } from "../controllers/resetPassword";
import { signUp } from "../controllers/signup";
import { signout } from "../controllers/signout";

import { body } from "express-validator";
const router = express.Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("You must supply a first name"),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("You must supply a last name"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("You must supply a phone number"),
  ],
  signUp
);

// sign with phone or email, both to use sms to sign in
router.post(
  "/signin-password",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  signinPassword
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Signing user out
router.post("/logout", signout);

export { router as authRouter };
