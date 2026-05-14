import React from "react";
import { Button, Col, Form, Input, notification, Row, Typography } from "antd";
import { forgotPasswordApi } from "../util/api";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Paragraph } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
const onFinish = async (values) => {
  const { email } = values;

  const res = await forgotPasswordApi(email);

  if (res && res.EC === 0) {

    // lưu token
    localStorage.setItem(
      "resetToken",
      res.resetToken
    );

    // lưu email
    localStorage.setItem(
      "resetEmail",
      email
    );

    notification.success({
      message: "FORGOT PASSWORD",
      description:
        res.EM || "Đã gửi OTP qua email",
    });

    if (res.previewUrl) {
      notification.info({
        message: "MAIL PREVIEW",
        description: res.previewUrl,
        duration: 0,
      });
    }

    navigate("/reset-password");

  } else {
    notification.error({
      message: "FORGOT PASSWORD",
      description: res?.EM ?? "error",
    });
  }
};

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-hero">
          <span className="auth-eyebrow">
            <SafetyCertificateOutlined /> Password recovery
          </span>
          <h1 className="auth-title">Đặt lại mật khẩu an toàn, rõ ràng.</h1>
          <Paragraph className="auth-description">
            Trang này được tách riêng để người dùng biết ngay mình đang ở bước
            khôi phục mật khẩu, tránh nhầm với đăng nhập.
          </Paragraph>
          <ul className="auth-points">
            <li>
              <MailOutlined /> Xác nhận bằng email đã đăng ký
            </li>
            <li>
              <LockOutlined /> Nhập mật khẩu mới ngay trên một màn hình
            </li>
            <li>
              <SafetyCertificateOutlined /> Quay lại đăng nhập sau khi cập nhật
              xong
            </li>
          </ul>
        </section>

        <Col xs={24} md={16} lg={8} className="auth-card auth-card--accent">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Đặt Lại Mật Khẩu</h2>
            <p className="auth-card__subtitle">
             Nhập email để nhận mã OTP đặt lại mật khẩu.
            </p>
          </div>
          <Form
            name="forgot-password"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="auth-form"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="auth-submit">
                Gửi mail đặt lại
              </Button>
            </Form.Item>
          </Form>
          <div className="auth-links">
            <Link to={"/"} className="auth-back">
              <ArrowLeftOutlined /> Quay lại trang chủ
            </Link>
            <span>
              Đã nhớ mật khẩu? <Link to={"/login"}>Đăng nhập</Link>
            </span>
          </div>
        </Col>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
