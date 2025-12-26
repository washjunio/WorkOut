// Funcoes utilitarias puras, sem efeitos colaterais.
export function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

// TODO: adicionar helpers de unidade (kg/lbs, km/mi) e formatadores de tempo.
