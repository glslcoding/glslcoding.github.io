



var canvas;
var gl;
var program;
/*
var matWorldUniformLocation;
var matViewUniformLocation;
var matProjUniformLocation;

var worldMatrix;
var viewMatrix;
var projMatrix;
*/
var speed = 50;
var vertexLoc = 0;
var texCoordLoc = 0;
var normalLoc = 0;
var projectionLoc = 0;
var modelviewLoc = 0;
var normalMatrixLoc = 0;
var modeLoc = 0;
var lightPosLoc = 0;
var lightVecLoc = 0;
var attenuationLoc = 0;
var projection = new Float32Array(16);
var modelview = new Float32Array(16);
var currentFileName = "teapot.txt";

// public member
  this.t = 0.0;
  this.modeVal = 1;
  this.lightPos = new Float32Array(3);
  this.lightVec = new Float32Array(3);
  this.attenuation = 0.01;
  
  // private members (inside closure)
  var canvasName = canvasName;
  var vertSrc = vertSrc;
  var fragSrc = fragSrc;
  var canvas;
  var gl;
  var sceneVertNo = 0;
  var bufID;
  var progID = 0;
  var vertID = 0;
  var fragID = 0;


function InitWebGL()
{
    canvas = document.getElementById("webGL-canvas");
    gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
    if (!gl)
    {
        console.log("Browser doesnt support webGL");
        return -1;        
    }
}


function InitShader(vertexShaderId, fragmentShaderId)
{
         gl.enable(gl.DEPTH_TEST);
    var vertElem = document.getElementById( vertexShaderId );
    
    if ( !vertElem ) { 
        alert( "Unable to load vertex shader "  );
        return -1;
    }


    var fragElem = document.getElementById( fragmentShaderId );
    if ( !fragElem ) { 
        alert( "Unable to load vertex shader "  );
        return -1;
    }         
    
    
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertElem.text);
    gl.shaderSource(fragmentShader, fragElem.text);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    program = gl.createProgram();
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }
}

function ConnectWithShaderAttribute()
{                                   
    
	// retrieve the location of the IN variables of the vertex shader
    vertexLoc = gl.getAttribLocation(program,"inputPosition");
    texCoordLoc =  gl.getAttribLocation(program,"inputTexCoord");
    normalLoc = gl.getAttribLocation(program, "inputNormal");
    
    // retrieve the location of the UNIFORM variables of the shader
    projectionLoc = gl.getUniformLocation(program, "projection");
    modelviewLoc = gl.getUniformLocation(program, "modelview");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMat");
    modeLoc = gl.getUniformLocation(program, "mode");
    lightPosLoc = gl.getUniformLocation(program, "lightPos");
    lightVecLoc = gl.getUniformLocation(program, "lightVec");
    attenuationLoc = gl.getUniformLocation(program, "attenuationVal");
}


function SupplyData()
{

    // generate a Vertex Buffer Object (VBO)
    bufID = gl.createBuffer();
    console.log("load model");
    var sceneVertexData = loadVertexData(currentFileName);
    console.log(sceneVertexData);
     console.log("data leght " + sceneVertexData.length);
    
    sceneVertNo = sceneVertexData.length / (3+2+3);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bufID);
    gl.bufferData(gl.ARRAY_BUFFER, sceneVertexData, gl.STATIC_DRAW);

    if(vertexLoc != -1) {
      // position
      var offset = 0;
      var stride = (3+2+3)*Float32Array.BYTES_PER_ELEMENT;
      gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, stride, offset);
      gl.enableVertexAttribArray(vertexLoc);
    }
    if(texCoordLoc != -1) {
      // texCoord
      offset = 0 + 3*Float32Array.BYTES_PER_ELEMENT;
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, stride, offset);
       gl.enableVertexAttribArray(texCoordLoc);
    }
    
    if(normalLoc != -1) {
      // normal
      offset = 0 + (3+2)*Float32Array.BYTES_PER_ELEMENT;
      gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, stride, offset);
      gl.enableVertexAttribArray(normalLoc);
    }  
      this.resize(this.canvas.width, this.canvas.height);
  
	
}

//public 
  this.resize = function (w, h) {
    gl.viewport(0, 0, w, h);
    
    // this function replaces gluPerspective
    mat4.perspective(projection, 45.0, w/h, 0.5, 4.0);
    //mat4Print(projection);
  }

function Render()
{                      
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //console.log("clear buffer");
    // camera orbits in the z=1.5 plane
    // and looks at the origin
    // mat4LookAt replaces gluLookAt
    var rad = Math.PI / 180.0 * this.t;

    mat4.lookAt(modelview,
               [1.5*Math.cos(rad), 1.5*Math.sin(rad), 1.5], // eye
               [0.0, 0.0, 0.0], // look at
               [0.0, 0.0, 1.0]); // up
    
    //mat4Print(modelview);
    
    var modelviewInv = new Float32Array(16);
    var normalmatrix = new Float32Array(16);
    mat4.invert(modelviewInv, modelview);
    mat4.transpose(normalmatrix, modelviewInv);
      
    gl.useProgram(program);
    
    // load the current projection and modelview matrix into the
    // corresponding UNIFORM variables of the shader
    gl.uniformMatrix4fv(projectionLoc, false, projection);
    gl.uniformMatrix4fv(modelviewLoc, false, modelview);
    if(normalMatrixLoc != -1)  gl.uniformMatrix4fv(normalMatrixLoc, false, normalmatrix);
    if(modeLoc != -1) gl.uniform1i(modeLoc, this.modeVal);
    if(lightPosLoc != -1) gl.uniform3fv(lightPosLoc, this.lightPos);
    if(lightVecLoc != -1) gl.uniform3fv(lightVecLoc, this.lightVec);
    if(attenuationLoc != -1) gl.uniform1f(attenuationLoc, this.attenuation);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bufID);
    gl.drawArrays(gl.TRIANGLES, 0, sceneVertNo);
    
    setTimeout(
        function () {
            this.t += 1.0;
            requestAnimFrame( this.Render );},
        speed
    );
}

var RunWebGL = function(vertexShaderId, fragShaderID)
{
    InitWebGL();
    InitShader(vertexShaderId, fragShaderID);
      ConnectWithShaderAttribute();    
    SupplyData();
     
    Render();            
}


window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();


function loadVertexData(filename) {
    var data = new Float32Array(0);
    var request = new XMLHttpRequest();
    request.open('GET', filename, false);
    request.send(); //"false" above, will block 
     
    console.log("request sent");
     
    if (request.status != 200) {
      alert("can not load file " + filename);

    }else{
        console.log("request done");
      var floatVals = request.responseText.split('\n');
      var numFloats = parseInt(floatVals[0]);
      if(numFloats % (3+2+3) != 0) return data;
      data = new Float32Array(numFloats);
      for(var k = 0; k < numFloats; k++) {
        data[k] = floatVals[k+1];
      }
    }
    console.log("data return");
    return data;
}