



var canvas;
var gl;
var program;
var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;


var matWorldUniformLocation;
var matViewUniformLocation;
var matProjUniformLocation;

var worldMatrix;
var viewMatrix;
var projMatrix;

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
    vertexLoc = gl.getAttribLocation(progID,"inputPosition");
    texCoordLoc =  gl.getAttribLocation(progID,"inputTexCoord");
    normalLoc = gl.getAttribLocation(progID, "inputNormal");
    
    // retrieve the location of the UNIFORM variables of the shader
    projectionLoc = gl.getUniformLocation(progID, "projection");
    modelviewLoc = gl.getUniformLocation(progID, "modelview");
    normalMatrixLoc = gl.getUniformLocation(progID, "normalMat");
    modeLoc = gl.getUniformLocation(progID, "mode");
    lightPosLoc = gl.getUniformLocation(progID, "lightPos");
    lightVecLoc = gl.getUniformLocation(progID, "lightVec");
    attenuationLoc = gl.getUniformLocation(progID, "attenuationVal");
}


function SupplyData()
{
    var sceneVertexData = loadVertexData(currentFileName);
    
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
    
    gl.useProgram(program); 
	
}

function Render()
{                      
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // camera orbits in the z=1.5 plane
    // and looks at the origin
    // mat4LookAt replaces gluLookAt
    var rad = Math.PI / 180.0 * this.t;

    mat4.lookAt(modelview,
               1.5*Math.cos(rad), 1.5*Math.sin(rad), 1.5, // eye
               0.0, 0.0, 0.0, // look at
               0.0, 0.0, 1.0); // up
    
    //mat4Print(modelview);
    
    var modelviewInv = new Float32Array(16);
    var normalmatrix = new Float32Array(16);
    mat4.invert(modelview, modelviewInv);
    mat4.transpose(modelviewInv, normalmatrix);
    
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
}

var RunWebGL = function(vertexShaderId, fragShaderID)
{
    InitWebGL();
    InitShader(vertexShaderId, fragShaderID);
    SupplyData();
    ConnectWithShaderAttribute();       
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
     
    if (request.status != 200) {
      alert("can not load file " + filename);

    }else{
      var floatVals = request.responseText.split('\n');
      var numFloats = parseInt(floatVals[0]);
      if(numFloats % (3+2+3) != 0) return data;
      data = new Float32Array(numFloats);
      for(var k = 0; k < numFloats; k++) {
        data[k] = floatVals[k+1];
      }
    }
    return data;
  }