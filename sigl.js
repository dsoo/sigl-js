;(function() {
  window.SIGL = {}

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
  window.SIGL.Texture = Texture;

  var VertexBuffer = function(context) {
    this.glContext = context;
    this.glBuffer;

    this.init = function(data, stride) {
      var context = this.glContext;
      var buffer = context.createBuffer();
      context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW);

      // TODO: Validate buffer sizes;
      buffer.itemSize = stride;
      buffer.numItems = vertices.length/stride;
      this.glBuffer = buffer;
    }
  }
  window.SIGL.VertexBuffer = VertexBuffer;

  var VertexIndexBuffer = function(context) {
    this.glContext = context;
    this.glIndexBuffer;

    this.init = function(data, stride) {
      // FIXME: Automatically determine buffer size based on length of index list
      var context = this.glContext;
      var index_buffer = context.createBuffer();
      context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, index_buffer);
      context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), context.STATIC_DRAW);
      index_buffer.itemSize = stride;
      index_buffer.numItems = data.length/stride;
      this.glIndexBuffer = index_buffer;
    }
  }

  var Shader = function(context) {
    this.glContext = context;
    this.glShader;

    // These should be set by parsing them out of the shader
    // but can be set by hand first
    this.uniforms = {}; // name : type
    this.vertexAttributes = [];

    this.initURL = function(url) {
      var str;
      $.ajax({
        url: url,
        success: function(data) {
          str = data;
        },
        async: false,
        dataType: 'text'
      })

      if (!str) {
        console.log('No script!');
        return null;
      }

      var vertex_re = /.+\.vert$/
      var frag_re = /.+\.frag$/

      if (url.match(frag_re)) {
        this.init(str, this.glContext.FRAGMENT_SHADER);
      } else if (url.match(vertex_re)) {
        this.init(str, this.glContext.VERTEX_SHADER);
      } else {
        // FIXME: We're hosed, error appropriately.
      }
    }

    this.init = function(shader_text, shader_type) {
      var shader = context.createShader(shader_type);
      this.glShader = shader;

      context.shaderSource(shader, shader_text);
      context.compileShader(shader);

      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        alert(this.glContext.getShaderInfoLog(shader));
      }
    }

    this.vertexAttribSetup = function(program) {
      var context = this.glContext;
      this.vertexAttributes.forEach(function(attribute) {
        program.enableVertexAttribute(attribute);
      })
    }

    this.uniformSetup = function(program) {
      var context = this.glContext;
      for (uniform in this.uniforms) {
        program.setupUniform(uniform, this.uniforms[uniform]);
      }
    }

    this.setupProgram = function(program) {
      this.vertexAttribSetup(program);
      this.uniformSetup(program);
    }
  }

  var ShaderProgram = function(context) {
    // FIXME: uniforms and vertex attributes should be in a member variable
    // instead of dumped directly onto the object.
    this.glContext = context;
    this.glProgram = undefined;
    this.vertexAttributes = {};
    this.uniformTypes = {};
    this.uniforms = {};

    this.init = function(url) {
      var program;
      var context = this.glContext;
      program = context.createProgram();
      this.glProgram = program;


      var fragment_shader = new Shader(context);
      fragment_shader.initURL("test.frag");
      fragment_shader.uniforms = {
        'uSampler': '1i'
        };

      var vertex_shader = new Shader(context);
      vertex_shader.initURL("test.vert");
      vertex_shader.vertexAttributes = ['aPosition', 'aTexCoord'];
      vertex_shader.uniforms = {
        'uMVMatrix': 'Matrix4fv',
        'uPMatrix': 'Matrix4fv'
        };


      context.attachShader(program, vertex_shader.glShader);
      context.attachShader(program, fragment_shader.glShader);
      context.linkProgram(program);

      if (!context.getProgramParameter(program, context.LINK_STATUS)) {
        alert("Could not initialise shaders");
      }

      context.useProgram(program);

      // TODO:
      // Shaders should be automatically parsed, and attributes should automatically be set up.
      // Parse shader and automatically add attribute variables to
      // And enable attribute arrays
      // javascript program object.
      vertex_shader.setupProgram(this);
      fragment_shader.setupProgram(this);

    }

    this.enableVertexAttribute = function(attribute) {
      var context = this.glContext;
      var va = context.getAttribLocation(this.glProgram, attribute);
      this.vertexAttributes[attribute] = va;
      context.enableVertexAttribArray(va);
    }

    this.setupUniform = function(uniform, uniform_type) {
      this.uniforms[uniform] = context.getUniformLocation(this.glProgram, uniform);
      this.uniformTypes[uniform] = uniform_type;
    }

    // FIXME: This is really a property of the context, not the shader.
    this.bindVertexBuffer = function(attrib_name, buffer) {
      var context = this.glContext;
      context.bindBuffer(context.ARRAY_BUFFER, buffer.glBuffer);
      context.vertexAttribPointer(this.vertexAttributes[attrib_name], buffer.glBuffer.itemSize, context.FLOAT, false, 0, 0);
    }

    this.updateUniforms = function(uniform_values) {
      var context = this.glContext;
      for (uniform in this.uniforms) {
        // FIXME: Understand the 'false' parameter
        // Do this based on the types of uniforms
        var uniform_type = this.uniformTypes[uniform];
        var func_name = 'uniform' + uniform_type;
        //console.log(uniform, func_name, uniform_values[uniform])
        // FIXME: Understand the different uniform types
        if (uniform_type === '1i') {
          context[func_name](this.uniforms[uniform], uniform_values[uniform])
        } else {
          context[func_name](this.uniforms[uniform], false, uniform_values[uniform])
        }
      }
    }
  }
  window.SIGL.ShaderProgram = ShaderProgram;

  var Renderer = function(context) {
    // Keep track of resources for you
    // The rendering context
    // All buffers associated with the context
    // All shaders associated with the context
    // All textures associated with the context

    this.glContext = context;
    this.texture = undefined;

    this.updateViewport = function() {
      var context = this.glContext;
      context.viewport(0, 0, context.viewportWidth, context.viewportHeight);
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }

    this.createVertexBuffer = function() {
      return new VertexBuffer(this.glContext);
    }

    this.createVertexIndexBuffer = function() {
      return new VertexIndexBuffer(this.glContext);
    }

    this.createShaderProgram = function() {
      return new ShaderProgram(this.glContext);
    }

    this.createTexture = function() {
      return new Texture(this.glContext);
    }

    this.bindVIBuffer = function(buffer) {
      this.glContext.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer.glIndexBuffer);
    }

    this.bindTexture = function(texture, index) {
      // FIXME: This should take into account the texture's actual properties
      this.glContext.activeTexture(this.glContext['TEXTURE'+index]);
      this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture.glTexture);
    }
  }
  window.SIGL.Renderer = Renderer;

})();