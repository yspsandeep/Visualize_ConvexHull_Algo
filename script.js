const timeoutSelect = document.getElementById('selBox');
const timeoutSelect2 = document.getElementById('selBox2');

//global vars
const jmSVGMap = new Map();
const jmPoints=[];
const jHull=[];
const jActions=[];

const kpsSVGMap = new Map();
const kpsPoints=[];
const kpsHull= new Set();
const kpsActions=[];

const getRandomNumber=(min, max)=> {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//svg containers
const jmcont = document.getElementById('jarvisMarch');
const jarvisContainer = SVG()
  .addTo('#jarvisMarch')
  .size(700, 500)
  .viewbox(0, 0, 700, 500)
  .on('click', (event) => {
    const crect = jmcont.getBoundingClientRect();
    const point = jarvisContainer.circle(5)
      .center(event.clientX-crect.left, event.clientY-crect.top)
      .fill('#000');
      let pt= new Point(event.clientX-crect.left, event.clientY-crect.top);
      jmPoints.push(pt);
      jmSVGMap.set(pt,point); //
  });

const kpscont = document.getElementById('kirkPS');
const kpsContainer = SVG()
  .addTo('#kirkPS')
  .size(700, 500)
  .viewbox(0, 0, 700, 500)
  .on('click', (event) => {
    const crect = kpscont.getBoundingClientRect();
    const point = kpsContainer.circle(5)
      .center(Math.round(event.clientX-crect.left), Math.round(event.clientY-crect.top))
      .fill('#000');
    let pt= [Math.round(event.clientX-crect.left), Math.round(event.clientY-crect.top)];
    kpsPoints.push(pt);
    kpsSVGMap.set(pt.toString(),[point]);
  });

//jarvis March functions
function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    
};
function shallowEqualityCheck(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  }
  

function findAngle(prev_o,o,p) {
    let dAx = o.x - prev_o.x;
    let dAy = o.y - prev_o.y;
    let dBx = p.x - o.x;
    let dBy = p.y - o.y;
    let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
    let degree_angle = angle * (180 / Math.PI);
    degree_angle=degree_angle+180
    return degree_angle
}
function findNextOrigin(prev_o,o,points,action){
    let flag=0;
    let best_angle = 360
    let best_point = null
    // console.log(o)
    for (let i = 0; i < points.length; i++){
        if(JSON.stringify(points[i]) === JSON.stringify(o) || JSON.stringify(points[i]) === JSON.stringify(prev_o)){
            continue
        }
        let angle=findAngle(prev_o,o,points[i])
        if(angle < best_angle){
          // drawCandLine(jarvisContainer,o,points[i]);
          if(flag===0){
            action.push(["asl",o,points[i]]);
            flag++;
          }else{
            action.push(["adl",o,points[i]]);
            action.push(["rsl"]);
            action.push(["asl",o,points[i]]);
            action.push(["rdl"]);
          }

            best_angle = angle
            best_point = JSON.parse(JSON.stringify(points[i]));
        }
        else if(angle == best_angle){
            if(Math.hypot(o.x-best_point.x, o.y-best_point.y)>Math.hypot(o.x-points[i].x, o.y-points[i].y)){
                best_angle = angle
                best_point = JSON.parse(JSON.stringify(points[i]));
            }
        }
        else{
          action.push(["adl",o,points[i]]);
          action.push(["rdl"]);
        }
        
    }
    return best_point

}
function Jarvis(points, svgmap, hullpoints, action){
    let hull = []
    let i=0;
    let origin=new Point(Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER)
    for (i = 0; i < points.length; i++){
        if(origin.y > points[i].y){
            origin = JSON.parse(JSON.stringify(points[i]));
        }
    }
    action.push(["ccb",origin]);
    prev_o = JSON.parse(JSON.stringify(origin));  
    prev_o.x = prev_o.x+0.001
    // console.log(origin)
    hull.push(origin);
    hullpoints.push(origin);
    // markHullPoint(origin);
    while(true){
      let candidate  = findNextOrigin(prev_o,origin,points,action);
      action.push(["ccg",origin]);
      // markCandPoint(candidate)
      if(hull.some((item) => shallowEqualityCheck(item, candidate))){
        // markHullPoint(candidate);
        action.push(["ccg",candidate]);
        
        break
      }
      else{
        action.push(["ccb",candidate]);

      }
      hull.push(candidate)
      hullpoints.push(candidate)
        prev_o = JSON.parse(JSON.stringify(origin));
        origin = JSON.parse(JSON.stringify(candidate));
        // markCurPoint(origin);
    }
    return hull
}

