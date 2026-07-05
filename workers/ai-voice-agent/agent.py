import os
import requests
from typing import Annotated
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import google

BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:5109")

def get_tenant_ai_settings(room_name: str):
    if room_name.startswith("t_"):
        extension = room_name[2:]
        try:
            resp = requests.get(f"{BACKEND_URL}/api/internal/ai-settings/by-extension/{extension}")
            if resp.status_code == 200:
                return resp.json(), extension
        except Exception as e:
            print("Error fetching AI settings:", e)
    
    return {
        "systemPrompt": "أنت مساعد ذكي للمطعم، تتصل عبر الهاتف. رحب بالمستخدم بأسلوب ودي.",
        "dialect": "standard",
        "voice": "default",
        "emotion": "neutral",
        "style": "normal"
    }, ""

# --- Tools ---
@llm.function_tool(description="Get customer profile and recent orders using their phone number.")
async def get_customer(
    extension: Annotated[str, "The extension of the tenant"],
    phone: Annotated[str, "The caller's phone number"]
):
    try:
        resp = requests.get(f"{BACKEND_URL}/api/internal/ai-tools/customer?extension={extension}&phone={phone}")
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

@llm.function_tool(description="Search the restaurant menu for items and prices.")
async def search_menu(
    extension: Annotated[str, "The extension of the tenant"],
    query: Annotated[str, "The name of the food item or category to search for"]
):
    try:
        resp = requests.get(f"{BACKEND_URL}/api/internal/ai-tools/menu?extension={extension}&query={query}")
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

@llm.function_tool(description="Place a new order for the customer.")
async def place_order(
    extension: Annotated[str, "The extension of the tenant"],
    phone: Annotated[str, "Customer phone number"],
    customer_name: Annotated[str, "Customer name"],
    items_summary: Annotated[str, "Summary of the items ordered (e.g. 1 Pizza, 2 Cola)"],
    total_amount: Annotated[float, "Total amount of the order"]
):
    try:
        payload = {
            "extension": extension,
            "phone": phone,
            "customerName": customer_name,
            "itemsSummary": items_summary,
            "totalAmount": float(total_amount)
        }
        resp = requests.post(f"{BACKEND_URL}/api/internal/ai-tools/order", json=payload)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

@llm.function_tool(description="Transfer the call to a human receptionist or manager.")
async def transfer_to_human(
    extension: Annotated[str, "The extension of the tenant"]
):
    try:
        resp = requests.post(f"{BACKEND_URL}/api/internal/ai-tools/transfer", json={"extension": extension})
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

restaurant_tools = [get_customer, search_menu, place_order, transfer_to_human]

class GeminiAgent(Agent):
    def __init__(self, instructions: str, tools: list) -> None:
        super().__init__(
            instructions=instructions,
            tools=tools
        )

    async def on_enter(self) -> None:
        try:
            self.session.generate_reply(user_input="مرحبا بك!")
        except Exception as e:
            print(f"Error in generate_reply: {e}")

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    settings, extension = get_tenant_ai_settings(ctx.room.name)
    base_instructions = settings.get("systemPrompt") or "أنت مساعد ذكي للمطعم."
    dialect = settings.get("dialect", "standard")
    emotion = settings.get("emotion", "neutral")
    style = settings.get("style", "normal")
    
    # Identify the caller if possible from the participant identity
    caller_phone = "Unknown"
    for p in ctx.room.remote_participants.values():
        if p.identity.startswith("sip_"):
            caller_phone = p.identity.replace("sip_", "")

    instructions = (
        f"{base_instructions}\n"
        f"IMPORTANT INSTRUCTIONS:\n"
        f"- You MUST speak entirely in this dialect/accent: {dialect}.\n"
        f"- Your tone/emotion should be: {emotion}.\n"
        f"- Your speaking style should be: {style}.\n"
        f"- The tenant extension is '{extension}'. Always pass this to your tools.\n"
        f"- The caller's phone number is '{caller_phone}'. Use it to greet them or look up their history via get_customer.\n"
    )
    
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-3.1-flash-live-preview",
            api_key=os.environ.get("GOOGLE_API_KEY")
        )
    )
            
    await session.start(agent=GeminiAgent(instructions=instructions, tools=restaurant_tools), room=ctx.room)
    print("Gemini Agent started in room:", ctx.room.name, "with instructions:", instructions)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
