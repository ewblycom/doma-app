window.DOMA = {
  week: "23–29.09.2026",
  budget: 3000,
  basket: 2347,
  people: {
    me: { name: "Я", kcal: 2000, p: 160, f: 65, c: 210, height: 182, weight: 80 },
    wife: { name: "Жена", kcal: 1600, p: 140, f: 52, c: 165, height: 168, weight: 75 }
  },
  goal: "Похудение сейчас, мышцы дальше",
  shops: "Tesco / Albert / Wolt · Чехия",
  meals: [],
  shop: [],
  workouts: [],
  docs: [],
  mailKeep: [],
  mailSkip: []
};
fetch('./week-data.json').then(r=>r.json()).then(d=>{Object.assign(window.DOMA,d); if(window.renderAll) renderAll();});