const markHullPoint=(point)=>{
  const gp=jarvisContainer.circle(10)
      .center(point.x,point.y)
      .fill('#4CE45C');
  return gp;
}

const markCurPoint=(point)=>{
  const bp=jarvisContainer.circle(10)
      .center(point.x,point.y)
      .fill('#0943F4');
  return bp;
}

//jarvis March buttons
const solidLine=[]
const dotLine=[]
const circles=[]
document.getElementById("jmLClr").disabled = true;
document.getElementById('jmRun').addEventListener('click', () => {
  const selectedTimeout = timeoutSelect.value;
  document.getElementById("jmRand").disabled = true;
  document.getElementById("jmLClr").disabled = false;
  document.getElementById("jmRun").disabled = true;
  Jarvis(jmPoints,jmSVGMap,jHull, jActions)
  // console.log(jActions);
  performActions(jActions,solidLine,dotLine,circles,selectedTimeout);
});

document.getElementById('jmRand').addEventListener('click', () => {
  const noPoints = getRandomNumber(8, 18);
  for(let i=0;i<noPoints;i++){
    let rx=getRandomNumber(40,660);
    let ry= getRandomNumber(40,460)
    const point = jarvisContainer.circle(5)
    .center(rx,ry)
    .fill('#000');
    let pt= new Point(rx,ry);
    jmSVGMap.set(pt,[point]);//
    jmPoints.push(pt);
  }
});

document.getElementById('jmClr').addEventListener('click', () => {
  document.getElementById("jmRun").disabled = false;
  document.getElementById("jmLClr").disabled = true;
  document.getElementById("jmRand").disabled = false;
  jarvisContainer.clear();
  for (const [key, value] of jmSVGMap) {
    jmSVGMap.delete(key);
  }
  
  sz=jmPoints.length
  for(let i=0;i<sz;i++){
    jmPoints.pop();
  }
  sz=jHull.length
  for(let i=0;i<sz;i++){
    jHull.pop();
  }
  sz=jActions.length;
  for(let i=0;i<sz;i++){
    jActions.pop();
  }
  sz= solidLine.length
  for(let i=0;i<sz;i++){
    solidLine.pop();
  }
  sz= dotLine.length
  for(let i=0;i<sz;i++){
    dotLine.pop();
  }

});

document.getElementById('jmLClr').addEventListener('click', () => {
  document.getElementById("jmRun").disabled = false;
  const selectedTimeout = timeoutSelect.value;
  sz=jHull.length
  for(let i=0;i<sz;i++){
    jHull.pop();
  }
  sz=jActions.length;
  for(let i=0;i<sz;i++){
    jActions.pop();
  }
  sz= solidLine.length
  for(let i=0;i<sz;i++){
    let ps= solidLine.pop();
    ps.remove();
  }
  sz= dotLine.length
  for(let i=0;i<sz;i++){
    let ps=dotLine.pop();
    ps.remove();
  }
  sz= circles.length
  for(let i=0;i<sz;i++){
    let ps=circles.pop();
    ps.remove();
  }
  Jarvis(jmPoints,jmSVGMap,jHull, jActions)
  document.getElementById("jmRun").disabled = true;
  // console.log(jActions);
  performActions(jActions,solidLine,dotLine,circles,selectedTimeout);
});

