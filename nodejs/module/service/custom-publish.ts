import { Logger } from "@mybricks/rocker-commons";
import axios from "axios";

export type CustomPublishDataParams = {
  env: string;
  productId: number;
  productName: string;
  publisherEmail: string;
  publisherName: string;
  version: string;
  commitInfo: string;
  type: string;
  groupId: string;
  groupName: string;
  content: {
    json: string;
    html: string;
    js: {
      name: string,
      content: string,
    }[]
  };
}

const OWNERS = ['wudi27'];
const NODE_ID = 36327;
const SERVER_TREE = "{\"id\":\"node-36327\",\"path\":\"/kuaishou/kwaishop/kwaishop-power/fangzhou-pcspa/pc-app\"}";

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
    const { env, productId, publisherEmail, commitInfo, content, groupId, groupName, productName, publisherName, type, version } = customPublishDataParams

    const deployEnv = env === 'prod' ? 'prod' : 'staging';

    const deployData = {
      /** 文件唯一标识 */
      uri: `/layout/${deployEnv}/${productId}`,
      /** 文件内容 */
      content: content.html,
      /** 文件名 */
      fileName: productName,
      /** 部署的环境，staging、prt、prod */
      env: deployEnv,
      /** 文件版本 */
      version: version,
      /** 域名访问路径 */
      routerPath: `/layout/${deployEnv}/${productId}`,
      /** 发布日志，上线信息 */
      commitInfo: commitInfo,
      /** 创建产品库和服务所需的其他信息（选填） */
      others: {
        /** 所有者 */
        owners: OWNERS,
        /** 管理员，多位管理员按 , 分隔；默认为申请人 */
        admin: OWNERS.join(';'),
        /** 服务树节点；如果传了server_name */
        node_id: NODE_ID,
        /** 服务树 */
        server_tree: SERVER_TREE,
      }
    }

    Logger.info(`[custom-publish] 调用发布集成接口，参数为: ${JSON.stringify({ ...deployData, content: '简化展示信息...' }, null, 2)}`);

    const res: any = await axios.post('https://eshop-fangzhou.staging.kuaishou.com/api/paas/kfx/deploy', deployData)

    if (res.data.code === -1) {
      throw new Error(res.data.message)
    }

    return res.data;
  } catch (e) {
    Logger.error(
      `发布集成接口调用失败！ ${e?.message || JSON.stringify(e, null, 2)}`
    );
  }
}