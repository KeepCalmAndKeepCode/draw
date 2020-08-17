// 返回
$(".return").click(function () {
  window.location.href = "./index.html";
})
// 清除缓存
$(".clearCache").click(function () {
  var whether = confirm("此操作将重新登录并清除所有已记录的地块和轨迹，是否继续？");
  if (whether) {
    window.localStorage.clear();
    window.location.href = "./login.html";
  }
})
// 获取用户信息
var userInfo = JSON.parse(localStorage.getItem("userInfo"));
$("#nickname").html(userInfo.nickname);
$.ajax({
  type: "get",
  url: "http://kaizhou.1352.site.veeteam.com/home/get_image/" + JSON.parse(localStorage.getItem("userInfo")).user_id,
  headers: {
    "token": JSON.parse(localStorage.getItem("userInfo")).token
  },
  // data:{
  //   user_id: 
  // },
  success: function (res) {
    if (res.code == 1007) {
      alert(res.message);
      window.location.href = "./login.html";
      return
    }
    $(".avatar").attr("src", res.data.image || "./img/defaultAvatar.png");
  }
})
// 关于我们
$(".aboutUs").click(function () {
  layui.use('layer', function () {
    var layer = layui.layer;

    layer.open({
      title:"关于我们",
      type: 1,
      content: '<p>　　本应用隶属《开州区农业大数据一张图》项目，用于上报和收集各涉农信息。开州区农业大数据一张图由重庆市开州区农委牵头，北京农信通科技有限责任公司实施建设，如在使用过程中由任何疑问请联系客服小薇的QQ：2783215959 或电话17051004096进行反馈。感谢您的使用！</p>',
      area: '80%',
      shadeClose: true
    });
  });
})
// 个人中心
$(".personalCenter").click(function () {
  window.location.href = "personalCenter.html"
})
// 我的记录
$(".myRecord").click(function () {
  window.location.href = "myRecord.html"
})
// 云端照片
$(".cloudPhotos").click(function () {
  window.location.href = "cloudPhotos.html"
})
// 轨迹
$(".track").click(function () {
  window.location.href = "track.html"
})
// 分享
$(".shareIt").click(function(){
  layui.use('layer', function () {
    var layer = layui.layer;

    layer.open({
      title:"分享",
      type: 1,
      content: '<img src="./img/AppQrcode.png" style="width:100%">',
      area: '50%',
      shadeClose: true
    });
  });
})
// 版本更新
$(".newVersionUpdate").click(function () {
  $.ajax({
    url:"http://app.156.site.veeteam.com/index.php/api/app_history?appid=122",
    success: function(res) {
      console.log(res);
      var localVersion = localStorage.getItem("localVersion");
      var serverVersion = res.data.history[0].app_version;
      if(localVersion != serverVersion && localVersion != null){
        var whetherToUpdate = confirm("检查到新版本，是否更新？")
        if (whetherToUpdate){
          localStorage.setItem("localVersion" , serverVersion);
          window.location.href = res.data.history[0].download_url;
        }
      } else {
        alert("当前版本已是最新版本");
      }
    }
  })
})
// 退出登录
$(".signOut").click(function () {
  var whether = confirm("此操作将重新登录并清除您的个人信息，是否继续？");
  if (whether) {
    window.localStorage.removeItem("userInfo");
    window.location.href = "login.html"
  }
})