//jarvis March actions runner
function performActions(actionArray, solidLine,dotLine, circles, delay) {
  if (actionArray.length === 0) return; 
  const action = actionArray.shift();
  // console.log(action);
  if(action[0]==="ccb"){
    circles.push(markCurPoint(action[1]));
  }
  else if(action[0]==="ccg"){
    circles.push(markHullPoint(action[1]));
  }
  else if(action[0]==="asl"){
    const line = jarvisContainer.line(action[1].x, action[1].y, action[2].x, action[2].y)
          .stroke({ width: 3, color: '#f06' })
    solidLine.push(line);
    // console.log(solidLine)
  }
  else if(action[0]==="rsl"){
    const deline= solidLine.pop();
    deline.remove();
  }
  else if(action[0]==="adl"){
    const line = jarvisContainer.line(action[1].x, action[1].y, action[2].x, action[2].y)
          .stroke({ width: 2, color: '#337357' })
          .attr('stroke-dasharray', '10,5');
    dotLine.push(line);
    // console.log(dotLine)
  }
  else if(action[0]==="rdl"){
    while(dotLine.length!==0){
      deline= dotLine.pop();
      deline.remove();
    }
  }
  // console.log(action);
  setTimeout(() => performActions(actionArray,solidLine,dotLine, circles, delay), delay);
}




//kps funtions

function flipped(points) {
    return points.map(point => [-point[0], -point[1]]);
}

function flipval(point){
  return [-point[0],-point[1]];
}

// function printMat(points) {
//     for (let point of points) {
//         let x = point[0], y = point[1]
//         console.log(x + " " + y)
//     }
// }

function integerDivision(dividend, divisor) {
    return Math.floor(dividend / divisor);
}

function popFromSet(set) {
    const iterator = set.values();
    const first = iterator.next().value;
    set.delete(first);
    return first;
}

function quickselectSlopes(slopes, k) {
    let dummy = Array.from(slopes)
    let sortedSlopes = dummy.sort((a, b) => a - b)
    return sortedSlopes[k]
}

function quickselect(points, k) {
    let sortedPoints = points.sort((a, b) => {
        if (a[0] !== b[0])
            return a[0] - b[0]
        else
            return a[1] - b[1]
    })
    return sortedPoints[k]
}

