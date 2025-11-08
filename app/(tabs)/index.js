import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("front");
  const [model, setModel] = useState(null);
  const [ready, setReady] = useState(false);
  const [playerMove, setPlayerMove] = useState("❓");
  const [aiMove, setAiMove] = useState("❓");
  const [result, setResult] = useState("Waiting...");
  const [countdown, setCountdown] = useState(0);

  // ---- Load TensorFlow & Handpose model ----
  useEffect(() => {
    (async () => {
      await tf.ready();
      await tf.setBackend("rn-webgl");
      const loadedModel = await handpose.load();
      setModel(loadedModel);
      setReady(true);
    })();
  }, []);

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  // ---- Countdown before taking picture ----
  const startCountdownAndDetect = async () => {
    setCountdown(3);
    let t = 3;
    const timer = setInterval(() => {
      t--;
      setCountdown(t);
      if (t === 0) {
        clearInterval(timer);
        setCountdown(0);
        detectGesture(); // capture after countdown
      }
    }, 1000);
  };

  // ---- Capture and detect gesture ----
  const detectGesture = async () => {
    if (!cameraRef.current || !model) return;

    const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });

    const manipulated = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 300 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );

    const imgB64 = await FileSystem.readAsStringAsync(manipulated.uri, { encoding: "base64" });
    const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;
    const raw = new Uint8Array(imgBuffer);
    const imageTensor = decodeJpeg(raw);
    const predictions = await model.estimateHands(imageTensor);
    imageTensor.dispose();

    if (predictions.length === 0) {
      setPlayerMove("❓");
      setResult("No hand detected");
      return;
    }

    const gesture = interpretGesture(predictions[0].landmarks);
    const ai = randomMove();
    const res = decideWinner(gesture, ai);

    setPlayerMove(symbolFor(gesture));
    setAiMove(symbolFor(ai));
    setResult(res);
  };

  // ---- Improved Gesture Detection ----
  function interpretGesture(points) {
    const [thumbTip, indexTip, middleTip, ringTip, pinkyTip] = [points[4],
    points[8],
    points[12],
    points[16],
    points[20],];
    const palmBase = points[0];
    const dist2D = (a, b) => Math.hypot(a[1] - b[1], a[2] - b[2]);
    const indexDist = dist2D(indexTip, palmBase);
    const middleDist = dist2D(middleTip, palmBase);
    const ringDist = dist2D(ringTip, palmBase);
    const pinkyDist = dist2D(pinkyTip, palmBase);// Depth (z): smaller = closer to camera
    const zDiffIndex = palmBase[2] - indexTip[2];
    const zDiffMiddle = palmBase[2] - middleTip[2];
    const zDiffRing = palmBase[2] - ringTip[2];
    const zDiffPinky = palmBase[2] - pinkyTip[2];
    const extended2D = [indexDist, middleDist, ringDist, pinkyDist].filter((d) => d > 80).length;// --- Detect pointing-forward scissor gesture ---
    if (zDiffIndex > 15 && zDiffMiddle > 15 && zDiffRing < 10 && zDiffPinky < 10) {
      return "scissors";
    }
    if (extended2D <= 1) return "rock";
    if (extended2D === 2) return "scissors";
    if (extended2D >= 4) return "paper";
    return "unknown";
  }
  

  function randomMove() {
    const moves = ["rock", "paper", "scissors"];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  function decideWinner(player, ai) {
    if (player === "unknown") return "Can't recognize your move!";
    if (player === ai) return "Draw 🤝";
    if (
      (player === "rock" && ai === "scissors") ||
      (player === "paper" && ai === "rock") ||
      (player === "scissors" && ai === "paper")
    )
      return "You Win 🎉";
    return "You Lose 😞";
  }

  function symbolFor(move) {
    if (move === "rock") return "✊";
    if (move === "paper") return "✋";
    if (move === "scissors") return "✌️";
    return "❓";
  }

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      <View style={styles.overlay}>
        {countdown > 0 ? (
          <Text style={[styles.text, { fontSize: 24, fontWeight: "bold" }]}>
            Get Ready... {countdown}
          </Text>
        ) : (
          <>
            <Text style={styles.text}>Your Move: {playerMove}</Text>
            <Text style={styles.text}>AI Move: {aiMove}</Text>
            <Text style={[styles.text, { fontWeight: "bold" }]}>{result}</Text>

            <TouchableOpacity
              onPress={startCountdownAndDetect}
              style={[styles.btn, !ready && { opacity: 0.4 }]}
              disabled={!ready}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                {ready ? "Play Round" : "Loading Model..."}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipBtn}>
          <Text style={{ color: "white" }}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#0008",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  text: { color: "#fff", marginVertical: 4 },
  btn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  flipBtn: {
    backgroundColor: "#666",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  message: { textAlign: "center", paddingBottom: 10, color: "white" },
});
