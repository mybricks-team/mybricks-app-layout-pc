import { Logger } from "@mybricks/rocker-commons";

export type CustomPublishDataParams = {
  fileId: number;
  envType: string;
  nowVersion: string;
  title: string;
  template: string;
};

export async function customPublish(
  req: any,
  customPublishDataParams: CustomPublishDataParams,
  retry: number = 0
) {
  if (retry !== 0) {
    Logger.info(`[custom-publish] 第${retry}次重试发布集成执行...`);
  }

  try {
    // doing something
    const { fileId } = customPublishDataParams;
    console.log(`customPublishDataParams JD==> `,customPublishDataParams);
  } catch (e) {
    Logger.error(
      `发布集成执行失败！ ${e?.message || JSON.stringify(e, null, 2)}`
    );
    if (retry >= 3) throw e;
    await customPublish(req, customPublishDataParams, retry + 1);
  }
}
