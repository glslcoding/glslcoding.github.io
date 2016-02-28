



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
    mat4Perspective(projection, 45.0, w/h, 0.5, 4.0);
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

    mat4LookAt(modelview,
               1.5*Math.cos(rad), 1.5*Math.sin(rad), 1.5, // eye
               0.0, 0.0, 0.0, // look at
               0.0, 0.0, 1.0); // up
    
    //mat4Print(modelview);
    
    var modelviewInv = new Float32Array(16);
    var normalmatrix = new Float32Array(16);
    mat4Invert(modelview, modelviewInv);
    mat4Transpose(modelviewInv, normalmatrix);
      
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




  // the following functions are some matrix and vector helpers
  // they work for this demo but in general it is recommended
  // to use more advanced matrix libraries
  function vec3Dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  function vec3Cross(a, b, res) {
    res[0] = a[1] * b[2]  -  b[1] * a[2];
    res[1] = a[2] * b[0]  -  b[2] * a[0];
    res[2] = a[0] * b[1]  -  b[0] * a[1];
  }

  function vec3Normalize(a) {
    var mag = Math.sqrt(a[0] * a[0]  +  a[1] * a[1]  +  a[2] * a[2]);
    a[0] /= mag; a[1] /= mag; a[2] /= mag;
  } 
  
  function mat4Identity(a) {
    a.length = 16;
    for (var i = 0; i < 16; ++i) a[i] = 0.0;
    for (var i = 0; i < 4; ++i) a[i + i * 4] = 1.0;
  }

  function mat4Multiply(a, b, res) {
    for (var i = 0; i < 4; ++i) {
      for (var j = 0; j < 4; ++j) {
        res[j*4 + i] = 0.0;
        for (var k = 0; k < 4; ++k) {
          res[j*4 + i] += a[k*4 + i] * b[j*4 + k];
        }
      }
    }
  }
  
  function mat4Perspective(a, fov, aspect, zNear, zFar) {
    var f = 1.0 / Math.tan (fov/2.0 * (Math.PI / 180.0));
    mat4Identity(a);
    a[0] = f / aspect;
    a[1 * 4 + 1] = f;
    a[2 * 4 + 2] = (zFar + zNear)  / (zNear - zFar);
    a[3 * 4 + 2] = (2.0 * zFar * zNear) / (zNear - zFar);
    a[2 * 4 + 3] = -1.0;
    a[3 * 4 + 3] = 0.0;
  }
  
  function  mat4LookAt(viewMatrix,
      eyeX, eyeY, eyeZ,
      centerX, centerY, centerZ,
      upX, upY, upZ) {

    var dir = new Float32Array(3);
    var right = new Float32Array(3);
    var up = new Float32Array(3);
    var eye = new Float32Array(3);

    up[0]=upX; up[1]=upY; up[2]=upZ;
    eye[0]=eyeX; eye[1]=eyeY; eye[2]=eyeZ;

    dir[0]=centerX-eyeX; dir[1]=centerY-eyeY; dir[2]=centerZ-eyeZ;
    vec3Normalize(dir);
    vec3Cross(dir,up,right);
    vec3Normalize(right);
    vec3Cross(right,dir,up);
    vec3Normalize(up);
    // first row
    viewMatrix[0]  = right[0];
    viewMatrix[4]  = right[1];
    viewMatrix[8]  = right[2];
    viewMatrix[12] = -vec3Dot(right, eye);
    // second row
    viewMatrix[1]  = up[0];
    viewMatrix[5]  = up[1];
    viewMatrix[9]  = up[2];
    viewMatrix[13] = -vec3Dot(up, eye);
    // third row
    viewMatrix[2]  = -dir[0];
    viewMatrix[6]  = -dir[1];
    viewMatrix[10] = -dir[2];
    viewMatrix[14] =  vec3Dot(dir, eye);
    // forth row
    viewMatrix[3]  = 0.0;
    viewMatrix[7]  = 0.0;
    viewMatrix[11] = 0.0;
    viewMatrix[15] = 1.0;
  }
  
  function mat4Print(a) {
    // opengl uses column major order
    var out = "";
    for (var i = 0; i < 4; ++i) {
      for (var j = 0; j < 4; ++j) {
        out += a[j * 4 + i] + " ";
      }
      out += "\n";
    }
    alert(out);
  }
  
  function mat4Transpose(a, transposed) {
    var t = 0;
    for (var i = 0; i < 4; ++i) {
      for (var j = 0; j < 4; ++j) {
        transposed[t++] = a[j * 4 + i];
      }
    }
  }

  function mat4Invert(m, inverse) {
    var inv = new Float32Array(16);
    inv[0] = m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+
             m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10];
    inv[4] = -m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-
             m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10];
    inv[8] = m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+
             m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9];
    inv[12]= -m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-
             m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9];
    inv[1] = -m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-
             m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10];
    inv[5] = m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+
             m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10];
    inv[9] = -m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-
             m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9];
    inv[13]= m[0]*m[9]*m[14]-m[0]*m[10]*m[13]-m[8]*m[1]*m[14]+
             m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9];
    inv[2] = m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+
             m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6];
    inv[6] = -m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-
             m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6];
    inv[10]= m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+
             m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5];
    inv[14]= -m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-
             m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5];
    inv[3] = -m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-
             m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6];
    inv[7] = m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+
             m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6];
    inv[11]= -m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-
             m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5];
    inv[15]= m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+
             m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5];

    var det = m[0]*inv[0]+m[1]*inv[4]+m[2]*inv[8]+m[3]*inv[12];
    if (det == 0) return false;
    det = 1.0 / det;
    for (var i = 0; i < 16; i++) inverse[i] = inv[i] * det;
    return true;
  }