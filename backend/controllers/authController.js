const bcrypt = require("bcryptjs");
const db = require("../config/db");
const generateToken = require("../utils/generateToken");
const transporter =
require("../config/mailConfig");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name,email,password,role_id) VALUES (?,?,?,?)";

    db.query(
      sql,
      [name, email, hashedPassword, role_id],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(201).json({
          success: true,
          message: "User registered successfully",
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT users.*, roles.role_name
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE email = ?
  `;

  db.query(sql, [email], async (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(
      user.id,
      user.role_name
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name
      }
    });

  });
};

const getProfile = (req, res) => {

  res.status(200).json({
    success: true,
    user: req.user
  });

};

const changePassword = async (req, res) => {

  try {

    const { currentPassword, newPassword } =
      req.body;

    const userId = req.user.id;

    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    const user = users[0];

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });

    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        message: "Current Password Incorrect"
      });

    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: "Password Changed Successfully"
    });

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

const forgotPassword = async (req, res) => {

  const { email } = req.body;

  try {

    const [users] =
      await db.promise().query(
        "SELECT * FROM users WHERE email=?",
        [email]
      );

    if (users.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Email Not Found"
      });

    }

    const otp =
      Math.floor(
        100000 + Math.random() * 900000
      ).toString();

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "StaffSpire Password Reset OTP",

      html: `
        <h2>Password Reset Request</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>
            Valid for 10 minutes.
        </p>
    `

    });

    await db.promise().query(

      `
            UPDATE users
            SET
                reset_otp=?,
                otp_expiry=
                DATE_ADD(
                    NOW(),
                    INTERVAL 10 MINUTE
                )
            WHERE email=?
            `,

      [
        otp,
        email
      ]

    );

    res.status(200).json({

      success: true,
      message: "OTP Sent To Email"

    });

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

const resetPassword = async (req, res) => {

  const {
    email,
    newPassword
  } = req.body;

  try {

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    await db.promise().query(

      `
      UPDATE users
      SET
          password=?,
          reset_otp=NULL,
          otp_expiry=NULL
      WHERE email=?
      `,

      [
        hashedPassword,
        email
      ]

    );

    res.json({
      success: true,
      message: "Password Reset Successfully"
    });

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

const verifyOTP = async (req, res) => {

  const {
    email,
    otp
  } = req.body;

  try {

    const [users] =
      await db.promise().query(

        `
            SELECT *
            FROM users
            WHERE email=?
            `,

        [email]

      );

    if (users.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });

    }

    const user = users[0];

    if (user.reset_otp !== otp) {

      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });

    }

    if (
      new Date() >
      new Date(user.otp_expiry)
    ) {

      return res.status(400).json({
        success: false,
        message: "OTP Expired"
      });

    }

    res.status(200).json({

      success: true,
      message: "OTP Verified"

    });

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};


module.exports = {
  registerUser,
  loginUser,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyOTP
};