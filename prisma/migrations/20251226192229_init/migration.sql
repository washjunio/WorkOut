-- CreateEnum
CREATE TYPE "ExecutionType" AS ENUM ('FORCA_CARGA', 'PESO_CORPORAL', 'TEMPO', 'CARDIO_CONTINUO');

-- CreateEnum
CREATE TYPE "FoodIntakeLevel" AS ENUM ('DENTRO_DA_DIETA', 'LEVEMENTE_ACIMA', 'ACIMA', 'FORA_DA_DIETA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "type" "ExecutionType" NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weekDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanExercise" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "targetReps" INTEGER,
    "targetWeight" DOUBLE PRECISION,
    "targetDuration" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseExecution" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ExecutionType" NOT NULL,
    "reps" INTEGER,
    "weight" DOUBLE PRECISION,
    "durationSec" INTEGER,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planExerciseId" TEXT,
    "notes" TEXT,

    CONSTRAINT "ExerciseExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardioSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "CardioSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "waterLiters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foodIntake" "FoodIntakeLevel" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExercise" ADD CONSTRAINT "PlanExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExercise" ADD CONSTRAINT "PlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseExecution" ADD CONSTRAINT "ExerciseExecution_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseExecution" ADD CONSTRAINT "ExerciseExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseExecution" ADD CONSTRAINT "ExerciseExecution_planExerciseId_fkey" FOREIGN KEY ("planExerciseId") REFERENCES "PlanExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardioSession" ADD CONSTRAINT "CardioSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
