import re
import json

def parse_table(filename, table_name):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    start_str = f"COPY public.{table_name} "
    start_idx = -1
    for i, line in enumerate(lines):
        if line.startswith(start_str):
            start_idx = i
            break
            
    if start_idx == -1: return []
    
    rows = []
    for line in lines[start_idx+1:]:
        if line.startswith("\\."): break
        parts = line.strip('\n').split('\t')
        rows.append(parts)
        
    return rows

dialects = parse_table('/root/call/dump.sql', 'text_to_voice_darijatdialect')
emotions = parse_table('/root/call/dump.sql', 'text_to_voice_darijatemotion')
styles = parse_table('/root/call/dump.sql', 'text_to_voice_darijatstyle')
voices = parse_table('/root/call/dump.sql', 'text_to_voice_darijatvoice')

# write to seed format for C#
with open('VoiceSeedData.cs.txt', 'w', encoding='utf-8') as f:
    f.write("public static class VoiceSeedData\n{\n")
    
    f.write("    public static List<VoiceDialect> GetDialects() => new List<VoiceDialect>\n    {\n")
    for row in dialects:
        f.write(f'        new VoiceDialect {{ Id = {row[0]}, Name = "{row[1]}", Value = "{row[2]}", IsPremium = {"true" if row[3]=="t" else "false"}, IsActive = {"true" if row[4]=="t" else "false"}, OrderIndex = {row[5]} }},\n')
    f.write("    };\n\n")

    f.write("    public static List<VoiceEmotion> GetEmotions() => new List<VoiceEmotion>\n    {\n")
    for row in emotions:
        f.write(f'        new VoiceEmotion {{ Id = {row[0]}, Name = "{row[1]}", Value = "{row[2]}", IsPremium = {"true" if row[3]=="t" else "false"}, IsActive = {"true" if row[4]=="t" else "false"}, OrderIndex = {row[5]} }},\n')
    f.write("    };\n\n")

    f.write("    public static List<VoiceStyle> GetStyles() => new List<VoiceStyle>\n    {\n")
    for row in styles:
        f.write(f'        new VoiceStyle {{ Id = {row[0]}, Name = "{row[1]}", Value = "{row[2]}", IsPremium = {"true" if row[3]=="t" else "false"}, IsActive = {"true" if row[4]=="t" else "false"}, OrderIndex = {row[5]} }},\n')
    f.write("    };\n\n")

    f.write("    public static List<VoiceProfile> GetVoices() => new List<VoiceProfile>\n    {\n")
    for row in voices:
        # id, name, voice_name, accent, gender, is_premium, is_active, demo_audio, order, gemini_voice
        f.write(f'        new VoiceProfile {{ Id = {row[0]}, Name = "{row[1]}", VoiceName = "{row[2]}", Accent = "{row[3]}", Gender = "{row[4]}", IsPremium = {"true" if row[5]=="t" else "false"}, IsActive = {"true" if row[6]=="t" else "false"}, DemoAudio = "{row[7]}", OrderIndex = {row[8]}, GeminiVoice = "{row[9] if len(row) > 9 else ""}" }},\n')
    f.write("    };\n")

    f.write("}\n")
