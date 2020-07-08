var gl;

window.onload = () => {
  initialize();
  const prg = getProgram();
  registVBO(prg);

  // matIVオブジェクトを生成
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
 * プログラムを取得
 */
function getProgram() {
  const vshader = createShader('vshader');
  const fshader = createShader('fshader');
  return createProgram(vshader, fshader);
}

/**
 * VBOを登録
 */
function registVBO(program) {
  // shaderで定義したattaributeのポインタを取得する
  const attrLocation = gl.getAttribLocation(
    program,
    'position'
  );
  // attaributeの要素数（vec3だから3？勝手に取ってくれよ（）
  const attrLength = 3;
  // 頂点座標情報
  const vertexPos = [
    // X,   Y,   Z
     0.0, 2.0, 0.0,
     1.5, 0.0, 0.0,
    -1.0, 0.0, 0.0
  ];
  // 頂点バッファの取得
  const vbo = createVBO(vertexPos);
  // VBOをバインド
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  // attrをバッファに格納みたいなふるまいか？
  gl.enableVertexAttribArray(attrLocation);
  // シェーダーに登録してるらしい。バインドしたVBOに対して実行される？
  gl.vertexAttribPointer(
    attrLocation,
    attrLength,
    gl.FLOAT,
    false, 0, 0
  );
}

/**
 * script elementのidからshaderを生成
 * @param string id 
 */
function createShader(id) {
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
 * シェーダープログラムの生成
 * @param vs vertex
 * @param fs fragment
 */
function createProgram(vs, fs) {
  // シェーダープログラムの作成
  const pg = gl.createProgram();
  // シェーダープログラムにvs, fsを紐付け
  gl.attachShader(pg, vs);
  gl.attachShader(pg, fs);
  // 紐付けたシェーダーをリンク
  gl.linkProgram(pg);

  if (gl.getProgramParameter(pg, gl.LINK_STATUS)) {
    // コケてなければ
    // このシェーダープログラムを使う
    gl.useProgram(pg);

    return pg;
  } else {
    console.error(gl.getProgramInfoLog(pg));
  }
}

/**
 * VBOを作成
 * @param srcArr ソース配列
 */
function createVBO(srcArr) {
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