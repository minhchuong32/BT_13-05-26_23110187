require("dotenv").config();
const { getPool } = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const saltRounds = 10;

const createMailTransporter = async () => {
  const hasSmtpConfig = process.env.MAIL_HOST && process.env.MAIL_USER;

  if (!hasSmtpConfig) {
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: String(process.env.MAIL_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

const createUserService = async (name, email, password) => {
  try {
    const pool = getPool();

    // check user exist
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (existingUsers.length > 0) {
      console.log(`>>> user exist, chọn 1 email khác: ${email}`);
      return null;
    }

    // hash user password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // save user to database
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashPassword, "User"],
    );

    return {
      id: result.insertId,
      name,
      email,
      role: "User",
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const loginService = async (email1, password) => {
  try {
    const pool = getPool();

    // fetch user by email
    const [rows] = await pool.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1",
      [email1],
    );

    if (rows.length > 0) {
      const user = rows[0];

      // compare password
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return {
          EC: 2,
          EM: "Email/Password không hợp lệ",
        };
      } else {
        // create an access token
        const payload = {
          email: user.email,
          name: user.name,
        };

        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        return {
          EC: 0,
          access_token,
          user: {
            email: user.email,
            name: user.name,
          },
        };
      }
    } else {
      return {
        EC: 1,
        EM: "Email/Password không hợp lệ",
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserService = async () => {
  try {
    const pool = getPool();
    const [users] = await pool.execute(
      "SELECT id AS _id, name, email, role FROM users ORDER BY id DESC",
    );
    return users;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const createResetToken = (email, otp) => {
  return jwt.sign(
    {
      email,
      otp,
      purpose: "reset-password",
    },
    process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_RESET_EXPIRE || "5m",
    },
  );
};
const forgotPasswordService = async (email) => {
  try {
    const pool = getPool();

    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (rows.length === 0) {
      return {
        EC: 1,
        EM: "Email không tồn tại",
      };
    }

    // tạo OTP
    const otp = generateOTP();

    // tạo token chứa OTP
    const token = createResetToken(email, otp);

    const transporter = await createMailTransporter();

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@expressjs01.local",
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      text: `OTP của bạn là: ${otp}`,

      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Reset Password</h2>

          <p>Mã OTP của bạn:</p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #2563eb;
              margin: 20px 0;
            "
          >
            ${otp}
          </div>

          <p>OTP có hiệu lực trong 5 phút.</p>
        </div>
      `,
    });

    return {
      EC: 0,
      EM: "Đã gửi OTP",
      resetToken: token,
      previewUrl:
        nodemailer.getTestMessageUrl(info) || undefined,
    };
  } catch (error) {
    console.log(error);

    return {
      EC: -1,
      EM: "Server error",
    };
  }
};

const resetPasswordService = async (
  email,
  otp,
  resetToken,
  newPassword,
) => {
  try {
    // verify token
    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_RESET_SECRET ||
        process.env.JWT_SECRET,
    );

    // kiểm tra purpose
    if (decoded.purpose !== "reset-password") {
      return {
        EC: 1,
        EM: "Token không hợp lệ",
      };
    }

    // kiểm tra email
    if (decoded.email !== email) {
      return {
        EC: 2,
        EM: "Email không đúng",
      };
    }

    // kiểm tra OTP
    if (decoded.otp !== otp) {
      return {
        EC: 3,
        EM: "OTP không đúng",
      };
    }

    const pool = getPool();

    const hashPassword = await bcrypt.hash(
      newPassword,
      saltRounds,
    );

    const [result] = await pool.execute(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashPassword, email],
    );

    if (result.affectedRows === 0) {
      return {
        EC: 4,
        EM: "Email không tồn tại",
      };
    }

    return {
      EC: 0,
      EM: "Đổi mật khẩu thành công",
    };
  } catch (error) {
    console.log(error);

    return {
      EC: 5,
      EM: "OTP đã hết hạn hoặc token không hợp lệ",
    };
  }
};

module.exports = {
  createUserService,
  loginService,
  getUserService,
  forgotPasswordService,
  resetPasswordService,
};
