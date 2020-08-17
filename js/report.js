var images = [];
var videoUrl = "";
// 获取localStorage缓存并且加入下拉列表的方法
function getLocalStorageDropdownList() {
  var len = localStorage.length;  // 获取长度
  var arr = []; // 定义数据集
  for (var i = 0; i < len; i++) {
    // 获取key 索引从0开始
    var getKey = localStorage.key(i);
    if (getKey.indexOf("lotName") != -1) {
      // 获取key对应的值
      var getVal = JSON.parse(localStorage.getItem(getKey)).lotName;
      // 放进数组
      arr.push({
        'key': getKey,
        'val': getVal
      })
    }
  }
  var reportPlotItem = `<option value="">选择上报地块：</option>`;
  for (var item of arr) {
    reportPlotItem += `<option value="${item.val}">${item.val}</option>`
  }
  $("#reportPlot").html(reportPlotItem);
}
getLocalStorageDropdownList();


// 上传图片
$(".reportPhoto").click(function () {
  $("#file1").click();
  var f = document.getElementById("file1");
  f.onchange = function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    // 图片压缩
    reader.onload = function () {
      console.log(this.result);
      lrz($('#file1')[0].files[0], //通过id获取file
        { width: 400 } //压缩配置，具体还有哪些参数下文解释
      ).then(function (rst) {
        // 压缩处理成功会执行
        console.log(rst.base64.split(",")[1]);
        var form = new FormData(document.getElementById("addForm"));//包装form为FormData对象，相当于form表单提交数据
        form.set('file', rst.file);//重要！用压缩的图片file对象替换表单file原始对象
        $.ajax({  //ajax上传
          url: "http://api.hnst.top/image/upload",
          type: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            source: rst.base64.split(",")[1],
          },
          success: function (res) {
            console.log(res);
            if (res.status == 0) {
              $(".pictureContainer").append(`<img src="${res.data.url}">`);
              images.push(res.data.url);
            } else {
              alert(res.message);
            }
          },
          error: function (e) {
            alert("错误！！");
          }
        })
      }).catch(function (err) {
        // 处理失败会执行
        alert("压缩失败!");
      }).always(function () {
        // 不管是成功失败，都会执行
      });

      // var source = reader.result.split(",")[1];
      // $.ajax({
      //   type: "POST",
      //   url: "http://api.hnst.top/image/upload",
      //   headers: {
      //     "Content-Type": "application/x-www-form-urlencoded"
      //   },
      //   data: {
      //     source
      //   },
      //   success: res => {
      //     if (res.status == 0) {
      //       $(".pictureContainer").append(`<img src="${res.data.url}">`);
      //       images.push(res.data.url);
      //     } else {
      //       alert(res.message);
      //     }
      //   }
      // })
    }
  }
})
// 上传视频
$(".reportVideo").click(function () {
  $("#file2").click();
  document.getElementById("file2").onchange = function () {
    // console.log(this.files[0]);
    // if (this.files[0].size > 550000) {
    //   alert("视频大小超过限制");
    //   return
    // }

    var fileObj = document.getElementById("file2").files[0]; // js 获取文件对象
    // console.log(fileObj);
    var formFile = new FormData();
    formFile.append("action", "UploadVMKImagePath");
    formFile.append("file", fileObj); //加入文件对象
    var data = formFile;
    // console.log(data);
    $.ajax({
      type: "POST",
      url: "http://kaizhou.1352.site.veeteam.com/home/upload_video",
      // headers: {
      //   "Content-Type": "application/x-www-form-urlencoded"
      // },
      data,
      enctype: 'multipart/form-data',
      cache: false,//上传文件无需缓存
      processData: false,//用于对data参数进行序列化处理 这里必须false
      contentType: false,//必须
      success: res => {
        console.log(res);
        if(res.code == 1000){
          console.log(res);
          videoUrl = res.data.url;
          $(".videoContainer").append(`<video src="${videoUrl}" controls></video>`)
        }else{
          alert("上传失败，请重新上传");
        }
      }
    })
    // var reader = new FileReader();
    // reader.readAsDataURL(this.files[0]);
    // reader.onload = function () {
    //   console.log(this);

    //   $(".videoContainer").append(`<video src="${this.result}" controls></video>`)
    // }
  }
})
// $("#industry").change(function (e) {
//   $.ajax({
//     type: "get",
//     url: "http://kaizhou.1352.site.veeteam.com/home/two_categroy/" + this.value,
//     success: res => {
//       var mainBusinessItem = `<option value="">选择主营业务</option>`;
//       for (var item of res.data) {
//         mainBusinessItem += `<option value="${item.id}">${item.name}</option>`
//       }
//       $("#mainBusiness").html(mainBusinessItem);
//     }
//   })
// })