function getBridge(points, median,actions,flp) {
    // console.log(median)
    // console.log(points)
    let candidates = new Set()
    if (points.length === 2) {
        sortedPoints = points.sort((a, b) => {
            if (a[0] !== b[0])
                return a[0] - b[0]
            else
                return a[1] - b[1]
        })
        return sortedPoints
    }

    let pairs = []
    let points_set = new Set(points)
    // console.log("Set: ", points_set)

    while (points_set.size >= 2) {
        let pair = [];
        pair.push(popFromSet(points_set))
        pair.push(popFromSet(points_set))
        pair = pair.sort((a, b) => {
            if (a[0] !== b[0])
                return a[0] - b[0]
            else
                return a[1] - b[1]
        })
        pairs.push(pair)
        if(flp){
          actions.push(["ddl",flipval(pair[0]),flipval(pair[1])]);
        }
        else{
          actions.push(["ddl",pair[0],pair[1]]);
        }
    }
    // console.log("PAIRS :", pairs)

    if (points_set.size === 1)
        candidates.add(popFromSet(points_set));
    let slopes = []
    for (let i = 0; i < pairs.length; i++) {
        let p1 = pairs[i][0]
        let p2 = pairs[i][1]
        if (p1[0] === p2[0]) {
            if (p1[1] > p2[1]){
              candidates.add(p1)
              if(flp){
                actions.push(["hidp",[flipval(p2)]])
              }else{
                actions.push(["hidp",[p2]])
              }
            }
            else{
              candidates.add(p2)
              if(flp){
                actions.push(["hidp",[flipval(p1)]])
              }else{
                actions.push(["hidp",[p1]])
              }
            }
            pairs.splice(i, 1)
            i--
        } 
        else {
            let slope = (p1[1] - p2[1]) / (p1[0] - p2[0])
            slopes.push(slope)
        }
    }

    let med_index = Math.floor(slopes.length / 2) - (slopes.length % 2 === 0 ? 1 : 0);
    let med_slope = quickselectSlopes(slopes, med_index)
    let small = [], equal = [], large = []
    // console.log("pairs",pairs);
    for (let i in slopes) {
        if (slopes[i] < med_slope){
          small.push(pairs[i])
          if(flp){
            actions.push(["crdl",flipval(pairs[i][0]),flipval(pairs[i][1])]);
          }else{
            actions.push(["crdl",pairs[i][0],pairs[i][1]]);
          }
        }
        else if (slopes[i] > med_slope){
          large.push(pairs[i])
          if(flp){
            actions.push(["cgdl",flipval(pairs[i][0]),flipval(pairs[i][1])]);
          }else{
            actions.push(["cgdl",pairs[i][0],pairs[i][1]]);
          }
        }
        else{
          equal.push(pairs[i])
          if(flp){
            actions.push(["cydl",flipval(pairs[i][0]),flipval(pairs[i][1])]);
          }else{
            actions.push(["cydl",pairs[i][0],pairs[i][1]]);
          }
        }
    }
    // console.log("small",small);
    // console.log("large",large);
    // console.log("equal",equal);

    let max_intercept = -Infinity
    let max_point=[-Infinity,-Infinity]
    for (let point of points)
    if (max_intercept < point[1] - med_slope * point[0]){
      max_intercept = point[1] - med_slope * point[0]
      max_point=point
    }
    

    if(flp)
      actions.push(["dsup",flipval(max_point),med_slope]);
    else
      actions.push(["dsup",max_point,med_slope]);

    
    let max_set = new Set()
    for (let point of points) {
        if (max_intercept === point[1] - med_slope * point[0]) {
            max_set.add(point)
        }
    }

    // console.log(max_intercept)
    max_set = Array.from(max_set);

    let left = max_set[0];
    for (let i = 1; i < max_set.length; i++)
        if ((max_set[i][0] < left[0]) || (max_set[i][0] === left[0] && max_set[i][1] < left[1]))
            left = max_set[i]

    let right = max_set[0];
    for (let i = 1; i < max_set.length; i++)
        if ((max_set[i][0] > right[0]) || (max_set[i][0] === right[0] && max_set[i][1] > right[1]))
            right = max_set[i]
    
    //highlight l and r 
    if(flp){
      actions.push(["hrc",left,right]);
    }else{
      actions.push(["hrc",left,right]);
    }
    // console.log(left)
    // console.log(right)
    

    if (left[0] <= median && right[0] >= median)
    {
      return [left, right]

    }

    if (right[0] <= median) {
        let largeEqual = new Set([...large, ...equal]);
        for (let [pt, point] of largeEqual) {
            candidates.add(point);
            if(flp){
              actions.push(["hidp",[flipval(pt)]]);
            }else{
              actions.push(["hidp",[pt]]);
            }
        }

        for (let pair of small) {
            for (let point of pair) {
                candidates.add(point);
            }
        }
    }

    if (left[0] > median) {
        let smallEqual = new Set([...small, ...equal]);
        for (let [point, pt] of smallEqual) {
            candidates.add(point);
            //hide pt
            if(flp){
              actions.push(["hidp",[flipval(pt)]]);
            }else{
              actions.push(["hidp",[pt]]);
            }
        }

        for (let pair of large) {
            for (let point of pair) {
                candidates.add(point);
            }
        }
    }

    actions.push(["radl"]);

    candidates = Array.from(candidates)
    // console.log("Candidates: ", candidates)
    // console.log()
    
    return getBridge(candidates, median,actions,flp)
}

