-- CreateEnum
CREATE TYPE "TipoTreino" AS ENUM ('FORCA', 'PESO_CORPO', 'TEMPO', 'CARDIO');

-- AlterTable
ALTER TABLE "PlanExercise" ADD COLUMN "tipoTreino" "TipoTreino",
ALTER COLUMN "targetSets" DROP NOT NULL;

-- Update existing records with default value (FORCA for REPETICOES, TEMPO for TEMPO, CARDIO for CARDIO)
UPDATE "PlanExercise" SET "tipoTreino" = CASE
  WHEN "executionMode" = 'CARDIO' THEN 'CARDIO'::"TipoTreino"
  WHEN "executionMode" = 'TEMPO' THEN 'TEMPO'::"TipoTreino"
  WHEN "executionMode" = 'REPETICOES' THEN 'FORCA'::"TipoTreino"
  ELSE 'FORCA'::"TipoTreino"
END;

-- Make tipoTreino NOT NULL after updating existing records
ALTER TABLE "PlanExercise" ALTER COLUMN "tipoTreino" SET NOT NULL;


