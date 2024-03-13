import React, { useEffect, useRef, useState } from 'react'
import { Form, Input, Card, Button } from 'antd'
import { _NAMESPACE_ } from "..";
import { TConfigProps } from '../useConfig';
import PublishLocalize from './PublishLocalize';

export default (props: TConfigProps) => {
  const { config, mergeUpdateConfig, loading, user } = props
  const [form] = Form.useForm();

  const uploadConfig = config?.uploadServer || {}
  useEffect(() => {
    form.setFieldsValue(uploadConfig)
  }, [uploadConfig])

  return <>
    <PublishLocalize {...props} />
  </>
}