function connect(p1, p2, points, actions,flp) {
    if (p1 === p2){
      if(flp){
        actions.push(["kagp",flipval(p1)]);
      }else{
        actions.push(["kagp",p1]);
      }
      return [p1]
    }
    let leftMax = quickselect(points, integerDivision(points.length, 2) - 1)
    let rightMin = quickselect(points, integerDivision(points.length, 2))
    if(flp){
      actions.push(["kmedx",(-leftMax[0] - rightMin[0]) / 2]);
    }else{
      actions.push(["kmedx",(leftMax[0]+rightMin[0])/2]);
    }
    let [left, right] = getBridge(points, (leftMax[0] + rightMin[0]) / 2,actions,flp)
    actions.push(["radl"]);
    // console.log(flp,left,right)
    if(flp){
      actions.push(["dsl",flipval(left),flipval(right)]);
    }else{
      actions.push(["dsl",left,right]);
    }
    let small = new Set(), large = new Set()
    
    small.add(left);
    for (let point of points)
        if (point[0] < left[0])
            small.add(point);
    
    large.add(right);
    for (let point of points)
        if (point[0] > right[0])
            large.add(point);

    let smalllarge= new Set();
    for(let x of small){
      smalllarge.add(x);
    }
    for(let x of large){
      smalllarge.add(x);
    }

    let hidp=[]
    for(const el of points){
      if(!smalllarge.has(el)){
        if(flp){
          hidp.push(flipval(el));

        }else{
          hidp.push(el);
        }
      }
    }
    actions.push(["hidp",hidp]);

    small = Array.from(small)
    large = Array.from(large)

    return connect(p1, left, small,actions,flp).concat(connect(right, p2, large,actions,flp))
}
let leftmostpts=[]
let rightmostpts=[]
function getUpperHull(points,actions,flp,leftarr,rightarr) {
    let leftMost = points[0], rightMost = points[0]
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] < leftMost[0])
            leftMost = points[i]
    }
    if(!flp){
      for(let i=0;i<points.length;i++){
        if(points[i][0]===leftMost[0]){
          leftarr.push(points[i]);
        }
      }
    }
    for (let i = 0; i < points.length; i++) {
        if (points[i][0] === leftMost[0] && points[i][1] > leftMost[1])
            leftMost = points[i]
    }

    for (let i = 1; i < points.length; i++) {
        if (points[i][0] > rightMost[0])
            rightMost = points[i]
    }
    if(!flp){
      for(let i=0;i<points.length;i++){
        if(points[i][0]===rightMost[0]){
          rightarr.push(points[i]);
        }
      }
    }
    for (let i = 0; i < points.length; i++) {
        if (points[i][0] === rightMost[0] && points[i][1] > rightMost[1])
            rightMost = points[i]
    }
    if(flp){
      actions.push(["kabp",flipval(leftMost),flipval(rightMost)])
    }else{
      actions.push(["kabp",leftMost,rightMost])
    }
    let newPoints = []
    newPoints.push(leftMost)
    let miny= Math.min(leftMost[1],rightMost[1]);
    for (let point of points) {
      if (point[0] > leftMost[0] && point[0] < rightMost[0] && point[1]>=miny){
        newPoints.push(point)
      }
    }
    newPoints.push(rightMost)
    const setNew= new Set(newPoints);
    let hidp=[]
    for(const el of points){
      if(!setNew.has(el)){
        if(flp){
          hidp.push(flipval(el));
        }else{
          hidp.push(el);
        }
      }
    }
    actions.push(["hidp",hidp]);
    points = newPoints
    // console.log("After taking LR: ", points)
    return connect(leftMost, rightMost, points,actions, flp)
}

function convexHull(points,actions,leftarr,rightarr) {
    let upperHull = getUpperHull(points,actions,0,leftarr,rightarr);
    //unhide hidden
    actions.push(["uhid"])
    let flippedPoints = flipped(points);
    actions.push(["radl"]);
    // console.log("Flipped Points: ", flippedPoints)
    let lowerHull = getUpperHull(flippedPoints,actions,1,leftarr,rightarr);
    lowerHull = flipped(lowerHull);
    actions.push(["uhid"])
    // console.log(upperHull)
    // console.log("######################")
    // console.log(leftarr)
    // console.log(rightarr)
    if(leftarr.length>=2){
      const sortedleft = leftarr.sort((a, b) => a[1] - b[1]);
      actions.push(["xterm",sortedleft]);
    }
    if(rightarr.length>=2){
      const sortedright= rightarr.sort((a, b) => a[1] - b[1]);
      actions.push(["xterm",sortedright]);
    }
    actions.push(["radl"]);

    if (upperHull[upperHull.length - 1][0] === lowerHull[0][0] && upperHull[upperHull.length - 1][1] === lowerHull[0][1])
        upperHull.pop();
    if (upperHull[0][0] === lowerHull[lowerHull.length - 1][0] && upperHull[0][1] === lowerHull[lowerHull.length - 1][1])
        lowerHull.pop();

    return upperHull.concat(lowerHull);
}

