var vertexPositionBuffer;
var vertexTexCoordBuffer;
var vertexIndexBuffer;

function initBuffers(renderer) {
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
  vertexPositionBuffer = renderer.createVertexBuffer();
  vertexPositionBuffer.init(vertices, 3);

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
  vertexTexCoordBuffer = renderer.createVertexBuffer();
  vertexTexCoordBuffer.init(textureCoords, 2);

  var vertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  vertexIndexBuffer = renderer.createVertexIndexBuffer();
  vertexIndexBuffer.init(vertexIndices, 1);
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

  renderer.updateViewport();

  // Bind vertex buffers
  shader_program.bindVertexBuffer('aPosition', vertexPositionBuffer);
  shader_program.bindVertexBuffer('aTexCoord', vertexTexCoordBuffer);

  // Bind index buffers
  renderer.bindVIBuffer(vertexIndexBuffer);

  // Set up texture
  renderer.bindTexture(renderer.texture, 0)


  // Update shader parameters
  // Set up the perspective matrix
  mat4.perspective(45, context.viewportWidth / context.viewportHeight, 0.1, 100.0, pMatrix);

  // Set up the modelview matrix
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);
  mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);
  mat4.rotate(mvMatrix, degToRad(zRot), [0, 0, 1]);

  shader_program.updateUniforms({
    'uSampler': 0,
    'uMVMatrix': mvMatrix,
    'uPMatrix': pMatrix
  })

  context.drawElements(context.TRIANGLES, vertexIndexBuffer.glIndexBuffer.numItems, context.UNSIGNED_SHORT, 0);
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
    //setTimeout(function() {
      tick(renderer);
    //}, 1000);
  })
  //console.log('drawing')
  updateAndDraw(renderer);
}

$(document).ready(function() {
  console.log("Ready!!!!")

  // Initialize openGL
  var canvas = document.getElementById("webgl-canvas");
  canvas.width = document.width;
  canvas.height = document.height;
  var context = initGL(canvas);

  var renderer = new SIGL.Renderer(context);

  renderer.initShaders();

  initBuffers(renderer);
  renderer.initTexture();

  context.clearColor(0.0, 0.0, 0.0, 1.0);
  context.enable(context.DEPTH_TEST);

  tick(renderer);
});
