import React from "react";

import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Typography,
} from "antd";

import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { resetPasswordApi } from "../util/api";

const { Paragraph } = Typography;

const ResetPasswordPage = () => {

  const navigate = useNavigate();

  const onFinish = async (values) => {

    const {
      email,
      otp,
      newPassword,
    } = values;

    const resetToken =
      localStorage.getItem("resetToken");

    if (!resetToken) {
      notification.error({
        message: "RESET PASSWORD",
        description:
          "Phiên reset password đã hết hạn",
      });

      return;
    }

    const res = await resetPasswordApi(
      email,
      otp,
      resetToken,
      newPassword,
    );

    if (res && res.EC === 0) {

      notification.success({
        message: "RESET PASSWORD",
        description:
          res.EM ||
          "Đổi mật khẩu thành công",
      });

      // xóa token
      localStorage.removeItem(
        "resetToken"
      );

      localStorage.removeItem(
        "resetEmail"
      );

      navigate("/login");

    } else {

      notification.error({
        message: "RESET PASSWORD",
        description:
          res?.EM ?? "error",
      });
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-shell">

        <section className="auth-hero">

          <span className="auth-eyebrow">
            <SafetyCertificateOutlined />
            {" "}
            OTP Verification
          </span>

          <h1 className="auth-title">
            Xác thực OTP và tạo mật khẩu mới.
          </h1>

          <Paragraph className="auth-description">
            Nhập email, mã OTP được gửi
            qua mail và mật khẩu mới để
            hoàn tất khôi phục tài khoản.
          </Paragraph>

          <ul className="auth-points">
            <li>
              <MailOutlined />
              {" "}
              OTP có hiệu lực trong vài phút
            </li>

            <li>
              <LockOutlined />
              {" "}
              Đặt mật khẩu mới an toàn hơn
            </li>

            <li>
              <SafetyCertificateOutlined />
              {" "}
              Đăng nhập lại sau khi cập nhật
            </li>
          </ul>

        </section>

        <Col
          xs={24}
          md={16}
          lg={8}
          className="auth-card auth-card--accent"
        >

          <div className="auth-card__header">

            <h2 className="auth-card__title">
              Reset Password
            </h2>

            <p className="auth-card__subtitle">
              Nhập OTP và mật khẩu mới.
            </p>

          </div>

          <Form
            name="reset-password"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="auth-form"
            initialValues={{
              email:
                localStorage.getItem(
                  "resetEmail"
                ) || "",
            }}
          >

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message:
                    "Vui lòng nhập email",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com"
              />
            </Form.Item>

            <Form.Item
              label="OTP"
              name="otp"
              rules={[
                {
                  required: true,
                  message:
                    "Vui lòng nhập OTP",
                },
              ]}
            >
              <Input
                placeholder="123456"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message:
                    "Vui lòng nhập mật khẩu mới",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="auth-submit"
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>

          </Form>

          <div className="auth-links">

            <Link
              to={"/"}
              className="auth-back"
            >
              <ArrowLeftOutlined />
              {" "}
              Quay lại trang chủ
            </Link>

            <span>
              Đã nhớ mật khẩu?
              {" "}
              <Link to={"/login"}>
                Đăng nhập
              </Link>
            </span>

          </div>

        </Col>

      </div>

    </div>
  );
};

export default ResetPasswordPage;