import os
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import google

class GeminiAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="أنت مساعد ذكي، تتحدث باللهجة المصرية وتتصل عبر الهاتف. رحب بالمستخدم وتحدث بأسلوب ودي ومرح."
        )

    async def on_enter(self) -> None:
        self.session.generate_reply(instructions="رحب بالمستخدم بكلمة واحدة مثل ألو")

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-3.1-flash-live-preview",
            api_key=os.environ.get("GOOGLE_API_KEY")
        )
    )
            
    await session.start(agent=GeminiAgent(), room=ctx.room)
    print("Gemini Agent started in room:", ctx.room.name)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
