import os
import requests
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import google

BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend-service:8080")

def get_tenant_ai_settings(room_name: str):
    # Example room_name: "t_101"
    if room_name.startswith("t_"):
        extension = room_name[2:]
        try:
            resp = requests.get(f"{BACKEND_URL}/api/internal/ai-settings/by-extension/{extension}")
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            print("Error fetching AI settings:", e)
    
    # Default settings
    return {
        "systemPrompt": "أنت مساعد ذكي للمطعم، تتصل عبر الهاتف. رحب بالمستخدم بأسلوب ودي.",
        "dialect": "standard",
        "voice": "default"
    }

class GeminiAgent(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(
            instructions=instructions
        )

    async def on_enter(self) -> None:
        self.session.generate_reply(instructions="رحب بالمستخدم بكلمة واحدة مثل ألو")

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    settings = get_tenant_ai_settings(ctx.room.name)
    instructions = settings.get("systemPrompt") or "أنت مساعد ذكي للمطعم."
    
    # NOTE: In a real advanced scenario, we'd map settings.voice/dialect to specific Google Cloud voices
    # For now, we set the system instructions
    
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-3.1-flash-live-preview",
            api_key=os.environ.get("GOOGLE_API_KEY")
        )
    )
            
    await session.start(agent=GeminiAgent(instructions=instructions), room=ctx.room)
    print("Gemini Agent started in room:", ctx.room.name, "with instructions:", instructions)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
