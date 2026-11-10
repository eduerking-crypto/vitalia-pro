import type {
  AdherenceStats,
  Appointment,
  ChatResponse,
  DailySummary,
  DrugInteraction,
  HealthScore,
  LabResult,
  Meal,
  MedicalDocument,
  MedicalProfile,
  Medication,
  MoodRecord,
  Notification,
  NutritionGoals,
  NutritionSuggestion,
  SleepRecord,
  Specialty,
  User,
  UserSettings,
  VitalSign,
} from "@vitalia/shared-types";
import { format, subDays } from "date-fns";
import { AGENTS_INFO, DEMO_CREDENTIALS } from "@/lib/constants";

/* ---------- utilidades deterministas ---------- */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261110);

const between = (min: number, max: number, decimals = 0) => {
  const value = min + rand() * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const isoDate = (d: Date) => format(d, "yyyy-MM-dd");

/* ---------- usuario y perfil ---------- */

export const mockUser: User = DEMO_CREDENTIALS.authResponse.user;

export const mockMedicalProfile: MedicalProfile = {
  id: "10000000-0000-4000-8000-000000000001",
  user_id: mockUser.id,
  blood_type: "O+",
  height_cm: 168,
  weight_kg: 64.2,
  chronic_conditions: ["Hipertensión arterial leve", "Prediabetes"],
  family_history: ["Padre: cardiopatía isquémica", "Madre: hipotiroidismo"],
  emergency_contact_name: "Marcos Ríos (hermano)",
  emergency_contact_phone: "+34 611 223 344",
  insurance_provider: "Sanitas — Plan Vital",
  insurance_policy: "SAN-8842-2019",
  allergies: [
    {
      id: "20000000-0000-4000-8000-000000000001",
      profile_id: "10000000-0000-4000-8000-000000000001",
      allergen: "Penicilina",
      severity: "severe",
      reaction: "Urticaria generalizada y dificultad respiratoria",
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      profile_id: "10000000-0000-4000-8000-000000000001",
      allergen: "Polen de gramíneas",
      severity: "moderate",
      reaction: "Rinitis alérgica estacional",
    },
    {
      id: "20000000-0000-4000-8000-000000000003",
      profile_id: "10000000-0000-4000-8000-000000000001",
      allergen: "Sulfitos",
      severity: "mild",
      reaction: "Cefalea leve tras vino tinto",
    },
  ],
};

export const mockSettings: UserSettings = {
  theme: "system",
  language: "es",
  notifications: {
    medications: true,
    appointments: true,
    achievements: true,
    weekly_report: false,
  },
  units: { weight: "kg", temperature: "c", distance: "km" },
  privacy: { share_anonymized_data: false, allow_ai_suggestions: true },
};

/* ---------- salud: vitales, sueño, ánimo ---------- */

export function buildVitals(days = 30): VitalSign[] {
  return Array.from({ length: days }, (_, i) => {
    const day = subDays(new Date(), days - 1 - i);
    return {
      id: `30000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      user_id: mockUser.id,
      recorded_at: `${format(day, "yyyy-MM-dd")}T08:${String(Math.round(between(0, 45))).padStart(2, "0")}:00Z`,
      systolic_bp: Math.round(between(112, 126)),
      diastolic_bp: Math.round(between(71, 84)),
      heart_rate: Math.round(between(58, 76)),
      temperature: between(36.2, 36.9, 1),
      oxygen_saturation: Math.round(between(95, 99)),
      glucose: Math.round(between(82, 108)),
      weight_kg: between(63.4, 65.1, 1),
    } satisfies VitalSign;
  });
}

export function buildSleep(days = 14): SleepRecord[] {
  return Array.from({ length: days }, (_, i) => {
    const day = subDays(new Date(), days - 1 - i);
    const deep = Math.round(between(62, 105));
    const rem = Math.round(between(68, 118));
    const light = Math.round(between(140, 220));
    const awake = Math.round(between(8, 34));
    const duration = deep + rem + light + awake;
    return {
      id: `40000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      user_id: mockUser.id,
      date: isoDate(day),
      duration_minutes: duration,
      deep_sleep_minutes: deep,
      rem_sleep_minutes: rem,
      light_sleep_minutes: light,
      awake_minutes: awake,
      efficiency: Math.round((duration / (duration + between(10, 40))) * 100),
      notes: i % 5 === 0 ? "Noche interrumpida por despertares." : "",
    } satisfies SleepRecord;
  });
}

const MOOD_EMOJIS: Record<number, string> = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

export function buildMood(days = 14): MoodRecord[] {
  return Array.from({ length: days }, (_, i) => {
    const mood = Math.round(between(2, 5));
    return {
      id: `50000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      user_id: mockUser.id,
      date: isoDate(subDays(new Date(), days - 1 - i)),
      mood,
      emoji: MOOD_EMOJIS[mood] ?? "😐",
      notes: mood >= 4 ? "Buen día y productivo." : "",
    } satisfies MoodRecord;
  });
}

export const mockHealthScore: HealthScore = {
  score: 78,
  label: "buena",
  components: [
    { key: "sleep", name: "Sueño", value: 82, weight: 0.25 },
    { key: "cardio", name: "Salud cardiovascular", value: 74, weight: 0.25 },
    { key: "activity", name: "Actividad física", value: 69, weight: 0.2 },
    { key: "hydration", name: "Hidratación", value: 85, weight: 0.1 },
    { key: "adherence", name: "Adherencia a medicación", value: 88, weight: 0.2 },
  ],
  computed_at: new Date().toISOString(),
};

/* ---------- medicamentos ---------- */

export function buildMedications(): Medication[] {
  const base = [
    { name: "Metformina", active_ingredient: "metformina HCl", dosage: "850 mg", frequency: "twice_daily" as const, time: "08:00", remaining_quantity: 42, prescribed_by: "Dr. Javier Ortiz (Endocrinología)", instructions: "Tomar con las comidas principales." },
    { name: "Losartán", active_ingredient: "losartán potásico", dosage: "50 mg", frequency: "once_daily" as const, time: "09:00", remaining_quantity: 28, prescribed_by: "Dra. Carmen Solís (Cardiología)", instructions: "Prefiere toma matinal con desayuno." },
    { name: "Warfarina", active_ingredient: "warfarina sódica", dosage: "5 mg", frequency: "once_daily" as const, time: "20:00", remaining_quantity: 17, prescribed_by: "Dra. Carmen Solís (Cardiología)", instructions: "Evitar alimentos ricos en vitamina K sin consulta previa." },
    { name: "Ibuprofeno", active_ingredient: "ibuprofeno", dosage: "400 mg", frequency: "as_needed" as const, time: "14:00", remaining_quantity: 9, prescribed_by: "Automedicación (revisar)", instructions: "Máximo 3 tomas/día si hay dolor." },
    { name: "Vitamina D3", active_ingredient: "colecalciferol", dosage: "2000 UI", frequency: "once_daily" as const, time: "13:00", remaining_quantity: 120, prescribed_by: "Dr. Javier Ortiz (Endocrinología)", instructions: "Tomar con una comida que contenga grasa." },
    { name: "Omeprazol", active_ingredient: "omeprazol", dosage: "20 mg", frequency: "once_daily" as const, time: "07:30", remaining_quantity: 33, prescribed_by: "Dra. Ana Beltrán (Medicina Familiar)", instructions: "En ayunas, 30 min antes del desayuno." },
  ];
  return base.map((m, i) => ({
    id: `60000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    user_id: mockUser.id,
    start_date: format(subDays(new Date(), 60 - i * 11), "yyyy-MM-dd"),
    end_date: null,
    is_active: true,
    reminder_enabled: i !== 3,
    rxnorm_code: ["6809", "31607", "11289", "5640", "27805", "18377"][i] ?? "",
    ...m,
  }));
}

export const mockInteractions: DrugInteraction[] = [
  {
    medication_a: "Warfarina",
    medication_b: "Ibuprofeno",
    severity: "major",
    description:
      "El ibuprofeno inhibe la agregación plaquetaria y desplaza la warfarina de su unión proteica, aumentando el riesgo de hemorragia.",
    recommendation:
      "Evita el ibuprofeno. Para dolor leve-moderado consulta paracetamol y valora INR si ya lo tomaste.",
  },
  {
    medication_a: "Losartán",
    medication_b: "Ibuprofeno",
    severity: "moderate",
    description:
      "Los AINE pueden reducir el efecto antihipertensivo del losartán y afectar la función renal.",
    recommendation:
      "Limita el uso de AINE y controla la tensión arterial si lo necesitas de forma puntual.",
  },
  {
    medication_a: "Metformina",
    medication_b: "Omeprazol",
    severity: "minor",
    description:
      "El omeprazol puede modificar ligeramente la absorción de metformina (efecto clínico limitado).",
    recommendation: "Separa las tomas 2 horas cuando sea posible.",
  },
];

export const mockAdherence: AdherenceStats = {
  period_days: 30,
  expected_doses: 150,
  taken_doses: 132,
  skipped_doses: 10,
  late_doses: 8,
  adherence_rate: 88,
  by_medication: [],
};

/* ---------- nutrición ---------- */

export function buildMeals(): Meal[] {
  const today = isoDate(new Date());
  const yesterday = isoDate(subDays(new Date(), 1));
  const meals: Array<[string, Meal["meal_type"], string, number, number, number, number, number]> = [
    [today, "breakfast", "Avena con frutos rojos y semillas de chía", 340, 14, 48, 9, 9],
    [today, "lunch", "Salmón a la plancha con quinoa y brócoli", 520, 38, 45, 22, 7],
    [today, "dinner", "Crema de calabaza y tortilla francesa", 390, 22, 28, 18, 6],
    [today, "snack", "Yogur griego natural con nueces", 210, 12, 8, 14, 2],
    [yesterday, "breakfast", "Tostadas integrales con aguacate y huevo", 420, 18, 38, 20, 8],
    [yesterday, "lunch", "Lentejas estofadas con verduras", 480, 27, 62, 8, 16],
    [yesterday, "dinner", "Ensalada de pollo a la parrilla", 430, 35, 18, 21, 5],
  ];
  return meals.map(([date, meal_type, food_name, calories, protein, carbs, fat, fiber], i) => ({
    id: `70000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    user_id: mockUser.id,
    date,
    meal_type,
    food_name,
    calories,
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    fiber_g: fiber,
    notes: "",
    image_url: null,
  }));
}

export const mockGoals: NutritionGoals = {
  calories: 2000,
  protein_g: 120,
  carbs_g: 220,
  fat_g: 65,
  water_ml: 2000,
};

export const mockSuggestions: NutritionSuggestion[] = [
  {
    id: "sug-1",
    title: "Merienda proteica pre-entreno",
    description: "Yogur griego (170 g) con plátano en rodajas y una cucharada de almendras fileteadas.",
    meal_type: "snack",
    calories: 260,
    protein_g: 16,
    carbs_g: 32,
    fat_g: 8,
    reason: "Vas por debajo de tu objetivo proteico y entrenas por la tarde.",
  },
  {
    id: "sug-2",
    title: "Cena ligera rica en triptófano",
    description: "Crema de calabaza con semillas de calabaza y queso fresco batido con cerezas.",
    meal_type: "dinner",
    calories: 330,
    protein_g: 20,
    carbs_g: 30,
    fat_g: 12,
    reason: "Tu sueño profundo bajó un 9% esta semana; las cenas ligeras pueden ayudar.",
  },
  {
    id: "sug-3",
    title: "Desayuno con más fibra",
    description: "Copos de avena integral con chia, arándanos y bebida de soja enriquecida.",
    meal_type: "breakfast",
    calories: 350,
    protein_g: 15,
    carbs_g: 44,
    fat_g: 10,
    reason: "La fibra media de tus desayunos ronda 6 g; el objetivo diario es 25 g.",
  },
];

/* ---------- telemedicina ---------- */

export function buildAppointments(): Appointment[] {
  const mk = (i: number, offsetDays: number, rest: Omit<Appointment, "id" | "user_id" | "date">): Appointment => ({
    id: `80000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    user_id: mockUser.id,
    date: isoDate(subDays(new Date(), -offsetDays)),
    ...rest,
  });
  return [
    mk(1, 2, { doctor_name: "Dra. Ana Beltrán", specialty: "Medicina Familiar", time: "10:30", modality: "video", status: "pending", reason: "Revisión de tratamiento anticoagulante", notes: "Llevar el último INR." }),
    mk(2, 5, { doctor_name: "Dra. Carmen Solís", specialty: "Cardiología", time: "16:00", modality: "video", status: "confirmed", reason: "Control de hipertensión y ECG previo", notes: "" }),
    mk(3, 12, { doctor_name: "Dr. Javier Ortiz", specialty: "Endocrinología", time: "09:15", modality: "in_person", status: "confirmed", reason: "Seguimiento de prediabetes (HbA1c)", notes: "Acudir en ayunas de 8 h." }),
    mk(4, -7, { doctor_name: "Dra. Ana Beltrán", specialty: "Medicina Familiar", time: "11:00", modality: "video", status: "completed", reason: "Consulta por cefalea tensional", notes: "Recomendó pausas visuales cada 45 min." }),
  ];
}

export const mockSpecialties: Specialty[] = [
  { id: "familiar", name: "Medicina Familiar", description: "Atención primaria y seguimiento crónico", icon: "Stethoscope", next_available: isoDate(subDays(new Date(), -2)), doctors_available: 14 },
  { id: "cardiologia", name: "Cardiología", description: "Corazón, tensión arterial y ritmo", icon: "HeartPulse", next_available: isoDate(subDays(new Date(), -5)), doctors_available: 6 },
  { id: "endocrinologia", name: "Endocrinología", description: "Diabetes, tiroides y metabolismo", icon: "FlaskConical", next_available: isoDate(subDays(new Date(), -12)), doctors_available: 4 },
  { id: "nutricion", name: "Nutrición", description: "Dietas personalizadas y peso saludable", icon: "Apple", next_available: isoDate(subDays(new Date(), -1)), doctors_available: 9 },
  { id: "dermatologia", name: "Dermatología", description: "Piel, pelo y uñas", icon: "Sparkles", next_available: isoDate(subDays(new Date(), -3)), doctors_available: 5 },
  { id: "psicologia", name: "Psicología", description: "Ansiedad, estrés y bienestar mental", icon: "Brain", next_available: isoDate(subDays(new Date(), -4)), doctors_available: 11 },
  { id: "ginecologia", name: "Ginecología", description: "Salud de la mujer", icon: "Flower2", next_available: isoDate(subDays(new Date(), -6)), doctors_available: 7 },
  { id: "pediatria", name: "Pediatría", description: "Salud infantil y adolescente", icon: "Baby", next_available: isoDate(subDays(new Date(), -2)), doctors_available: 8 },
];

/* ---------- laboratorios y documentos ---------- */

export function buildLabs(): LabResult[] {
  const mk = (i: number, offsetDays: number, test_name: string, lab_name: string, status: LabResult["status"], values: LabResult["values"]): LabResult => ({
    id: `90000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    user_id: mockUser.id,
    test_name,
    lab_name,
    date: isoDate(subDays(new Date(), offsetDays)),
    status,
    file_url: "#",
    values,
  });
  return [
    mk(1, 21, "Hemograma completo", "Laboratorio Central Vitalia", "normal", [
      { name: "Hemoglobina", value: 13.8, unit: "g/dL", reference_min: 12, reference_max: 16, status: "normal" },
      { name: "Leucocitos", value: 6.4, unit: "10³/µL", reference_min: 4.5, reference_max: 11, status: "normal" },
      { name: "Plaquetas", value: 231, unit: "10³/µL", reference_min: 150, reference_max: 400, status: "normal" },
      { name: "Hematíes", value: 4.6, unit: "10⁶/µL", reference_min: 4.2, reference_max: 5.4, status: "normal" },
    ]),
    mk(2, 35, "Perfil lipídico", "Laboratorio Central Vitalia", "review", [
      { name: "Colesterol total", value: 212, unit: "mg/dL", reference_min: 0, reference_max: 200, status: "review" },
      { name: "LDL", value: 141, unit: "mg/dL", reference_min: 0, reference_max: 130, status: "review" },
      { name: "HDL", value: 55, unit: "mg/dL", reference_min: 40, reference_max: 90, status: "normal" },
      { name: "Triglicéridos", value: 118, unit: "mg/dL", reference_min: 0, reference_max: 150, status: "normal" },
    ]),
    mk(3, 60, "Glucosa y función renal", "Synlab Diagnóstico", "normal", [
      { name: "Glucosa en ayunas", value: 99, unit: "mg/dL", reference_min: 70, reference_max: 100, status: "normal" },
      { name: "Creatinina", value: 0.81, unit: "mg/dL", reference_min: 0.6, reference_max: 1.1, status: "normal" },
      { name: "eFG (MDRD)", value: 96, unit: "mL/min/1.73m²", reference_min: 90, reference_max: 120, status: "normal" },
    ]),
  ];
}

export function buildDocuments(): MedicalDocument[] {
  const mk = (i: number, name: string, type: string, size: number, offsetDays: number, shared: string[] = []): MedicalDocument => ({
    id: `a0000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    user_id: mockUser.id,
    filename: name,
    document_type: type,
    file_url: "#",
    file_size: size,
    uploaded_at: `${isoDate(subDays(new Date(), offsetDays))}T10:00:00Z`,
    shared_with: shared,
  });
  return [
    mk(1, "informe-cardiologia-2026.pdf", "Informe médico", 384_221, 35, ["Dra. Carmen Solís"]),
    mk(2, "radiografia-torax.pdf", "Imagen diagnóstica", 1_204_992, 48),
    mk(3, "analitica-completa-oct.pdf", "Resultado de laboratorio", 512_000, 21),
    mk(4, "receta-warfarina.pdf", "Receta médica", 98_304, 10),
  ];
}

/* ---------- notificaciones ---------- */

export function buildNotifications(): Notification[] {
  const mk = (i: number, offsetHours: number, type: Notification["type"], title: string, message: string): Notification => {
    const d = new Date();
    d.setHours(d.getHours() - offsetHours);
    return {
      id: `b0000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      user_id: mockUser.id,
      type,
      title,
      message,
      is_read: i > 3,
      created_at: d.toISOString(),
    };
  };
  return [
    mk(1, 1, "medication", "Toma de las 20:00 — Warfarina", "Recuerda registrar tu toma de warfarina antes de las 21:00."),
    mk(2, 3, "alert", "Interacción detectada", "Warfarina + Ibuprofeno presentan interacción de gravedad mayor. Revisa el módulo de medicamentos."),
    mk(3, 8, "appointment", "Cita confirmada", "Tu videoconsulta con Dra. Carmen Solís (Cardiología) quedó confirmada para el próximo " + format(subDays(new Date(), -5), "d 'de' MMMM", { locale: undefined }) + "."),
    mk(4, 26, "achievement", "¡7 días de racha!", "Has registrado tus tomas durante 7 días seguidos. Adherencia del 92%."),
    mk(5, 50, "achievement", "Objetivo de hidratación", "Ayer alcanzaste tu meta de 2 L de agua."),
    mk(6, 72, "medication", "Stock bajo: Losartán", "Te quedan ~28 comprimidos de Losartán (≈4 semanas)."),
  ];
}

/* ---------- asistente IA (respuestas locales) ---------- */

interface RuleMatch {
  agent: NonNullable<ChatResponse["agent_used"]>;
  reasoning: string;
  reply: string;
}

const SECURITY_DISCLAIMER =
  "Ante dolor torácico, dificultad respiratoria, pérdida de conciencia o sangrado activo, llama inmediatamente a emergencias (112 en España / 911).";

export function mockChatReply(message: string): ChatResponse {
  const m = message.toLowerCase();

  const rules: Array<{ pattern: RegExp; match: RuleMatch }> = [
    {
      pattern: /sueñ|dorm|insomni|despert/i,
      match: {
        agent: "biology",
        reasoning: "Consulta sobre sueño y recuperación → Agente Biología.",
        reply:
          "Tu media de las últimas 2 semanas es de 6 h 52 min con un 18% de sueño profundo (algo por debajo del 20% recomendado). La eficiencia de tu sueño ronda el 84%. Tres palancas con buena evidencia: regularidad de horario (acostarte y levantarte con ±30 min de variación), luz solar en la primera hora del día, y evitar cafeína después de las 14:00. Si los despertares superan los 30 min por noche de forma recurrente, vale una valoración médica.",
      },
    },
    {
      pattern: /presi|tensi|card|pulso|ritmo|arritmi/i,
      match: {
        agent: "biology",
        reasoning: "Consulta cardiovascular → Agente Biología.",
        reply:
          "Tu tensión media reciente es 118/76 mmHg en reposo matinal y tu frecuencia cardiaca en reposo se mueve entre 58–76 lpm (buena capacidad aeróbica). Con Losartán 50 mg el objetivo es mantener la media diurna por debajo de 130/80. Registra las tomas siempre a la misma hora y en reposo de 5 min. Si mides dos días seguidos >140/90, contacta con tu médica.",
      },
    },
    {
      pattern: /glucos|azúcar|azucar|hba1c|diabet/i,
      match: {
        agent: "biology",
        reasoning: "Consulta metabólica → Agente Biología.",
        reply:
          "Tu glucosa en ayunas se mueve entre 82–108 mg/dL, en el rango de normoglucosa-alto (tu última HbA1c pendiente de control). Con el diagnóstico de prediabetes, la combinación de dieta mediterránea, 150 min/semana de actividad aeróbica y control de peso reduce hasta un 58% el riesgo de progresión a diabetes tipo 2 (programa DPP). La metformina que tomas apoya ese mismo objetivo.",
      },
    },
    {
      pattern: /com|calor|prote|dieta|peso|macro|nutri|agu/i,
      match: {
        agent: "nutrition",
        reasoning: "Consulta nutricional → Agente Nutrición.",
        reply:
          "Hoy llevas ~1.460 kcal (objetivo 2.000) con 86 g de proteína de 120 g objetivo y 24 g de fibra de 25–30 g recomendadas. Con el prediabetes como contexto: prioriza carbohidratos de índice bajo (legumbres, avena integral, quinoa), proteína en cada comida (25–30 g) y grasa de calidad (oliva, frutos secos, pescado azul 2×/semana). Sugerencia del día: merienda proteica pre-entreno con yogur griego y fruta.",
      },
    },
    {
      pattern: /interacc|warfar|ibuprof|alcohol|emergenc|urgenc|dolor fuerte|sangr/i,
      match: {
        agent: "security",
        reasoning: "Consulta de seguridad farmacológica → Agente Seguridad (prioridad alta).",
        reply:
          "⚠️ Detecto una interacción relevante en tu medicación actual: Warfarina + Ibuprofeno (gravedad mayor, riesgo hemorrágico). Evita los AINE y usa paracetamol si necesitas analgesia puntual, avisando a tu médica. También losarten + ibuprofeno es moderado. Nunca automediques antiinflamatorios con anticoagulantes. " + SECURITY_DISCLAIMER,
      },
    },
  ];

  const matched = rules.find((r) => r.pattern.test(m));

  const fallback: RuleMatch = {
    agent: "general",
    reasoning: "Consulta general → enrutamiento al coordinador con contexto del perfil.",
    reply:
      "Puedo ayudarte con tus métricas de salud (sueño, tensión, glucosa), nutrición y macronutrientes, medicamentos e interacciones, o tus citas y analíticas. Prueba preguntas como «¿cómo ha sido mi sueño esta semana?», «¿qué debo cenar hoy?» o «¿puedo tomar ibuprofeno con warfarina?». " + SECURITY_DISCLAIMER,
  };

  const result = matched?.match ?? fallback;

  return {
    message: {
      id: `c0000000-0000-4000-8000-${Date.now().toString(12).padStart(12, "0")}`,
      user_id: mockUser.id,
      role: "assistant",
      content: result.reply,
      agent: result.agent,
      created_at: new Date().toISOString(),
    },
    agent_used: result.agent,
    agent_reasoning: result.reasoning,
    disclaimers: [
      "La información proporcionada es orientativa y no sustituye la consulta con un profesional sanitario.",
    ],
  };
}

export function agentsInfoFromConstants() {
  return AGENTS_INFO;
}

/** Recalcula el resumen diario a partir de comidas. */
export function summarizeMeals(meals: Meal[], date: string): DailySummary {
  const of = meals.filter((meal) => meal.date === date);
  return {
    date,
    total_calories: of.reduce((acc, m) => acc + m.calories, 0),
    total_protein_g: of.reduce((acc, m) => acc + m.protein_g, 0),
    total_carbs_g: of.reduce((acc, m) => acc + m.carbs_g, 0),
    total_fat_g: of.reduce((acc, m) => acc + m.fat_g, 0),
    total_fiber_g: of.reduce((acc, m) => acc + m.fiber_g, 0),
    meals_count: of.length,
  };
}
