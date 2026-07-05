using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodRMS.Api.Entities
{
    public class CallRecord
    {
        [Key]
        public int Id { get; set; }

        public Guid TenantId { get; set; }
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }

        public string CallerNumber { get; set; }
        
        public DateTime CallStartTime { get; set; }
        public int DurationSeconds { get; set; }
        
        public string RecordingUrl { get; set; }
        
        public bool HandledByAi { get; set; }
        public bool TransferredToHuman { get; set; }
    }
}
