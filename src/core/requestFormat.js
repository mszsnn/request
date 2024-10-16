
class RequestFormat {
  // 根据返回的 content-type 转化 response, 不考虑文件下载
  async getResponseContent(response) {
    const { headers } = response;
    const contentType = headers.get('content-type');
    if (contentType.indexOf('application/json') > -1) {
      return await response.json();
    } else {
      return await response.text();
    }
  }

  // 失败返回格式化后的错误
  async formatError(response, config) {
    const { url } = config;
    const { status, headers } = response;
    const error = await this.getResponseContent(response);
    return {
      url,
      status,
      config,
      error,
      headers
    };
  }

  // 成功直接返回结果
  async format(response) {
    return await this.getResponseContent(response);
  }
}

export default new RequestFormat();