// 获取开州区
$.ajax({
  type: "POST",
  url: "http://api.hnst.top/district/town?pid=500154000000",
  success: res => {
    var townshipItem = `<option value="">所属乡镇：</option>`;
    for (var item of res.data) {
      townshipItem += `<option value="${item.town_id}">${item.town_name}</option>`
    }
    $("#township").html(townshipItem);
  }
})
$("#township").change(function (e) {
  $.ajax({
    type: "get",
    url: "http://api.hnst.top/district/village",
    data: {
      pid: this.value
    },
    success: res => {
      var communityItem = `<option value="">所属社区：</option>`;
      for (var item of res.data) {
        communityItem += `<option value="${item.village_id}">${item.village_name}</option>`
      }
      $("#community").html(communityItem);
    }
  })
})

// 关闭上报表单
$(".shutDown").click(function () {
  window.history.back(-1);
})
$(".back").click(function () {
  window.history.back(-1);
})

// 获取主体性质
function getTheNatureOfTheSubject(param) {
  $.ajax({
    type: "get",
    url: "http://kaizhou.1352.site.veeteam.com/home/app_management_body/" + param,
    success: res => {
      var htmlStr = `<option value="">选择单位性质</option>`;
      for (var item of res.data) {
        htmlStr += `<option value="${item.id}" id="">${item.name}</option>`
      }
      if (param !== 0) {
        $(".unitNatureSecondary").html(htmlStr);
      } else {
        $(".unitNature").html(htmlStr);
      }
    }
  })
}
getTheNatureOfTheSubject(0);

// 获取资源类型栏目
$.ajax({
  type: 'get',
  url: "http://kaizhou.1352.site.veeteam.com/home/app_main_label/0",
  success: res => {
    var htmlStr = "";
    for (var item of res.data) {
      htmlStr += `
        <div class="resourceTypeClick" data-typeId = "${item.id}">
          <input type="checkbox" name="mainlabel_id" title="${item.name}" value="${item.id}">${item.name}
          <div class="subResourceType"></div>
        </div>
      `
    }
    $(".resourceCheckbox").html(htmlStr);
  }
})
$(".resourceCheckbox").on("click",".resourceTypeClick",function(e){
  var typeid = $(this).data("typeid");
  if (e.target != e.currentTarget){//防止父元素覆盖资源的绑定事件操作
    return
  }
  $.ajax({
    url: "http://kaizhou.1352.site.veeteam.com/home/app_main_label/" + typeid,
    success: res => {
      console.log(res);
      var htmlStr = "";
      for (var item of res.data) {
        htmlStr += `
          <div>
            <input type="checkbox" name="mainlabel_id" title="${item.name}" value="${item.id}">${item.name}
          </div>
        `
      }
      $(this).find(".subResourceType").html(htmlStr);
    }
  })
})
// 下一页/上一页
var pageControl = 0;
$(".nextPage").click(function () {
  $(".remark").height($(".requiredField").height());
  if (pageControl == 0) {
    pageControl = 1;
    $(this).html("上一页");
    $(".remark").css("display", "block");
    $(".requiredField").css("display", "none");
  } else {
    pageControl = 0;
    $(this).html("下一页");
    $(".remark").css("display", "none");
    $(".requiredField").css("display", "block");
  }
})


// 种粮大户
// $("#largePro").on("click", function () {
//   alert(111);
//   // $(".formSwitching").html($("#largeProTpl").html());
//   // $("#largeProTpl").css("display","block");
// })
$(".unitNature").change(function (e) {
  switch (e.target.value) {
    case "":
      getTheNatureOfTheSubject(99);
      $(".formSwitching").html("");
      break;
    case "28":
      getTheNatureOfTheSubject(28);
      $(".formSwitching").html("");
      break;
    case "23":
      getTheNatureOfTheSubject(23);
      break;
    case "24":
      getTheNatureOfTheSubject(24);
      $(".formSwitching").html($("#largeGrainGrowers").html());
      break;
    case "26":
      getTheNatureOfTheSubject(26);
      $(".formSwitching").html($("#familyFarm").html());
      break;
    case "29":
      getTheNatureOfTheSubject(29);
      $(".formSwitching").html($("#largeBreeder").html());
      break;
    case "27":
      getTheNatureOfTheSubject(27);
      $(".formSwitching").html($("#farmersCooperatives").html());
      break;
    case "25":
      getTheNatureOfTheSubject(25);
      $(".formSwitching").html($("#leadingEnterprise").html());
      break;
    case "30":
      getTheNatureOfTheSubject(30);
      $(".formSwitching").html($("#bigAgriculturalMachinery").html());
      break;
  }
})

