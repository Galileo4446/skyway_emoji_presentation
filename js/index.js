Promise.all([
    faceapi.nets.ssdMobilenetv1.load('./models'), // 精度の高い顔検出モデル
    faceapi.nets.faceLandmark68Net.load('./models'), // 顔の68個のランドマークの検出モデル
    faceapi.nets.faceExpressionNet.load('./models'), // 顔の68個のランドマークの検出モデル
]).catch((e) => {
    console.log(`face-apiを読み込むことができませんでした。${e}`);
});

// Webカメラの起動
const video = document.getElementById('video');
const media = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
        width: 640,
        height: 360,
        aspectRatio: 1.77,
        facingMode: "user",
    }
}).then((stream) => {
    video.srcObject = stream;
    video.onloadeddata = () => {
        video.play();
    }
}).catch((e) => {
    console.log(e);
});

// 描画用canvasの設定
const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
cvs.width = 640; cvs.height = 360;

// face-apiで顔のランドマークを取得します。
let faceData;
async function getLandMarks(){
    // faceData = await faceapi.detectSingleFace(video).withFaceLandmarks();
    faceData = await faceapi.detectSingleFace(video).withFaceExpressions();
    faceHappy = (faceData.expressions.happy )
    console.log(faceHappy);

    if(faceData == null) return;
    // drawLandMarks(faceData.landmarks.positions);
}

// 取得したランドマークをcanvasに描画します。
function drawLandMarks(positions) {
    // ctx.clearRect(0, 0, cvs.width, cvs.height);
    // ctx.fillStyle = '#000000';
    // for(let i = 0; i < positions.length; i++){
    //     ctx.fillRect(positions[i].x, positions[i].y, 3, 3)
    // }
}

function render(){
    requestAnimationFrame(render);
    getLandMarks();
}

render();