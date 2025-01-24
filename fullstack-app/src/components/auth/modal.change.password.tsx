"use client";

import { useHasMounted } from "@/utils/customHook";
import { Button, Form, Input, Modal, notification, Steps } from "antd";
import {
  ArrowLeftOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import Password from "antd/es/input/Password";

const ModalChangePassword = (props: any) => {
  const { isModalOpen, setIsModalOpen } = props;
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [userId, setUserId] = useState("");
  const [accountId, setAccountId] = useState("");
  const hasMounted = useHasMounted();
  const [email_gl, setEmailGl] = useState("");
  if (!hasMounted) return <></>;

  const onFinishStep0 = async (values: any) => {
    const { email } = values;
    const res = await sendRequest<IBackendRes<any>>({
      url: "http://localhost:8080/contact/register",
      method: "POST",
      body: {
        email,
      },
    });

    if (res?.data) {
      setUserId(res.data.id);
      setCurrent(1);
      setEmailGl(values.email);
      const res_id = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/pro-account/checkemail`,
        method: "POST",
        body: {
          email,
        },
      });

      if (res_id.data) {
        setAccountId(res_id.data.id);
      }
    } else {
      notification.error({
        message: "Call APIs error",
        description: res?.message,
      });
    }
  };

  const onFinishStep1 = async (values: any) => {
    const { code } = values;
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/contact/check-code`,
      method: "POST",
      body: {
        code,
        id: userId,
      },
    });

    if (res?.data) {
      await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/pro-account/${accountId}`,
        method: "PATCH",
        body: {
          password: values.password,
        },
      });
      setCurrent(2);
    } else {
      notification.error({
        message: "Call APIs error",
        description: res?.message,
      });
    }
  };
  return (
    <>
      <Modal
        title="Quên mật khẩu"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        footer={null}
      >
        <Steps
          current={current}
          items={[
            {
              title: "Email",
              // status: 'finish',
              icon: <UserOutlined />,
            },
            {
              title: "Verification",
              // status: 'finish',
              icon: <SolutionOutlined />,
            },

            {
              title: "Done",
              // status: 'wait',
              icon: <SmileOutlined />,
            },
          ]}
        />
        {current === 0 && (
          <>
            <div style={{ margin: "20px 0" }}>
              <p>
                Để thực hiện thay đổi mật khẩu, vui lòng nhập email tài khoản
                của bạn.
              </p>
            </div>
            <Form
              name="change-password"
              onFinish={onFinishStep0}
              autoComplete="off"
              layout="vertical"
              form={form}
            >
              <Form.Item label="" name="email">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {current === 1 && (
          <>
            <div style={{ margin: "20px 0" }}>
              <p>Vui lòng thực hiện đổi mật khẩu</p>
            </div>

            <Form
              name="change-pass-2"
              onFinish={onFinishStep1}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="Code"
                name="code"
                rules={[
                  {
                    required: true,
                    message: "Please input your code!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Confirm
                </Button>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    setCurrent(0);
                  }}
                ></Button>
              </Form.Item>
            </Form>
          </>
        )}

        {current === 2 && (
          <div style={{ margin: "20px 0" }}>
            <p>
              Tải khoản của bạn đã được thay đổi mật khẩu thành công. Vui lòng
              đăng nhập lại
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ModalChangePassword;
