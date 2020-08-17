var map, zoom = 8, polygonTool, config, geocode, lng, lat, handler, marker, lineTool, markerTool, images, lng_latArea, lng_latLine, lng_latPoint, area, tracklength;
//初始化地图对象
map = new T.Map("mapDiv");
; (function () {
  if (!localStorage.getItem("userInfo")) {
    window.location.href = "./login.html";
    return
  }
})()

function onLoad() {
  //创建对象
  var controls = new T.Control.MapType();
  //添加控件
  map.addControl(controls);

  //允许鼠标双击放大地图
  map.enableScrollWheelZoom();
  config = {
    showLabel: true,
    color: "blue",
    weight: 3,
    opacity: 0.5,
    fillColor: "#FFFFFF",
    fillOpacity: 0.5
  };
  //创建标注工具对象
  polygonTool = new T.PolygonTool(map, config);
  lineTool = new T.PolylineTool(map, config);

  //创建标注工具对象
  markerTool = new T.MarkTool(map, {
    follow: true
  });
  getCoordinatePoints();

  // 面的监听事件
  polygonTool.addEventListener("draw", function (e) {
    lng_latArea = e.currentLnglats;
    area = (e.currentArea / 1000000).toFixed(3);
    $(".save").css("visibility","inherit");
    // polygonTool.clear();
    map.clearOverLays();
    var points = [];
    for (var i = 0; i < e.currentLnglats.length; i++) {
      points.push(new T.LngLat(e.currentLnglats[i].lng, e.currentLnglats[i].lat));
    }
    var polygon = new T.Polygon(points, {
      color: "blue", weight: 3, opacity: 0.5, fillColor: "#FFFFFF", fillOpacity: 0.5
    });
    map.addOverLay(polygon);
    // polygon.isEditable(true);
    polygon.enableEdit();
  });
  // 折线的监听事件
  lineTool.addEventListener("draw", function (e) {
    lng_latLine = e.currentLnglats;
    tracklength = Number(e.currentDistance).toFixed(3);
    // var line;
    // var points = [];
    // for (var i = 0;i < lng_latLine.length; i++){
    //   points.push(new T.LngLat(lng_latLine[i].lng, lng_latLine[i].lat));
    // }
    // console.log(points);

    // line = new T.Polyline(points)
    // var points = [];
    // points.push(new T.LngLat(116.41239, 39.97569));
    // points.push(new T.LngLat(116.412799, 39.9068));
    // points.push(new T.LngLat(116.32970, 39.92940));
    // points.push(new T.LngLat(116.385440, 39.90610));
    // //创建线对象
    // line = new T.Polyline(points);
    // //向地图上添加线
    // map.addOverLay(line);
    // line.enableEdit();

    // line.enableEdit();
  })
  // 点的监听事件
  polygonTool.addEventListener("addpoint", function (e) {
    lng_latPoint = e.currentLnglats;
    // area = (e.currentArea / 1000000).toFixed(3);
  });

  // 获取地块绘面
  getPlotPlot();

  // 获取更新
  $.ajax({
    url: "http://app.156.site.veeteam.com/index.php/api/app_history?appid=122",
    success: function (res) {
      // 首次安装app时 localVersion 为 null
      // 往后登录APP时 localVersion 被设置为最新版本
      // 检查本地版本
      var localVersion = localStorage.getItem("localVersion");
      var serverVersion = res.data.history[0].app_version;

      // 本地版本 与服务器版本不同 并且不是首次安装时 跳转下载页面
      if (localVersion != serverVersion && localVersion != null) {
        var whetherToUpdate = confirm("检查到新版本，是否更新？");
        if (whetherToUpdate) {
          localStorage.setItem("localVersion", serverVersion);
          window.location.href = res.data.history[0].download_url;
        }
        return;
      }

      // 初次安装应用时，设置现在的版本
      if (localVersion == null) {
        localStorage.setItem("localVersion", serverVersion);
      }
    }
  })
}
// 获取地块绘面
function getPlotPlot() {
  $.ajax({
    type: "get",
    url: "http://kaizhou.1352.site.veeteam.com/home/lon_lat_info",
    headers: {
      "token": JSON.parse(localStorage.getItem("userInfo")).token
    },
    success: function (res) {
      if (res.code == 1007) {
        alert(res.message);
        window.location.href = "./login.html";
        return;
      }

      for (var itemOut of res.data) {
        let points = []; // 坐标合集
        for (var itemInner of JSON.parse(itemOut.lozenges_longitude_latitude)) {
          points.push(new T.LngLat(itemInner.lng, itemInner.lat));
        }
        if (points.length == 1) {
          let marker = new T.Marker(new T.LngLat(points[0].lng, points[0].lat));
          map.addOverLay(marker);
          let label = new T.Label({
            text: itemOut.lon_lat_name,
            position: new T.LngLat(points[0].lng, points[0].lat),
            offset: new T.Point(-10, -40)
          })
          map.addOverLay(label);
        } else {
          let polygon = new T.Polygon(points, {
            color: "blue",
            weight: 3,
            opacity: 0.5,
            fillColor: "#FFFFFF",
            fillOpacity: 0.5
          });
          map.addOverLay(polygon);
          if (itemOut.lon_lat_name) {
            let label = new T.Label({
              text: `${itemOut.lon_lat_name}<br>${itemOut.area}平方千米`,
              position: new T.LngLat(getCenterOfGravityPoint(points)[1], getCenterOfGravityPoint(points)[0]),
              offset: new T.Point(-40, 0)
            })
            map.addOverLay(label);
          }

        }
      }
    }
  })
}
// 获取不规则多边形重心点 
function getCenterOfGravityPoint(points) {
  var area = 0;
  var Gx = 0,
    Gy = 0;

  for (var i = 1; i < points.length; i++) {
    let iLat = points[i % points.length].lat;
    let iLng = points[i % points.length].lng;
    let nextLat = points[i - 1].lat;
    let nextLng = points[i - 1].lng;
    let temp = (iLat * nextLat - iLng * nextLng) / 2;
    area += temp;
    Gx += temp * (iLat + nextLat) / 2;
    Gy += temp * (iLng + nextLng) / 2;
  }
  Gx = Gx / area;
  Gy = Gy / area;
  return [Gx, Gy];
}
var icon = new T.Icon({
  iconUrl: "./img/positioning3.gif",
  iconSize: new T.Point(25, 35),
  iconAnchor: new T.Point(4, 20)
});
// 获取当前位置坐标点
function getCoordinatePoints() {
  if (!navigator.geolocation) {
    alert("您的设备不支持地理位置");
    return;
  }
  navigator.geolocation.getCurrentPosition(function (position) {
    lng = position.coords.longitude;
    lat = position.coords.latitude;
    // var coordinatePointSetArr = [];
    // coordinatePointSetArr.push([lng, lat]);
    // alert(coordinatePointSetArr);
    // $("#coordinatePointSet").html(coordinatePointSetArr.join("-"));
    $("#coordinate").html(`经度:${lng} 纬度${lat}`);
    //设置显示地图的中心点和级别
    // map.centerAndZoom(new T.LngLat(lng, lat), 10);
    map.centerAndZoom(new T.LngLat(108.399496,31.167385), 10);
    
    // 添加自定义图层 start
    var imageURL = "http://t0.tianditu.gov.cn/img_w/wmts?" +
      "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
      "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=24a91c78b8442853b9c43daf94bf4479";
    //创建自定义图层对象
    var lay = new T.TileLayer(imageURL, {
      minZoom: 1,
      maxZoom: 18
    });
    //将图层增加到地图上
    map.addLayer(lay);

    // 添加自定义图层 start
    var imageURL1 = "http://t0.tianditu.gov.cn/cia_w/wmts?" +
      "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
      "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=24a91c78b8442853b9c43daf94bf4479";
    //创建自定义图层对象
    var lay1 = new T.TileLayer(imageURL1, {
      minZoom: 1,
      maxZoom: 18
    });
    //将图层增加到地图上
    map.addLayer(lay1);


    marker = new T.Marker(new T.LngLat(lng, lat), {
      icon
    }); // 创建标注
    map.addOverLay(marker);

    geocode = new T.Geocoder();
    geocode.getLocation(new T.LngLat(lng, lat), function (result) {
      $("#address").val(result.result.result.formatted_address);
      $(".addressTop").html(result.result.result.formatted_address);
    })
  }, function (err) {
    alert("您的设备不支持地理位置");
  })
}
// 清除所有
function clearAll() {
  try {
    // polygonTool.clear();
    // lineTool.clear();
    map.clearOverLays();
  } catch (err) {
    console.log(err);
  } finally {
    map.addOverLay(marker);
  }
}
// 点击事件
// 绘制地块
var plotPlotStatus = "action";
$(".draw").click(function () {
  if (plotPlotStatus == "action") {
    plotPlotStatus = "stop";
    $(this).text("停止绘制");
    map.clearOverLays();
    polygonTool.open();
    endeditMarker();
    markerTool.open();
    return
  };
  if(plotPlotStatus == "stop"){
    polygonTool.endDraw();
  }
  
})
// 保存
var pointsEndEdit = [];
$(".save").click(function () {
  console.log(map.getOverlays());
  // for(let i = 0;i < map.getOverlays().length;i++){
  //   if(map.getOverlays().or){

  //   }
  // }

  // 编辑后的点的坐标数组
  var editArr = map.getOverlays()[0].ht[0];
  var newEditArr = []; // 声明新数组用以处理编辑后的坐标点
  var newEditAreaArr = []; // 用以获取面积
  for (let item of editArr) {
    newEditArr.push({
      lat:item.lat,
      lng:item.lng
    });
    newEditAreaArr.push(new T.LngLat(item.lng, item.lat));
  }
  var editArea = (polygonTool.getArea(newEditAreaArr) / 1000000).toFixed(3);
  var defaultLotName = JSON.parse(localStorage.getItem("userInfo")).nickname + "的" + (Math.floor(Math.random() * (9999 - 1000)) + 1000) + "地块";
  var lotName = prompt("请输入地块名", defaultLotName);
  if (lotName) {
    var track = [];
    newEditArr.forEach((currentValue, index, arr) => {
      geocode.getLocation(new T.LngLat(currentValue.lng, currentValue.lat), result => {
        track.push(result.formatted_address);
        if (track.length == arr.length) {
          var lotdata = {
            lotName,
            lng_lat: newEditArr || lng_latPoint,
            area: editArea || "",
            track
          }
          localStorage.setItem("lotName" + new Date().getTime(), JSON.stringify(lotdata));
        }
      })
    })
  }
})
// var plotPlotStatus = "action";
// $(".draw").click(function () {
//   // lineTool = new T.PolylineTool(map, config);
//   // 点击开始标注
//   if (plotPlotStatus == "action") {
//     plotPlotStatus = "stop";
//     $(this).text("停止标注");
//     // $(".reset").css("display", "flex");
//     polygonTool.open();
//     endeditMarker();
//     markerTool.open();
//     return
//   }
//   // 点击停止标注
//   if (plotPlotStatus == "stop") {
//     plotPlotStatus = "action";
//     // $(".reset").css("display", "none");
//     $(this).text("绘制地块");
//     polygonTool.endDraw();

