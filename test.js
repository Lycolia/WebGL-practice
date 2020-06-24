var gl;

window.onload = () => {
  const cnv = document.getElementById('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  console.log('initalized canvas!');

  gl = canvas.getContext('webgl');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * script elementのidからshaderを生成
 * @param string id 
 */
function createShader(id) {
  let shader;
  const el = document.getElementById(id);

  switch(el.type) {
    case 'x-shader/x-vertex':
      shader = gl.createShader(gl.VERTEX_SHADER);
      break;

    case 'x-shader/x-vertex':
      shader = gl.createShader(gl.FRAGMENT_SHADER);
      break;

    default :
        return;
  }
  gl.shaderSource(shader, scriptElement.text);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  } else {
    console.error(gl.getShaderInfoLog(shader));
  }
}

/**
 * プログラムオブジェクトの生成
 * @param vs vertex
 * @param fs fragment
 */
function createProgram(vs, fs) {
  const pg = gl.createProgram();
  gl.attachShader(pg, vs);
  gl.attachShader(pg, fs);
  gl.linkProgram(pg);

  if (gl.getProgramParameter(pg, gl.LINK_STATUS)) {
    gl.useProgram(pg);

    return pg;
  } else {
    console.error(gl.getProgramInfoLog(pg));
  }
}