using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodRMS.Api.Entities
{
    public class VoiceDialect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public bool IsPremium { get; set; }
        public bool IsActive { get; set; }
        public int OrderIndex { get; set; }
    }

    public class VoiceEmotion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public bool IsPremium { get; set; }
        public bool IsActive { get; set; }
        public int OrderIndex { get; set; }
    }

    public class VoiceStyle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public bool IsPremium { get; set; }
        public bool IsActive { get; set; }
        public int OrderIndex { get; set; }
    }

    public class VoiceProfile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string VoiceName { get; set; } = string.Empty;
        public string Accent { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public bool IsPremium { get; set; }
        public bool IsActive { get; set; }
        public string DemoAudio { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string GeminiVoice { get; set; } = string.Empty;
    }
}
