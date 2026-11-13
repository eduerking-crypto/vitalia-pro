"""Agentes del asistente. El router clasifica la intención y responde.

Los agentes especializados viven en el router (biología, nutrición, seguridad)
hasta que se dividan en módulos propios.
"""

from app.agents.biology_agent import biology_agent  # noqa: F401
from app.agents.router import build_graph, run_assistant  # noqa: F401
