// GitHub OAuth Device Flow - 创建仓库并推送
const https = require('https');

const CLIENT_ID = 'Iv1.b507a08c87ecf98c';

function post(host, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: host,
      path: path,
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: 请求设备码
  const device = await post('github.com', '/login/device/code', {
    client_id: CLIENT_ID,
    scope: 'repo'
  });

  console.log('\n请打开浏览器访问:');
  console.log(`\n  ${device.verification_uri}\n`);
  console.log(`输入验证码: ${device.user_code}\n`);
  console.log('然后按 Enter 继续...');

  // 等待用户授权
  await new Promise(r => process.stdin.once('data', r));

  // Step 2: 用设备码换 token
  const token = await post('github.com', '/login/oauth/access_token', {
    client_id: CLIENT_ID,
    device_code: device.device_code,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
  });

  if (token.error) {
    console.log('授权失败:', token.error_description);
    process.exit(1);
  }

  console.log('授权成功！正在创建仓库...');

  // Step 3: 创建仓库
  const repo = await post('api.github.com', '/user/repos', {
    name: 'sd-album',
    description: 'SD 相册 - 员工照片查询',
    private: false,
    auto_init: false
  }, {
    'Authorization': `Bearer ${token.access_token}`,
    'User-Agent': 'sd-album-deploy'
  });

  console.log(`仓库已创建: ${repo.html_url}`);

  // 保存 token 供后续使用
  console.log(`\nGITHUB_TOKEN=${token.access_token}`);
  console.log(`REPO_URL=https://github.com/${repo.full_name}.git`);
}
main();
