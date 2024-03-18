import { Injectable } from "@nestjs/common";
import { publish } from "./publish";
import { upload } from "./upload";
import { rollback } from "./rollback";
import { downloadProduct } from "./download-product";
import { CustomPublishDataParams, customPublish } from "./custom-publish";

@Injectable()
export default class PcPageService {
  async publish(req, { json, userId, fileId, envType, commitInfo, appConfig }) {
    return await publish(req, {
      json,
      userId,
      fileId,
      envType,
      commitInfo,
      appConfig,
    });
  }

  async upload(req, { file }, { groupId = "" } = {}) {
    return await upload(req, { file }, { groupId });
  }

  async rollback(
    req: any,
    filePath: string,
    rollbackDataParams: { nowVersion: string; fileId: number; type: string }
  ) {
    return await rollback(req, filePath, rollbackDataParams);
  }

  async downloadProduct(
    res: any,
    params: { fileId: number; envType: string; version: string }
  ) {
    return await downloadProduct(res, params);
  }

  async customPublish(
    req: any,
    customPublishDataParams: CustomPublishDataParams
  ) {
    return await customPublish(req, customPublishDataParams);
  }
}
