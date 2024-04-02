import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Card, Button, Popconfirm } from "antd";
import API from "@mybricks/sdk-for-app/api";
import { _NAMESPACE_ } from "..";
import dayjs from "dayjs";
import { TConfigProps } from "../useConfig";
const { Meta } = Card;

enum FieldName {
  PublishAPI = `publishApi`,
  Domain = "domain"
}

export default ({ config, mergeUpdateConfig, loading, user }: TConfigProps) => {
  const [form] = Form.useForm();

  const publishApiConfig = config?.publishApiConfig || {};
  useEffect(() => {
    form.setFieldsValue(publishApiConfig);
  }, [publishApiConfig]);

  const onSubmit = (values) => {
    const updateTime = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    mergeUpdateConfig({
      publishApiConfig: { ...values, updateTime, user: user?.email },
    });
  };

  const onReset = () => {
    const updateTime = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    mergeUpdateConfig({
      publishApiConfig: { [FieldName.PublishAPI]: "", updateTime, user: user?.email },
    }).finally(() => {
      form.resetFields();
    });
  };

  return (
    <>
      <Form form={form} onFinish={onSubmit} style={{ marginTop: 12 }}>
        <Form.Item
          name={FieldName.PublishAPI}
          label="发布集成接口"
          tooltip="发布时会自动调用该接口向用户系统发送产物信息（如html页面内容）"
        >
          <Input placeholder="https://my.mybricks.world/publish" />
        </Form.Item>
        <Form.Item
          name={FieldName.Domain}
          label="访问域名"
          tooltip="发布后的页面可在此域名下访问"
        >
          <Input placeholder="www.xxx.com" />
        </Form.Item>
        <Form.Item style={{ textAlign: "right" }}>
          {Object.keys(publishApiConfig).length > 0 && (
            <Meta
              description={`${publishApiConfig.user} 更新于 ${publishApiConfig.updateTime}`}
            />
          )}
          <Popconfirm
            title={`确定清空发布集成接口吗？`}
            onConfirm={onReset}
            okText="确定"
            cancelText="再想想"
          >
            <Button htmlType="reset" style={{ marginRight: 8 }}>
              清空
            </Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
