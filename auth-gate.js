(function () {
  const URL = "https://nvxzplthqeqyihqzgacf.supabase.co";
  const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eHpwbHRocWVxeWlocXpnYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTY1NzQsImV4cCI6MjEwNTczMjU3NH0.FT5ve5zEFbnF_5Ac-aM3Mv_lingo9OgIGM6Y3h9xJfs";
  const SITE = "https://ewblycom.github.io/doma-app/";
  function partnerEmail(code) { return "partner." + code + "@join.doma.app"; }
  function partnerPass(code) { return "DomaJoin-" + code + "-9x"; }
  function nice(m) {
    const t = String(m || "");
    if (/already registered/i.test(t)) return "Этот email уже есть. Откройте вход.";
    if (/invalid login/i.test(t)) return "Неверный email или пароль.";
    if (/invalid invite/i.test(t)) return "Неверный код дома.";
    if (/household is full/i.test(t)) return "В доме уже двое.";
    if (/already in a household/i.test(t)) return "Вы уже в доме.";
    if (/gen_random_bytes/i.test(t)) return "В SQL Editor нужно выполнить sql-fix.sql.";
    if (/not authenticated/i.test(t)) return "Сессия не создалась. Выключите Confirm email в Supabase.";
    return t;
  }
  const gate = document.createElement("div");
  gate.id = "authGate";
  gate.innerHTML = '<div class="auth-box"><h1>Дома</h1><div class="auth-seg"><button type="button" data-mode="login" class="on">Вход</button><button type="button" data-mode="create">Создать дом</button><button type="button" data-mode="join">Код дома</button></div><p id="authErr" class="auth-err" hidden></p><form id="authForm"></form></div>';
  document.body.appendChild(gate);
  let mode = "login";
  let sb = null;
  window.DOMA_AUTH = { house: null, profile: null };
  function showErr(msg) {
    const el = document.getElementById("authErr");
    if (!msg) { el.hidden = true; el.textContent = ""; return; }
    el.hidden = false; el.textContent = nice(msg);
  }
  function formHtml() {
    if (mode === "join") return '<input name="code" inputmode="numeric" maxlength="8" placeholder="Код дома" required><button type="submit">Войти по коду</button><p class="auth-hint">Жена вводит только код.</p>';
    if (mode === "create") return '<input name="house" placeholder="Название дома" value="Дом"><input name="email" type="email" placeholder="Email" required><input name="password" type="password" minlength="6" placeholder="Пароль" required><button type="submit">Создать дом</button>';
    return '<input name="email" type="email" placeholder="Email" required><input name="password" type="password" minlength="6" placeholder="Пароль" required><button type="submit">Войти</button>';
  }
  function drawForm() {
    document.querySelectorAll(".auth-seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.mode === mode); });
    document.getElementById("authForm").innerHTML = formHtml();
  }
  async function afterSession() {
    const { data: prof } = await sb.from("profiles").select("id,slot,display_name,household_id,kcal,protein,height,weight").eq("id", (await sb.auth.getUser()).data.user.id).maybeSingle();
    if (!prof) return false;
    const { data: house } = await sb.from("households").select("id,name,invite_code").eq("id", prof.household_id).maybeSingle();
    window.DOMA_AUTH.profile = prof;
    window.DOMA_AUTH.house = house;
    if (prof.slot === "partner" && window.state) state.who = "wife";
    gate.style.display = "none";
    document.body.classList.add("authed");
    paintCode();
    return true;
  }
  function paintCode() {
    const pill = document.getElementById("whoPill");
    if (!pill) return;
    let chip = document.getElementById("houseChip");
    if (!chip) {
      chip = document.createElement("button");
      chip.id = "houseChip";
      chip.className = "house-chip";
      chip.type = "button";
      pill.parentNode.insertBefore(chip, pill);
    }
    const code = (window.DOMA_AUTH.house && window.DOMA_AUTH.house.invite_code) || "";
    chip.textContent = code ? ("Код " + code) : "Дом";
    chip.onclick = openSettings;
  }
  function openSettings() {
    const h = window.DOMA_AUTH.house || {};
    const p = window.DOMA_AUTH.profile || {};
    const body = '<p class="hint">Название: <b>' + (h.name || "Дом") + '</b></p><p class="hint">Код для жены</p><div class="house-code">' + (h.invite_code || "—") + '</div><p class="hint">Она открывает этот же сайт → «Код дома» → вводит только цифры.</p><label class="fl">Рост см <input id="setH" type="number" value="' + (p.height || "") + '"></label><label class="fl">Вес кг <input id="setW" type="number" value="' + (p.weight || "") + '"></label><div class="row-btns"><button class="on" type="button" id="saveProf">Сохранить</button><button type="button" id="signOut">Выйти</button></div>';
    if (typeof openSheet === "function") openSheet("Настройки", body);
    setTimeout(function () {
      const s = document.getElementById("saveProf");
      const o = document.getElementById("signOut");
      if (s) s.onclick = async function () {
        const height = Number(document.getElementById("setH").value || 0);
        const weight = Number(document.getElementById("setW").value || 0);
        await sb.from("profiles").update({ height: height || null, weight: weight || null }).eq("id", p.id);
        if (typeof closeSheet === "function") closeSheet();
      };
      if (o) o.onclick = async function () { await sb.auth.signOut(); location.reload(); };
    }, 30);
  }
  document.querySelectorAll(".auth-seg button").forEach(function (b) {
    b.onclick = function () { mode = b.dataset.mode; showErr(""); drawForm(); };
  });
  drawForm();
  document.getElementById("authForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    showErr("");
    try {
      if (mode === "join") {
        const code = String(fd.get("code") || "").replace(/\s/g, "");
        if (!code) return showErr("Введите код");
        const email = partnerEmail(code);
        const password = partnerPass(code);
        let up = await sb.auth.signUp({ email: email, password: password, options: { emailRedirectTo: SITE } });
        if (up.error && !/already/i.test(up.error.message)) { /* continue to sign in anyway */ }
        const inn = await sb.auth.signInWithPassword({ email: email, password: password });
        if (inn.error) return showErr(inn.error.message);
        if (!(await afterSession())) {
          const rpc = await sb.rpc("join_household", { p_code: code });
          if (rpc.error) return showErr(rpc.error.message);
          if (!(await afterSession())) return showErr("Код принят, но профиль не создался. Проверьте SQL.");
        }
        return;
      }
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");
      if (mode === "create") {
        let { data, error } = await sb.auth.signUp({ email: email, password: password, options: { emailRedirectTo: SITE } });
        if (error && /already registered/i.test(error.message)) {
          const inn = await sb.auth.signInWithPassword({ email: email, password: password });
          if (inn.error) return showErr(inn.error.message);
        } else if (error) return showErr(error.message);
        else if (!data.session) {
          const inn = await sb.auth.signInWithPassword({ email: email, password: password });
          if (inn.error) return showErr("Выключите Confirm email в Supabase (Authentication → Providers → Email).");
        }
        if (!(await afterSession())) {
          const rpc = await sb.rpc("create_household", { p_name: String(fd.get("house") || "Дом") });
          if (rpc.error) return showErr(rpc.error.message);
          if (!(await afterSession())) return showErr("Дом не создался. Выполните sql-fix.sql в Supabase.");
        }
        return;
      }
      const inn = await sb.auth.signInWithPassword({ email: email, password: password });
      if (inn.error) return showErr(inn.error.message);
      if (!(await afterSession())) showErr("Вы вошли, но дома ещё нет. Откройте «Создать дом».");
    } catch (err) { showErr(err.message || String(err)); }
  });
  async function boot() {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    sb = createClient(URL, ANON);
    window.DOMA_SB = sb;
    const { data } = await sb.auth.getSession();
    if (data.session && await afterSession()) return;
    gate.style.display = "flex";
  }
  boot();
})();
