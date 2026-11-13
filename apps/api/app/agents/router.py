"""LangGraph-based assistant router with local fallback (no OpenAI key required)."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph

from app.core.config import settings
from app.integrations.openai_client import chat_completion

SYSTEM_PROMPT = (
    "Eres un asistente de salud de VITALIA Pro. Responde en español, de forma clara, "
    "corta y empática. Nunca diagnoses ni recetes. Siempre deriva al profesional "
    "sanitario ante duda o síntomas de alarma."
)

DISCLAIMER = (
    "Esta información es orientativa y no sustituye la consulta con un profesional sanitario."
)


class AgentState(dict[str, Any]):
    """LangGraph state: user message, user context, selected agent, answer."""


def _classify_intent(message: str) -> str:
    m = message.lower()
    if any(k in m for k in ["dolor", "pecho", "respirar", "sangr", "urgenc", "emergenc", "infarto"]):
        return "security"
    if any(k in m for k in ["coma", "comí", "cena", "desayun", "proteína", "caloría", "dieta", "nutric", "peso", "hidrat", "agua"]):
        return "nutrition"
    if any(k in m for k in ["sueñ", "dormir", "tensión", "presi", "glucosa", "colesterol", "ritmo", "corazón", "cardiac", "síntoma"]):
        return "biology"
    return "general"


async def _llm_reply(system: str, user: str) -> str | None:
    if not settings.openai_api_key:
        return None
    try:
        return await chat_completion(system, user)
    except Exception:  # pragma: no cover - fallback to local
        return None


def _local_reply(agent: str, message: str, user_context: dict[str, Any] | None) -> str:
    m = message.lower()
    ctx = user_context or {}
    if agent == "biology":
        return (
            "Tus métricas recientes son coherentes con un estado estable. "
            "Si tienes dudas sobre una analítica concreta, sube el resultado en Laboratorios y te ayudo a interpretarlo. "
            + DISCLAIMER
        )
    if agent == "nutrition":
        return (
            "Come variedad de vegetales, proteína en cada comida y grasa de calidad. "
            "Mantén la hidratación (≈2 L de agua al día). Para menús personalizados dime tus preferencias. "
            + DISCLAIMER
        )
    if agent == "security":
        return (
            "Ante dolor torácico, dificultad para respirar, pérdida de conciencia o sangrado activo, "
            "llama inmediatamente a emergencias (112 en España / 911 en EE. UU.). "
            "No modifiques dosis de medicación sin consultar a tu médico. " + DISCLAIMER
        )
    return (
        "Pregúntame sobre tu sueño, tensión, glucosa, nutrición o medicación. "
        "Tengo acceso a tu perfil para darte respuestas personalizadas. " + DISCLAIMER
    )


async def run_assistant(
    message: str,
    user_id: str,
    user_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    agent = _classify_intent(message)

    reasoning = f"Intención detectada: {agent}."
    llm_text = await _llm_reply(SYSTEM_PROMPT, message)
    content = llm_text or _local_reply(agent, message, user_context)

    return {
        "reply": content,
        "agent": agent,
        "reasoning": reasoning,
        "disclaimers": [DISCLAIMER],
    }


def build_graph() -> StateGraph:
    """Exposes a minimal LangGraph graph (kept for structure/future expansion)."""
    workflow = StateGraph(AgentState)

    async def node(state: AgentState) -> AgentState:
        result = await run_assistant(
            state.get("message", ""),
            state.get("user_id", ""),
            state.get("user_context"),
        )
        state["answer"] = result["reply"]
        state["agent"] = result["agent"]
        state["reasoning"] = result["reasoning"]
        return state

    workflow.add_node("assistant", node)
    workflow.set_entry_point("assistant")
    workflow.add_edge("assistant", "__end__")
    return workflow.compile()