$(".unitNatureSecondary").change(function (e) {
  // 专业大户 （24种粮大户、29养殖大户、30农机大户）
  switch (e.target.value) {
    case "24":
      $(".formSwitching").html($("#largeGrainGrowers").html());
      break;
    case "29":
      $(".formSwitching").html($("#largeBreeder").html());
      break;
    case "30":
      $(".formSwitching").html($("#bigAgriculturalMachinery").html());
      break;
  }
})

// 表单操作事件监听（三品一标）
$("input[type=radio][name = threeProductsAndOneBid]").change(function (ev) {
  if (this.value == 0) {

  } else {

  }
})

// Array.prototype.remove = function (dx) {
//   if (isNaN(dx) || dx > this.length) {
//     return false;
//   }
//   for (var i = 0, n = 0; i < this.length; i++) {
//     if (this[i] != this[dx]) {
//       this[n++] = this[i];
//     }
//   }
//   this.length -= 1;
// };
// 上报
$(".reportSub").click(function () {
  // 资源类型栏目
  var mainlabel_idArr = [];
  $("input[type='checkbox']:checked").each(function (index, item) {
    mainlabel_idArr.push($(this).val());
  });

  var reportData = {};
  $.each($('form').serializeArray(), function (index, param) {
    if (!(param.name in reportData)) {
      reportData[param.name] = param.value;
    }
  });
  reportData.mainlabel_id = mainlabel_idArr;
  var user_id = JSON.parse(localStorage.getItem("userInfo")).user_id; // user_id 上传者id
  var lon_lat_name = $("#reportPlot").val();// lon_lat_name 地片儿名字 
  reportData.images = images; //图片网络地址
  var getVal;
  for (var i = 0; i < localStorage.length; i++) {
    // 获取key 索引从0开始
    var getKey = localStorage.key(i);
    if (getKey.indexOf("lotName") != -1 && JSON.parse(localStorage.getItem(getKey)).lotName == lon_lat_name) {
      // 获取key对应的值
      // if (JSON.parse(localStorage.getItem(getKey)).lotName == lon_lat_name) {
      // };
      getVal = JSON.parse(localStorage.getItem(getKey));
    }
  }

  reportData.user_id = user_id;
  reportData.lon_lat_name = lon_lat_name;
  reportData.area = getVal.area;
  reportData.lozenges_longitude_latitude = JSON.stringify(getVal.lng_lat);
  reportData.category_id = $("#businessCategory").ySelectedValues();   // 经营类目
  reportData.video = videoUrl;

  $.ajax({
    type: "post",
    url: "http://kaizhou.1352.site.veeteam.com/home/company_create",
    headers: {
      "token": JSON.parse(localStorage.getItem("userInfo")).token
    },
    data: reportData,
    success: res => {
      if (res.code == 1000) {
        alert("上报成功");
      } else {
        alert("所有信息不能为空！");
      }
    }
  })
})

// 所属类目
$.ajax({
  type: "get",
  url: "http://kaizhou.1352.site.veeteam.com/home/categroy",
  headers: {
    "token": JSON.parse(localStorage.getItem("userInfo")).token
  },
  success: res => {
    recursiveParsing(res.data);
    $('.businessCategory').ySelect({
      placeholder: '请选择经营类目',
      searchText: '搜索',
      showSearch: true,
      numDisplayed: 4,
      overflowText: '已选中 {n}项',
      isCheck: false
    }
    );
  }
})

function recursiveParsing(obj) {
  for (var item in obj) {
    // recursiveParsing(item);
    if (typeof obj[item] == 'object') {
      $(".businessCategory").append(`<option value="${obj[item].id}" data-level="${obj[item].level}">${obj[item].name}</option>`)
      recursiveParsing(obj[item].child);
    } else {
      return
    }
  }
}
