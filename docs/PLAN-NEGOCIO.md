# VITALIA Pro — Plan de negocio y propuesta comercial

> Documento de trabajo para conversaciones con IPS, clínicas y aseguradoras.
> Versión 1.0 · 2026

---

## 1. Resumen ejecutivo

**Qué es.** VITALIA Pro es una plataforma de salud digital con dos portales conectados:

- **Portal del paciente**: historia clínica personal, medicación con recordatorios, nutrición, actividad, laboratorios, documentos, asistente con IA y credencial de emergencia.
- **Portal de empresa (IPS)**: panel de dirección con pacientes priorizados por riesgo, adherencia, agenda del equipo, reportes y auditoría de accesos.

**Problema.** Las IPS pierden continuidad del cuidado entre consultas: el paciente no registra nada, la adherencia es baja y el equipo solo se enterada cuando hay una complicación. Los datos quedan en papel, Excel o en el WhatsApp de cada profesional.

**Propuesta de valor.** Una sola plataforma donde el paciente registra su día a día y la IPS ve, en tiempo real, quién necesita atención. Menos llamadas, mejor adherencia y evidencia para auditorías y contratos.

**Modelo.** SaaS B2B2C con pago por paciente activo/mes, contrato anual, onboarding e implementación pagados aparte.

---

## 2. Mercado y cliente ideal (ICP)

### Segmento primario
- **IPS y clínicas privadas** de 5 a 60 profesionales.
- Programas de crónicos (hipertensión, diabetes, cardiometabólico).
- Operación en Colombia y LATAM hispanohablante.

### Segmento secundario
- Aseguradoras y medicina prepagada con programas de gestión de riesgo.
- Redes de salud y cajas de compensación.
- Empresas con programas de bienestar (B2B2E).

### Por qué ahora
- Digitalización forzada post-pandemia y normativa de historia clínica electrónica.
- Presión de pagadores por indicadores de adherencia y reingresos.
- Pacientes acostumbrados a apps de salud y mensajería.

### Tamaño y enfoque
- Colombia: miles de IPS; el foco inicial son 200 clínicas medianas en Bogotá, Medellín y Cali.
- Meta realista año 1: **8–12 IPS** con 300–1.500 pacientes cada una.

---

## 3. Propuesta de valor por rol

### Para la dirección médica
- Tablero con adherencia, riesgo y actividad.
- Reportes exportables para contratos y auditoría.
- Trazabilidad de quién accedió a qué historia clínica.

### Para el profesional
- Lista priorizada: primero los pacientes en riesgo.
- Contexto antes de la consulta sin abrir 4 sistemas.
- Menos tiempo en llamadas de seguimiento.

### Para el paciente
- Todo su historial en el teléfono, incluso sin conexión (APK).
- Recordatorios de medicación y metas claras.
- Asistente que orienta y deriva al profesional.

---

## 4. Modelo de negocio

| Plan | Precio de referencia | Incluye | Cliente objetivo |
|---|---|---|---|
| **Esencial** | US$ 1,50 / paciente / mes | Hasta 250 pacientes, portal paciente, agenda | Consultorios, equipos pequeños |
| **Profesional** | US$ 2,90 / paciente / mes | Hasta 2.000 pacientes, portal empresa, analítica, roles | IPS medianas |
| **Enterprise** | Contrato anual a medida | Pacientes ilimitados, multi-sede, FHIR/HL7, SLA | Redes y aseguradoras |

**Ingresos adicionales**
- Implementación y migración de datos: US$ 1.500–6.000 por IPS.
- Capacitación al equipo: US$ 400 por sesión.
- Integraciones (FHIR, laboratorio, facturación): proyecto.
- Marca blanca (logo y dominio propio): +20% del plan.

**Ejemplo de ticket**
Una IPS con 800 pacientes en plan Profesional = **US$ 2.320/mes** (~US$ 27.840/año) más implementación.

**Costos variables estimados**
- Infraestructura (API + Postgres gestionado): US$ 40–150/mes según volumen.
- IA del asistente: US$ 0,002–0,01 por conversación (o modo local sin costo).
- Soporte: 1 persona por cada 15–20 clientes.

---

## 5. Go-to-market

### Fase 0 — Demo (semanas 0–4)
- Demo pública con datos ficticios y dos portales.
- APK instalable para mostrar en visitas.
- Material: one-pager, guion de demo de 20 minutos, checklist de seguridad.

### Fase 1 — Pilotos (meses 1–3)
- 2–3 IPS aliadas con **piloto de 30 días sin costo**.
- Métricas de éxito pactadas: adherencia, % pacientes activos, citas atendidas.
- Precio piloto: 50% del plan durante 3 meses.

### Fase 2 — Venta repetible (meses 4–9)
- Caso de éxito documentado con cifras.
- Contrato estándar + cuestionario de seguridad respondido.
- Venta directa a dirección médica y coordinación de calidad.

### Fase 3 — Escala (meses 10–18)
- Partnerships con integradores y proveedores de HCE.
- Marca blanca para aseguradoras.
- Expansión a México, Perú y Chile.

### Canales
- Referidos de médicos y asociaciones científicas.
- LinkedIn y eventos de salud digital.
- Contenido: "cómo medir adherencia real en tu IPS".

---

## 6. Competencia y diferenciación

