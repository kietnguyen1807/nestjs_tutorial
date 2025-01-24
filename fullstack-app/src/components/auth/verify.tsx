"use client";
import React from "react";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  notification,
  Row,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";

const Verify = (props: any) => {
  const { id } = props;
  const router = useRouter();
  const [form] = Form.useForm(); // Tạo ref form
  const onFinish = async (values: any) => {
    const { id, code } = values;
    const res = await sendRequest<IBackendRes<any>>({
      url: "http://localhost:8080/contact/check-code",
      method: "POST",
      body: {
        id,
        code,
      },
    });
    console.log("Check res", res);
    if (res.data) {
      message.info("Account activation successful.");
      router.push("/auth/login");
    } else {
      notification.error({
        message: "Verify error",
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
          <legend>Kích hoạt tài khoản</legend>
          <Form
            form={form} // Kết nối instance `form`
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item label="Id" name="id" initialValue={id} hidden>
              <Input disabled />
            </Form.Item>

            <div>
              The code has been sent to your email, please check your email.
            </div>
            <Divider />

            <Form.Item
              label="Code"
              name="code"
              rules={[
                {
                  required: true,
                  message: "Please input your Code!",
                },
              ]}
            >
              <Input />
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

export default Verify;
