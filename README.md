# AR Experience — Video on Custom Marker

A WebAR project that plays a video on a custom marker image using **MindAR.js** and **A-Frame**.

## Flow

```
📱 Scan QR Code → 🌐 Website Opens → 📷 Camera Activates → 🎯 Point at Marker → 🎥 Video Plays!
```

## Quick Start

### Step 1: Compile the AR Target

Before running the AR experience, you need to compile your marker image into MindAR's `.mind` format:

```bash
npm run compile
```

This opens a browser page. Click **"Compile Target"**, wait for it to finish, then move the downloaded `targets.mind` file into the `assets/` folder.

### Step 2: Start the Server

```bash
npm start
```

Opens at `http://localhost:8080`.

### Step 3: Test It

1. Open `assets/thf.jpeg` on another screen (laptop/tablet)
2. Open the AR page on your phone (use your local IP, e.g., `http://192.168.x.x:8080`)
3. Point camera at the image → video plays!

## Deploying for Mobile

Mobile browsers require **HTTPS** for camera access. Options:

- **localtunnel**: `npx -y localtunnel --port 8080`
- **ngrok**: `ngrok http 8080`
- **GitHub Pages / Netlify**: push the project and get a free HTTPS URL

## Project Structure

```
├── index.html              # Main AR experience page
├── css/style.css           # Loading UI, scanning hints
├── js/app.js               # Video play/pause on target events
├── assets/
│   ├── thf.jpeg            # Custom marker image
│   ├── video.mp4           # Video to play on marker
│   └── targets.mind        # Compiled MindAR target (generated)
├── print/ar-card.html      # Printable QR code + marker
├── tools/compile.html      # Browser-based target compiler
└── package.json
```

## Replacing Assets

1. Replace `assets/thf.jpeg` with your new marker image
2. Replace `assets/video.mp4` with your new video
3. Re-run `npm run compile` to generate a new `targets.mind`
4. Adjust the `<a-video>` dimensions in `index.html` if your video has a different aspect ratio
