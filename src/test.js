/**
 * @type {WebGLRenderingContext}
 */
var gl;

window.onload = () => {
  initialize();
  const prg = getProgram();
  createVBO(prg);
  drawPolygon(prg);
};

/**
 * 初期化
 */
function initialize() {
  const canvas = document.getElementById('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  console.log('initalized canvas!');

  // キャンバスコンテキストの取得
  gl = canvas.getContext('webgl');
  // クリア色設定
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // クリア深度設定
  gl.clearDepth(1.0);
  // 色設定と深度設定を元にキャンバスを初期化
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

/**
 * script elementのidからshaderを取得
 * @param {string} id
 * @returns {any}
 */
function getShader(id) {
  let shader;
  // vs, vfのscriptタグを取得
  const el = document.getElementById(id);

  switch(el.type) {
    // エレメントタイプに応じてシェーダーを作成
    case 'x-shader/x-vertex':
      shader = gl.createShader(gl.VERTEX_SHADER);
      break;

    case 'x-shader/x-fragment':
      shader = gl.createShader(gl.FRAGMENT_SHADER);
      break;

    default :
        return;
  }
  // 作成したシェーダーにスクリプトを紐付け
  gl.shaderSource(shader, el.text);
  // コンパイル
  gl.compileShader(shader);

  // エラーハンドリング
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  } else {
    console.error(gl.getShaderInfoLog(shader));
  }
}

/**
 * シェーダープログラムの取得
 * @returns {WebGLProgram}
 */
function getProgram() {
  // シェーダーの取得
  const vshader = getShader('vshader');
  const fshader = getShader('fshader');
  // シェーダープログラムの作成
  const prg = gl.createProgram();
  // シェーダープログラムにvs, fsを紐付け
  gl.attachShader(prg, vshader);
  gl.attachShader(prg, fshader);
  // 紐付けたシェーダーをリンク
  gl.linkProgram(prg);

  if (gl.getProgramParameter(prg, gl.LINK_STATUS)) {
    // コケてなければ
    // このシェーダープログラムを使う
    gl.useProgram(prg);

    return prg;
  } else {
    console.error(gl.getProgramInfoLog(prg));
  }
}

/**
 * VBOを取得
 * @param {Array} srcArr ソース配列
 */
function getVBO(srcArr) {
  // バッファの作成
  const vboBuff = gl.createBuffer();
  // バッファのバインド
  gl.bindBuffer(gl.ARRAY_BUFFER, vboBuff);
  // バッファにデータを流し込む
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(srcArr), gl.STATIC_DRAW);
  // バッファのバインドを切る
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vboBuff;
}

/**
 * VBOを作成
 * @param {WebGLProgram} program
 */
function createVBO(program) {
  const position = VBO();
  const color = VBO();
  // shaderで定義したattaributeのポインタを取得する
  position.location = gl.getAttribLocation(
    program,
    'position'
  );
  color.location = gl.getAttribLocation(
    program,
    'color'
  );
  // attaributeの要素数
  position.length = 3;
  color.length = 4;
  // 頂点座標情報
  position.vertex = [
    // X,   Y,   Z
      0.0, 2.0, 0.0, // Top
      1.5, 0.0, 0.0, // Right
    -0.5, 0.0, 0.0   // Left
  ];
  color.vertex = [
    // R, G, B, A
    1.0, 0.10, 0.0, 1.0, // Top
    0.0, 1.0, 0.0, 1.0, // Right
    0.0, 0.0, 1.0, 1.0, // Left
  ];
  // 頂点バッファの取得
  position.vbo = getVBO(position.vertex);
  color.vbo = getVBO(color.vertex);
  // VBOをバインド
  gl.bindBuffer(gl.ARRAY_BUFFER, position.vbo);
  // attrをバッファに格納みたいなふるまいか？
  gl.enableVertexAttribArray(position.location);
  // シェーダーに登録してるらしい。バインドしたVBOに対して実行される？
  gl.vertexAttribPointer(
    position.location,
    position.length,
    gl.FLOAT,
    false, 0, 0
  );
  // VBOをバインド
  gl.bindBuffer(gl.ARRAY_BUFFER, color.vbo);
  // attrをバッファに格納みたいなふるまいか？
  gl.enableVertexAttribArray(color.location);
  // シェーダーに登録してるらしい。バインドしたVBOに対して実行される？
  gl.vertexAttribPointer(
    color.location,
    color.length,
    gl.FLOAT,
    false, 0, 0
  );
}

/**
 * ポリゴンを描画する
 * 
 * @param {WebGLProgram} prg 
 */
function drawPolygon(prg) {
  // matIVオブジェクトを生成
  // eslint-disable-next-line no-undef
  const m = new matIV();
  
  // 行列の生成
  var model = m.identity(m.create()); // モデル情報（モデルの位置、回転、縮尺
  var view = m.identity(m.create());  // ビュー情報（視点の位置、注視点、向き
  var prj = m.identity(m.create());   // プロジェクション情報（スクリーンのサイズ、クリッピング領域
  var mvpMatrix = m.identity(m.create()); // 足し込みバッファ

  // ビュー変換
  m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], view);
  // プロジェクション変換
  m.perspective(90, 1024 / 768, 0.1, 100, prj);

  m.multiply(prj, view, mvpMatrix); // プロジェクション * ビュー = 足し込みバッファ
  m.multiply(mvpMatrix, model, mvpMatrix); // 足し込みバッファ * モデル = 足し込みバッファ

  // shaderで定義したuniformのポインタを取得する
  const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
  // uniformのポインタをバッファに格納している？
  gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
  // ここまでの情報を元にバッファ内にモデルを描画？
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  // ここまでのバッファデータを吐く
  gl.flush();
}

/**
 * VBOのInterface的ななにか
 */
function VBO() {
  return {
    location: 0,
    length: 0,
    vertex: [],
    vbo: null
  };
}