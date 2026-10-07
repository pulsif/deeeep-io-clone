* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0d1321;
  font-family: Arial, Helvetica, sans-serif;
}

body {
  position: relative;
}

#gameCanvas {
  width: 100vw;
  height: 100vh;
  display: block;
  background:
    radial-gradient(circle at center, rgba(41, 84, 58, 0.7), rgba(11, 19, 26, 1) 60%),
    #0d1321;
}

#hud {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 20;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(9, 15, 22, 0.7);
  border-radius: 10px;
  color: #eaf2ff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.32);
}

#hudTitle {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

#hudMeta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.82rem;
}
