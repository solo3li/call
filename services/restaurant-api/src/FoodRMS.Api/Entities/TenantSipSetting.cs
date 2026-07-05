using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodRMS.Api.Entities
{
    public class TenantSipSetting
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        // External SIP Trunk settings to connect to provider
        public string TrunkHost { get; set; } = string.Empty;
        public string TrunkUsername { get; set; } = string.Empty;
        public string TrunkPassword { get; set; } = string.Empty;
        public int TrunkPort { get; set; } = 5060;
        public int MaxChannels { get; set; } = 10;
        public string DidNumber { get; set; } = string.Empty;

        // MicroSIP extension generated for this tenant's manager
        public string AgentExtension { get; set; } = string.Empty;
        public string AgentPassword { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
