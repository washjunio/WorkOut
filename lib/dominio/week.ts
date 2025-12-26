// Helpers simples para definicoes semanais (semana comeco na segunda).
export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 domingo
  const diff = (day === 0 ? -6 : 1 - day); // traz para segunda
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date = new Date()) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setMilliseconds(-1);
  return end;
}
