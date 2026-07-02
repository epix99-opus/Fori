from abc import ABC, abstractmethod
from typing import Any


class AgentInterface(ABC):
    @abstractmethod
    async def run(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Execute an agent task."""
