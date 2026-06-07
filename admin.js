// SD 相册管理后台
const ADMIN_PWD = 'sd2026';
const REPO_OWNER = 'linyangjiang39-debug';
const REPO_NAME = 'sd-album-9d12e';
const DATA_PATH = 'script.js';

let users = [];
let editingId = null;
let gitToken = null;

// ===== 初始化 =====
(function() {
  gitToken = localStorage.getItem('sd_admin_token');
  if (gitToken) {
    document.getElementById('tokenInput').value = gitToken;
    document.getElementById('pwdInput').value = ADMIN_PWD;
  }
  document.getElementById('photoInput').addEventListener('change', previewPhoto);
})();

// ===== 登录 =====
async function login() {
  const pwd = document.getElementById('pwdInput').value.trim();
  const token = document.getElementById('tokenInput').value.trim();
  if (pwd !== ADMIN_PWD) {
    showStatus('密码错误', 'error');
    return;
  }
  if (!token) {
    showStatus('请填写 GitHub Token', 'error');
    return;
  }
  gitToken = token;
  localStorage.setItem('sd_admin_token', token);
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('adminPage').classList.remove('hidden');
  await loadData();
}

function logout() {
  document.getElementById('adminPage').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
  editingId = null;
}

// ===== 数据读写 =====
async function loadData() {
  try {
    const resp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`,
      { headers: { Authorization: `token ${gitToken}` } }
    );
    if (resp.status === 401) {
      showStatus('Token 无效或已过期，请重新创建', 'error');
      return;
    }
    if (resp.status === 404) {
      showStatus('仓库或文件不存在，请联系管理员', 'error');
      return;
    }
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const content = atob(data.content);
    const match = content.match(/const users = (\[[\s\S]*?\]);/);
    if (match) {
      users = eval(match[1]);
    }
    renderList();
    showStatus(`已加载 ${users.length} 名员工`, 'success');
  } catch(e) {
    showStatus('加载失败: ' + e.message + '，请检查网络后刷新重试', 'error');
  }
}

async function saveData() {
  try {
    // 生成新的 script.js 内容
    const usersStr = JSON.stringify(users, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/: "([^"]*?)"/g, (m, v) => v ? `: "${v}"` : ': ""');
    const newContent = `// 自动生成 - SD相册员工数据
const users = ${usersStr};

let currentUser = null;

function init() {
  showUsers(users);
  document.getElementById("jobInput").addEventListener("input", function() {
    filterUsers(this.value);
  });
}

function showUsers(list) {
  const photoGrid = document.getElementById("photoGrid");
  const photoTitle = document.getElementById("photoTitle");
  photoTitle.innerText = "全部员工（共 " + list.length + " 人）";
  photoGrid.innerHTML = "";

  if (list.length === 0) {
    photoTitle.innerText = "没有找到该工号";
    return;
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "600px" });

  list.forEach(function(user) {
    const card = document.createElement("div");
    card.className = "photo-card-item";

    const img = document.createElement("img");
    img.dataset.src = user.photo;
    img.alt = user.jobNo;
    img.onclick = function() {
      openViewer(user.photo);
    };

    const label = document.createElement("div");
    label.className = "photo-label";
    label.innerText = user.jobNo;

    card.appendChild(img);
    card.appendChild(label);
    card.onclick = function(e) {
      if (e.target.tagName !== "IMG") {
        selectUser(user);
      }
    };

    photoGrid.appendChild(card);
    observer.observe(img);
  });
}

function filterUsers(keyword) {
  const kw = keyword.trim();
  if (kw === "") { showUsers(users); return; }
  const matched = users.filter(function(user) {
    return user.jobNo.toLowerCase().indexOf(kw.toLowerCase()) !== -1;
  });
  showUsers(matched);
}

function selectUser(user) {
  currentUser = user;
  document.getElementById("photoTitle").innerText = "已选中：" + user.jobNo;
  document.getElementById("jobInput").value = user.jobNo;
}

function searchUser() {
  filterUsers(document.getElementById("jobInput").value);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(function() {
    alert("复制成功：" + text);
  }).catch(function() {
    alert("复制失败，请手动复制：" + text);
  });
}

function openViewer(photoUrl) {
  var v = document.getElementById("imageViewer");
  var fullUrl = photoUrl.replace("./images/", "./images_full/");
  document.getElementById("viewerImg").src = fullUrl;
  v.style.display = "flex";
}

function closeViewer() {
  var v = document.getElementById("imageViewer");
  v.style.display = "none";
  document.getElementById("viewerImg").src = "";
}

function toggleSchedule() {
  var body = document.getElementById("scheduleBody");
  var arrow = document.getElementById("scheduleArrow");
  if (body.style.display === "none") {
    body.style.display = "block";
    arrow.classList.add("open");
  } else {
    body.style.display = "none";
    arrow.classList.remove("open");
  }
}

init();
`;

    // 获取当前文件的 SHA
    const resp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`,
      { headers: { Authorization: `token ${gitToken}` } }
    );
    const info = await resp.json();

    // 提交更新
    const updateResp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${gitToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `更新员工数据 - ${new Date().toLocaleString()}`,
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: info.sha
        })
      }
    );

    if (updateResp.ok) {
      showStatus('保存成功！约30秒后生效', 'success');
    } else {
      throw new Error('保存失败');
    }
  } catch(e) {
    showStatus('保存失败: ' + e.message, 'error');
  }
}

