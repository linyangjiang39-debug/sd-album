// 自动生成 - SD相册员工数据
const users = [
  {
    jobNo: "111",
    wechat: "",
    phone: "",
    photo: "./images/111.webp"
  },
  {
    jobNo: "118",
    wechat: "",
    phone: "",
    photo: "./images/118.webp"
  },
  {
    jobNo: "138",
    wechat: "",
    phone: "",
    photo: "./images/138.webp"
  },
  {
    jobNo: "139",
    wechat: "",
    phone: "",
    photo: "./images/139.webp"
  },
  {
    jobNo: "155",
    wechat: "",
    phone: "",
    photo: "./images/155.webp"
  },
  {
    jobNo: "166",
    wechat: "",
    phone: "",
    photo: "./images/166.webp"
  },
  {
    jobNo: "168",
    wechat: "",
    phone: "",
    photo: "./images/168.webp"
  },
  {
    jobNo: "180",
    wechat: "",
    phone: "",
    photo: "./images/180.webp"
  },
  {
    jobNo: "188",
    wechat: "",
    phone: "",
    photo: "./images/188.webp"
  },
  {
    jobNo: "222",
    wechat: "",
    phone: "",
    photo: "./images/222.webp"
  },
  {
    jobNo: "520",
    wechat: "",
    phone: "",
    photo: "./images/520.webp"
  },
  {
    jobNo: "555",
    wechat: "",
    phone: "",
    photo: "./images/555.webp"
  },
  {
    jobNo: "600",
    wechat: "",
    phone: "",
    photo: "./images/600.webp"
  },
  {
    jobNo: "602",
    wechat: "",
    phone: "",
    photo: "./images/602.webp"
  },
  {
    jobNo: "603",
    wechat: "",
    phone: "",
    photo: "./images/603.webp"
  },
  {
    jobNo: "605",
    wechat: "",
    phone: "",
    photo: "./images/605.webp"
  },
  {
    jobNo: "606",
    wechat: "",
    phone: "",
    photo: "./images/606.webp"
  },
  {
    jobNo: "608",
    wechat: "",
    phone: "",
    photo: "./images/608.webp"
  },
  {
    jobNo: "609",
    wechat: "",
    phone: "",
    photo: "./images/609.webp"
  },
  {
    jobNo: "610",
    wechat: "",
    phone: "",
    photo: "./images/610.webp"
  },
  {
    jobNo: "611",
    wechat: "",
    phone: "",
    photo: "./images/611.webp"
  },
  {
    jobNo: "618",
    wechat: "",
    phone: "",
    photo: "./images/618.webp"
  },
  {
    jobNo: "626",
    wechat: "",
    phone: "",
    photo: "./images/626.webp"
  },
  {
    jobNo: "628",
    wechat: "",
    phone: "",
    photo: "./images/628.webp"
  },
  {
    jobNo: "633",
    wechat: "",
    phone: "",
    photo: "./images/633.webp"
  },
  {
    jobNo: "636",
    wechat: "",
    phone: "",
    photo: "./images/636.webp"
  },
  {
    jobNo: "655",
    wechat: "",
    phone: "",
    photo: "./images/655.webp"
  },
  {
    jobNo: "658",
    wechat: "",
    phone: "",
    photo: "./images/658.webp"
  },
  {
    jobNo: "660",
    wechat: "",
    phone: "",
    photo: "./images/660.webp"
  },
  {
    jobNo: "666",
    wechat: "",
    phone: "",
    photo: "./images/666.webp"
  },
  {
    jobNo: "668",
    wechat: "",
    phone: "",
    photo: "./images/668.webp"
  },
  {
    jobNo: "678",
    wechat: "",
    phone: "",
    photo: "./images/678.webp"
  }
];

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
