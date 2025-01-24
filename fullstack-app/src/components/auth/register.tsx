"use client";
import React from "react";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  notification,
  Row,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();
  const [form] = Form.useForm(); // Tạo ref form
  const onFinish = async (values: any) => {
    const res = await sendRequest<IBackendRes<IRegister>>({
      url: "http://localhost:8080/pro-user",
      method: "POST",
      body: {
        firstName: values.FirstName,
        lastName: values.LastName,
        email: values.email,
        location: values.Location,
        birthday: values.birthday,
        password: values.password,
      },
    });

    if (res.statusCode === 201) {
      await sendRequest({
        url: "http://localhost:8080/contact/register",
        method: "POST",
        body: {
          email: values.email,
        },
      });
      notification.success({
        message: "Register successful",
        description: "Your account has been created.",
      });
      router.push(`/verify/${res.data?.id}`);
    } else if (res.statusCode === 400) {
      form.setFields([
        {
          name: "email",
          errors: ["Email already exists. Please change your email."],
        },
      ]);
    } else {
      notification.error({
        message: "Register error",
        description: res.message,
      });
    }
  };

  return (
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
          <legend>Đăng Ký Tài Khoản</legend>
          <Form
            form={form} // Kết nối instance `form`
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Row gutter={16}>
              {/* First Name */}
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="FirstName"
                  rules={[
                    {
                      required: true,
                      message: "Please input your First Name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              {/* Last Name */}
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="LastName"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Last Name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ!",
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

            <Form.Item label="Location" name="Location">
              <Input />
            </Form.Item>

            <Form.Item label="Birthday" name="birthday">
              <DatePicker
                style={{ width: "100%" }}
                showTime={false} // Không cần chọn giờ
                format="YYYY-MM-DD" // Hiển thị ngày trong định dạng này
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Link href={"/"}>
            <ArrowLeftOutlined /> Quay lại trang chủ
          </Link>
          <Divider />
          <div style={{ textAlign: "center" }}>
            Đã có tài khoản? <Link href={"/auth/login"}>Đăng nhập</Link>
          </div>
        </fieldset>
      </Col>
    </Row>
  );
};

export default Register;
