// 自动生成 - SD相册员工数据
const users = [];

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
