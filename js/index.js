Promise.all([
    faceapi.nets.ssdMobilenetv1.load('./models'), // 精度の高い顔検出モデル
    faceapi.nets.faceLandmark68Net.load('./models'), // 顔の68個のランドマークの検出モデル
    faceapi.nets.faceExpressionNet.load('./models'), // 顔の68個のランドマークの検出モデル
]).catch((e) => {
    console.log(`face-apiを読み込むことができませんでした。${e}`);
});

// Webカメラの起動
let localStream;

const myVideo = document.getElementById('my-video');
const media = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
        width: 640,
        height: 360,
        aspectRatio: 1.77,
        facingMode: "user",
    }
}).then((stream) => {
    myVideo.srcObject = stream;
    myVideo.onloadeddata = () => {
        myVideo.play();
        localStream = stream;
    }
}).catch((e) => {
    console.log(e);
});

//Peer作成
const peer = new Peer({
    key: '20573a9c-1b05-486f-8b30-2ab8da60e243',
    debug: 3
});

//PeerID取得
peer.on('open', () => {
    document.getElementById('my-id').textContent = peer.id;
});

// 発信処理
let dataConnection;
document.getElementById('make-call').onclick = () => {
    const theirID = document.getElementById('their-id').value;
    const mediaConnection = peer.call(theirID, localStream);
    dataConnection = peer.connect(theirID);
    setMediaEventListener(mediaConnection);
    setDataEventListener(dataConnection);
};

//メディア着信処理
peer.on('call', mediaConnection => {
    mediaConnection.answer(localStream);
    setMediaEventListener(mediaConnection);
});

//データ着信処理
peer.on('connection', dataConnection => {
    console.log("データコネクション着信したよ");
    setDataEventListener(dataConnection);
});

// イベントリスナを設置する関数
let theirVideo = document.getElementById('their-video');
const setMediaEventListener = mediaConnection => {
mediaConnection.on('stream', stream => {
    // video要素にカメラ映像をセットして再生
    // const theirVideo = document.getElementById('their-video')
    theirVideo.srcObject = stream;
    theirVideo.play();
});
}
const setDataEventListener = dataConnection => {
    dataConnection.on("open", () => {
        console.log("接続された時に発火するイベント");
        // const data = {
        //     name: "SkyWay",
        //     msg: "HelloWorld"
        // };
        // dataConnection.send(data);
    });
    dataConnection.on("data", ({ result }) => {
        console.log("受信した時に発火するイベント");
        console.log(`${result}`);
        drawLandMarks(result);
    })
}

// 描画用canvasの設定
const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
cvs.width = 640; cvs.height = 80;

// face-apiで顔のランドマークを取得します。
async function getLandMarks(){
    let myFaceData;
    let theirFaceData;
    let myFaceHappy;
    let theirFaceHappy;
    let myResult;
    let theirResult;
    drawLandMarks("Processing");
    // myFaceData = await faceapi.detectSingleFace(video).withFaceLandmarks();
    myFaceData = await faceapi.detectSingleFace(myVideo).withFaceExpressions();
    myFaceHappy = (myFaceData.expressions.happy);
    console.log(myFaceData.expressions);
    console.log(`自分:${myFaceHappy}`);

    // 相手の映像
    theirFaceData = await faceapi.detectSingleFace(theirVideo).withFaceExpressions();
    theirFaceHappy = (theirFaceData.expressions.happy)
    console.log(`相手:${theirFaceHappy}`);
    // if(myFaceData == null || theirFaceData == null) return;
    // if(myFaceData == null) return;
    if(myFaceHappy > theirFaceHappy){
        myResult = "You Win!!!";
        theirResult = "You Lose...";
    }else if(myFaceHappy == theirFaceHappy){
        myResult = "Draw";
        theirResult = "Draw";   
    }else{
        myResult = "You Lose...";
        theirResult = "You Win!!!";
    }
    //データ送信準備
    const data = {
        result: theirResult
    };
    //データ送信
    dataConnection.send(data);
    drawLandMarks(myResult);
    
}

document.getElementById('start-battle').onclick = () => {
    console.log("start!!")
    getLandMarks();
}

// 取得したランドマークをcanvasに描画します。
function drawLandMarks(message) {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = '#000000';
    ctx.font = "48px serif";
    ctx.fillText(message, 10, 50);
}

function render(){
    requestAnimationFrame(render);
    // getLandMarks();
}

render();