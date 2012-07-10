function initGL(canvas) {
  var context;
  try {
    context = canvas.getContext("experimental-webgl");
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } catch (e) {
  }
  if (!context) {
    alert("Could not initialise WebGL, sorry :-(");
  }
  return context;
}

function getShader(context, url) {
  var str;
  $.ajax({
    url: url,
    success: function(data) {
      str = data;
    },
    async: false,
    dataType: 'text'
  })
  //var shaderScript = document.getElementById(id);
  if (!str) {
    console.log('No script!');
    return null;
  }

  //var k = shaderScript.firstChild;
  //while (k) {
  //  if (k.nodeType == 3) {
  //    str += k.textContent;
  //  }
  //  k = k.nextSibling;
  //}

  var vertex_re = /.+\.vert$/
  var frag_re = /.+\.frag$/

  var shader;
  if (url.match(frag_re)) {
    shader = context.createShader(context.FRAGMENT_SHADER);
  } else if (url.match(vertex_re)) {
    shader = context.createShader(context.VERTEX_SHADER);
  } else {
    return null;
  }

  context.shaderSource(shader, str);
  context.compileShader(shader);

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    alert(context.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}
