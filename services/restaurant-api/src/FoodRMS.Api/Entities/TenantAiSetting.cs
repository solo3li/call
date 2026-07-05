using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodRMS.Api.Entities
{
    public class TenantAiSetting
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        public bool IsAiActive { get; set; } = true;
        
        public long? VoiceProfileId { get; set; }
        public VoiceProfile? VoiceProfile { get; set; }

        public long? VoiceDialectId { get; set; }
        public VoiceDialect? VoiceDialect { get; set; }

        public long? VoiceEmotionId { get; set; }
        public VoiceEmotion? VoiceEmotion { get; set; }

        public long? VoiceStyleId { get; set; }
        public VoiceStyle? VoiceStyle { get; set; }

        public string SystemPrompt { get; set; } = string.Empty;
        
        // Escalation extension (e.g., MicroSIP extension "101")
        public string EscalationExtension { get; set; } = string.Empty;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
