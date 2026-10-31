* { margin:0; padding:0; box-sizing:border-box; }

body {
  background-color: #09090b;
  color: #f4f4f5;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

/* LOGIN */
.login-box {
  background: #141417;
  padding: 40px 30px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  text-align: center;
  width: 100%;
  max-width: 360px;
  margin-top: 15vh;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}

.login-box h2 { color: #4ade80; font-size: 20px; margin-bottom: 8px; }

.pin-input {
  width: 100%;
  padding: 16px;
  background: #09090b;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  text-align: center;
  font-size: 24px;
  letter-spacing: 8px;
  outline: none;
  margin: 20px 0;
}

.pin-input:focus { border-color: #4ade80; }

.btn-login {
  width: 100%;
  background: #4ade80;
  color: #09090b;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* PAINEL */
#painel-privado { width: 100%; max-width: 500px; }

.status-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #eab308;
  background: rgba(234,179,8,0.1);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 10px;
}

#painel-privado h1 { font-size: 22px; font-weight: 900; color: #4ade80; }

/* ABAS */
.tabs-nav { display: flex; gap: 6px; margin: 20px 0; }

.tab-btn {
  flex: 1;
  background: #141417;
  color: #71717a;
  border: 1px solid rgba(255,255,255,0.05);
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.2s;
}

.tab-btn.active { background: #27272a; color: #f4f4f5; border-color: #4b5563; }

.tab-content { display: none; }
.tab-content.active { display: block; }

/* CARDS E INPUTS */
.card-admin {
  background: #141417;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 12px;
}

.card-admin h3 { font-size: 14px; font-weight: 800; margin-bottom: 12px; color: #f4f4f5; }

.input-field {
  width: 100%;
  padding: 12px;
  background: #09090b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #f4f4f5;
  font-size: 13px;
  outline: none;
}

.input-field:focus { border-color: #4ade80; }

.btn-action {
  width: 100%;
  background: #eab308;
  color: #09090b;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  text-transform: uppercase;
}

/* RETRÔ */
.moldura-retro {
  background: #f2ebd9;
  border: 6px double #3b2d20;
  padding: 20px;
  margin: 15px auto;
  color: #3b2d20;
  font-family: Georgia, serif;
  text-align: center;
  border-radius: 4px;
}

.retro-badge {
  background: #c2410c;
  color: #f2ebd9;
  font-weight: bold;
  font-size: 10px;
  padding: 3px 10px;
  text-transform: uppercase;
  display: inline-block;
}

.retro-divisor { width: 40px; height: 2px; background: #3b2d20; margin: 10px auto; }

/* LEGENDAS KATERINA */
.legenda-card {
  background: #09090b;
  border: 1px solid rgba(249,115,22,0.2);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.legenda-card textarea {
  width: 100%;
  height: 130px;
  background: #141417;
  color: #f4f4f5;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  resize: none;
  font-family: monospace;
  margin: 8px 0;
}

.btn-copiar {
  width: 100%;
  background: #25D366;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 11px;
  cursor: pointer;
}

/* RADAR ITEMS */
.radar-item {
  background: #09090b;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #10b981;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.radar-meta { display: flex; justify-content: space-between; font-size: 10px; font-weight: 800; }
.radar-link { color: #f4f4f5; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.radar-actions { display: flex; gap: 6px; margin-top: 4px; }
.radar-actions a, .radar-actions button {
  flex: 1;
  padding: 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: none;
}
.radar-actions a { background: #1e293b; color: #4ade80; }
.radar-actions button { background: #27272a; color: #fff; border: 1px solid #3f3f46; }
