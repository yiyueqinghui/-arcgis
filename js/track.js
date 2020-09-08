/**
 * 移动轨迹
 * @param {Array[][]} moveTra   轨迹点数组： 例:[[116.895, 36.6513], [116.972, 36.773], [117.089212, 36.65343],……]
 * @param {Number} speed       移动速度：单位 ms
 * @param {Array[]}    attrCar      小车对象属性：例：["imageUrl",imageWidth,imageHeight]
 */
function movementInit(moveTra,speed,attrCar,colorTra){
	require(
		["esri/geometry/Point","esri/symbols/PictureMarkerSymbol","esri/geometry/Polyline","esri/SpatialReference","esri/symbols/SimpleLineSymbol",
         "esri/graphic","dojo/domReady!"],
		function(Point,PictureMarkerSymbol,Polyline,SpatialReference,SimpleLineSymbol,Graphic){
            
            //初始化轨迹  【选择保留】
            var polyline=new Polyline(moveTra);
         	if(null==colorTra){
             	var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH,new esri.Color([0,255,0]),2);
            }else{
            	var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH,new esri.Color(colorTra),2);
            }
            var graphicOfLine=new Graphic(polyline,lineSymbol);
            map.graphics.add(graphicOfLine);
            //初始化小车对象
            var point=new Point(moveTra[0][0], moveTra[0][1]);
         	var pictureMarkerSymbol=new PictureMarkerSymbol(attrCar[0],attrCar[1],attrCar[2]); 
            graphicOfCar=new Graphic(point,pictureMarkerSymbol);   
            //map.graphics.add(graphicOfCar); 
            graphicOfCar.geometry.x = moveTra[0][0]; 
        	graphicOfCar.geometry.y = moveTra[0][1]; 

			carLayer = new esri.layers.GraphicsLayer("carLayer");
			map.addLayer(carLayer);
			carLayer.add(graphicOfCar);

        	move(0,1,speed,graphicOfCar,moveTra);
		}
	)
}
	var carLayer;
//根据序列点坐标 进行移动  
function move(start,end,rush,car,points){
	//先算第一个点和第二个点的关系  之后一次算每个点和下一个点的关系
    var x1=points[start][0];
    var y1=points[start][1];
    var x2=points[end][0];
    var y2=points[end][1];
    var p=(y2-y1)/(x2-x1);//斜率
    var v=0.001;//距离  距离越小 位置越精确
                
    var moving=setInterval(function(){
        //分别计算 x,y轴方向速度
        if(Math.abs(p)==Number.POSITIVE_INFINITY){//无穷大
        	car.geometry.y+=v;
        }else{
    	    if(x2<x1){
    			car.geometry.x-=(1/Math.sqrt(1+p*p))*v;
            	car.geometry.y-=(p/Math.sqrt(1 + p * p)) * v; 
            	//计算汽车角度 
             	car.symbol.angle =CalulateXYAnagle(x1,y1,x2,y2);
    		}else{
    			car.geometry.x+=(1/Math.sqrt(1+p*p))*v;
            	car.geometry.y+=(p/Math.sqrt(1+p*p))*v; 
             	//计算汽车角度 
            	car.symbol.angle =CalulateXYAnagle(x1,y1,x2,y2);
    	 	}
        }
        
	    //图层刷新 
	    //map.graphics.redraw(); 

		var carGriphic = car;
		carLayer.clear();
        carLayer.add(carGriphic);

	    if (Math.abs(car.geometry.x - x2) <=v && Math.abs(car.geometry.y - y2)<=v) {
	        clearInterval(moving); 
			//console.log(start);
	        start++;
	        end++; 
	        if (end < points.length) 
	            move(start, end,rush,car,points); 
	    } 
    }, rush);     
}
//计算小车移动角度              
function CalulateXYAnagle(startx,starty,endx,endy){ 
	var tan=Math.atan(Math.abs((endy-starty)/(endx-startx)))*180/Math.PI+90;//车头旋转角度（根据图片调整）
	if (endx > startx && endy > starty){//第一象限  
        return -tan+180;  
    }else if (endx > startx && endy < starty){//第二象限   
        return tan;  
    }else if (endx < startx && endy > starty){//第三象限    
        return tan - 180;  
    }else{//第四象限  
        return - tan;  
    }  
}

//向小车添加自定义属性
function setAttrForGraphic(graphic,attr){
	if (isObjectNull(graphic)){
		return;
	}
	var attrold = graphic.attributes;
	if(attrold!=null&&attrold!=undefined){
		for(var p in attr){
			attrold[p] = attr[p];
		}
		attr = attrold;
	}
	graphic.setAttributes(attr);
}
//读取小车的自定义属性
function getAttrForGraphic(graphic){
	if (isObjectNull(graphic)){
		return;
	}
	return graphic.attributes;
}
