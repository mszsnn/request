import { createHookManager } from '../utils/hookManager';

function getHookManager () {
  const hookManager = createHookManager();
  // 标准请求钩子
  hookManager.registSlot('beforeMergeConfig');
  hookManager.registSlot('afterMergeConfig');
  hookManager.registSlot('beforeSend');
  hookManager.registSlot('request');
  hookManager.registSlot('finish');
  hookManager.registSlot('fail');
  hookManager.registSlot('success');
  // 请求已经建立， 拿到返回的 promise
  hookManager.registSlot('requestEstablished');

  return hookManager;
}

export default getHookManager;

