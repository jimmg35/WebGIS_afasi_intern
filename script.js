//script


//Variables
var mapInfo;
var imgUrl_1 = new Array();  //存放map_1影像的陣列(比較舊的)
var imgUrl_2 = new Array();  //存放map_2影像的陣列(比較新的)
var Time_1 = new Array();  //日期(舊)
var Time_2 = new Array();  //日期(新)
var scale = 30;
var map_1;
var map_2;
var initialExtent;

var mapParameter = {
    addLayer_1:function(url){},
    addLayer_2:function(url){},
};
var mapImageClear = {
    clearImg_1:function(){},
    clearImg_2:function(){},
};
var AllimgLayers_1 = new Array();
var AllimgLayers_2 = new Array();

var uu = "https://map.coa.gov.tw/html/b.html?sect=NA003607560001&ID5000=95213081&extent=200556.3931,2659626.165,200589.8462,2659764.7592";

var ppos = uu.indexOf("&extent=") + 8;
var eextent = uu.substring(ppos);
eextent = eextent.split(",",4);

eextent[0] = Number(eextent[0]) - 250; //xmin
eextent[1] = Number(eextent[1]) - 250;
eextent[2] = Number(eextent[2]) + 250;
eextent[3] = Number(eextent[3]) + 250;

eextent[0] = String(eextent[0]) - 250;
eextent[1] = String(eextent[1]) - 250;
eextent[2] = String(eextent[2]) - 250;
eextent[3] = String(eextent[3]) - 250;





var pos = uu.indexOf("sect=") + 5;
var pos2 = uu.indexOf("&");
var DuanHao = uu.substring(pos,pos2); //段號

