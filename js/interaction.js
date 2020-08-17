// 弹出表单
$(".reportBtn").click(function () {
  // $(".report").css("display", "block");
  window.location.href = "./report.html";
})
// 关闭上报表单
$(".shutDown").click(function () {
  // $(".report").css("display", "none");
  window.location.href = "./index.html";
})
// 关闭登录弹窗
$(".logInShutDown").click(function () {
  $(".logIn").css("display", "none");
})
// $(".logInPopups").click(function () {
//   window.location.href = "./login.html?shutDown=1"
// })
// 上传图片
$(".reportPhoto").click(function () {
  $("#file1").click();
  var f = document.getElementById("file1");
  f.onchange = function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      $(".reportPhoto").attr("src", reader.result);
      $(".reportPhoto").css("width", "100px");
      var source = reader.result.split(",")[1];

      $.ajax({
        type: "POST",
        url: "http://api.hnst.top/image/upload",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          source
        },
        success: res => {
          console.log(res);
          alert(res.message);
          images = res.data.url;
        }
      })
    }
  }
})
// 放大
$(".zoomAdd").click(function () {
  map.zoomIn();
})
// 缩小
$(".zoomSub").click(function () {
  map.zoomOut();
})
// 相机
$(".camera").click(function () {
  plus.camera.getCamera().captureImage(p => {
    plus.io.resolveLocalFileSystemURL(p, function (entry) {
      // alert(p)
      //转化本地绝对路径
      // var str = JSON.stringify(entry) ;
      // alert(str);
      console.log(entry);
      var urlHope = plus.io.convertLocalFileSystemURL(p);
      alert(urlHope);
      // $("#imgTest").attr("src",urlHope);
      // if (testJson.imgList.length < 5) {
      //   appendFile(urlHope);
      // }

      // plus.io.resolveLocalFileSystemURL(p, function (entry) {
      //   compressImage(entry.toLocalURL(), entry.name);
      // }, function (e) {
      //   plus.nativeUI.toast("读取拍照文件错误：" + e.message);
      // });
    }, err => {
      console.log(JSON.stringify(err));
    });
  }, {
    filename: "_doc/camera/"
  })
})
// 回到位置
$(".backPosition").click(function () {
  map.addOverLay(marker);
  map.centerAndZoom(new T.LngLat(lng, lat), zoom);
})
// 跳转到我的
$(".mine").click(function () {
  window.location.href = "./mine.html"
})
// 刷新
$(".refresh").click(function () {
  window.location.reload();
})


// 资源类目显示
var heatmapOverlay;

