var Texture = function(context) {
  this.glContext = context;
  this.glTexture = context.createTexture();

  this.init = function() {
    var context = this.glContext;
    var texture = this.glTexture;

    var size = 8;
    var pixels = new Uint8Array(size*size*4);
    var i;
    for (i = 0; i < size*size*4; ++i) {
      if (0 == (i % 3)) {
        pixels.set([255], i);
      }
    }

    context.bindTexture(context.TEXTURE_2D, texture);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, size, size, 0, context.RGBA, context.UNSIGNED_BYTE, pixels);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.bindTexture(context.TEXTURE_2D, null);
  }
}

var FragmentShader = function(context) {
  this.glContext = context;
  this.glFragShader = undefined;

  this.init = function() {
    this.glFragShader = getShader(this.glContext, "test.frag");

  }
}

var ShaderProgram = function(context) {
  this.glContext = context;
  this.glProgram = undefined;

  this.init = function() {
    console.log('Initializing shaders');
    var program;
    var context = this.glContext;

    var fragmentShader = getShader(context, "test.frag");
    var vertexShader = getShader(context, "test.vert");

    program = context.createProgram();
    context.attachShader(program, vertexShader);
    context.attachShader(program, fragmentShader);
    context.linkProgram(program);

    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    context.useProgram(program);

    // Todo
    // Parse shader and automatically add attribute variables to
    // javascript program object.

    program.vertexPositionAttribute = context.getAttribLocation(program, "aVertexPosition");
    context.enableVertexAttribArray(program.vertexPositionAttribute);

    program.textureCoordAttribute = context.getAttribLocation(program, "aTextureCoord");
    context.enableVertexAttribArray(program.textureCoordAttribute);

    program.pMatrixUniform = context.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = context.getUniformLocation(program, "uMVMatrix");
    program.samplerUniform = context.getUniformLocation(program, "uSampler");

    this.glProgram = program;
  }

  this.update = function(pMatrix, mvMatrix) {
    var context = this.glContext;
    context.uniform1i(this.glProgram.samplerUniform, 0);
    context.uniformMatrix4fv(this.glProgram.pMatrixUniform, false, pMatrix);
    context.uniformMatrix4fv(this.glProgram.mvMatrixUniform, false, mvMatrix);
  }
}

var Renderer = function(context) {
  // Keep track of resources for you
  // The rendering context
  // All buffers associated with the context
  // All shaders associated with the context
  // All textures associated with the context

  this.context = context;
  this.shaderProgram = undefined;
  this.texture = undefined;

  this.initTexture = function() {
    this.texture = new Texture(this.context);
    this.texture.init();
  }

  this.initShaders = function() {
    this.shaderProgram = new ShaderProgram(this.context);
    this.shaderProgram.init();
  }
}

var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;

function initBuffers(context) {
  cubeVertexPositionBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, cubeVertexPositionBuffer);
  vertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];
  context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STATIC_DRAW);
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = 24;

  cubeVertexTextureCoordBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  var textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];
  context.bufferData(context.ARRAY_BUFFER, new Float32Array(textureCoords), context.STATIC_DRAW);
  cubeVertexTextureCoordBuffer.itemSize = 2;
  cubeVertexTextureCoordBuffer.numItems = 24;

  cubeVertexIndexBuffer = context.createBuffer();
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  var cubeVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), context.STATIC_DRAW);
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numItems = 36;
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

var xRot = 0;
var yRot = 0;
var zRot = 0;

function drawScene(renderer) {
  var context = renderer.context;
  var shader_program = renderer.shaderProgram;

  var mvMatrix = mat4.create();
  var pMatrix = mat4.create();

  context.viewport(0, 0, context.viewportWidth, context.viewportHeight);
  context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);


  // Bind vertex attributes
  context.bindBuffer(context.ARRAY_BUFFER, cubeVertexPositionBuffer);
  context.vertexAttribPointer(shader_program.glProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, context.FLOAT, false, 0, 0);

  context.bindBuffer(context.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  context.vertexAttribPointer(shader_program.glProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, context.FLOAT, false, 0, 0);

  // Set up texture
  context.activeTexture(context.TEXTURE0);
  context.bindTexture(context.TEXTURE_2D, renderer.texture.glTexture);

  // Bind vertex data
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  // Update shader parameters
  // Set up the perspective matrix
  mat4.perspective(45, context.viewportWidth / context.viewportHeight, 0.1, 100.0, pMatrix);

  // Set up the modelview matrix
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);
  mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);
  mat4.rotate(mvMatrix, degToRad(zRot), [0, 0, 1]);

  shader_program.update(pMatrix, mvMatrix);

  context.drawElements(context.TRIANGLES, cubeVertexIndexBuffer.numItems, context.UNSIGNED_SHORT, 0);
}


var lastTime = 0;

function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    xRot += (90 * elapsed) / 10000.0;
    yRot += (90 * elapsed) / 10000.0;
    zRot += (90 * elapsed) / 10000.0;
  }
  lastTime = timeNow;
}

function updateAndDraw(renderer) {
  drawScene(renderer);
  animate();
}

function tick(renderer) {
  requestAnimFrame(function() {
    tick(renderer);
  })
  updateAndDraw(renderer);
}

$(document).ready(function() {
  console.log("Ready!!!!")

  // Initialize openGL
  var canvas = document.getElementById("webgl-canvas");
  canvas.width = document.width;
  canvas.height = document.height;
  var context = initGL(canvas);
  var renderer = new Renderer(context);

  renderer.initShaders();

  initBuffers(context);
  renderer.initTexture();

  context.clearColor(0.0, 0.0, 0.0, 1.0);
  context.enable(context.DEPTH_TEST);

  tick(renderer);
});