// ===== 图片上传 =====
async function uploadImage(file, jobNo) {
  const base64 = await fileToBase64(file);
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `images/${jobNo}.${ext}`;
  const pathFull = `images_full/${jobNo}.${ext}`;

  // 上传压缩版
  const resp = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { headers: { Authorization: `token ${gitToken}` } }
  );
  let sha = null;
  if (resp.ok) {
    const info = await resp.json();
    sha = info.sha;
  }

  const body = {
    message: `上传照片 ${jobNo}`,
    content: base64.split(',')[1]
  };
  if (sha) body.sha = sha;

  await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: { Authorization: `token ${gitToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  // 上传高清版（同样的图）
  const resp2 = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pathFull}`,
    { headers: { Authorization: `token ${gitToken}` } }
  );
  sha = null;
  if (resp2.ok) {
    const info = await resp2.json();
    sha = info.sha;
  }
  const body2 = {
    message: `上传高清照片 ${jobNo}`,
    content: base64.split(',')[1]
  };
  if (sha) body2.sha = sha;
  await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pathFull}`,
    {
      method: 'PUT',
      headers: { Authorization: `token ${gitToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body2)
    }
  );

  return `./${path}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== 员工CRUD =====
function renderList() {
  const container = document.getElementById('employeeList');
  if (users.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#ccc;padding:20px;">暂无员工，请添加</div>';
    return;
  }
  container.innerHTML = users.map((u, i) => `
    <div class="employee-row">
      <img src="${u.photo}" class="photo-preview" style="width:50px;height:50px;" onerror="this.style.display='none'">
      <div class="employee-info">
        <div class="id">${u.jobNo}</div>
        <div class="detail">${u.wechat || '-'} / ${u.phone || '-'}</div>
      </div>
      <div class="employee-actions">
        <button class="btn-sm btn-primary" onclick="editEmployee(${i})">编辑</button>
        <button class="btn-sm btn-danger" onclick="deleteEmployee(${i})">删除</button>
      </div>
    </div>
  `).join('');
}

function editEmployee(index) {
  const u = users[index];
  document.getElementById('jobNoInput').value = u.jobNo;
  document.getElementById('wechatInput').value = u.wechat || '';
  document.getElementById('phoneInput').value = u.phone || '';
  document.getElementById('editId').value = index;
  document.getElementById('formTitle').innerText = '编辑员工';
  document.getElementById('saveBtn').innerText = '保存修改';
  document.getElementById('cancelBtn').classList.remove('hidden');
  editingId = index;
  window.scrollTo(0, document.body.scrollHeight);
}

function cancelEdit() {
  editingId = null;
  document.getElementById('jobNoInput').value = '';
  document.getElementById('wechatInput').value = '';
  document.getElementById('phoneInput').value = '';
  document.getElementById('photoInput').value = '';
  document.getElementById('editId').value = '';
  document.getElementById('formTitle').innerText = '添加员工';
  document.getElementById('saveBtn').innerText = '添加员工';
  document.getElementById('cancelBtn').classList.add('hidden');
  document.getElementById('photoPreview').classList.add('hidden');
}

async function saveEmployee() {
  const jobNo = document.getElementById('jobNoInput').value.trim();
  const wechat = document.getElementById('wechatInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();
  const photoFile = document.getElementById('photoInput').files[0];

  if (!jobNo) { showStatus('请输入工号', 'error'); return; }

  let photoUrl = '';
  if (editingId !== null) {
    photoUrl = users[editingId].photo;
  }

  if (photoFile) {
    showStatus('正在上传照片...', '');
    try {
      photoUrl = await uploadImage(photoFile, jobNo);
      showStatus('照片上传成功', 'success');
    } catch(e) {
      showStatus('照片上传失败', 'error');
      return;
    }
  }

  if (!photoUrl && !photoFile) {
    showStatus('请选择照片', 'error');
    return;
  }

  const employee = { jobNo, wechat, phone, photo: photoUrl };

  if (editingId !== null) {
    users[editingId] = employee;
  } else {
    // 检查重复
    if (users.find(u => u.jobNo === jobNo)) {
      showStatus('该工号已存在', 'error');
      return;
    }
    users.push(employee);
  }

  showStatus('正在保存...', '');
  await saveData();
  cancelEdit();
  renderList();
}

async function deleteEmployee(index) {
  if (!confirm(`确定删除工号 ${users[index].jobNo}？`)) return;
  users.splice(index, 1);
  showStatus('正在保存...', '');
  await saveData();
  renderList();
}

// ===== 工具 =====
function previewPhoto() {
  const file = document.getElementById('photoInput').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('photoPreview');
    preview.src = e.target.result;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function showStatus(msg, type) {
  const el = document.getElementById('statusMsg');
  el.innerText = msg;
  el.className = 'status ' + (type || '');
  el.classList.remove('hidden');
  if (type === 'success') {
    setTimeout(() => el.classList.add('hidden'), 2500);
  }
}
