const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) =>
  res.render("login", { user: "" })
);

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register", { user: "" })
);

module.exports = router;