const kpsMarkHull=(point)=>{
  // console.log(point);
  const gp=kpsContainer.circle(10)
      .center(point[0],point[1])
      .fill('#4CE45C');
  return gp;
}

const kpsMarkCur=(point)=>{
  // console.log(point);
  const gp=kpsContainer.circle(10)
      .center(point[0],point[1])
      .fill('#4287f5');
  return gp;
}

const kpsMarkHidden=(point)=>{
  const gp=kpsContainer.circle(5)
      .center(point[0],point[1])
      .fill('#D8D8D8');
  return gp;
}

//kps buttons
document.getElementById("kpsLClr").disabled = true;
document.getElementById('kpsRun').addEventListener('click', () => {
  const selectedTimeout = timeoutSelect2.value;
  document.getElementById("kpsRand").disabled = true;
  document.getElementById("kpsLClr").disabled = false;
  document.getElementById("kpsRun").disabled = true;
  convexHull(kpsPoints,kpsActions,leftmostpts,rightmostpts)
  // console.log(kpsActions);
  kpsPerformActions(kpsActions,selectedTimeout,kpsSVGMap,kpsHull,hidden,templines,hullines,dottedlines);
  // console.log(kpsPoints)
});

document.getElementById('kpsRand').addEventListener('click', () => {
  const noPoints = getRandomNumber(8, 11);
  for(let i=0;i<noPoints;i++){
    let rx=getRandomNumber(40,660);
    let ry= getRandomNumber(40,460)
    const point = kpsContainer.circle(5)
    .center(rx,ry)
    .fill('#000');
    let pt= [rx, ry];
    kpsSVGMap.set(pt.toString(),[point]);//
    kpsPoints.push(pt);
  }
});

document.getElementById('kpsClr').addEventListener('click', () => {
  document.getElementById("kpsRun").disabled = false;
  document.getElementById("kpsLClr").disabled = true;
  document.getElementById("kpsRand").disabled = false;
  kpsContainer.clear();
  for (const [key, value] of kpsSVGMap) {
    while(value.length!==1){
      let v= value.pop();
      v.remove();
    }
    kpsSVGMap.delete(key);
  }
  
  sz=kpsPoints.length
  for(let i=0;i<sz;i++){
    kpsPoints.pop();
  }
  for(let i of kpsHull){
    kpsHull.delete(i)
  }
  sz=kpsActions.length;
  for(let i=0;i<sz;i++){
    kpsActions.pop();
  }
  sz=templines.length;
  for(let i=0;i<sz;i++){
    templines.pop();
  }
  sz=hidden.length;
  for(let i=0;i<sz;i++){
    hidden.pop();
  }
  sz=hullines.length;
  for(let i=0;i<sz;i++){
    hullines.pop();
  }
  for(const [key,val] of dottedlines){
    val.remove();
  }
  dottedlines.clear();
  sz= leftmostpts.length;
  for(let i=0;i<sz;i++){
    leftmostpts.pop();
  }
  sz= rightmostpts.length;
  for(let i=0;i<sz;i++){
    rightmostpts.pop();
  }
});

