"""
LLM Provider Configuration - Dual Provider with Automatic Fallback
Supports: Groq (openai/gpt-oss-120b + qwen/qwen3.8-27b) + Google Gemini
"""
import os
import logging
from typing import Optional, List
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel

logger = logging.getLogger(__name__)

PRIMARY_GROQ_MODEL = "openai/gpt-oss-120b"
FAST_GROQ_MODEL = "qwen/qwen3.8-27b"


class ResilientFallbackLLM:
    """Wrapper that tries primary LLM and falls back to secondary on failure."""
    def __init__(self, models: List[BaseChatModel]):
        self.models = [m for m in models if m is not None]

    async def ainvoke(self, messages, **kwargs):
        last_error = None
        for i, model in enumerate(self.models):
            try:
                return await model.ainvoke(messages, **kwargs)
            except Exception as e:
                logger.warning(f"LLM model index {i} failed: {e}. Trying fallback...")
                last_error = e
        raise RuntimeError(f"All configured LLM models failed. Last error: {last_error}")

    def invoke(self, messages, **kwargs):
        last_error = None
        for i, model in enumerate(self.models):
            try:
                return model.invoke(messages, **kwargs)
            except Exception as e:
                logger.warning(f"LLM model index {i} failed: {e}. Trying fallback...")
                last_error = e
        raise RuntimeError(f"All configured LLM models failed. Last error: {last_error}")


def get_groq_llm(model: str = PRIMARY_GROQ_MODEL, temperature: float = 0.3, max_tokens: int = 4096) -> Optional[BaseChatModel]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    return ChatGroq(
        model=model,
        api_key=api_key,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def get_gemini_llm(temperature: float = 0.3, max_tokens: int = 4096) -> Optional[BaseChatModel]:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
    except Exception as e:
        logger.warning(f"Could not initialize Gemini: {e}")
        return None


def get_llm(temperature: float = 0.3, max_tokens: int = 4096):
    """
    Get resilient LLM with automatic fallback.
    Priority: Groq GPT-OSS-120B -> Groq Qwen-3.8-27B -> Gemini
    """
    candidates = []
    groq_primary = get_groq_llm(PRIMARY_GROQ_MODEL, temperature=temperature, max_tokens=max_tokens)
    if groq_primary:
        candidates.append(groq_primary)

    groq_fast = get_groq_llm(FAST_GROQ_MODEL, temperature=temperature, max_tokens=max_tokens)
    if groq_fast:
        candidates.append(groq_fast)

    gemini = get_gemini_llm(temperature=temperature, max_tokens=max_tokens)
    if gemini:
        candidates.append(gemini)

    if not candidates:
        raise RuntimeError("No LLM provider configured. Set GROQ_API_KEY or GEMINI_API_KEY in .env")

    return ResilientFallbackLLM(candidates)


def get_fast_llm():
    """Get a fast LLM for quick tasks (parsing, small completions)"""
    candidates = []
    groq_fast = get_groq_llm(FAST_GROQ_MODEL, temperature=0.1, max_tokens=2048)
    if groq_fast:
        candidates.append(groq_fast)

    groq_primary = get_groq_llm(PRIMARY_GROQ_MODEL, temperature=0.1, max_tokens=2048)
    if groq_primary:
        candidates.append(groq_primary)

    if not candidates:
        return get_llm(temperature=0.1, max_tokens=2048)

    return ResilientFallbackLLM(candidates)


def get_reasoning_llm():
    """Get a reasoning-focused LLM for complex planning tasks"""
    return get_llm(temperature=0.3, max_tokens=8192)
