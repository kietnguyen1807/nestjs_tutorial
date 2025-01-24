"use client";

import { useHasMounted } from "@/utils/customHook";
import { Button, Divider, Form, Input, Modal, notification } from "antd";
import { useState } from "react";
import React from "react";
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Steps } from "antd";
import { sendRequest } from "@/utils/api";

const ModuleReactive = (prop: any) => {
  const { isModalOpen, setIsModalOpen, userEmail } = prop;
  const [current, setCurrent] = useState(0);
  const [userId, setUserId] = useState("");
  const hasMounted = useHasMounted();
  if (!hasMounted) return <></>;

  const onFinishStep0 = async (values: any) => {
    const res = await sendRequest<IBackendRes<any>>({
      url: "http://localhost:8080/contact/register",
      method: "POST",
      body: {
        email: values.email,
      },
    });
    if (res.data) {
      setUserId(res.data.id);
      setCurrent(1);
    } else {
      notification.success({
        message: "Resend email error",
        description: res.message,
      });
    }
  };

  const onFinishStep1 = async (values: any) => {
    const res = await sendRequest<IBackendRes<any>>({
      url: "http://localhost:8080/contact/check-code",
      method: "POST",
      body: {
        id: userId,
        code: values.code,
      },
    });

    if (res.data) {
      setCurrent(2);
    } else {
      notification.error({
        message: "Resend email error",
        description: res.message,
      });
    }
  };

  return (
    <>
      <Modal
        title="Active Account"
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
              title: "Login",
              //   status: "finish",
              icon: <UserOutlined />,
            },
            {
              title: "Verification",
              //   status: "finish",
              icon: <SolutionOutlined />,
            },
            {
              title: "Done",
              // status: "wait",
              icon: <SmileOutlined />,
            },
          ]}
        />
        {current === 0 && (
          <>
            <div style={{ margin: "20px 0" }}>
              <p>Your account not active</p>
            </div>
            <Form
              name="verify1"
              onFinish={onFinishStep0}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item label="" name="email" initialValue={userEmail}>
                <Input disabled />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Resend
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {current === 1 && (
          <>
            <Form
              name="verify2"
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
                    message: "Please enter your code",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Activate
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
              Your account has been activated successful. Please login again{" "}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ModuleReactive;
