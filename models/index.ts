// Modelos representam o dominio (objetos ricos) e nao a persistencia.
// Defina factories/constructors aqui para Workout, Cardio, Habito etc.
export type Workout = {
  id: string;
  name: string;
  scheduledAt?: Date;
};

// TODO: adicionar modelos de Habito e Registro diario conforme features.
