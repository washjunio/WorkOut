// Central de validacoes com Zod (instalar dependencia). Mantido simples para nao quebrar build inicial.
// TODO: substituir stubs por schemas reais quando zod estiver instalado.
export const placeholderValidator = {
  parse: <T>(value: T) => value,
};
