"use client";
import { Button, Col, Divider, Form, Input, notification, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModuleReactive from "./model";
import { useState } from "react";
import { authenticate } from "@/utils/actions";
import ModalChangePassword from "./modal.change.password";

const Login = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const onFinish = async (values: any) => {
    setUserEmail("");
    const { email, password } = values;
    const res = await authenticate(email, password);

    if (res.error) {
      notification.error({
        message: "Login error",
        description: res?.error,
      });
      if (res.code === 2) {
        setUserEmail(values.email);
        setIsModalOpen(true);
      }
    } else {
      router.push("/dashboard");
      notification.success({
        message: "Login successful",
      });
    }
  };

  return (
    <>
      <Row justify={"center"} style={{ marginTop: "30px" }}>
        <Col xs={24} md={16} lg={8}>
          <fieldset
            style={{
              padding: "15px",
              margin: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <legend>Đăng Nhập</legend>
            <Form
              name="basic"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Button type="primary" htmlType="submit">
                    Login
                  </Button>
                  <Button type="link" onClick={() => setChangePassword(true)}>
                    Quên mật khẩu ?
                  </Button>
                </div>
              </Form.Item>
            </Form>
            <Link href={"/"}>
              <ArrowLeftOutlined /> Quay lại trang chủ
            </Link>
            <Divider />
            <div style={{ textAlign: "center" }}>
              Chưa có tài khoản?{" "}
              <Link href={"/auth/register"}>Đăng ký tại đây</Link>
            </div>
          </fieldset>
        </Col>
      </Row>
      <ModuleReactive
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        userEmail={userEmail}
      />
      <ModalChangePassword
        isModalOpen={changePassword}
        setIsModalOpen={setChangePassword}
      />
    </>
  );
};

export default Login;