document.getElementById('kpsLClr').addEventListener('click', () => {
  document.getElementById("kpsRun").disabled = false;
  const selectedTimeout = timeoutSelect2.value;
  for (const [key, value] of kpsSVGMap) {
    while(value.length!==1){
      let v= value.pop();
      v.remove();
    }
  }
  for(const [key,val] of dottedlines){
    val.remove();
  }
  dottedlines.clear();
  for(let i of kpsHull){
    kpsHull.delete(i)
  }
  sz=kpsActions.length;
  for(let i=0;i<sz;i++){
    kpsActions.pop();
  }
  sz=templines.length;
  for(let i=0;i<sz;i++){
    templines.pop();
  }
  sz=hidden.length;
  for(let i=0;i<sz;i++){
    let hid=hidden.pop();
    hid.remove();
  }
  sz=hullines.length;
  for(let i=0;i<sz;i++){
    let hl=hullines.pop();
    hl.remove();
  }
  convexHull(kpsPoints,kpsActions,leftmostpts,rightmostpts)
  document.getElementById("kpsRun").disabled = true;
  // console.log(kpsActions);
  kpsPerformActions(kpsActions,selectedTimeout,kpsSVGMap,kpsHull,hidden,templines,hullines,dottedlines);
});

const findintercept=(pt,slp)=>{
      let x_int= -pt[1]/slp+pt[0];
      let y_int= pt[1]-slp*pt[0];
      return [[x_int,0],[0,y_int]];
    }

//kps actions runner
const hidden=[];
const templines=[];
const hullines=[];
const dottedlines=new Map();
const kpsPerformActions=(actionArray,delay,pointMap,hullpt,hidden,templines,hullines,dottedlines)=>{
  if (actionArray.length === 0) return; 
  const action = actionArray.shift();
  // console.log(action);
  if(action[0]==="kagp"){
    let pt=kpsMarkHull(action[1]);
    // kpsSVGMap[action[1]].push(pt);
    let arr= pointMap.get(action[1].toString());
    arr.push(pt);
    pointMap.set(action[1].toString(),arr);
    hullpt.add(action[1].toString());
  }
  else if(action[0]==="kabp"){
    let pt =kpsMarkCur(action[1]);
    let pt2 =kpsMarkCur(action[2]);
    // console.log(pointMap);
    let arr= pointMap.get(action[1].toString());
    // console.log(arr)
    arr.push(pt)
    arr.push(pt2)
    pointMap.set(action[1].toString(),arr);
    hullpt.add(action[1].toString());
    hullpt.add(action[2].toString());
  }
  else if(action[0]==="hidp"){
    for(pt of action[1]){
      if(hullpt.has(pt.toString())){
        continue;
      }
      // console.log(pt);
      // console.log(pointMap.has(pt.toString()))
      let hidpt= kpsMarkHidden(pt);
      let arr= pointMap.get(pt.toString());
      arr.push(hidpt);
      pointMap.set(pt.toString(),arr);
      hidden.push(hidpt);
    }
  }
  else if(action[0]==="uhid"){
    while(hidden.length!==0){
      let pt= hidden.pop();
      pt.remove();
    }
    // console.log(hullines)
    for(let i=0;i<hullines.length;i++){
      hullines[i].stroke({ color: '#f06'});
    }
  }
  else if(action[0]==="dsl"){
    // console.log(pointMap.has(action[1].toString()),pointMap.has(action[2].toString()))
    const line = kpsContainer.line(action[1][0], action[1][1], action[2][0], action[2][1])
          .stroke({ width: 3, color: '#E26EE5' })
    hullines.push(line);
  }
  else if(action[0]==="ddl"){
    const line = kpsContainer.line(action[1][0], action[1][1], action[2][0], action[2][1])
          .stroke({ width: 3, color: '#A9A9A9' })
          .attr('stroke-dasharray', '10,5');
    dottedlines.set([action[1],action[2]].toString(),line);
  }
  else if(action[0]==="crdl" ||action[0]==="cgdl" || action[0]==="cydl"){
    let arr= [action[1],action[2]].toString();
    // console.log(arr);
    // console.log(dottedlines);
    let line=dottedlines.get(arr);
    if(action[0]==="crdl"){
      line.stroke({ color: '#D20103' });
    }else if(action[0]==="cgdl"){
      line.stroke({ color: '#7DDA58' });
    }else{
      line.stroke({ color: '#FFDE59' });
    }
  }
  else if(action[0]==="radl"){
    while(templines.length!==0){
      let t= templines.pop();
      t.remove();
    }
    for(let [key,val] of dottedlines){
      val.remove();
    }
    dottedlines.clear();
    // console.log("dottttt",dottedlines)
    // console.log("tmpllll",templines);
  }
  else if(action[0]==="kmedx"){
    const line = kpsContainer.line(action[1], 25, action[1], 475)
          .stroke({ width: 2, color: '#00bbbb' })
          .attr('stroke-dasharray', '10,5');
    templines.push(line);
  }
  else if(action[0]==="dsup"){
    let endpts= findintercept(action[1],action[2]);
    const line = kpsContainer.line(endpts[0][0],endpts[0][1],endpts[1][0],endpts[1][1])
          .stroke({ width: 2, color: '#820300' })
          .attr('stroke-dasharray', '10,5');
    templines.push(line);
  }
  else if(action[0]==="xterm"){
    // console.log(action)
    for(let i=1;i<action[1].length;i++){
      const line = kpsContainer.line(action[1][i-1][0], action[1][i-1][1], action[1][i][0], action[1][i][1])
          .stroke({ width: 3, color: '#f06' });
      hullines.push(line);
      
    }
    for(let i=0;i<action[1].length;i++){
      let pt=kpsMarkHull(action[1][i]);
      arr= pointMap.get(action[1][i].toString());
      arr.push(pt);
      pointMap.set(action[1][i].toString(),arr);
    }
  }
  setTimeout(() => kpsPerformActions(actionArray, delay,pointMap,hullpt,hidden,templines,hullines,dottedlines), delay);
}