| Alternativa | Debilidad | Ventaja de VITALIA |
|---|---|---|
| HCE tradicionales | Paciente pasivo, sin seguimiento entre citas | Portal del paciente + datos continuos |
| Apps de bienestar | Sin vínculo clínico ni historia | Integrado al equipo de la IPS |
| WhatsApp + Excel | Sin trazabilidad ni auditoría | Auditoría, roles y cifrado |
| Desarrollos a medida | Costosos y lentos | Producto listo, onboarding en días |

**Foso defensivo**: datos longitudinales por paciente + flujos clínicos ya implementados + cumplimiento y auditoría listos para contratos.

---

## 7. Roadmap de producto

### Ya implementado (v1)
- 11 módulos del paciente y 6 del portal de empresa.
- Autenticación JWT, roles, auditoría encadenada y cifrado de campos.
- Panel de empresa con KPIs, riesgo, agenda, equipo, reportes y exportación CSV.
- APK Android con la web embebida y modo sin conexión.

### v1.1 (1–2 meses)
- Invitaciones reales de pacientes por correo y código.
- Gestión de usuarios y permisos desde el portal.
- Notificaciones push y recordatorios programados.
- Historial de chat persistente.

### v1.2 (3–4 meses)
- Videoconsulta WebRTC integrada.
- Integración FHIR R4 / HL7 para laboratorios y HCE.
- Facturación y conciliación de cups.
- Multi-sede y agregación por regional.

### v2 (6–12 meses)
- Modelos de riesgo predictivo (readmisión, descompensación).
- Programas de crónicos configurables por la IPS.
- Marca blanca y SSO empresarial.

---

## 8. Métricas clave (KPIs)

**Producto**
- Pacientes activos semanales / mes.
- Adherencia media a medicación.
- % de pacientes con datos en los últimos 7 días.
- Tiempo medio de registro diario.

**Negocio**
- MRR y ARR.
- Churn de IPS (objetivo < 5% anual).
- CAC y payback (< 9 meses).
- Expansión por paciente (net revenue retention).

**Clínicas (valor demostrable)**
- Reducción de llamadas de seguimiento.
- Mejora de adherencia en 90 días.
- Citas atendidas vs. agendadas.

---

## 9. Seguridad, privacidad y cumplimiento

- **Cifrado en tránsito** (HTTPS obligatorio) y **de campos sensibles** en reposo (Fernet/AES).
- **Roles**: paciente, profesional, administrador, con permisos separados.
- **Auditoría encadenada** SHA-256 de cada acceso a datos clínicos.
- **Minimización de datos** y consentimiento explícito del paciente.
- Preparado para **HIPAA/GDPR**; para Colombia, alineación con Ley 1581 de protección de datos y Resolución 1995 de historia clínica.
- Retención y borrado configurables por contrato.
- Recomendación: auditoría externa y pentest antes del primer contrato grande.

---

## 10. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Baja adopción del paciente | Alto | Onboarding asistido, recordatorios y APK sin fricción |
| Ciclo de venta largo en IPS | Medio | Piloto de 30 días y caso de éxito |
| Exigencia de integraciones | Medio | Roadmap FHIR y partnerships |
| Incidente de seguridad | Alto | Cifrado, auditoría, pentest y seguro ciber |
| Dependencia de un fundador técnico | Medio | Documentación, CI/CD y código en repositorio propio |

---

## 11. Estructura de la empresa (para escalar)

- **Dirección general / ventas**: relación con IPS y aseguradoras.
- **Producto y tecnología**: 1 líder técnico + 1 full-stack.
- **Éxito del cliente**: implementación, capacitación y soporte.
- **Clínico**: asesor médico (medio tiempo) para validar flujos.
- **Cumplimiento**: asesor legal externo para contratos y habeas data.

---

## 12. Inversión y uso de fondos (si aplica)

| Rubro | Uso |
|---|---|
| Producto | 2 desarrolladores durante 6 meses |
| Infraestructura | Entornos productivos, monitoreo y respaldos |
| Cumplimiento | Pentest, revisión legal, seguros |
| Comercial | Material, eventos y prospección |

**Hito de inversión**: 10 IPS con contrato y ARR de US$ 250k.

---

## 13. Qué necesita una IPS para empezar (checklist)

1. Definir responsable interno del programa.
2. Entregar listado de pacientes y profesionales (CSV).
3. Aprobar política de datos y consentimiento.
4. Configurar logo y colores de marca.
5. Capacitar al equipo (1 sesión de 60 minutos).
6. Lanzar piloto con 50–100 pacientes.
7. Revisar tablero a los 30 días y decidir expansión.

---

## 14. Guion de demo (20 minutos)

1. **2 min** — Portada y problema: continuidad del cuidado.
2. **5 min** — Portal del paciente: medicación, signos vitales, asistente.
3. **6 min** — Portal de empresa: resumen, paciente en riesgo, agenda.
4. **3 min** — Reportes y auditoría: evidencia para contratos.
5. **2 min** — Seguridad y arquitectura.
6. **2 min** — Plan, piloto y siguientes pasos.

---

## Anexo: credenciales de demostración

| Portal | Usuario | Contraseña |
|---|---|---|
| Paciente | `demo@vitalia.health` | `Demo1234!` |
| Empresa (IPS) | `admin@vitalia.ips` | `Ips1234!` |

> Los datos son ficticios. No introducir información real de pacientes en la demo pública.
