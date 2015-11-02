function SVG(width, height){
  this.width=width;
  this.height=height;
  this.content='';
  this.lineWidth=1;
  this.trans={x:0,y:0,w:1,h:1};
}
SVG.prototype={
  toDataURL: function(){
    var attributes = {
      width: this.width+'mm',
      height: this.height+'mm',
      viewBox: [0,0,this.width,this.height].join(' '),
      'stroke-width': this.lineWidth
    }
    var attrArray=[];
    for(var key in attributes){
      attrArray.push(key+'="'+attributes[key]+'"');
    }
    var data="<svg xmlns='http://www.w3.org/2000/svg' "+attrArray.join(' ')+">"+this.content+"</svg>"
    return 'data:image/svg+xml,'+encodeURIComponent(data);
  },
  translate: function(p){
    return {x:this.trans.x+p.x*this.trans.w,y:this.trans.y+p.y*this.trans.h}
  },
  transPoints: function(points){
    var self=this;
    return points.map(function(p){return self.translate(p)});
  },
  line: function(points, loop){
    points=this.transPoints(points);
    var out = [['M',points[0].x,points[0].y].join(' ')]
    for(var i=1;i<points.length;i++){
      var p=points[i];
      out.push('L'+[p.x,p.y].join(' '));
    }
    this.content+="<path stroke='black' fill='none' d='"+out.join(' ')+(loop?'z':'')+"' />";
  },
  curve: function(points, loop){
    points=this.transPoints(points);
    if(points.length>2){
      for(var i=0;i<points.length;i++){
        var p=points[i],pa=points[i-1],pb=points[i+1];
        if(loop&&!pa)pa=points[points.length-1];
        if(loop&&!pb)pb=points[0];
        if(!pa){
          pp=points[2];
          pa={x:3*p.x-3*pb.x+pp.x,y:3*p.y-3*pb.y+pp.y}
        }
        if(!pb){
          pp=points[points.length-3];
          pb={x:3*p.x-3*pa.x+pp.x,y:3*p.y-3*pa.y+pp.y}
        }
        var dx=pb.x-pa.x,dy=pb.y-pa.y;
        var l=Math.sqrt(dx*dx+dy*dy);
        p.dx=dx/l,p.dy=dy/l;
      }
    }
    var out = [['M',points[0].x,points[0].y].join(' ')]
    for(var i=1;i<=points.length;i++){
      var p1=points[i-1],p2=points[i];
      if(!p2){
        if(!loop)continue;
        p2=points[0];
      }
      var dx = p2.x-p1.x,dy=p2.y-p1.y;
      var l = Math.sqrt(dx*dx+dy*dy);
      out.push(
        'C'+[
          p1.x+l*(p1.dx||0)/3,
          p1.y+l*(p1.dy||0)/3,
          p2.x-l*(p2.dx||0)/3,
          p2.y-l*(p2.dy||0)/3,
          p2.x,p2.y
        ].join(' ')
      )
    }
    this.content+="<path stroke='black' fill='none' d='"+out.join(' ')+(loop?'z':'')+"' />"
  }
}