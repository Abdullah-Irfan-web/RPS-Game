# 🤖 Rock–Paper–Scissors AI (React Native + TensorFlow + Expo Camera)

A mobile app built with **React Native (Expo)** that allows users to play Rock–Paper–Scissors using **hand gesture recognition via the mobile camera**.  
The app detects your hand gesture in real-time, compares it with an AI opponent’s random move, and displays the result instantly — just like a real match!

---

## 🚀 Features

- 🎥 Real-time hand gesture recognition using the mobile camera  
- 🧠 TensorFlow.js + HandPose model for detecting hand landmarks  
- ✋ Detects **Rock**, **Paper**, and **Scissors** gestures accurately  
- ✌️ Kindly note, this is the gesture for Scissors
- 🕹️ Countdown before each round to simulate real gameplay  
- 🤝 Displays player move, AI move, and match result  
- 🔄 Camera flip (front/back) support  
- 📱 Built using **Expo SDK 54** — works directly in Expo Go or as an APK  

---

## 🧰 Tech Stack

- **React Native (Expo)**
- **TensorFlow.js + HandPose Model**
- **Expo Camera API**
- **Expo FileSystem**
- **Expo ImageManipulator**

---

## ⚙️ Installation & Setup

###  Clone the repository
```bash
git clone https://github.com/Abdullah-Irfan-web/RPS-Game.git
cd rps-camera-app

2️⃣ Install dependencies
npm install --legacy-peer-deps

⚠️ Note:
Some TensorFlow-related packages (like @tensorflow/tfjs-react-native) have version conflicts with latest Expo SDK.
To avoid dependency resolution errors, always use --legacy-peer-deps while installing.

3️⃣ Start the Expo development server
npx expo start

4️⃣ Run on your mobile device
Install the Expo Go app from Play Store / App Store

Scan the QR code from the terminal or Expo DevTools

App will open on your phone instantly


📸 Demo

👉 Live App: 
https://expo.dev/preview/update?message=Initial+version+of+RPS+Camera+AI+app&updateRuntimeVersion=1.0.0&createdAt=2025-11-08T07%3A29%3A58.475Z&slug=exp&projectId=532af75a-d58f-4311-b553-850940d9db8b&group=e1568aaf-0d2d-4509-bbb5-02c986c701da (Open it in your browser and it will redirect ypu to open through expo go app)

exp://u.expo.dev/532af75a-d58f-4311-b553-850940d9db8b/group/e1568aaf-0d2d-4509-bbb5-02c986c701da (Open directly thorugh your expo go app. Enter this URL Manually)



🧩 How It Works — Gesture Detection Logic

This app uses the @tensorflow-models/handpose model to detect 21 key landmarks on the user’s hand.
From those points, the app calculates distances and depth between fingers to classify the gesture:

✊ Rock

All fingers are folded (short distances from fingertips to palm).

✌️ Scissors

Index and middle fingers are extended forward (toward the camera) while other fingers are bent.
The app checks both 2D distance and depth (z-axis) to confirm they’re pointing outward.

🖐️ Paper

All fingers are extended (large distances for all fingertips).


Once your move is detected, the app:

Randomly generates an AI move.

Compares both moves using Rock–Paper–Scissors rules.

Displays the result (Win/Lose/Draw).

🕒 Gameplay Flow

Tap “Play Round”

A 3-second countdown starts — prepare your hand gesture

The app captures an image and detects your move

The AI plays instantly

You see:

🧠 Your gesture

🎲 AI’s random move

🏆 Result (Win/Lose/Draw)



Summary of Approach

Integrated TensorFlow HandPose for hand landmark detection.

Used distance metrics (2D) and depth comparison (z-axis) to interpret gestures.

Added 3-second countdown to simulate real-life gameplay feel.

AI generates random move — logic implemented via standard RPS rules.

Designed for simplicity, clarity, and cross-platform compatibility (Android/iOS).