// 默认地块名(昵称 + 随机四位数) 
// var defaultLotName = JSON.parse(localStorage.getItem("userInfo")).nickname + "的" + (Math.floor(Math.random() * (9999 - 1000)) + 1000) + "地块";
// var lotName = prompt("请输入地块名", defaultLotName);
// if (lotName) {
//   var track = [];
//   // var trackPromise = [];
//   // for(let item of lng_lat){
//   //   console.log(item);
//   //   geocode.getLocation(new T.LngLat(item.lng, item.lat), function (result) {
//   //     console.log(result.addressComponent.address);
//   //     track.push(result.addressComponent.address);
//   //   })
//   // }
//   lng_latArea.forEach((currentValue, index, arr) => {
//     geocode.getLocation(new T.LngLat(currentValue.lng, currentValue.lat), result => {
//       track.push(result.formatted_address);
//       if (track.length == arr.length) {
//         var lotdata = {
//           lotName,
//           lng_lat: lng_latArea || lng_latPoint,
//           area: area || "",
//           track
//         }
//         localStorage.setItem("lotName" + new Date().getTime(), JSON.stringify(lotdata));
//       }
//     })
//   })
// }
// }
// })
// 绘制轨迹
var trajectoryStatus = "action";
$(".trajectory").click(function () {
  if (trajectoryStatus == "action") {
    trajectoryStatus = "stop";
    $(this).text("停止绘制");
    lineTool.open();
    return
  }
  if (trajectoryStatus == "stop") {
    trajectoryStatus = "action";
    $(this).text("绘制轨迹");
    lineTool.endDraw();
    // 默认轨迹名(昵称 + 随机四位数) 
    var defaultTrackName = JSON.parse(localStorage.getItem("userInfo")).nickname + "的" + (Math.floor(Math.random() * (9999 - 1000)) + 1000) + "轨迹";
    var trackName = prompt("请输入轨迹名", defaultTrackName);
    if (trackName) {
      var track = [];
      lng_latLine.forEach((currentValue, index, arr) => {
        geocode.getLocation(new T.LngLat(currentValue.lng, currentValue.lat), result => {
          track.push(result.formatted_address);
          if (track.length == arr.length) {
            var trackdata = {
              trackName,
              lng_lat: lng_latLine || lng_latPoint,
              tracklength: tracklength || "",
              track
            }
            localStorage.setItem("trackName" + new Date().getTime(), JSON.stringify(trackdata));
          }
        })
      })
    }
  }
})
// 重置
$(".reset").click(function () {
  plotPlotStatus = "action";
  trajectoryStatus = "action";
  $(".draw").text("绘制地块");
  $(".trajectory").text("绘制轨迹");
  polygonTool.endDraw();
  lineTool.endDraw();
  clearAll();
})
// 添加标注点
function editMarker() {
  var markers = markerTool.getMarkers();
  for (var i = 0; i < markers.length; i++) {
    markers[i].enableDragging();
  }
}
// 删除标注点
function endeditMarker() {
  var markers = markerTool.getMarkers()
  for (var i = 0; i < markers.length; i++) {
    markers[i].disableDragging();
  }
}
// 多级标签
var vueObj = new Vue({
  el: "#resourceCategory",
  data: {
    resourceCategory: [],
    businessEntity: [],
    index: 0,
    num: 0,
    isActiveLeft: true,
    isActiveRight: false,
    zoomLevel: 13,

    currentType: "",
    currentId: ""
  },
  mounted() {
    this.getResourceType(2, 0);
    this.getBusinessEntity(1, 0);
    this.mapZoomMonitoring();
  },
  methods: {
    // 选项卡切换
    tabSwitching(num) {
      this.index = num;
    },
    // 选项卡抽屉
    drawer() {
      var tabWidthrIn = "-" + $(".resourceCategory").outerWidth() + "px";
      // var tabWidthrOut = $(".resourceCategory").outerWidth() + "px";
      if (this.isActiveLeft) {
        this.isActiveLeft = false;
        this.isActiveRight = true;
        $(".resourceCategory").css({
          'right': "2%",
          '-webkit-transition-duration': '.5s',
          'transition-duration': '.5s'
        })
        return
      } else {
        this.isActiveLeft = true;
        this.isActiveRight = false;
        $(".resourceCategory").css({
          'right': tabWidthrIn,
          '-webkit-transition-duration': '.5s',
          'transition-duration': '.5s'
        })
        return
      }
    },

    // 天地图地图缩放监听
    mapZoomMonitoring() {
      map.addEventListener("zoomend", e => {
        if (this.currentId) {
          this.getHeatmapsMassivePlots(this.currentType, this.currentId);
        }
      })
    },
    // 获取热力图、海量点、地块
    getHeatmapsMassivePlots(type, id) {
      // 传入的type和id
      this.currentType = type;
      this.currentId = id;
      // 避免多次请求接口
      // 缩放级别小于10 不请求接口
      // ！！！
      if (map.getZoom() == 10) {
        // alert("小于10：" + map.getZoom());
      } else {
        // alert("大于等于10：" + map.getZoom());
        this.pointHeatMapData(type, id);
      }

      if (map.getZoom() == 13) {
        this.zoomLevel = map.getZoom();
        getPlotPlot();
      }
    },
    // 获取资源类型以及子类型
    getResourceType(type, resourceTypeId) {
      $.ajax({
        url: "http://kaizhou.1352.site.veeteam.com/home/app_main_label/" + resourceTypeId,
        success: res => {
          if (resourceTypeId == 0){
            this.resourceCategory = res.data;
          } else {
            for (let index = 0;index < this.resourceCategory.length;index++){
              if(this.resourceCategory[index].id == resourceTypeId){
                console.log(this.resourceCategory[index]);
                this.resourceCategory[index].subCategory = res.data;
                let newResourceCategory = this.resourceCategory;
                this.resourceCategory = [];
                this.resourceCategory = newResourceCategory;
              }
            }
          }
        }
      })
    },
    // 获取经营主体以及子主体
    getBusinessEntity(type, businessEntityID) {
      $.ajax({
        url: "http://kaizhou.1352.site.veeteam.com/home/app_management_body/" + businessEntityID,
        success: res => {
          if (businessEntityID == 0) {
            this.businessEntity = res.data;
          } else {
            for (let index = 0; index < this.businessEntity.length; index++) {
              if (this.businessEntity[index].id == businessEntityID) {
                console.log(this.businessEntity[index]);
                this.businessEntity[index].subCategory = res.data;
                let newBusinessEntity = this.businessEntity;
                this.businessEntity = [];
                this.businessEntity = newBusinessEntity;
              }
            }
          }
        }
      })
    },
    // 获取点数据或热力图数据
    pointHeatMapData(type, id) {
      // 传入的type和id
      this.currentType = type;
      this.currentId = id;
      
      // type == 1 获取子经营主体
      // type == 2 获取子资源类型
      if (type == 1){
        this.getBusinessEntity(type, id); // 获取子经营主体
      } else {
        this.getResourceType(type, id); // 获取子资源类型
      }
      this.zoomLevel = map.getZoom();
      this.getHeatMap(type, id);
      if (map.getZoom() > 13) {
        getPlotPlot();
      }
    },
    // 获取热力图
    getHeatMap(type, id) {
      let heatmapOverlay;
      $.ajax({
        type: "post",
        url: "http://kaizhou.1352.site.veeteam.com/home/relitu",
        data: {
          type,
          id
        },
        success: res => {
          if (res.code == 1001) {
            alert(res.message);
            return
          }
          // map.centerAndZoom(new T.LngLat(map.getCenter().lng, map.getCenter().lat),map.getZoom());
          // map.centerAndZoom(new T.LngLat(lng, lat), map.getZoom());
          map.clearOverLays();
          var data = res.data;
          if (!isSupportCanvas()) {
            alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~');
          }

          if (this.zoomLevel > 10) {
            var massivePoints = []; // 海量点
            for (let i = 0; i < data.length; i++) {
              // var point = new T.LngLat(data[i].lnglat[0], data[i].lnglat[1]);
              // var marker = new T.Marker(point);// 创建标注
              // map.addOverLay(marker);

              massivePoints.push(new T.LngLat(data[i].lnglat[0], data[i].lnglat[1]));
            }
            var _CloudCollection = new T.CloudMarkerCollection(massivePoints, {
              color: 'dodgerblue',
              SizeType: TDT_POINT_SIZE_SMALL
            });
            map.addOverLay(_CloudCollection);
            return
          }
          // map.centerAndZoom(new T.LngLat(108.399496,31.167385), map.getZoom());
          map.panBy([-1,-1]); // 注意：这里挪动一下地图为了让热力图归位 
          var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
              var geoCoord = data[i].lnglat;
              if (geoCoord) {
                res.push({
                  // name: data[i].name,
                  lat: geoCoord[1],
                  lng: geoCoord[0],
                  count: data[i].value
                });
              }
            }
            return res;
          };
          var points = convertData(data);

          //详细的参数,可以查看heatmap.js的文档 https://github.com/pa7/heatmap.js/blob/master/README.md
          //参数说明如下:
          /* visible 热力图是否显示,默认为true
           * opacity 热力的透明度,1-100
           * radius 势力图的每个点的半径大小
           * gradient  {JSON} 热力图的渐变区间 . gradient如下所示
           *	{
           .2:'rgb(0, 255, 255)',
           .5:'rgb(0, 110, 255)',
           .8:'rgb(100, 0, 255)'
           }
           value 为颜色值.
           */
          heatmapOverlay = new T.HeatmapOverlay({
            "radius": 30,

          });
          map.addOverLay(heatmapOverlay);
          heatmapOverlay.setDataSet({ data: points, max: 300 });

          function isSupportCanvas() {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
          }
        }
      })
    },
    // 获取经营主体子类目
    // getBusinessSubjectSubcategory() {

    // },
    // 双指缩放事件监听
    // twofingerZoom() {
    //   function setGesture(el) {
    //     var obj = {}; //定义一个对象
    //     var istouch = false;
    //     var start = [];
    //     el.addEventListener("touchstart", function (e) {
    //       if (e.touches.length >= 2) {  //判断是否有两个点在屏幕上
    //         istouch = true;
    //         start = e.touches;  //得到第一组两个点
    //         obj.gesturestart && obj.gesturestart.call(el); //执行gesturestart方法
    //       };
    //     }, false);
    //     document.addEventListener("touchmove", function (e) {
    //       e.preventDefault();
    //       if (e.touches.length >= 2 && istouch) {
    //         var now = e.touches;  //得到第二组两个点
    //         var scale = getDistance(now[0], now[1]) / getDistance(start[0], start[1]); //得到缩放比例，getDistance是勾股定理的一个方法
    //         var rotation = getAngle(now[0], now[1]) - getAngle(start[0], start[1]);  //得到旋转角度，getAngle是得到夹角的一个方法
    //         e.scale = scale.toFixed(2);
    //         e.rotation = rotation.toFixed(2);
    //         obj.gesturemove && obj.gesturemove.call(el, e);  //执行gesturemove方法
    //       };
    //     }, false);
    //     document.addEventListener("touchend", function (e) {
    //       if (istouch) {
    //         istouch = false;
    //         obj.gestureend && obj.gestureend.call(el);  //执行gestureend方法
    //       };
    //     }, false);
    //     return obj;
    //   };
    //   function getDistance(p1, p2) {
    //     var x = p2.pageX - p1.pageX,
    //       y = p2.pageY - p1.pageY;
    //     return Math.sqrt((x * x) + (y * y));
    //   };
    //   function getAngle(p1, p2) {
    //     var x = p1.pageX - p2.pageX,
    //       y = p1.pageY - p2.pageY;
    //     return Math.atan2(y, x) * 180 / Math.PI;
    //   };
    //   var that = this;
    //   var box = document.querySelector("#mapDiv");
    //   var boxGesture = setGesture(box);  //得到一个对象
    //   boxGesture.gesturestart = function () {  //双指开始
    //     // box.style.backgroundColor = "yellow";
    //   };
    //   boxGesture.gesturemove = function (e) {  //双指移动
    //     // box.innerHTML = e.scale + "<br />" + e.rotation;
    //     // box.style.transform = "scale(" + e.scale + ") rotate(" + e.rotation + "deg)";//改变目标元素的大小和角度
    //   };
    //   boxGesture.gestureend = function () {  //双指结束
    //     // box.innerHTML = "";
    //     // box.style.cssText = "background-color:red";
    //     // alert(map.getZoom());
    //     if(that.currentId){
    //       that.getHeatmapsMassivePlots();
    //     }
    //   };
    // },
  }
})