//legend
const legendBox = SVG().addTo('#legend').size(500,175);
const dsup= legendBox.line(0,25,90,25)
          .stroke({ width: 2, color: '#820300' })
          .attr('stroke-dasharray', '10,5');
const dsuptxt= legendBox.text('Supporting line')
          .move(110, 15)
          .fill('#333')
          .font({
            family: 'Times New Roman',
            size: 17,
            anchor: 'start'
          });
const kmedx= legendBox.line(0,50,90,50)
          .stroke({ width: 2, color: '#00bbbb' })
          .attr('stroke-dasharray', '10,5');
const kmedxtxt= legendBox.text('Median line')
          .move(110, 40)
          .fill('#333')
          .font({
            family: 'Times New Roman',
            size: 17,
            anchor: 'start'
          });
const ddl= legendBox.line(0,75,90,75)
          .stroke({ width: 2, color: '#A9A9A9' })
          .attr('stroke-dasharray', '10,5');
const ddltxt= legendBox.text('Lines drawn between random pair of candidate points')
          .move(110, 65)
          .fill('#333')
          .font({
            family: 'Times New Roman',
            size: 17,
            anchor: 'start'
          });
const crdl= legendBox.line(0,100,90,100)
          .stroke({ width: 2, color: '#D20103' })
          .attr('stroke-dasharray', '10,5');
const crdltxt= legendBox.text('Lines that have slope less than median slope')
          .move(110, 90)
          .fill('#333')
          .font({
            family: 'Times New Roman',
            size: 17,
            anchor: 'start'
          });
const cydl= legendBox.line(0,125,90,125)
          .stroke({ width: 2, color: '#FFDE59' })
          .attr('stroke-dasharray', '10,5');
const cydltxt= legendBox.text('Lines that have slope equal to median slope')
          .move(110, 115)
          .fill('#333')
          .font({
            family: 'Times New Roman',
            size: 17,
            anchor: 'start'
          });
const cgdl= legendBox.line(0,150,90,150)
          .stroke({ width: 2, color: '#7DDA58' })
          .attr('stroke-dasharray', '10,5');
const cgdltxt= legendBox.text('Lines that have slope greater than median slope')
          .move(110, 140)
          .fill('#333')
          .font({
            family: 'Times New Roman',
            size: 17,
            anchor: 'start'
          });