var Gpos = uu.indexOf("&ID5000=") + 8;
var Gpos2 = uu.indexOf("&extent");
var TooFoo = uu.substring(Gpos,Gpos2);
var DuanHao_result;
var iEL = new Array();
require([
    "esri/map",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "esri/layers/WMSLayer",
    "esri/layers/WMSLayerInfo",
    "esri/layers/WMTSLayer",
    "esri/layers/WMTSLayerInfo",
    "dojo/on",
    "esri/tasks/GeometryService",
    "esri/layers/MapImageLayer",
    "esri/layers/MapImage",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/graphic",
], function (Map, Point, Extent, SpatialReference, WMSLayer, WMSLayerInfo,WMTSLayer,WMTSLayerInfo, on, GeometryService, MapImageLayer, MapImage,GraphicsLayer,SimpleMarkerSymbol,graphic) {
    //打撈資料
    var url = "https://map.coa.gov.tw/proxy/proxy.ashx?https://coagis.colife.org.tw/arcgis/rest/services/Factory/COA_FactoryImg/MapServer/exts/FactoryImg_SOE/GetASO_VersionInfo"
    $.ajax({
        url:url,
        type:"POST",
        async: false, //weird way to get global variable
        dataType:"json",
        data:{     
            FrameID:TooFoo,
            f:"json"
        },
        success: function(result){
            mapInfo = result;
        }
    });
    //console.log(mapInfo);

    for (var i = 0;i <mapInfo.FrameInfo.length;i++){
        var mapDict = mapInfo.FrameInfo[i];
        var Time = mapDict.Date;
        var year = Number(Time.substring(0,4));
        var month = Number(Time.substring(5,7));
        var day = Number(Time.substring(8,10));
        var mapName = String(mapDict.Name);                         //圖資名稱
        var mapNumPos = mapDict.Name.indexOf("_");
        var mapNum = String(mapDict.Name.substring(0,mapNumPos));   //這是段號
        var mapBbox = String(mapDict.bbox);       //這是BBOX
        var LatLon = new Array();   
        //計算寬高
        LatLon = mapBbox.split(",",4);
        LatLon[0] = Number(LatLon[0]) + 250; //Xmin
        LatLon[1] = Number(LatLon[1]) + 250; //Ymin
        LatLon[2] = Number(LatLon[2]) - 250; //Xmax
        LatLon[3] = Number(LatLon[3]) - 250; //Ymax
        
        var imgWidth = String(Math.round(LatLon[2] - LatLon[0]));
        var imgHeight = String(Math.round(LatLon[3] - LatLon[1]));
        
        //LatLon[0] = String(LatLon[0]);
        //LatLon[1] = String(LatLon[1]);
        //LatLon[2] = String(LatLon[2]);
        //LatLon[3] = String(LatLon[3]);
        mapBbox = eextent[0]+","+eextent[1]+","+eextent[2]+","+eextent[3]
        

        iEL.push(mapBbox);
        initialExtent = iEL[1];                       //用第二張影像的extent來設定一開始地圖extent
        var dynamicURL = "http://owms.afasi.gov.tw/asofb/" + mapNum + "/wms?SERVICE=WMS&REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&LAYERS=" + mapNum + ":" + mapName + "&STYLES=&FORMAT=image/jpeg&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&SRS=EPSG:3826&BBOX=" + mapBbox + "&WIDTH=" + imgWidth + "&HEIGHT=" + imgHeight;
        //時間判斷  (I get bad logic)
        if(year >= 2016){
            if(month > 5){
                imgUrl_2.push(dynamicURL);
                Time_2.push(Time);
            }else if(month < 5){
                imgUrl_1.push(dynamicURL);
                Time_1.push(Time);
            }else if(month == 5){
                if(day >= 20){
                    imgUrl_2.push(dynamicURL);
                    Time_2.push(Time);
                }else{
                    imgUrl_1.push(dynamicURL);
                    Time_1.push(Time);
                }
            }
        }else{
            imgUrl_1.push(dynamicURL);
            Time_1.push(Time);
        }
        //imgUrl.push(dynamicURL);
    }
    //console.log(imgUrl_1);
    //console.log(imgUrl_2);

    //動態新增Options
    var ss = document.getElementById("mySelect_1"); //左側前期
    for(var i = 0;i < imgUrl_1.length;i++){
        var new_option = new Option(Time_1[i],imgUrl_1[i]); //option名稱,option值
        ss.options.add(new_option);
    }
    var ww = document.getElementById("mySelect_2"); //右側後期
    for(var i = 0;i < imgUrl_2.length;i++){
        var new_option = new Option(Time_2[i],imgUrl_2[i]);
        ww.options.add(new_option);
    }

    //extent轉型
    initialExtent = initialExtent.split(",",4);
    for (var i = 0;i<4;i++){
        initialExtent[i] = Number(initialExtent[i]);
        //console.log(initialExtent[i]);
    }

    //Basemaps
    map_1 = new Map("MapBox1", {
        center: [120.4812910145056, 24.17184202216923],
        logo:false,
        zoom: scale
    });
    map_2 = new Map("MapBox2", {
        center: [120.4812910145056, 24.17184202216923],
        logo:false,
        zoom: scale
    });
    

    //國土測繪中心底圖(WMS)
    var layer1 = new WMSLayerInfo({
        name: 'EMAP15',
        title: '臺灣通用電子地圖(無門牌)'
    });
    var resourceInfo = {
        extent: new Extent(119, 26, 123, 20, { wkid: 3857 }),
        layerInfos: [layer1],
        version: "1.1.1"
    };
    var wmslayer = new WMSLayer("http://maps.nlsc.gov.tw/S_Maps/wms", {
        format: "png",
        resourceInfo: resourceInfo,
        visibleLayers: ['EMAP15']
    });
    var wmslayer2 = new WMSLayer("http://maps.nlsc.gov.tw/S_Maps/wms", {
        format: "png",
        resourceInfo: resourceInfo,
        visibleLayers: ['EMAP15']
    });
    map_1.addLayer(wmslayer);
    map_2.addLayer(wmslayer2);

    
    

 
    //Coordinate convert function (add image to map)
    mapParameter.addLayer_1 = function(url){
        map_1.on("load",function(){
            map_1.disablePan()
        });
        //經緯度
        var start = url.indexOf("BBOX") + 5;  //經緯度開始處
        var end1 = url.lastIndexOf("&WIDTH");  //經緯度結束處
        var LatLon = (url.substring(start,end1)).split(",",4);
        //EPSG
        var EPSG_start = url.indexOf("EPSG:") + 5 //epsg開始處
        var EPSG_end = url.lastIndexOf("&BBOX") //epsg結束處
        var EPSG_code = Number(url.substring(EPSG_start,EPSG_end));
        
        //Parsing結束
        var bboxArray = [Number(LatLon[0]),Number(LatLon[1]),Number(LatLon[2]),Number(LatLon[3])];
        var ArrayGeometry = [];
        
        ArrayGeometry.push(new Point(bboxArray[0], bboxArray[1], new esri.SpatialReference({
            wkid: EPSG_code
        })));
        ArrayGeometry.push(new Point(bboxArray[2], bboxArray[3], new esri.SpatialReference({
            wkid: EPSG_code
        })));
        var geometryService = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";
        var gsvc = new esri.tasks.GeometryService(geometryService);
        var outSR = new esri.SpatialReference({
            wkid: 102100
        });
    
        //開始轉換
        gsvc.project(ArrayGeometry, outSR, function (projected) {
            bboxArray = [];
            for (var i = 0; i < projected.length; i++) {
                bboxArray.push(projected[i].x);
                bboxArray.push(projected[i].y);
            }
    
            var layer = new MapImageLayer({ 'id': 'image' });
            var mi = new MapImage({
                'extent': { 
                    'xmin': bboxArray[0], 
                    'ymin': bboxArray[1], 
                    'xmax': bboxArray[2], 
                    'ymax': bboxArray[3], 
                    'spatialReference': { 'wkid': 102100 } },
                'href': url  
            });
            layer.addImage(mi);
            map_1.addLayer(layer);
            AllimgLayers_1.push(layer); //將影像圖層加入陣列
            //var imgExtent = new Extent(bboxArray[0],bboxArray[1],bboxArray[2],bboxArray[3],new SpatialReference({ wkid:102100}));
            //map_1.setExtent(imgExtent);
            //console.log(bboxArray);
            map_1.enablePan();
        });
    };
    mapParameter.addLayer_2 = function(url){
        map_2.on("load",function(){
            map_2.disablePan()
        });
        //經緯度
        var start = url.indexOf("BBOX") + 5;  //經緯度開始處
        var end1 = url.lastIndexOf("&WIDTH");  //經緯度結束處
        var LatLon = (url.substring(start,end1)).split(",",4);
        //EPSG
        var EPSG_start = url.indexOf("EPSG:") + 5 //epsg開始處
        var EPSG_end = url.lastIndexOf("&BBOX") //epsg結束處
        var EPSG_code = Number(url.substring(EPSG_start,EPSG_end));
 
        //Parsing結束
        var bboxArray = [Number(LatLon[0]),Number(LatLon[1]),Number(LatLon[2]),Number(LatLon[3])];
        var ArrayGeometry = [];
        
        ArrayGeometry.push(new Point(bboxArray[0], bboxArray[1], new esri.SpatialReference({
            wkid: EPSG_code
        })));
        ArrayGeometry.push(new Point(bboxArray[2], bboxArray[3], new esri.SpatialReference({
            wkid: EPSG_code
        })));
        var geometryService = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";
        var gsvc = new esri.tasks.GeometryService(geometryService);
        var outSR = new esri.SpatialReference({
            wkid: 102100
        });
    
        //開始轉換
        gsvc.project(ArrayGeometry, outSR, function (projected) {
            bboxArray = [];
            for (var i = 0; i < projected.length; i++) {
                bboxArray.push(projected[i].x);
                bboxArray.push(projected[i].y);
            }
    
            var layer = new MapImageLayer({ 'id': 'image' });
            var mi = new MapImage({
                'extent': { 
                    'xmin': bboxArray[0], 
                    'ymin': bboxArray[1], 
                    'xmax': bboxArray[2], 
                    'ymax': bboxArray[3], 
                    'spatialReference': { 'wkid': 102100 } },
                'href': url   //計算過寬高後取代
            });
            layer.addImage(mi);
            map_2.addLayer(layer);
            AllimgLayers_2.push(layer); //將影像圖層加入陣列
            //var imgExtent = new Extent(bboxArray[0],bboxArray[1],bboxArray[2],bboxArray[3],new SpatialReference({ wkid:102100}));
            //map_2.setExtent(imgExtent);
            map_2.enablePan();
        });
    };
    //Clear ImgLayer
    mapImageClear.clearImg_1 = function(){
        if (AllimgLayers_1.length === 1){
            map_1.removeLayer(AllimgLayers_1[0]);
            AllimgLayers_1.splice(0,1);
        }
    };
    mapImageClear.clearImg_2 = function(){
        if (AllimgLayers_2.length === 1){
            map_2.removeLayer(AllimgLayers_2[0]);
            AllimgLayers_2.splice(0,1);
        }
    };
    
    //mapParameter.addLayer_1(imgUrl_1[0]);
    //window.setTimeout("mapParameter.addLayer_2(imgUrl_2[0]);",3000);
    //window.setTimeout("alert(32)",2000);
     


    var DuanHao_2 = "段號 = '" + DuanHao + "'";
    //console.log(DuanHao_2);
    var url = "https://gis.coa.gov.tw/proxy/proxy.ashx?https://coagis.colife.org.tw/arcgis/rest/services/CadastralMap/CadastralMap_Tiled_106Q4/MapServer/1/query?"
    $.ajax({
        url:url,
        type:"POST",
        async: false, //weird way to get global variable
        dataType:"json",
        data:{
            where: DuanHao_2, //停止於此
            outSR:"102100",
            OutFields:"*",
            returnGeometry:"true",
            f:"json"
        },
        success: function(result){
            DuanHao_result = result;
        }
    });

    //找出最大最小XY
    var AreaArray = DuanHao_result.features[0].geometry.rings[0];
    var Xarray = new Array();
    var Yarray = new Array();
    for(var i = 0;i < AreaArray.length;i++){
        Xarray.push(AreaArray[i][0]);
        Yarray.push(AreaArray[i][1]);
    }

    var xxmin = Xarray[0];
    var xxmax = Xarray[0];
    var yymin = Yarray[0];
    var yymax = Yarray[0];
    for(var i = 1;i<Xarray.length;i++){
        if(xxmin > Xarray[i]){
            xxmin = Xarray[i];
        }
        if(xxmax < Xarray[i]){
            xxmax = Xarray[i];
        }
        if(yymin > Yarray[i]){
            yymin = Yarray[i];
        }
        if(yymax < Yarray[i]){
            yymax = Yarray[i];
        }
    }
    
    //center轉換(10200 to 4326)
    var ArrayGeometry_1 = [];
    ArrayGeometry_1.push(new Point(xxmin, yymin, new esri.SpatialReference({
        wkid: 102100
    })));
    ArrayGeometry_1.push(new Point(xxmax, yymax, new esri.SpatialReference({
        wkid: 102100
    })));
    var geometryService_1 = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";
    var gsvc_1 = new esri.tasks.GeometryService(geometryService_1);
    var outSR_1 = new esri.SpatialReference({
        wkid: 4326
    });
    gsvc_1.project(ArrayGeometry_1, outSR_1, function (projected) {
        bboxArray = [];
        for (var i = 0; i < projected.length; i++) {
            bboxArray.push(projected[i].x);
            bboxArray.push(projected[i].y);
        }
        //console.log(bboxArray);
        var centerX = ((bboxArray[2] - bboxArray[0]) / 2) + bboxArray[0];
        var centerY = ((bboxArray[3] - bboxArray[1]) / 2) + bboxArray[1];
        map_1.centerAndZoom([centerX,centerY],scale);
    });
    

    //段籍圖
    var FactoryGeometry_1 = {
        "geometry":{
            "rings":[AreaArray],
            "spatialReference":{"wkid":102100}
        },
        "symbol":{"color":[221,160,221,64],
                    "outline":{
                        "color":[160,32,240,255],
                        "width":1,
                        "type":"esriSLS",
                        "style":"esriSLSSolid"
                    },
                    "type":"esriSFS","style":"esriSFSSolid"
        }
    }
    var FactoryGeometry_2 = {
        "geometry":{
            "rings":[AreaArray],
            "spatialReference":{"wkid":102100}
        },
        "symbol":{"color":[221,160,221,64],
                    "outline":{
                        "color":[160,32,240,255],
                        "width":1,
                        "type":"esriSLS",
                        "style":"esriSLSSolid"
                    },
                    "type":"esriSFS","style":"esriSFSSolid"
        }
    }
    var FactoryGraph_1 = new graphic(FactoryGeometry_1);
    var FactoryGraph_2 = new graphic(FactoryGeometry_2);
    var FactoryGraphLayer_1 = new GraphicsLayer();
    var FactoryGraphLayer_2 = new GraphicsLayer();
    FactoryGraphLayer_1.add(FactoryGraph_1);
    FactoryGraphLayer_2.add(FactoryGraph_2);
    map_1.addLayer(FactoryGraphLayer_1);
    map_2.addLayer(FactoryGraphLayer_2);
    
    //Disable zoom in/out listener
    //map_1.on("load", function() {
    //    map_1.disableScrollWheel();
    //    map_2.disableScrollWheel();
    //    map_1.disableDoubleClickZoom();
    //    map_2.disableDoubleClickZoom();
    //    map_1.disableKeyboardNavigation();
    //    map_2.disableKeyboardNavigation();
    //    map_1.hideZoomSlider();
    //    map_2.hideZoomSlider();    <--可能是BUG
    //});

    //synchronize two maps
    map_1.on("extent-change",function(){
        map_2.setExtent(map_1.extent);
    });
    //map_2.on("extent-change",function(){
    //    map_1.setExtent(map_2.extent);
    //});


    //WMS_Layers
    WMS_94212030_0527 = new WMSLayer("http://owms.afasi.gov.tw/asofb/94212030/wms?SERVICE=WMS&REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&LAYERS=94212030:94212030_091008a_20~0527_rgb&STYLES=&FORMAT=image/jpeg&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&SRS=EPSG:3826&BBOX=197307,2674152,200196,2677239&WIDTH=497&HEIGHT=382", {
        format: "png",
        resourceInfo: {
            extent: new Extent(120.4812910145056, 24.17184202216923, 120.50983595296258, 24.199808657098817, { wkid: 3826 })
        }
    });
});


function layerChange_1(){
    var choose = document.getElementById("mySelect_1").value; //此時的choose就是URL
    mapImageClear.clearImg_1();
    mapParameter.addLayer_1(choose);
}


function layerChange_2(){
    var choose = document.getElementById("mySelect_2").value;
    mapImageClear.clearImg_2();
    mapParameter.addLayer_2(choose);
}