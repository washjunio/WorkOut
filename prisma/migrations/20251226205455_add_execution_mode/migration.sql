-- CreateEnum
CREATE TYPE "ExecutionMode" AS ENUM ('REPETICOES', 'TEMPO', 'CARDIO');

-- AlterTable
ALTER TABLE "PlanExercise" ADD COLUMN     "executionMode" "ExecutionMode" NOT NULL DEFAULT 'REPETICOES',
ADD COLUMN     "restSeconds" INTEGER,
ADD COLUMN     "weeklyTargetMinutes" INTEGER;

-- CreateIndex
CREATE INDEX "CardioSession_userId_startedAt_idx" ON "CardioSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "ExerciseExecution_userId_exerciseId_executedAt_idx" ON "ExerciseExecution"("userId", "exerciseId", "executedAt");
